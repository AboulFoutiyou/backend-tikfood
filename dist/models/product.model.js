"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = exports.ProductCategory = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const vendor_model_1 = require("./vendor.model");
const order_model_1 = require("./order.model");
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["SUCRE"] = "sucr\u00E9";
    ProductCategory["SALE"] = "sal\u00E9";
    ProductCategory["MIXTE"] = "mixte";
    ProductCategory["JUS"] = "jus";
})(ProductCategory || (exports.ProductCategory = ProductCategory = {}));
let Product = class Product extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
exports.Product = Product;
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        id: true,
        generated: true,
        // required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "id", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "name", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "description", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'number',
        required: true,
    }),
    tslib_1.__metadata("design:type", Number)
], Product.prototype, "price", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
        jsonSchema: {
            enum: Object.values(ProductCategory),
        },
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "category", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'array',
        itemType: 'string',
    }),
    tslib_1.__metadata("design:type", Array)
], Product.prototype, "images", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'boolean',
        default: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], Product.prototype, "isAvailable", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'date',
        default: () => new Date(),
    }),
    tslib_1.__metadata("design:type", Date)
], Product.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'date',
        default: () => new Date(),
    }),
    tslib_1.__metadata("design:type", Date)
], Product.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, repository_1.belongsTo)(() => vendor_model_1.Vendor),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "vendorId", void 0);
tslib_1.__decorate([
    (0, repository_1.hasMany)(() => order_model_1.Order),
    tslib_1.__metadata("design:type", Array)
], Product.prototype, "orders", void 0);
exports.Product = Product = tslib_1.__decorate([
    (0, repository_1.model)(),
    tslib_1.__metadata("design:paramtypes", [Object])
], Product);
//# sourceMappingURL=product.model.js.map