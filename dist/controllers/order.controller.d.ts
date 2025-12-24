import { Count, Filter, FilterExcludingWhere, Where } from '@loopback/repository';
import { UserProfile } from '@loopback/security';
import { Order, OrderStatus } from '../models';
import { OrderRepository, ProductRepository } from '../repositories';
export declare class OrderController {
    orderRepository: OrderRepository;
    productRepository: ProductRepository;
    constructor(orderRepository: OrderRepository, productRepository: ProductRepository);
    create(order: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Order>;
    count(where?: Where<Order>): Promise<Count>;
    find(filter?: Filter<Order>): Promise<Order[]>;
    getMyOrders(currentUser: UserProfile, filter?: Filter<Order>): Promise<Order[]>;
    getAnalytics(currentUser: UserProfile): Promise<any>;
    getWeeklyRevenueByWeekday(orders: any[], referenceDate?: Date): number[];
    getWeeklyCountsByWeekday(orders: any[], referenceDate?: Date): any[];
    findById(id: string, filter?: FilterExcludingWhere<Order>): Promise<Order>;
    updateStatus(id: string, statusUpdate: {
        status: OrderStatus;
    }, currentUser: UserProfile): Promise<void>;
    updateById(id: string, order: Partial<Order>, currentUser: UserProfile): Promise<void>;
    deleteById(id: string, currentUser: UserProfile): Promise<void>;
}
