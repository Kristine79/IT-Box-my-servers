/**
 * Firebase Authentication Verification for API Routes
 * 
 * This module provides token verification for API routes using Firebase Admin SDK.
 * Must be used in all protected API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logAuthFailure, logSecurityEvent } from './security-logger';
import { secureErrorResponse } from './security-headers';

// Lazy initialization of Firebase Admin to avoid bundling in client
let firebaseAdmin: typeof import('firebase-admin') | null = null;
let auth: import('firebase-admin').auth.Auth | null = null;

async function getFirebaseAdmin() {
  if (firebaseAdmin) return firebaseAdmin;
  
  firebaseAdmin = await import('firebase-admin');
  
  // Initialize if not already initialized
  if (firebaseAdmin.apps.length === 0) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      throw new Error('Firebase Admin credentials not configured');
    }
    
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      }),
    });
  }
  
  return firebaseAdmin;
}

async function getAuth() {
  if (auth) return auth;
  const admin = await getFirebaseAdmin();
  auth = admin.auth();
  return auth;
}

interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email?: string;
    emailVerified?: boolean;
  };
}

/**
 * Verify Firebase ID token from request
 */
async function verifyIdToken(request: NextRequest): Promise<{ uid: string; email?: string; emailVerified?: boolean } | null> {
  try {
    // Get token from Authorization header or __session cookie
    const authHeader = request.headers.get('authorization');
    let token: string | undefined;
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get from cookie
      const sessionCookie = request.cookies.get('__session')?.value;
      if (sessionCookie) {
        token = sessionCookie;
      }
    }
    
    if (!token) {
      return null;
    }
    
    const auth = await getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };
  } catch (error) {
    // Token verification failed
    logSecurityEvent(
      request,
      'auth_failure',
      'medium',
      { reason: 'token_verification_failed', error: error instanceof Error ? error.message : 'Unknown error' }
    );
    return null;
  }
}

/**
 * Higher-order function to protect API routes with Firebase auth
 */
export function withFirebaseAuth(
  handler: (req: AuthenticatedRequest, user: { uid: string; email?: string; emailVerified?: boolean }) => Promise<NextResponse>,
  options: { required?: boolean; adminOnly?: boolean } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = await verifyIdToken(request);

    if (!user) {
      if (options.required !== false) {
        logAuthFailure(request, 'Invalid or missing Firebase token');
        return secureErrorResponse('Unauthorized: Valid authentication required', 401);
      }
      // Allow anonymous access if not required
      return handler(request as AuthenticatedRequest, { uid: 'anonymous' });
    }

    // Attach user to request for handler use
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;

    return handler(authenticatedRequest, user);
  };
}

/**
 * Verify auth without HOC - for use within handlers
 */
export async function requireAuth(request: NextRequest): Promise<{ uid: string; email?: string; emailVerified?: boolean } | null> {
  return verifyIdToken(request);
}

export type { AuthenticatedRequest };
