import { HttpRequest, InvocationContext } from '@azure/functions';
import { verifyAccessToken, JwtPayload } from './auth';

export const authenticate = (
  request: HttpRequest,
  context: InvocationContext
): JwtPayload | null => {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    context.warn('No authorization header found');
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const payload = verifyAccessToken(token);

  if (!payload) {
    context.warn('Invalid or expired token');
    return null;
  }

  return payload;
};

export const requireAuth = (
  request: HttpRequest,
  context: InvocationContext
): JwtPayload | { error: string; status: number } => {
  const user = authenticate(request, context);
  
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  return user;
};

export const requireRole = (
  request: HttpRequest,
  context: InvocationContext,
  allowedRoles: string[]
): JwtPayload | { error: string; status: number } => {
  const authResult = requireAuth(request, context);
  
  if ('error' in authResult) {
    return authResult;
  }

  if (!allowedRoles.includes(authResult.role)) {
    context.warn(`User role ${authResult.role} not in allowed roles: ${allowedRoles.join(', ')}`);
    return { error: 'Forbidden: Insufficient permissions', status: 403 };
  }

  return authResult;
};

export const requireTenant = (
  user: JwtPayload,
  tenantId: string
): boolean => {
  // SuperAdmins can access all tenants
  if (user.role === 'SUPERADMIN') {
    return true;
  }
  
  return user.tenantId === tenantId;
};
