import { UserProfile } from '@loopback/security';
import { Client, Order } from '../models';
import { ClientRepository, OrderRepository, VendorRepository } from '../repositories';
import { Credentials } from '../types';
import { ClientUserService } from '../services/client-user.service';
export declare class ClientController {
    clientRepository: ClientRepository;
    orderRepository: OrderRepository;
    clientUserService: ClientUserService;
    vendorRepository: VendorRepository;
    constructor(clientRepository: ClientRepository, orderRepository: OrderRepository, clientUserService: ClientUserService, vendorRepository: VendorRepository);
    register(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
        client: Client;
    }>;
    login(credentials: Credentials): Promise<{
        token: string;
        client: Client;
    }>;
    getCurrentClient(currentUser: UserProfile): Promise<Client>;
    placeOrder(clientId: string, orderData: Omit<Order, 'id' | 'clientId'>): Promise<Order>;
    getClientOrders(clientId: string): Promise<Order[]>;
    deleteClient(clientId: string): Promise<{
        message: string;
    }>;
    updateClientProfile(clientId: string, clientData: Partial<Client>): Promise<Client>;
    changePassword(clientId: string, passwords: {
        oldPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
