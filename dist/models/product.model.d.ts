import { Entity } from '@loopback/repository';
import { Vendor } from './vendor.model';
import { Order } from './order.model';
export declare enum ProductCategory {
    SUCRE = "sucr\u00E9",
    SALE = "sal\u00E9",
    MIXTE = "mixte",
    JUS = "jus"
}
export declare class Product extends Entity {
    id?: string;
    name: string;
    description?: string;
    price: number;
    category: ProductCategory;
    images?: string[];
    isAvailable?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    vendorId: string;
    orders: Order[];
    constructor(data?: Partial<Product>);
}
export interface ProductRelations {
    vendor?: Vendor;
    orders?: Order[];
}
export type ProductWithRelations = Product & ProductRelations;
