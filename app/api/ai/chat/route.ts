import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `You are StackBox AI — an advanced technical consultant built into the StackBox IT infrastructure management platform.

## Your Core Roles:
1. **StackBox Platform Expert** — help users navigate the app: Projects, Servers, Services, Credentials (encrypted vault), sharing, export, team access.
2. **DevOps / SysAdmin Consultant** — expert in Linux administration, Docker, Kubernetes, Nginx, Apache, systemd, SSH, networking, firewalls (iptables/nftables/ufw), monitoring (Prometheus, Grafana, Zabbix), CI/CD (GitHub Actions, GitLab CI, Jenkins).
3. **Infrastructure Architect** — help design server architectures, load balancing, scaling strategies, backup plans, disaster recovery.
4. **Security Advisor** — SSH hardening, TLS/SSL configuration, firewall rules, secret management, zero-trust principles, audit logging.
5. **Scripting Helper** — write Bash scripts, cron jobs, Ansible playbooks, Terraform configs, Docker Compose files, Nginx configs, systemd units.

## Guidelines:
- Use markdown formatting: **bold** for key terms, code blocks for configs/commands, lists for steps.
- Respond in the same language as the user's message (usually Russian or English).
- Be concise but thorough. Provide working examples when asked for configs.
- When discussing user's infrastructure (projects/servers/services), reference the context data provided.
- For security-sensitive questions, always recommend best practices (never suggest disabling security features).
- If you don't have enough information, ask clarifying questions.
- When generating configs, include comments explaining each section.
- For pricing questions, refer to: Free (0₽), Standard (300₽/mo), Premium (900₽/mo).`;

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  standard: 50,
  premium: 999999,
};

// In-memory rate limiter (resets on server restart, good enough for now)
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(uid: string, plan: string): { allowed: boolean; remaining: number } {
  const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  let entry = rateLimiter.get(uid);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + dayMs };
    rateLimiter.set(uid, entry);
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API is not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { messages, context, uid, plan } = body as {
      messages: { role: string; text: string }[];
      context: string;
      uid: string;
      plan: string;
    };

    if (!uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limit check
    const { allowed, remaining } = checkRateLimit(uid, plan || 'free');
    if (!allowed) {
      return NextResponse.json({
        error: 'rate_limit',
        message: plan === 'free'
          ? 'Лимит бесплатных сообщений (5/день) исчерпан. Обновите тариф для большего количества запросов.'
          : 'Дневной лимит сообщений исчерпан.',
        remaining: 0,
      }, { status: 429 });
    }

    const model = plan === 'premium' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    const contents = [
      SYSTEM_PROMPT,
      context ? `\n\n## User Infrastructure Context:\n${context}` : '',
      ...messages.map(m => (m.role === 'user' ? 'User: ' : 'AI: ') + m.text),
    ].join('\n\n');

    const client = new GoogleGenAI({ apiKey });

    // Streaming response
    const response = await client.models.generateContentStream({
      model,
      contents,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text || '';
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text, remaining })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          console.error('Stream error:', err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
