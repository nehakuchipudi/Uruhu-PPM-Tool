import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import prisma from '../db';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
  JwtPayload
} from '../auth';

// Sign Up
export async function signup(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Sign up request received');

  try {
    const body = await request.json() as any;
    const { email, password, name, tenantId, role = 'GUEST' } = body;

    if (!email || !password || !name || !tenantId) {
      return {
        status: 400,
        jsonBody: { error: 'Email, password, name, and tenantId are required' }
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return {
        status: 409,
        jsonBody: { error: 'User with this email already exists' }
      };
    }

    // Verify tenant exists
    const tenant = await prisma.instance.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return {
        status: 404,
        jsonBody: { error: 'Tenant not found' }
      };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        tenantId,
        role: role as any
      }
    });

    // Generate tokens
    const tokenPayload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const refreshTokenExpiry = getRefreshTokenExpiry();

    // Save refresh token
    await prisma.user.update({
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
  } catch (error: any) {
    context.error('Error in signup:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to create user', details: error.message }
    };
  }
}

// Sign In
export async function signin(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Sign in request received');

  try {
    const body = await request.json() as any;
    const { email, password } = body;

    if (!email || !password) {
      return {
        status: 400,
        jsonBody: { error: 'Email and password are required' }
      };
    }

    // Find user
    const user = await prisma.user.findUnique({
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
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      return {
        status: 401,
        jsonBody: { error: 'Invalid email or password' }
      };
    }

    // Generate tokens
    const tokenPayload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const refreshTokenExpiry = getRefreshTokenExpiry();

    // Update last login and refresh token
    await prisma.user.update({
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
  } catch (error: any) {
    context.error('Error in signin:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to sign in', details: error.message }
    };
  }
}

// Refresh Token
export async function refreshToken(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Refresh token request received');

  try {
    const body = await request.json() as any;
    const { refreshToken: token } = body;

    if (!token) {
      return {
        status: 400,
        jsonBody: { error: 'Refresh token is required' }
      };
    }

    // Verify refresh token
    const payload = verifyRefreshToken(token);

    if (!payload) {
      return {
        status: 401,
        jsonBody: { error: 'Invalid or expired refresh token' }
      };
    }

    // Find user and verify refresh token
    const user = await prisma.user.findUnique({
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
    const tokenPayload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);
    const newRefreshTokenExpiry = getRefreshTokenExpiry();

    // Update refresh token
    await prisma.user.update({
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
  } catch (error: any) {
    context.error('Error in refreshToken:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to refresh token', details: error.message }
    };
  }
}

// Logout
export async function logout(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Logout request received');

  try {
    const body = await request.json() as any;
    const { userId } = body;

    if (!userId) {
      return {
        status: 400,
        jsonBody: { error: 'User ID is required' }
      };
    }

    // Clear refresh token
    await prisma.user.update({
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
  } catch (error: any) {
    context.error('Error in logout:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to logout', details: error.message }
    };
  }
}

// Register routes
app.http('signup', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/signup',
  handler: signup
});

app.http('signin', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/signin',
  handler: signin
});

app.http('refresh', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/refresh',
  handler: refreshToken
});

app.http('logout', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/logout',
  handler: logout
});
