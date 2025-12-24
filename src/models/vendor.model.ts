import {Entity, model, property, hasMany} from '@loopback/repository';
import {Product} from './product.model';
import {Order} from './order.model';
import { User } from '@loopback/authentication-jwt';

@model()
export class Vendor extends Entity {
  @property({
    type: 'string',
    id: true,
    genrated: true,
  })
  id: string;

  @property({
    type: 'string',
    required: false,
  })
  email?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;


  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
  })
  location?: string;

  @property({
    type: 'string',
  })
  phone?: string;

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