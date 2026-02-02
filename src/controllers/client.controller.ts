import {
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
  response,
} from '@loopback/rest';
import {inject} from '@loopback/core';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Client, Order, OrderStatus} from '../models';
import {ClientRepository, OrderRepository, VendorRepository} from '../repositories';
import * as bcrypt from 'bcryptjs';
import { Credentials } from '../types';
import { ClientUserService } from '../services/client-user.service';
import {authenticate} from '@loopback/authentication';

export class ClientController {
  constructor(
    @inject('repositories.ClientRepository')
    public clientRepository: ClientRepository,
    @inject('repositories.OrderRepository')
    public orderRepository: OrderRepository,
    @inject('services.ClientUserService')
    public clientUserService: ClientUserService,
    @inject('repositories.VendorRepository')
    public vendorRepository: VendorRepository,
  ) {}

  // Inscription
  @post('/clients/register')
  @response(200, {
    description: 'Client registration',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            client: getModelSchemaRef(Client, {exclude: ['password']}),
          },
        },
      },
    },
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Client, {
            title: 'ClientRegistration',
            exclude: ['id', 'createdAt', 'updatedAt'],
          }),
        },
      },
    })
    client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    // Validate if email already exists in clients and vendors
    let existingClient = null;
    if (client.email) { 
      existingClient = await this.clientRepository.findOne({
      where: {email: client.email},
    });
  }
    if (existingClient) {
      throw new Error('Email déjà utilisé par un autre client');
    }
    const existingVendor = await this.vendorRepository.findOne({
      where: {email: client.email},
    });
    if (existingVendor) {
      throw new Error('Email déjà utilisé par un vendeur');
    }

    // verify if phone number already exists
    const existingPhoneClient = await this.clientRepository.findOne({
      where: {phone: client.phone},
    });
    if (existingPhoneClient) {
      throw new Error('Numero de téléphone déjà utilisé par un autre client');
    }
    const existingPhoneVendor = await this.vendorRepository.findOne({
      where: {phone: client.phone},
    });
    if (existingPhoneVendor) {
      throw new Error('Numero de téléphone déjà utilisé par un vendeur');
    }

    // Verifier la longueur du mot de passe : minimum 8 caractères
    if (client.password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(client.password, 10);
    client.password = hashedPassword;

    const savedClient = await this.clientRepository.create(client);
    delete (savedClient as any).password;

    const token = await this.clientUserService.generateToken(savedClient);

    return {client: savedClient, token};
  }

  // Connexion
  @post('/clients/login')
  @response(200, {
    description: 'Client login',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {type: 'string'},
            client: getModelSchemaRef(Client, {exclude: ['password']}),
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
    const client = await this.clientUserService.verifyCredentials(credentials);
    // Error message handled in verifyCredentials
    if (!client) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const token = await this.clientUserService.generateToken(client);
    delete (client as any).password;
    return {token, client};
  }

    @get('/clients/me')
    @authenticate('jwt')
    @response(200, {
      description: 'Current client profile',
      content: {
        'application/json': {
          schema: getModelSchemaRef(Client, {exclude: ['password']}),
        },
      },
    })
    async getCurrentClient(
      @inject(SecurityBindings.USER) currentUser: UserProfile,
    ): Promise<Client> {
      const client = await this.clientRepository.findById(currentUser.id, {
        fields: {password: false},
      });
      return client;
    }

  // Commander
  @post('/clients/{clientId}/orders')
  @response(200, {
    description: 'Client places an order',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Order),
      },
    },
  })
  async placeOrder(
    @param.path.string('clientId') clientId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            exclude: ['id'],
          }),
        },
      },
    })
    orderData: Omit<Order, 'id' | 'clientId'>,
  ): Promise<Order> {
    return this.clientRepository.orders(clientId).create(orderData);
  }

  @get('/clients/{clientId}/orders')
@response(200, {
  description: 'Get all orders for a client',
  content: {
    'application/json': {
      schema: {
        type: 'array',
        items: getModelSchemaRef(Order),
      },
    },
  },
})
async getClientOrders(
  @param.path.string('clientId') clientId: string,
): Promise<Order[]> {
  // Fetch orders related to the specified client
  const client = await this.clientRepository.findById(clientId);
  if (!client || !client.phone) {
    throw new Error('Client not found');
  }

  //return this.clientRepository.orders(clientId).find();
  return this.orderRepository.find({
  where: {customerPhone: client.phone}
});
}

// Supprimer un client
  @post('/clients/{clientId}/delete')
  @response(200, { 
    description: 'Delete a client account',
  })
  async deleteClient(
    @param.path.string('clientId') clientId: string,
  ): Promise<{message: string}> {
    // Vérifier si le client a des commandes actives
    const activeOrders = await this.clientRepository.orders(clientId).find({
      where: {status: {neq: OrderStatus.CANCELLED}},
    });

    if (activeOrders.length > 0) {
      throw new Error('Impossible de supprimer le compte client avec des commandes actives.');
    }

    await this.clientRepository.deleteById(clientId);
    return {message: 'Client account deleted successfully'};
  }

  // Mettre à jour le profil du client
  // (Cette méthode peut être étendue selon les besoins)
  @post('/clients/{clientId}/update')
  @response(200, {
    description: 'Update client profile',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Client, {exclude: ['password']}),
      },
    },
  })
  async updateClientProfile(
    @param.path.string('clientId') clientId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Client, {
            title: 'ClientProfileUpdate',
            exclude: ['id', 'createdAt', 'updatedAt', 'password'],
          }),
        },
      },
    })
    clientData: Partial<Client>,
  ): Promise<Client> {
    // Ensure phone and email uniqueness if they are being updated
    if (clientData.email) {
      const existingClient = await this.clientRepository.findOne({
        where: {email: clientData.email, id: {neq: clientId}},
      });
      if (existingClient) {
        throw new Error('Email déjà utilisé par un autre client');
      }
      const existingVendor = await this.vendorRepository.findOne({
        where: {email: clientData.email},
      });
      if (existingVendor) {
        throw new Error('Email déjà utilisé par un vendeur');
      }
    }

    if (clientData.phone) {
      const existingPhoneClient = await this.clientRepository.findOne({
        where: {phone: clientData.phone, id: {neq: clientId}},
      });
      if (existingPhoneClient) {
        throw new Error('Numero de téléphone déjà utilisé par un autre client');
      }
      const existingPhoneVendor = await this.vendorRepository.findOne({
        where: {phone: clientData.phone},
      });
      if (existingPhoneVendor) {
        throw new Error('Numero de téléphone déjà utilisé par un vendeur');
      }
    }

    await this.clientRepository.updateById(clientId, clientData);
    const updatedClient = await this.clientRepository.findById(clientId, {
      fields: {password: false},
    });
    return updatedClient;
  }

  // Changement de mot de passe
  @post('/clients/{clientId}/change-password')
  @response(200, {
    description: 'Change client password',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {type: 'string'},
          },
        },
      },
    },
  })
  async changePassword(
    @param.path.string('clientId') clientId: string,
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
  ): Promise<{message: string}> {
    const client = await this.clientRepository.findById(clientId);
    const passwordMatched = await bcrypt.compare(
      passwords.oldPassword,
      client.password,
    );
    if (!passwordMatched) {
      throw new Error('Ancien mot de passe incorrect');
    }
    const hashedNewPassword = await bcrypt.hash(passwords.newPassword, 10);
    await this.clientRepository.updateById(clientId, {
      password: hashedNewPassword,
    });
    return {message: 'Mot de passe mis à jour avec succès'};
  }

}
