"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
const corsMiddleware = async (context, next) => {
    const { request, response } = context;
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (request.method === 'OPTIONS') {
        response.statusCode = 204;
        return;
    }
    return next();
};
exports.corsMiddleware = corsMiddleware;
//# sourceMappingURL=cors.middleware.js.map