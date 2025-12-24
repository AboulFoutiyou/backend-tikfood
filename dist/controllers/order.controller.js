"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const authentication_1 = require("@loopback/authentication");
const authorization_1 = require("@loopback/authorization");
const core_1 = require("@loopback/core");
const security_1 = require("@loopback/security");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
let OrderController = class OrderController {
    constructor(orderRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }
    async create(order) {
        const product = await this.productRepository.findById(order.productId);
        order.vendorId = product.vendorId;
        return this.orderRepository.create(order);
    }
    async count(where) {
        return this.orderRepository.count(where);
    }
    async find(filter) {
        return this.orderRepository.find(filter);
    }
    async getMyOrders(currentUser, filter) {
        return this.orderRepository.find({
            ...filter,
            where: { vendorId: currentUser.id, ...filter?.where },
            include: ['product'],
            order: ['createdAt DESC'],
        });
    }
    async getAnalytics(currentUser) {
        const orders = await this.orderRepository.find({
            where: { vendorId: currentUser.id },
            include: ['product'],
        });
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayOrders = orders.filter(order => order.orderDate >= todayStart);
        // WEEK (du lundi courant 00:00 au lundi suivant 00:00)
        const day = today.getDay(); // 0 = dim, 1 = lun...
        const diffToMonday = (day === 0) ? 6 : day - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - diffToMonday);
        monday.setHours(0, 0, 0, 0);
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);
        nextMonday.setHours(0, 0, 0, 0);
        let weeklyOrders = Array(7).fill(0);
        weeklyOrders = this.getWeeklyCountsByWeekday(orders, today);
        const weeklyRevenue = this.getWeeklyRevenueByWeekday(orders, today);
        // Top products
        const productStats = {};
        orders.forEach(order => {
            const productName = order.product?.name || 'Unknown Product';
            if (!productStats[order.productId]) {
                productStats[order.productId] = {
                    name: productName,
                    orders: 0,
                    revenue: 0
                };
            }
            productStats[order.productId].orders++;
            productStats[order.productId].revenue += order.totalPrice;
        });
        const topProducts = Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        // Orders by status
        const statusCounts = {};
        orders.forEach(order => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });
        const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
        return {
            totalOrders: orders.length,
            totalRevenue: orders.filter(o => o.status !== models_1.OrderStatus.CANCELLED).reduce((sum, order) => sum + order.totalPrice, 0),
            todayOrders: todayOrders.length,
            todayRevenue: todayOrders.filter(o => o.status !== models_1.OrderStatus.CANCELLED).reduce((sum, order) => sum + order.totalPrice, 0),
            weeklyOrders,
            weeklyRevenue,
            topProducts,
            ordersByStatus,
        };
    }
    getWeeklyRevenueByWeekday(orders, referenceDate = new Date()) {
        const day = referenceDate.getDay(); // 0 = dim, 1 = lun, ...
        const diffToMonday = (day === 0) ? -6 : 1 - day;
        const monday = new Date(referenceDate);
        monday.setDate(referenceDate.getDate() + diffToMonday);
        monday.setHours(0, 0, 0, 0);
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);
        nextMonday.setHours(0, 0, 0, 0);
        const revenues = new Array(7).fill(0);
        for (const o of orders) {
            const d = o.orderDate instanceof Date ? o.orderDate : new Date(o.orderDate);
            if (isNaN(d.getTime()))
                continue;
            if (d >= monday && d < nextMonday && o.status !== models_1.OrderStatus.CANCELLED) {
                const jsDay = d.getDay(); // 0..6 (dim..sam)
                const mondayIndex = (jsDay + 6) % 7; // 0 = lundi
                revenues[mondayIndex] += Number(o.totalPrice) || 0;
            }
        }
        return revenues;
    }
    // ...existing code...
    getWeeklyCountsByWeekday(orders, referenceDate = new Date()) {
        // calcule le lundi de la semaine contenant referenceDate (00:00)
        const day = referenceDate.getDay(); // 0 = dim, 1 = lun, ...
        const diffToMonday = (day === 0) ? -6 : 1 - day;
        const monday = new Date(referenceDate);
        monday.setDate(referenceDate.getDate() + diffToMonday);
        monday.setHours(0, 0, 0, 0);
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);
        nextMonday.setHours(0, 0, 0, 0);
        // initialise tableau [lun, mar, mer, jeu, ven, sam, dim]
        const counts = new Array(7).fill(0);
        for (const o of orders) {
            // parser la date quel que soit le format (string ou Date)
            const d = o.orderDate instanceof Date ? o.orderDate : new Date(o.orderDate);
            if (isNaN(d.getTime()))
                continue; // ignore dates invalides
            // ne prendre que les commandes de la semaine [monday, nextMonday)
            if (d >= monday && d < nextMonday) {
                const jsDay = d.getDay(); // 0..6 (dim..sam)
                const mondayIndex = (jsDay + 6) % 7; // transforme JS day en index où 0 = lundi
                counts[mondayIndex] += 1;
            }
        }
        return counts;
    }
    // ...existing code...
    async findById(id, filter) {
        return this.orderRepository.findById(id, filter);
    }
    async updateStatus(id, statusUpdate, currentUser) {
        // Verify ownership
        const order = await this.orderRepository.findById(id);
        if (order.vendorId !== currentUser.id) {
            throw new Error('Unauthorized');
        }
        await this.orderRepository.updateById(id, {
            status: statusUpdate.status,
            updatedAt: new Date(),
        });
    }
    async updateById(id, order, currentUser) {
        // Verify ownership
        const existingOrder = await this.orderRepository.findById(id);
        if (existingOrder.vendorId !== currentUser.id) {
            throw new Error('Unauthorized');
        }
        order.updatedAt = new Date();
        await this.orderRepository.updateById(id, order);
    }
    async deleteById(id, currentUser) {
        const order = await this.orderRepository.findById(id);
        if (order.vendorId !== currentUser.id) {
            throw new Error('Unauthorized');
        }
        await this.orderRepository.deleteById(id);
    }
};
exports.OrderController = OrderController;
tslib_1.__decorate([
    (0, rest_1.post)('/orders'),
    (0, rest_1.response)(200, {
        description: 'Order model instance',
        content: { 'application/json': { schema: (0, rest_1.getModelSchemaRef)(models_1.Order) } },
    }),
    tslib_1.__param(0, (0, rest_1.requestBody)({
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Order, {
                    title: 'NewOrder',
                    exclude: ['id', 'createdAt', 'updatedAt'],
                }),
            },
        },
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderController.prototype, "create", null);
tslib_1.__decorate([
    (0, rest_1.get)('/orders/count'),
    (0, rest_1.response)(200, {
        description: 'Order model count',
        content: { 'application/json': { schema: repository_1.CountSchema } },
    }),
    tslib_1.__param(0, rest_1.param.where(models_1.Order)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderController.prototype, "count", null);
tslib_1.__decorate([
    (0, rest_1.get)('/orders'),
    (0, rest_1.response)(200, {
        description: 'Array of Order model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: (0, rest_1.getModelSchemaRef)(models_1.Order, { includeRelations: true }),
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.filter(models_1.Order)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderController.prototype, "find", null);
tslib_1.__decorate([
    (0, rest_1.get)('/orders/my-orders'),
    (0, authentication_1.authenticate)('jwt')
    //@authorize({allowedRoles: ['vendor']})
    ,
    (0, rest_1.response)(200, {
        description: 'Current vendor orders',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: (0, rest_1.getModelSchemaRef)(models_1.Order, { includeRelations: true }),
                },
            },
        },
    }),
    tslib_1.__param(0, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.filter(models_1.Order)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderController.prototype, "getMyOrders", null);
tslib_1.__decorate([
    (0, rest_1.get)('/orders/analytics'),
    (0, authentication_1.authenticate)('jwt')
    //@authorize({allowedRoles: ['vendor']})
    ,
    (0, rest_1.response)(200, {
        description: 'Order analytics for current vendor',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        totalOrders: { type: 'number' },
                        totalRevenue: { type: 'number' },
                        todayOrders: { type: 'number' },
                        todayRevenue: { type: 'number' },
                        weeklyOrders: { type: 'array', items: { type: 'number' } },
                        weeklyRevenue: { type: 'array', items: { type: 'number' } },
                        topProducts: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    orders: { type: 'number' },
                                    revenue: { type: 'number' },
                                },
                            },
                        },
                        ordersByStatus: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string' },
                                    count: { type: 'number' },
                                },
                            },
                        },
                    },
                },
            },
        },
    }),
    tslib_1.__param(0, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderController.prototype, "getAnalytics", null);
tslib_1.__decorate([
    (0, rest_1.get)('/orders/{id}'),
    (0, rest_1.response)(200, {
        description: 'Order model instance',
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Order, { includeRelations: true }),
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('id')),
    tslib_1.__param(1, rest_1.param.filter(models_1.Order, { exclude: 'where' })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderController.prototype, "findById", null);
tslib_1.__decorate([
    (0, rest_1.patch)('/orders/{id}/status'),
    (0, authentication_1.authenticate)('jwt')
    //@authorize({allowedRoles: ['vendor']})
    ,
    (0, rest_1.response)(204, {
        description: 'Update order status',
    }),
    tslib_1.__param(0, rest_1.param.path.string('id')),
    tslib_1.__param(1, (0, rest_1.requestBody)({
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: {
                            type: 'string',
                            enum: Object.values(models_1.OrderStatus),
                        },
                    },
                },
            },
        },
    })),
    tslib_1.__param(2, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderController.prototype, "updateStatus", null);
tslib_1.__decorate([
    (0, rest_1.patch)('/orders/{id}'),
    (0, authentication_1.authenticate)('jwt'),
    (0, authorization_1.authorize)({ allowedRoles: ['vendor'] }),
    (0, rest_1.response)(204, {
        description: 'Order PATCH success',
    }),
    tslib_1.__param(0, rest_1.param.path.string('id')),
    tslib_1.__param(1, (0, rest_1.requestBody)({
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Order, { partial: true, exclude: ['id', 'vendorId', 'productId'] }),
            },
        },
    })),
    tslib_1.__param(2, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderController.prototype, "updateById", null);
tslib_1.__decorate([
    (0, rest_1.del)('/orders/{id}'),
    (0, authentication_1.authenticate)('jwt'),
    (0, authorization_1.authorize)({ allowedRoles: ['vendor'] }),
    (0, rest_1.response)(204, {
        description: 'Order DELETE success',
    }),
    tslib_1.__param(0, rest_1.param.path.string('id')),
    tslib_1.__param(1, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderController.prototype, "deleteById", null);
exports.OrderController = OrderController = tslib_1.__decorate([
    tslib_1.__param(0, (0, repository_1.repository)(repositories_1.OrderRepository)),
    tslib_1.__param(1, (0, repository_1.repository)(repositories_1.ProductRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.OrderRepository,
        repositories_1.ProductRepository])
], OrderController);
//# sourceMappingURL=order.controller.js.map