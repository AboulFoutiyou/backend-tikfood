import {Entity, model, property, hasMany} from '@loopback/repository';
import {Order} from './order.model';
import { User } from '@loopback/authentication-jwt';
import { Simple } from './simple.model';

@model()
export class Client extends Simple {

  @property({
    type: 'boolean',
    default: true,
  })
  isActive?: boolean;

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

  @hasMany(() => Order)
  orders: Order[];

  constructor(data?: Partial<Client>) {
    super(data);
  }
}

export interface ClientRelations {
  orders?: Order[];
}

export type ClientWithRelations = Client & ClientRelations;