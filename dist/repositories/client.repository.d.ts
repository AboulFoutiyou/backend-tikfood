import { Getter } from '@loopback/core';
import { DefaultCrudRepository, HasManyRepositoryFactory } from '@loopback/repository';
import { MongodbDataSource } from '../datasources/db.datasource';
import { Client, ClientRelations, Order } from '../models';
import { OrderRepository } from './order.repository';
export declare class ClientRepository extends DefaultCrudRepository<Client, typeof Client.prototype.id, ClientRelations> {
    protected orderRepositoryGetter: Getter<OrderRepository>;
    readonly orders: HasManyRepositoryFactory<Order, typeof Client.prototype.id>;
    constructor(dataSource: MongodbDataSource, orderRepositoryGetter: Getter<OrderRepository>);
    findByEmail(email: string): Promise<Client | null>;
    findByTelephone(phone: string): Promise<Client | null>;
}
