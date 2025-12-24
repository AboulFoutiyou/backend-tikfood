"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const order_model_1 = require("./order.model");
let Client = class Client extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
exports.Client = Client;
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        id: true,
        genrated: true,
    }),
    tslib_1.__metadata("design:type", String)
], Client.prototype, "id", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Client.prototype, "name", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: false, // rend l'email optionnel
    }),
    tslib_1.__metadata("design:type", String)
], Client.prototype, "email", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Client.prototype, "password", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Client.prototype, "description", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Client.prototype, "location", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Client.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'boolean',
        default: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], Client.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'date',
        default: () => new Date(),
    }),
    tslib_1.__metadata("design:type", Date)
], Client.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'date',
        default: () => new Date(),
    }),
    tslib_1.__metadata("design:type", Date)
], Client.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, repository_1.hasMany)(() => order_model_1.Order),
    tslib_1.__metadata("design:type", Array)
], Client.prototype, "orders", void 0);
exports.Client = Client = tslib_1.__decorate([
    (0, repository_1.model)(),
    tslib_1.__metadata("design:paramtypes", [Object])
], Client);
//# sourceMappingURL=client.model.js.map