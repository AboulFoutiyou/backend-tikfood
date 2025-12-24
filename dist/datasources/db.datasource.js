"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongodbDataSource = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const config = {
    name: 'db',
    connector: 'mongodb',
    url: 'mongodb+srv://foutiyou_db_user:16641@tikfood1.7agnjzi.mongodb.net/tikfoodbd?retryWrites=true&w=majority',
    useNewUrlParser: true,
    useUnifiedTopology: true
};
// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
let MongodbDataSource = class MongodbDataSource extends repository_1.juggler.DataSource {
    constructor(dsConfig = config) {
        super(dsConfig);
    }
};
exports.MongodbDataSource = MongodbDataSource;
MongodbDataSource.dataSourceName = 'db';
MongodbDataSource.defaultConfig = config;
exports.MongodbDataSource = MongodbDataSource = tslib_1.__decorate([
    (0, core_1.lifeCycleObserver)('datasource'),
    tslib_1.__param(0, (0, core_1.inject)('datasources.config.db', { optional: true })),
    tslib_1.__metadata("design:paramtypes", [Object])
], MongodbDataSource);
//# sourceMappingURL=db.datasource.js.map