"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.instancesGet = instancesGet;
const functions_1 = require("@azure/functions");
const db_1 = __importDefault(require("../db"));
const middleware_1 = require("../middleware");
async function instancesGet(request, context) {
    context.log('HTTP trigger function processed a request for instances');
    // Authenticate user
    const authResult = (0, middleware_1.requireAuth)(request, context);
    if ('error' in authResult) {
        return { status: authResult.status, jsonBody: { error: authResult.error } };
    }
    const user = authResult;
    try {
        // SuperAdmins can see all instances, others only their own
        const whereClause = user.role === 'SUPERADMIN'
            ? {}
            : { id: user.tenantId };
        const instances = await db_1.default.instance.findMany({
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
    }
    catch (error) {
        context.error('Error fetching instances:', error);
        return {
            status: 500,
            jsonBody: { error: 'Failed to fetch instances' }
        };
    }
}
functions_1.app.http('instances', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'instances',
    handler: instancesGet
});
