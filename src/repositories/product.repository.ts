import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/db.datasource';
import {Product, ProductRelations, Vendor, Order} from '../models';
import {VendorRepository} from './vendor.repository';
import {OrderRepository} from './order.repository';

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.id,
  ProductRelations
> {
  public readonly vendor: BelongsToAccessor<Vendor, typeof Product.prototype.id>;
  public readonly orders: HasManyRepositoryFactory<Order, typeof Product.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: MongodbDataSource,
    @repository.getter('VendorRepository') protected vendorRepositoryGetter: Getter<VendorRepository>,
    @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Product, dataSource);
    this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter,);
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
    this.vendor = this.createBelongsToAccessorFor('vendor', vendorRepositoryGetter,);
    this.registerInclusionResolver('vendor', this.vendor.inclusionResolver);
  }

  async findAvailableProducts() {
    return this.find({
      where: {
        isAvailable: true,
      },
      include: [
        {
          relation: 'vendor',
          scope: {
            where: {
              isAvailable: true,
            },
          },
        },
      ],
    });
  }
}