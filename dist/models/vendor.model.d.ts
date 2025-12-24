import { Entity } from '@loopback/repository';
import { Product } from './product.model';
import { Order } from './order.model';
export declare class Vendor extends Entity {
    id: string;
    email?: string;
    name: string;
    password: string;
    description?: string;
    location?: string;
    phone?: string;
    isAvailable?: boolean;
    openingHours?: {
        start: string;
        end: string;
    };
    avatar?: string;
    createdAt?: Date;
    updatedAt?: Date;
    products: Product[];
    orders: Order[];
    constructor(data?: Partial<Vendor>);
}
export interface VendorRelations {
    products?: Product[];
    orders?: Order[];
}
export type VendorWithRelations = Vendor & VendorRelations;
