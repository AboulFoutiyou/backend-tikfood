import { Entity } from '@loopback/repository';
import { Order } from './order.model';
export declare class Client extends Entity {
    id: string;
    name: string;
    email?: string;
    password: string;
    description?: string;
    location?: string;
    phone?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    orders: Order[];
    constructor(data?: Partial<Client>);
}
export interface ClientRelations {
    orders?: Order[];
}
export type ClientWithRelations = Client & ClientRelations;
