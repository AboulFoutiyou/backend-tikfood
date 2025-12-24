import {Entity, model, property, hasMany} from '@loopback/repository';
import {Order} from './order.model';
import { User } from '@loopback/authentication-jwt';

@model()
export class Client extends Entity {
  @property({
    type: 'string',
    id: true,
    genrated: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: false, // rend l'email optionnel
  })
  email?: string;

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