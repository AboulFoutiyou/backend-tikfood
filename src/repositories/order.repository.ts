import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/db.datasource';
import {Order, OrderRelations, Vendor, Product} from '../models';
import {VendorRepository} from './vendor.repository';
import {ProductRepository} from './product.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {
  public readonly vendor: BelongsToAccessor<Vendor, typeof Order.prototype.id>;
  public readonly product: BelongsToAccessor<Product, typeof Order.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: MongodbDataSource,
    @repository.getter('VendorRepository') protected vendorRepositoryGetter: Getter<VendorRepository>,
    @repository.getter('ProductRepository') protected productRepositoryGetter: Getter<ProductRepository>,
  ) {
    super(Order, dataSource);
    this.product = this.createBelongsToAccessorFor('product', productRepositoryGetter,);
    this.registerInclusionResolver('product', this.product.inclusionResolver);
    this.vendor = this.createBelongsToAccessorFor('vendor', vendorRepositoryGetter,);
    this.registerInclusionResolver('vendor', this.vendor.inclusionResolver);
  }
}