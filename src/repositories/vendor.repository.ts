import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/db.datasource';
import {Vendor, VendorRelations, Product, Order} from '../models';
import {ProductRepository} from './product.repository';
import {OrderRepository} from './order.repository';

export class VendorRepository extends DefaultCrudRepository<
  Vendor,
  typeof Vendor.prototype.id,
  VendorRelations
> {
  public readonly products: HasManyRepositoryFactory<Product, typeof Vendor.prototype.id>;
  public readonly orders: HasManyRepositoryFactory<Order, typeof Vendor.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: MongodbDataSource,
    @repository.getter('ProductRepository') protected productRepositoryGetter: Getter<ProductRepository>,
    @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Vendor, dataSource);
    this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter,);
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
    this.products = this.createHasManyRepositoryFactoryFor('products', productRepositoryGetter,);
    this.registerInclusionResolver('products', this.products.inclusionResolver);
  }

  async findByEmail(email: string): Promise<Vendor | null> {
    const vendor = await this.findOne({where: {email}});
    return vendor;
  }

  async findByTelephone(phone: string): Promise<Vendor | null> {
    const vendor = await this.findOne({where: {phone}});
    return vendor;
  }
}