import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/db.datasource';
import {Client, ClientRelations, Order} from '../models';
import {OrderRepository} from './order.repository';

export class ClientRepository extends DefaultCrudRepository<
  Client,
  typeof Client.prototype.id,
  ClientRelations
> {
  public readonly orders: HasManyRepositoryFactory<Order, typeof Client.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: MongodbDataSource,
    @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Client, dataSource);
    this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter);
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
  }

  async findByEmail(email: string): Promise<Client | null> {
    const client = await this.findOne({where: {email}});
    return client;
  }

  async findByTelephone(phone: string): Promise<Client | null> {
    const client = await this.findOne({where: {phone}});
    return client;
  }
}