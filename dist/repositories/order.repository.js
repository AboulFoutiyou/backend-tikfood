"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const db_datasource_1 = require("../datasources/db.datasource");
const models_1 = require("../models");
let OrderRepository = class OrderRepository extends repository_1.DefaultCrudRepository {
    constructor(dataSource, vendorRepositoryGetter, productRepositoryGetter) {
        super(models_1.Order, dataSource);
        this.vendorRepositoryGetter = vendorRepositoryGetter;
        this.productRepositoryGetter = productRepositoryGetter;
        this.product = this.createBelongsToAccessorFor('product', productRepositoryGetter);
        this.registerInclusionResolver('product', this.product.inclusionResolver);
        this.vendor = this.createBelongsToAccessorFor('vendor', vendorRepositoryGetter);
        this.registerInclusionResolver('vendor', this.vendor.inclusionResolver);
    }
};
exports.OrderRepository = OrderRepository;
exports.OrderRepository = OrderRepository = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)('datasources.db')),
    tslib_1.__param(1, repository_1.repository.getter('VendorRepository')),
    tslib_1.__param(2, repository_1.repository.getter('ProductRepository')),
    tslib_1.__metadata("design:paramtypes", [db_datasource_1.MongodbDataSource, Function, Function])
], OrderRepository);
//# sourceMappingURL=order.repository.js.map