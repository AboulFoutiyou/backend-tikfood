import { Getter } from '@loopback/core';
import { DefaultCrudRepository, HasManyRepositoryFactory } from '@loopback/repository';
import { MongodbDataSource } from '../datasources/db.datasource';
import { Vendor, VendorRelations, Product, Order } from '../models';
import { ProductRepository } from './product.repository';
import { OrderRepository } from './order.repository';
export declare class VendorRepository extends DefaultCrudRepository<Vendor, typeof Vendor.prototype.id, VendorRelations> {
    protected productRepositoryGetter: Getter<ProductRepository>;
    protected orderRepositoryGetter: Getter<OrderRepository>;
    readonly products: HasManyRepositoryFactory<Product, typeof Vendor.prototype.id>;
    readonly orders: HasManyRepositoryFactory<Order, typeof Vendor.prototype.id>;
    constructor(dataSource: MongodbDataSource, productRepositoryGetter: Getter<ProductRepository>, orderRepositoryGetter: Getter<OrderRepository>);
    findByEmail(email: string): Promise<Vendor | null>;
    findByTelephone(phone: string): Promise<Vendor | null>;
}
