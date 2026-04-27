import { NextRequest, NextResponse } from 'next/server';
import * as tls from 'tls';
import * as net from 'net';

export interface CheckResult {
  serviceId: string;
  url: string;
  status: 'up' | 'down' | 'degraded';
  httpStatus?: number;
  responseTime?: number; // ms
  sslExpiry?: string; // ISO date
  sslDaysLeft?: number;
  portOpen?: boolean;
  checkedAt: string;
  error?: string;
}

async function checkHttp(url: string): Promise<{ status: number; responseTime: number } | { error: string }> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    return { status: res.status, responseTime: Date.now() - start };
  } catch (e: any) {
    // Retry with GET if HEAD fails
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);
      return { status: res.status, responseTime: Date.now() - start };
    } catch (e2: any) {
      return { error: e2.message || 'Connection failed' };
    }
  }
}

async function checkSsl(hostname: string): Promise<{ expiry: string; daysLeft: number } | null> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(443, hostname, { servername: hostname, timeout: 5000 }, () => {
        const cert = socket.getPeerCertificate();
        socket.destroy();
        if (cert && cert.valid_to) {
          const expiry = new Date(cert.valid_to);
          const daysLeft = Math.floor((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          resolve({ expiry: expiry.toISOString(), daysLeft });
        } else {
          resolve(null);
        }
      });
      socket.on('error', () => { socket.destroy(); resolve(null); });
      socket.on('timeout', () => { socket.destroy(); resolve(null); });
    } catch {
      resolve(null);
    }
  });
}

async function checkPort(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const socket = new net.Socket();
      socket.setTimeout(5000);
      socket.on('connect', () => { socket.destroy(); resolve(true); });
      socket.on('error', () => { socket.destroy(); resolve(false); });
      socket.on('timeout', () => { socket.destroy(); resolve(false); });
      socket.connect(port, host);
    } catch {
      resolve(false);
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { services } = body as {
      services: { id: string; url: string; port?: string }[];
    };

    if (!services || !Array.isArray(services)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const results: CheckResult[] = await Promise.all(
      services.slice(0, 50).map(async (svc) => {
        const result: CheckResult = {
          serviceId: svc.id,
          url: svc.url || '',
          status: 'down',
          checkedAt: new Date().toISOString(),
        };

        // HTTP check
        if (svc.url) {
          let targetUrl = svc.url;
          if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

          const httpResult = await checkHttp(targetUrl);
          if ('status' in httpResult) {
            result.httpStatus = httpResult.status;
            result.responseTime = httpResult.responseTime;
            if (httpResult.status >= 200 && httpResult.status < 400) {
              result.status = httpResult.responseTime > 3000 ? 'degraded' : 'up';
            } else if (httpResult.status >= 400 && httpResult.status < 500) {
              result.status = 'degraded';
            } else {
              result.status = 'down';
            }
          } else {
            result.error = httpResult.error;
            result.status = 'down';
          }

          // SSL check (only for HTTPS URLs)
          try {
            const hostname = new URL(targetUrl).hostname;
            const ssl = await checkSsl(hostname);
            if (ssl) {
              result.sslExpiry = ssl.expiry;
              result.sslDaysLeft = ssl.daysLeft;
            }
          } catch {}
        }

        // Port check
        if (svc.port && svc.url) {
          try {
            const hostname = svc.url.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
            const port = parseInt(svc.port);
            if (!isNaN(port)) {
              result.portOpen = await checkPort(hostname, port);
            }
          } catch {}
        }

        return result;
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Monitoring check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
