"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.signin = signin;
exports.refreshToken = refreshToken;
exports.logout = logout;
const functions_1 = require("@azure/functions");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../auth");
// Sign Up
async function signup(request, context) {
    context.log('Sign up request received');
    try {
        const body = await request.json();
        const { email, password, name, tenantId, role = 'GUEST' } = body;
        if (!email || !password || !name || !tenantId) {
            return {
                status: 400,
                jsonBody: { error: 'Email, password, name, and tenantId are required' }
            };
        }
        // Check if user already exists
        const existingUser = await db_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return {
                status: 409,
                jsonBody: { error: 'User with this email already exists' }
            };
        }
        // Verify tenant exists
        const tenant = await db_1.default.instance.findUnique({
            where: { id: tenantId }
        });
        if (!tenant) {
            return {
                status: 404,
                jsonBody: { error: 'Tenant not found' }
            };
        }
        // Hash password
        const passwordHash = await (0, auth_1.hashPassword)(password);
        // Create user
        const user = await db_1.default.user.create({
            data: {
                email,
                passwordHash,
                name,
                tenantId,
                role: role
            }
        });
        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
            email: user.email
        };
        const accessToken = (0, auth_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
        const refreshTokenExpiry = (0, auth_1.getRefreshTokenExpiry)();
        // Save refresh token
        await db_1.default.user.update({
            where: { id: user.id },
            data: {
                refreshToken,
                refreshTokenExpiry
            }
        });
        return {
            status: 201,
            jsonBody: {
                message: 'User created successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    tenantId: user.tenantId
                },
                accessToken,
                refreshToken
            }
        };
    }
    catch (error) {
        context.error('Error in signup:', error);
        return {
            status: 500,
            jsonBody: { error: 'Failed to create user', details: error.message }
        };
    }
}
// Sign In
async function signin(request, context) {
    context.log('Sign in request received');
    try {
        const body = await request.json();
        const { email, password } = body;
        if (!email || !password) {
            return {
                status: 400,
                jsonBody: { error: 'Email and password are required' }
            };
        }
        // Find user
        const user = await db_1.default.user.findUnique({
            where: { email },
            include: { tenant: true }
        });
        if (!user) {
            return {
                status: 401,
                jsonBody: { error: 'Invalid email or password' }
            };
        }
        if (!user.isActive) {
            return {
                status: 403,
                jsonBody: { error: 'Account is deactivated' }
            };
        }
        // Verify password
        const isValidPassword = await (0, auth_1.comparePassword)(password, user.passwordHash);
        if (!isValidPassword) {
            return {
                status: 401,
                jsonBody: { error: 'Invalid email or password' }
            };
        }
        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
            email: user.email
        };
        const accessToken = (0, auth_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
        const refreshTokenExpiry = (0, auth_1.getRefreshTokenExpiry)();
        // Update last login and refresh token
        await db_1.default.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                refreshToken,
                refreshTokenExpiry
            }
        });
        return {
            status: 200,
            jsonBody: {
                message: 'Sign in successful',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    tenantId: user.tenantId,
                    tenant: {
                        id: user.tenant.id,
                        name: user.tenant.name,
                        logo: user.tenant.logo
                    }
                },
                accessToken,
                refreshToken
            }
        };
    }
    catch (error) {
        context.error('Error in signin:', error);
        return {
            status: 500,
            jsonBody: { error: 'Failed to sign in', details: error.message }
        };
    }
}
// Refresh Token
async function refreshToken(request, context) {
    context.log('Refresh token request received');
    try {
        const body = await request.json();
        const { refreshToken: token } = body;
        if (!token) {
            return {
                status: 400,
                jsonBody: { error: 'Refresh token is required' }
            };
        }
        // Verify refresh token
        const payload = (0, auth_1.verifyRefreshToken)(token);
        if (!payload) {
            return {
                status: 401,
                jsonBody: { error: 'Invalid or expired refresh token' }
            };
        }
        // Find user and verify refresh token
        const user = await db_1.default.user.findUnique({
            where: { id: payload.userId }
        });
        if (!user || user.refreshToken !== token) {
            return {
                status: 401,
                jsonBody: { error: 'Invalid refresh token' }
            };
        }
        if (!user.isActive) {
            return {
                status: 403,
                jsonBody: { error: 'Account is deactivated' }
            };
        }
        // Check if refresh token is expired
        if (user.refreshTokenExpiry && user.refreshTokenExpiry < new Date()) {
            return {
                status: 401,
                jsonBody: { error: 'Refresh token has expired' }
            };
        }
        // Generate new tokens
        const tokenPayload = {
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
            email: user.email
        };
        const newAccessToken = (0, auth_1.generateAccessToken)(tokenPayload);
        const newRefreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
        const newRefreshTokenExpiry = (0, auth_1.getRefreshTokenExpiry)();
        // Update refresh token
        await db_1.default.user.update({
            where: { id: user.id },
            data: {
                refreshToken: newRefreshToken,
                refreshTokenExpiry: newRefreshTokenExpiry
            }
        });
        return {
            status: 200,
            jsonBody: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        };
    }
    catch (error) {
        context.error('Error in refreshToken:', error);
        return {
            status: 500,
            jsonBody: { error: 'Failed to refresh token', details: error.message }
        };
    }
}
// Logout
async function logout(request, context) {
    context.log('Logout request received');
    try {
        const body = await request.json();
        const { userId } = body;
        if (!userId) {
            return {
                status: 400,
                jsonBody: { error: 'User ID is required' }
            };
        }
        // Clear refresh token
        await db_1.default.user.update({
            where: { id: userId },
            data: {
                refreshToken: null,
                refreshTokenExpiry: null
            }
        });
        return {
            status: 200,
            jsonBody: { message: 'Logged out successfully' }
        };
    }
    catch (error) {
        context.error('Error in logout:', error);
        return {
            status: 500,
            jsonBody: { error: 'Failed to logout', details: error.message }
        };
    }
}
// Register routes
functions_1.app.http('signup', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/signup',
    handler: signup
});
functions_1.app.http('signin', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/signin',
    handler: signin
});
functions_1.app.http('refresh', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/refresh',
    handler: refreshToken
});
functions_1.app.http('logout', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/logout',
    handler: logout
});
