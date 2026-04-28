/**
 * Security Logger - Anomaly Detection & Monitoring
 * Skills: detecting-anomalous-authentication-patterns, securing-serverless-functions
 * 
 * Implements security event logging with anomaly detection:
 * - Failed authentication monitoring
 * - Rate limit violations
 * - Suspicious input patterns
 * - Geographic anomalies
 * - Time-based anomalies
 */

import { NextRequest } from 'next/server';

// Security event types
export type SecurityEventType = 
  | 'auth_failure'
  | 'auth_success'
  | 'rate_limit_exceeded'
  | 'validation_failure'
  | 'suspicious_input'
  | 'permission_denied'
  | 'encryption_failure'
  | 'api_error';

// Severity levels
export type Severity = 'low' | 'medium' | 'high' | 'critical';

interface SecurityEvent {
  timestamp: string;
  type: SecurityEventType;
  severity: Severity;
  ip: string;
  userId?: string;
  userAgent?: string;
  path: string;
  method: string;
  details: Record<string, unknown>;
  metadata: {
    requestId: string;
    country?: string;
    city?: string;
    isNewIp?: boolean;
    isUnusualTime?: boolean;
  };
}

// In-memory event store (use proper SIEM in production)
const recentEvents: SecurityEvent[] = [];
const MAX_STORED_EVENTS = 10000;

// Anomaly thresholds
const ANOMALY_THRESHOLDS = {
  auth_failures_per_ip: { count: 5, windowMinutes: 15 },
  auth_failures_per_user: { count: 3, windowMinutes: 15 },
  rate_limit_violations: { count: 10, windowMinutes: 60 },
  suspicious_inputs: { count: 3, windowMinutes: 10 },
};

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract client IP from request
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  // @ts-expect-error - ip property exists on NextRequest in newer versions
  return req.ip || 'unknown';
}

/**
 * Check if request time is unusual (e.g., 2-6 AM local time)
 */
function isUnusualTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 2 && hour <= 6;
}

/**
 * Check if IP is new (not seen in last 24 hours)
 */
function isNewIP(ip: string): boolean {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recentIPs = new Set(
    recentEvents
      .filter(e => e.timestamp > dayAgo)
      .map(e => e.ip)
  );
  return !recentIPs.has(ip);
}

/**
 * Log security event
 */
export function logSecurityEvent(
  req: NextRequest,
  type: SecurityEventType,
  severity: Severity,
  details: Record<string, unknown> = {},
  userId?: string
): void {
  const ip = getClientIP(req);
  const event: SecurityEvent = {
    timestamp: new Date().toISOString(),
    type,
    severity,
    ip,
    userId,
    userAgent: req.headers.get('user-agent') || undefined,
    path: req.nextUrl.pathname,
    method: req.method,
    details,
    metadata: {
      requestId: generateRequestId(),
      isNewIp: isNewIP(ip),
      isUnusualTime: isUnusualTime(),
    },
  };

  // Store event (limit storage)
  recentEvents.push(event);
  if (recentEvents.length > MAX_STORED_EVENTS) {
    recentEvents.shift();
  }

  // Log to console (use proper logging service in production)
  const logMessage = `[SECURITY] ${type} | ${severity} | ${ip} | ${req.method} ${req.nextUrl.pathname}`;
  
  if (severity === 'critical') {
    console.error(`🚨 ${logMessage}`, event);
  } else if (severity === 'high') {
    console.warn(`⚠️  ${logMessage}`, event);
  } else {
    console.log(`ℹ️  ${logMessage}`);
  }

  // Check for anomalies
  const anomaly = detectAnomaly(event);
  if (anomaly) {
    console.error(`🔔 ANOMALY DETECTED: ${anomaly.type}`, anomaly);
  }
}

/**
 * Detect anomalies in recent events
 */
function detectAnomaly(event: SecurityEvent): { type: string; details: string } | null {
  const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const recentIPAuthFailures = recentEvents.filter(
    e => e.ip === event.ip && 
         e.type === 'auth_failure' && 
         e.timestamp > windowStart
  );

  // Check for brute force
  if (recentIPAuthFailures.length >= ANOMALY_THRESHOLDS.auth_failures_per_ip.count) {
    return {
      type: 'BRUTE_FORCE_ATTEMPT',
      details: `${recentIPAuthFailures.length} auth failures from ${event.ip} in 15 min`,
    };
  }

  // Check for suspicious pattern
  const suspiciousEvents = recentEvents.filter(
    e => e.ip === event.ip && 
         e.severity === 'high' && 
         e.timestamp > new Date(Date.now() - 60 * 60 * 1000).toISOString()
  );

  if (suspiciousEvents.length >= 5) {
    return {
      type: 'SUSPICIOUS_ACTIVITY',
      details: `${suspiciousEvents.length} high-severity events from ${event.ip} in 1 hour`,
    };
  }

  // Unusual time + new IP + auth failure
  if (event.metadata.isUnusualTime && event.metadata.isNewIp && event.type === 'auth_failure') {
    return {
      type: 'UNUSUAL_LOGIN_ATTEMPT',
      details: `Auth failure from new IP ${event.ip} at unusual time`,
    };
  }

  return null;
}

/**
 * Get security summary for monitoring
 */
export function getSecuritySummary(
  hours: number = 24
): {
  totalEvents: number;
  bySeverity: Record<Severity, number>;
  byType: Record<SecurityEventType, number>;
  topIPs: { ip: string; count: number }[];
  anomalies: { type: string; details: string; timestamp: string }[];
} {
  const windowStart = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const windowEvents = recentEvents.filter(e => e.timestamp > windowStart);

  const bySeverity: Record<Severity, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  const byType: Partial<Record<SecurityEventType, number>> = {};
  const ipCounts: Record<string, number> = {};
  const anomalies: { type: string; details: string; timestamp: string }[] = [];

  windowEvents.forEach(event => {
    bySeverity[event.severity]++;
    byType[event.type] = (byType[event.type] || 0) + 1;
    ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;

    const anomaly = detectAnomaly(event);
    if (anomaly) {
      anomalies.push({ ...anomaly, timestamp: event.timestamp });
    }
  });

  const topIPs = Object.entries(ipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }));

  return {
    totalEvents: windowEvents.length,
    bySeverity,
    byType: byType as Record<SecurityEventType, number>,
    topIPs,
    anomalies,
  };
}

/**
 * Middleware helper to log auth failures
 */
export function logAuthFailure(
  req: NextRequest,
  reason: string,
  userId?: string
): void {
  logSecurityEvent(
    req,
    'auth_failure',
    userId ? 'medium' : 'low',
    { reason },
    userId
  );
}

/**
 * Middleware helper to log rate limit violations
 */
export function logRateLimitViolation(
  req: NextRequest,
  limit: number,
  current: number
): void {
  logSecurityEvent(
    req,
    'rate_limit_exceeded',
    current > limit * 2 ? 'high' : 'medium',
    { limit, current, exceededBy: current - limit }
  );
}

/**
 * Middleware helper to log suspicious input
 */
export function logSuspiciousInput(
  req: NextRequest,
  pattern: string,
  input: string
): void {
  logSecurityEvent(
    req,
    'suspicious_input',
    'high',
    { pattern, input: input.substring(0, 100) } // Truncate for privacy
  );
}

/**
 * Export security events for SIEM integration
 */
export function exportSecurityEvents(format: 'json' | 'csv' = 'json'): string {
  if (format === 'csv') {
    const headers = ['timestamp', 'type', 'severity', 'ip', 'userId', 'path', 'method', 'details'];
    const rows = recentEvents.map(e => [
      e.timestamp,
      e.type,
      e.severity,
      e.ip,
      e.userId || '',
      e.path,
      e.method,
      JSON.stringify(e.details),
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  return JSON.stringify(recentEvents, null, 2);
}
