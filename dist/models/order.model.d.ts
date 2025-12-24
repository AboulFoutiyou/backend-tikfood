import { Entity } from '@loopback/repository';
import { Vendor } from './vendor.model';
import { Product } from './product.model';
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PREPARING = "preparing",
    READY = "ready",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare class Order extends Entity {
    id?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    quantity: number;
    totalPrice: number;
    status: OrderStatus;
    deliveryAddress: string;
    notes?: string;
    orderDate?: Date;
    createdAt: Date;
    updatedAt?: Date;
    vendorId: string;
    productId: string;
    clientId: string;
    constructor(data?: Partial<Order>);
}
export interface OrderRelations {
    vendor?: Vendor;
    product?: Product;
}
export type OrderWithRelations = Order & OrderRelations;
