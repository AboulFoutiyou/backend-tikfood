"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = exports.OrderStatus = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const vendor_model_1 = require("./vendor.model");
const product_model_1 = require("./product.model");
const client_model_1 = require("./client.model");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["PREPARING"] = "preparing";
    OrderStatus["READY"] = "ready";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
let Order = class Order extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
exports.Order = Order;
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        id: true,
        generated: true,
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "id", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "customerName", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "customerPhone", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "customerEmail", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'number',
        required: true,
        default: 1,
    }),
    tslib_1.__metadata("design:type", Number)
], Order.prototype, "quantity", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'number',
        required: true,
    }),
    tslib_1.__metadata("design:type", Number)
], Order.prototype, "totalPrice", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
        default: OrderStatus.PENDING,
        jsonSchema: {
            enum: Object.values(OrderStatus),
        },
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "status", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "deliveryAddress", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'date',
        default: () => new Date(),
    }),
    tslib_1.__metadata("design:type", Date)
], Order.prototype, "orderDate", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'date',
        default: () => new Date(),
    }),
    tslib_1.__metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'date',
        default: () => new Date(),
    }),
    tslib_1.__metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, repository_1.belongsTo)(() => vendor_model_1.Vendor),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "vendorId", void 0);
tslib_1.__decorate([
    (0, repository_1.belongsTo)(() => product_model_1.Product),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "productId", void 0);
tslib_1.__decorate([
    (0, repository_1.belongsTo)(() => client_model_1.Client),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "clientId", void 0);
exports.Order = Order = tslib_1.__decorate([
    (0, repository_1.model)(),
    tslib_1.__metadata("design:paramtypes", [Object])
], Order);
//# sourceMappingURL=order.model.js.map