import { Getter } from '@loopback/core';
import { DefaultCrudRepository, BelongsToAccessor } from '@loopback/repository';
import { MongodbDataSource } from '../datasources/db.datasource';
import { Order, OrderRelations, Vendor, Product } from '../models';
import { VendorRepository } from './vendor.repository';
import { ProductRepository } from './product.repository';
export declare class OrderRepository extends DefaultCrudRepository<Order, typeof Order.prototype.id, OrderRelations> {
    protected vendorRepositoryGetter: Getter<VendorRepository>;
    protected productRepositoryGetter: Getter<ProductRepository>;
    readonly vendor: BelongsToAccessor<Vendor, typeof Order.prototype.id>;
    readonly product: BelongsToAccessor<Product, typeof Order.prototype.id>;
    constructor(dataSource: MongodbDataSource, vendorRepositoryGetter: Getter<VendorRepository>, productRepositoryGetter: Getter<ProductRepository>);
}
