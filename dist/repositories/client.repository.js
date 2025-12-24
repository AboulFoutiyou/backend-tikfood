"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRepository = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const db_datasource_1 = require("../datasources/db.datasource");
const models_1 = require("../models");
let ClientRepository = class ClientRepository extends repository_1.DefaultCrudRepository {
    constructor(dataSource, orderRepositoryGetter) {
        super(models_1.Client, dataSource);
        this.orderRepositoryGetter = orderRepositoryGetter;
        this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter);
        this.registerInclusionResolver('orders', this.orders.inclusionResolver);
    }
    async findByEmail(email) {
        const client = await this.findOne({ where: { email } });
        return client;
    }
    async findByTelephone(phone) {
        const client = await this.findOne({ where: { phone } });
        return client;
    }
};
exports.ClientRepository = ClientRepository;
exports.ClientRepository = ClientRepository = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)('datasources.db')),
    tslib_1.__param(1, repository_1.repository.getter('OrderRepository')),
    tslib_1.__metadata("design:paramtypes", [db_datasource_1.MongodbDataSource, Function])
], ClientRepository);
//# sourceMappingURL=client.repository.js.map