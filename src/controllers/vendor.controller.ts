import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Vendor} from '../models';
import {VendorRepository} from '../repositories';
import {VendorUserService} from '../services/vendor-user.service';
import {Credentials} from '../types';
import {validateCredentials} from '../services/validator.service';
import * as bcrypt from 'bcryptjs';
import { OrderStatus } from '../models';
import { HttpErrors } from '@loopback/rest';
import { ClientRepository } from '../repositories';

export class VendorController {
  constructor(
    @repository(VendorRepository)
    public vendorRepository: VendorRepository,
    @inject('services.VendorUserService')
    public vendorUserService: VendorUserService,
    @repository(ClientRepository)
    public clientRepository: ClientRepository,
  ) {}

  @post('/vendors/register')
  @response(200, {
    description: 'Vendor registration',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {type: 'string'},
            vendor: getModelSchemaRef(Vendor, {exclude: ['password']}),
          },
        },
      },
    },
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Vendor, {
            title: 'VendorRegistration',
            exclude: ['id', 'createdAt', 'updatedAt'],
          }),
        },
      },
    })
    vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>,
  ) {

    console.log('--- REQUÊTE REÇUE SUR /vendors/register ---');
        console.log('Données brutes reçues :', JSON.stringify(vendor, null, 2));
        
    if (vendor.email) {
      validateCredentials({email: vendor.email, password: vendor.password});
    }

    if (vendor.phone) {
      validateCredentials({phone: vendor.phone, password: vendor.password});
    }

    // Check if email or phone already exists in vendors
    if (vendor.email) {
      const existingVendor = await this.vendorRepository.findOne({ 
        where: {email: vendor.email},
      });
      if (existingVendor) {
        throw new HttpErrors.UnprocessableEntity('Un compte avec cet email existe déjà');
      }

      const existingClient= await this.clientRepository.findOne({
        where: {email: vendor.email},
      });
      if (existingClient) {
        throw new HttpErrors.UnprocessableEntity('Un compte client avec cet email existe déjà');
      }
    }

    if (vendor.phone) {
      const existingVendorByPhone = await this.vendorRepository.findOne({
        where: {phone: vendor.phone},
      });
      if (existingVendorByPhone) {
        throw new HttpErrors.UnprocessableEntity('Un compte avec ce numéro de téléphone existe déjà');
      }
      const existingClientByPhone = await this.clientRepository.findOne({
        where: {phone: vendor.phone},
      });
      if (existingClientByPhone) {
        throw new HttpErrors.UnprocessableEntity('Un compte client avec ce numéro de téléphone existe déjà');
      }
    }

    // Verifier la longueur du mot de passe : minimum 8 caractères
    if (vendor.password.length < 8) {
      throw new HttpErrors.UnprocessableEntity('Le mot de passe doit contenir au moins 8 caractères');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(vendor.password, 10);
    vendor.password = hashedPassword;

    const savedVendor = await this.vendorRepository.create(vendor);
    delete (savedVendor as any).password;

    const token = await this.vendorUserService.generateToken(savedVendor);

    return {
      token,
      vendor: savedVendor,
    };
  }

  @post('/vendors/login')
  @response(200, {
    description: 'Vendor login',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {type: 'string'},
            vendor: getModelSchemaRef(Vendor, {exclude: ['password']}),
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['password'],
            properties: {
              email: {type: 'string', format: 'email'},
              phone: {type: 'string'},
              password: {type: 'string', minLength: 8},
            },
          },
        },
      },
    })
    credentials: Credentials,
  ) {
    const vendor = await this.vendorUserService.verifyCredentials(credentials);
    const token = await this.vendorUserService.generateToken(vendor);

    delete (vendor as any).password;

    return {
      token,
      vendor,
    };
  }

  @get('/vendors/me')
  @authenticate('jwt')
  @response(200, {
    description: 'Current vendor profile',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Vendor, {exclude: ['password']}),
      },
    },
  })
  async getCurrentVendor(
    @inject(SecurityBindings.USER) currentUser: UserProfile,
  ): Promise<Vendor> {
    const vendor = await this.vendorRepository.findById(currentUser.id, {
      fields: {password: false},
    });
    return vendor;
  }

  @get('/vendors/count')
  @response(200, {
    description: 'Vendor model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Vendor) where?: Where<Vendor>): Promise<Count> {
    return this.vendorRepository.count(where);
  }

  @get('/vendors')
  @response(200, {
    description: 'Array of Vendor model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Vendor, {
            includeRelations: true,
            exclude: ['password'],
          }),
        },
      },
    },
  })
  async find(@param.filter(Vendor) filter?: Filter<Vendor>): Promise<Vendor[]> {
    return this.vendorRepository.find({
      ...filter,
      fields: {password: false, ...filter?.fields},
    });
  }

  @get('/vendors/{id}')
  @response(200, {
    description: 'Vendor model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Vendor, {
          includeRelations: true,
          exclude: ['password'],
        }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Vendor, {exclude: 'where'})
    filter?: FilterExcludingWhere<Vendor>,
  ): Promise<Vendor> {
    return this.vendorRepository.findById(id, {
      ...filter,
      fields: {password: false, ...filter?.fields},
    });
  }

  @patch('/vendors/{id}')
  @authenticate('jwt')
  @response(204, {
    description: 'Vendor PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Vendor, {partial: true, exclude: ['id', 'createdAt', 'password']}),
        },
      },
    })
    vendor: Partial<Vendor>,
    @inject(SecurityBindings.USER) currentUser: UserProfile,
  ): Promise<void> {
    // Ensure vendor can only update their own profile
    if (currentUser.id !== id) {
      throw new HttpErrors.Unauthorized('Non autorisé');
    }

    // Verify if phone number is being updated and is unique
    if (vendor.phone) {
      const existingVendor = await this.vendorRepository.findOne({
        where: {
          phone: vendor.phone,
          id: {neq: id},
        },
      });
      if (existingVendor) {
        throw new HttpErrors.UnprocessableEntity('Un compte avec ce numéro de téléphone existe déjà');
      }

      const existingClient = await this.clientRepository.findOne({
        where: {
          phone: vendor.phone,
        },
      });
      if (existingClient) {
        throw new HttpErrors.UnprocessableEntity('Un compte client avec ce numéro de téléphone existe déjà');
      }
    }

    vendor.updatedAt = new Date();
    await this.vendorRepository.updateById(id, vendor);
  }

  @patch('/vendors/{id}/availability')
  @authenticate('jwt')
  //@authorize({allowedRoles: ['vendor']})
  @response(204, {
    description: 'Toggle vendor availability',
  })
  async toggleAvailability(
    @param.path.string('id') id: string,
    @inject(SecurityBindings.USER) currentUser: UserProfile,
  ): Promise<void> {
    if (currentUser.id !== id) {
      throw new Error('Unauthorized');
    }

    const vendor = await this.vendorRepository.findById(id);
    await this.vendorRepository.updateById(id, {
      isAvailable: !vendor.isAvailable,
      updatedAt: new Date(),
    });
  }

  @del('/vendors/{id}')
  @authenticate('jwt')
  @response(204, {
    description: 'Vendor DELETE success',
  })
  async deleteById(
    @param.path.number('id') id: string,
    @inject(SecurityBindings.USER) currentUser: UserProfile,
  ): Promise<void> {
    if (currentUser.id !== id) {
      throw new HttpErrors.Unauthorized('Non autorisé');
    }
    // Verify if vendor has associated orders that are not completed or cancelled
    // Essayons de voir s'il y a une commande associée à ce vendeur non complétée ni annulée
    const orders = await this.vendorRepository.orders(id).find({
      where: {
        and: [
        {status: {neq: OrderStatus.DELIVERED}},
        {status: {neq: OrderStatus.CANCELLED}},
      ],
      },
    });

    if (orders.length > 0) {
      throw new HttpErrors.BadRequest(
        'Impossible de supprimer le compte. Des commandes en cours existent.',
      );
    }

    // Rendre les produits du vendeur inactifs avant la suppression
    await this.vendorRepository.products(id).patch(
      {isAvailable: false, updatedAt: new Date()},
      {},
    );
    
    await this.vendorRepository.deleteById(id);
  }

  // Change vendor password
  @post('/vendors/{id}/change-password')
  @authenticate('jwt')
  @response(204, {
    description: 'Change vendor password',
  })
  async changePassword(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['oldPassword', 'newPassword'],
            properties: {
              oldPassword: {type: 'string'},
              newPassword: {type: 'string', minLength: 8},
            },
          },
        },
      }, 
    })
    passwords: {oldPassword: string; newPassword: string},
    @inject(SecurityBindings.USER) currentUser: UserProfile,
  ): Promise<void> {
    if (currentUser.id !== id) {
      throw new HttpErrors.Unauthorized('Non autorisé');
    }
    const vendor = await this.vendorRepository.findById(id);

    // Verify old password
    const passwordMatched = await bcrypt.compare(
      passwords.oldPassword,
      vendor.password,
    );
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Ancien mot de passe incorrect.');
    }
    // Validate new password
    validateCredentials({email: vendor.email, password: passwords.newPassword});
    // Hash new password
    const hashedPassword = await bcrypt.hash(passwords.newPassword, 10);  
    await this.vendorRepository.updateById(id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });
  }
}