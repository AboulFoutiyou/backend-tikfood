"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vendor = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const product_model_1 = require("./product.model");
const order_model_1 = require("./order.model");
let Vendor = class Vendor extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
exports.Vendor = Vendor;
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        id: true,
        genrated: true,
    }),
    tslib_1.__metadata("design:type", String)
], Vendor.prototype, "id", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: false,
    }),
    tslib_1.__metadata("design:type", String)
], Vendor.prototype, "email", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Vendor.prototype, "name", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Vendor.prototype, "password", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Vendor.prototype, "description", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Vendor.prototype, "location", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Vendor.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'boolean',
        default: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], Vendor.prototype, "isAvailable", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'object',
    }),
    tslib_1.__metadata("design:type", Object)
], Vendor.prototype, "openingHours", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Vendor.prototype, "avatar", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'date',
        default: () => new Date(),
    }),
    tslib_1.__metadata("design:type", Date)
], Vendor.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'date',
        default: () => new Date(),
    }),
    tslib_1.__metadata("design:type", Date)
], Vendor.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, repository_1.hasMany)(() => product_model_1.Product),
    tslib_1.__metadata("design:type", Array)
], Vendor.prototype, "products", void 0);
tslib_1.__decorate([
    (0, repository_1.hasMany)(() => order_model_1.Order),
    tslib_1.__metadata("design:type", Array)
], Vendor.prototype, "orders", void 0);
exports.Vendor = Vendor = tslib_1.__decorate([
    (0, repository_1.model)(),
    tslib_1.__metadata("design:paramtypes", [Object])
], Vendor);
//# sourceMappingURL=vendor.model.js.map