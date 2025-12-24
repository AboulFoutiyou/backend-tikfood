/// <reference types="express" />
import { Count, Filter, FilterExcludingWhere, Where } from '@loopback/repository';
import { UserProfile } from '@loopback/security';
import { Product } from '../models';
import { ProductRepository, VendorRepository } from '../repositories';
import { Request, Response } from '@loopback/rest';
export declare class ProductController {
    productRepository: ProductRepository;
    vendorRepository: VendorRepository;
    constructor(productRepository: ProductRepository, vendorRepository: VendorRepository);
    create(request: Request, response: Response, currentUser: UserProfile): Promise<Product>;
    count(where?: Where<Product>): Promise<Count>;
    find(filter?: Filter<Product>): Promise<Product[]>;
    getFeed(): Promise<Product[]>;
    findByVendor(vendorId: string, filter?: Filter<Product>): Promise<Product[]>;
    getMyProducts(currentUser: UserProfile, filter?: Filter<Product>): Promise<Product[]>;
    findById(id: string, filter?: FilterExcludingWhere<Product>): Promise<Product>;
    updateById(id: string, product: Partial<Product>, currentUser: UserProfile): Promise<void>;
    toggleAvailability(id: string, currentUser: UserProfile): Promise<void>;
    deleteById(id: string, currentUser: UserProfile): Promise<void>;
}
