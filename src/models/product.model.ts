import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {Vendor} from './vendor.model';
import {Order} from './order.model';

export enum ProductCategory {
  SUCRE = 'sucré',
  SALE = 'salé',
  MIXTE = 'mixte',
  JUS = 'jus',
}

@model()
export class Product extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    // required: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'number',
    required: true,
  })
  price: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(ProductCategory),
    },
  })
  category: ProductCategory;

  @property({
    type: 'array',
    itemType: 'string',
  })
  images?: string[];

  @property({
    type: 'boolean',
    default: true,
  })
  isAvailable?: boolean;

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

  // une propriété 'composition' qui decrit la composition du produit: designation et quantité(optionnelle)
  @property({
    type: 'array',
    itemType: 'object',
  })
  composition?: {designation: string; quantity?: string}[];

  @belongsTo(() => Vendor)
  vendorId: string;

  @hasMany(() => Order)
  orders: Order[];

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  vendor?: Vendor;
  orders?: Order[];
}

export type ProductWithRelations = Product & ProductRelations;