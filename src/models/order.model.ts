import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Vendor} from './vendor.model';
import {Product} from './product.model';
import {Client} from './client.model';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@model()
export class Order extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  customerName: string;

  @property({
    type: 'string',
    required: true,
  })
  customerPhone: string;

  @property({
    type: 'string',
  })
  customerEmail?: string;

  @property({
    type: 'number',
    required: true,
    default: 1,
  })
  quantity: number;

  @property({
    type: 'number',
    required: true,
  })
  totalPrice: number;

  @property({
    type: 'string',
    required: true,
    default: OrderStatus.PENDING,
    jsonSchema: {
      enum: Object.values(OrderStatus),
    },
  })
  status: OrderStatus;

  @property({
    type: 'string',
    required: true,
  })
  deliveryAddress: string;

  @property({
    type: 'string',
  })
  notes?: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  orderDate?: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedAt?: Date;

  @belongsTo(() => Vendor)
  vendorId: string;

  @belongsTo(() => Product)
  productId: string;

  @belongsTo(() => Client)
  clientId: string;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  vendor?: Vendor;
  product?: Product;
}

export type OrderWithRelations = Order & OrderRelations;