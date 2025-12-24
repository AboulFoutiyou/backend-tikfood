import { Getter } from '@loopback/core';
import { DefaultCrudRepository, BelongsToAccessor, HasManyRepositoryFactory } from '@loopback/repository';
import { MongodbDataSource } from '../datasources/db.datasource';
import { Product, ProductRelations, Vendor, Order } from '../models';
import { VendorRepository } from './vendor.repository';
import { OrderRepository } from './order.repository';
export declare class ProductRepository extends DefaultCrudRepository<Product, typeof Product.prototype.id, ProductRelations> {
    protected vendorRepositoryGetter: Getter<VendorRepository>;
    protected orderRepositoryGetter: Getter<OrderRepository>;
    readonly vendor: BelongsToAccessor<Vendor, typeof Product.prototype.id>;
    readonly orders: HasManyRepositoryFactory<Order, typeof Product.prototype.id>;
    constructor(dataSource: MongodbDataSource, vendorRepositoryGetter: Getter<VendorRepository>, orderRepositoryGetter: Getter<OrderRepository>);
    findAvailableProducts(): Promise<(Product & ProductRelations)[]>;
}
