export type PlanId = 'free' | 'standard' | 'premium';

export interface PlanLimits {
  maxProjects: number;
  maxServers: number;
  maxServices: number;
  maxCredentials: number;
  canExport: boolean;
  canShare: boolean;
  canShareEdit: boolean;
  canNotifications: boolean;
  canHistory: boolean;
  canTeamAccess: boolean;
  canIntegrations: boolean;
  canEnhancedEncryption: boolean;
  canChangeTheme: boolean;
  canMonitoring: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    maxProjects: 2,
    maxServers: 1,
    maxServices: 2,
    maxCredentials: 4,
    canExport: false,
    canShare: false,
    canShareEdit: false,
    canNotifications: false,
    canHistory: false,
    canTeamAccess: false,
    canIntegrations: false,
    canEnhancedEncryption: false,
    canChangeTheme: false,
    canMonitoring: false,
  },
  standard: {
    maxProjects: 10,
    maxServers: 5,
    maxServices: 15,
    maxCredentials: 50,
    canExport: true,
    canShare: true,
    canShareEdit: false,
    canNotifications: true,
    canHistory: true,
    canTeamAccess: false,
    canIntegrations: false,
    canEnhancedEncryption: false,
    canChangeTheme: true,
    canMonitoring: true,
  },
  premium: {
    maxProjects: Infinity,
    maxServers: Infinity,
    maxServices: Infinity,
    maxCredentials: Infinity,
    canExport: true,
    canShare: true,
    canShareEdit: true,
    canNotifications: true,
    canHistory: true,
    canTeamAccess: true,
    canIntegrations: true,
    canEnhancedEncryption: true,
    canChangeTheme: true,
    canMonitoring: true,
  },
};

export function getPlanLimits(planId: PlanId): PlanLimits {
  return PLAN_LIMITS[planId] || PLAN_LIMITS.free;
}
