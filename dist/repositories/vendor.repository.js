"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRepository = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const db_datasource_1 = require("../datasources/db.datasource");
const models_1 = require("../models");
let VendorRepository = class VendorRepository extends repository_1.DefaultCrudRepository {
    constructor(dataSource, productRepositoryGetter, orderRepositoryGetter) {
        super(models_1.Vendor, dataSource);
        this.productRepositoryGetter = productRepositoryGetter;
        this.orderRepositoryGetter = orderRepositoryGetter;
        this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter);
        this.registerInclusionResolver('orders', this.orders.inclusionResolver);
        this.products = this.createHasManyRepositoryFactoryFor('products', productRepositoryGetter);
        this.registerInclusionResolver('products', this.products.inclusionResolver);
    }
    async findByEmail(email) {
        const vendor = await this.findOne({ where: { email } });
        return vendor;
    }
    async findByTelephone(phone) {
        const vendor = await this.findOne({ where: { phone } });
        return vendor;
    }
};
exports.VendorRepository = VendorRepository;
exports.VendorRepository = VendorRepository = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)('datasources.db')),
    tslib_1.__param(1, repository_1.repository.getter('ProductRepository')),
    tslib_1.__param(2, repository_1.repository.getter('OrderRepository')),
    tslib_1.__metadata("design:paramtypes", [db_datasource_1.MongodbDataSource, Function, Function])
], VendorRepository);
//# sourceMappingURL=vendor.repository.js.map