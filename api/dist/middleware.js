"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTenant = exports.requireRole = exports.requireAuth = exports.authenticate = void 0;
const auth_1 = require("./auth");
const authenticate = (request, context) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        context.warn('No authorization header found');
        return null;
    }
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = (0, auth_1.verifyAccessToken)(token);
    if (!payload) {
        context.warn('Invalid or expired token');
        return null;
    }
    return payload;
};
exports.authenticate = authenticate;
const requireAuth = (request, context) => {
    const user = (0, exports.authenticate)(request, context);
    if (!user) {
        return { error: 'Unauthorized', status: 401 };
    }
    return user;
};
exports.requireAuth = requireAuth;
const requireRole = (request, context, allowedRoles) => {
    const authResult = (0, exports.requireAuth)(request, context);
    if ('error' in authResult) {
        return authResult;
    }
    if (!allowedRoles.includes(authResult.role)) {
        context.warn(`User role ${authResult.role} not in allowed roles: ${allowedRoles.join(', ')}`);
        return { error: 'Forbidden: Insufficient permissions', status: 403 };
    }
    return authResult;
};
exports.requireRole = requireRole;
const requireTenant = (user, tenantId) => {
    // SuperAdmins can access all tenants
    if (user.role === 'SUPERADMIN') {
        return true;
    }
    return user.tenantId === tenantId;
};
exports.requireTenant = requireTenant;
