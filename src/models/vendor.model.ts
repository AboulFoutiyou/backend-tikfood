import {Entity, model, property, hasMany} from '@loopback/repository';
import {Product} from './product.model';
import {Order} from './order.model';
import { User } from '@loopback/authentication-jwt';
import { Simple } from './simple.model';

@model()
export class Vendor extends Simple {

  @property({
    type: 'boolean',
    default: true,
  })
  isAvailable?: boolean;

  @property({
    type: 'object',
  })
  openingHours?: {
    start: string;
    end: string;
  };

  @property({
    type: 'string',
  })
  avatar?: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedAt?: Date;

  @hasMany(() => Product)
  products: Product[];

  @hasMany(() => Order)
  orders: Order[];

  constructor(data?: Partial<Vendor>) {
    super(data);
  }
}

export interface VendorRelations {
  products?: Product[];
  orders?: Order[];
}

export type VendorWithRelations = Vendor & VendorRelations;