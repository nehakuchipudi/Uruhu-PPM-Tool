import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import prisma from '../db';
import { requireAuth, requireRole } from '../middleware';

export async function instancesGet(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('HTTP trigger function processed a request for instances');

    // Authenticate user
    const authResult = requireAuth(request, context);
    if ('error' in authResult) {
        return { status: authResult.status, jsonBody: { error: authResult.error } };
    }

    const user = authResult;

    try {
        // SuperAdmins can see all instances, others only their own
        const whereClause = user.role === 'SUPERADMIN' 
            ? {} 
            : { id: user.tenantId };

        const instances = await prisma.instance.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: {
                        people: true,
                        projects: true,
                        workOrders: true,
                        users: true,
                    },
                },
            },
        });

        return {
            status: 200,
            jsonBody: instances
        };
    } catch (error) {
        context.error('Error fetching instances:', error);
        return {
            status: 500,
            jsonBody: { error: 'Failed to fetch instances' }
        };
    }
}

app.http('instances', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'instances',
    handler: instancesGet
});
