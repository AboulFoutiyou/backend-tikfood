"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const tslib_1 = require("tslib");
const rest_1 = require("@loopback/rest");
const core_1 = require("@loopback/core");
const security_1 = require("@loopback/security");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
const bcrypt = tslib_1.__importStar(require("bcryptjs"));
const client_user_service_1 = require("../services/client-user.service");
const authentication_1 = require("@loopback/authentication");
let ClientController = class ClientController {
    constructor(clientRepository, orderRepository, clientUserService, vendorRepository) {
        this.clientRepository = clientRepository;
        this.orderRepository = orderRepository;
        this.clientUserService = clientUserService;
        this.vendorRepository = vendorRepository;
    }
    // Inscription
    async register(client) {
        // Validate if email already exists in clients and vendors
        let existingClient = null;
        if (client.email) {
            existingClient = await this.clientRepository.findOne({
                where: { email: client.email },
            });
        }
        if (existingClient) {
            throw new Error('Email déjà utilisé par un autre client');
        }
        const existingVendor = await this.vendorRepository.findOne({
            where: { email: client.email },
        });
        if (existingVendor) {
            throw new Error('Email déjà utilisé par un vendeur');
        }
        // verify if phone number already exists
        const existingPhoneClient = await this.clientRepository.findOne({
            where: { phone: client.phone },
        });
        if (existingPhoneClient) {
            throw new Error('Numero de téléphone déjà utilisé par un autre client');
        }
        const existingPhoneVendor = await this.vendorRepository.findOne({
            where: { phone: client.phone },
        });
        if (existingPhoneVendor) {
            throw new Error('Numero de téléphone déjà utilisé par un vendeur');
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(client.password, 10);
        client.password = hashedPassword;
        const savedClient = await this.clientRepository.create(client);
        delete savedClient.password;
        return { client: savedClient };
    }
    // Connexion
    async login(credentials) {
        const client = await this.clientUserService.verifyCredentials(credentials);
        // Error message handled in verifyCredentials
        if (!client) {
            throw new Error('Email ou mot de passe incorrect');
        }
        const token = await this.clientUserService.generateToken(client);
        delete client.password;
        return { token, client };
    }
    async getCurrentClient(currentUser) {
        const client = await this.clientRepository.findById(currentUser.id, {
            fields: { password: false },
        });
        return client;
    }
    // Commander
    async placeOrder(clientId, orderData) {
        return this.clientRepository.orders(clientId).create(orderData);
    }
    async getClientOrders(clientId) {
        // Fetch orders related to the specified client
        const client = await this.clientRepository.findById(clientId);
        if (!client || !client.phone) {
            throw new Error('Client not found');
        }
        //return this.clientRepository.orders(clientId).find();
        return this.orderRepository.find({
            where: { customerPhone: client.phone }
        });
    }
    // Supprimer un client
    async deleteClient(clientId) {
        // Vérifier si le client a des commandes actives
        const activeOrders = await this.clientRepository.orders(clientId).find({
            where: { status: { neq: models_1.OrderStatus.CANCELLED } },
        });
        if (activeOrders.length > 0) {
            throw new Error('Impossible de supprimer le compte client avec des commandes actives.');
        }
        await this.clientRepository.deleteById(clientId);
        return { message: 'Client account deleted successfully' };
    }
    // Mettre à jour le profil du client
    // (Cette méthode peut être étendue selon les besoins)
    async updateClientProfile(clientId, clientData) {
        // Ensure phone and email uniqueness if they are being updated
        if (clientData.email) {
            const existingClient = await this.clientRepository.findOne({
                where: { email: clientData.email, id: { neq: clientId } },
            });
            if (existingClient) {
                throw new Error('Email déjà utilisé par un autre client');
            }
            const existingVendor = await this.vendorRepository.findOne({
                where: { email: clientData.email },
            });
            if (existingVendor) {
                throw new Error('Email déjà utilisé par un vendeur');
            }
        }
        if (clientData.phone) {
            const existingPhoneClient = await this.clientRepository.findOne({
                where: { phone: clientData.phone, id: { neq: clientId } },
            });
            if (existingPhoneClient) {
                throw new Error('Numero de téléphone déjà utilisé par un autre client');
            }
            const existingPhoneVendor = await this.vendorRepository.findOne({
                where: { phone: clientData.phone },
            });
            if (existingPhoneVendor) {
                throw new Error('Numero de téléphone déjà utilisé par un vendeur');
            }
        }
        await this.clientRepository.updateById(clientId, clientData);
        const updatedClient = await this.clientRepository.findById(clientId, {
            fields: { password: false },
        });
        return updatedClient;
    }
    // Changement de mot de passe
    async changePassword(clientId, passwords) {
        const client = await this.clientRepository.findById(clientId);
        const passwordMatched = await bcrypt.compare(passwords.oldPassword, client.password);
        if (!passwordMatched) {
            throw new Error('Ancien mot de passe incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(passwords.newPassword, 10);
        await this.clientRepository.updateById(clientId, {
            password: hashedNewPassword,
        });
        return { message: 'Mot de passe mis à jour avec succès' };
    }
};
exports.ClientController = ClientController;
tslib_1.__decorate([
    (0, rest_1.post)('/clients/register'),
    (0, rest_1.response)(200, {
        description: 'Client registration',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        client: (0, rest_1.getModelSchemaRef)(models_1.Client, { exclude: ['password'] }),
                    },
                },
            },
        },
    }),
    tslib_1.__param(0, (0, rest_1.requestBody)({
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Client, {
                    title: 'ClientRegistration',
                    exclude: ['id', 'createdAt', 'updatedAt'],
                }),
            },
        },
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClientController.prototype, "register", null);
tslib_1.__decorate([
    (0, rest_1.post)('/clients/login'),
    (0, rest_1.response)(200, {
        description: 'Client login',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                        client: (0, rest_1.getModelSchemaRef)(models_1.Client, { exclude: ['password'] }),
                    },
                },
            },
        },
    }),
    tslib_1.__param(0, (0, rest_1.requestBody)({
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    required: ['password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                        password: { type: 'string', minLength: 8 },
                    },
                },
            },
        },
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClientController.prototype, "login", null);
tslib_1.__decorate([
    (0, rest_1.get)('/clients/me'),
    (0, authentication_1.authenticate)('jwt'),
    (0, rest_1.response)(200, {
        description: 'Current client profile',
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Client, { exclude: ['password'] }),
            },
        },
    }),
    tslib_1.__param(0, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClientController.prototype, "getCurrentClient", null);
tslib_1.__decorate([
    (0, rest_1.post)('/clients/{clientId}/orders'),
    (0, rest_1.response)(200, {
        description: 'Client places an order',
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Order),
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('clientId')),
    tslib_1.__param(1, (0, rest_1.requestBody)({
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Order, {
                    exclude: ['id'],
                }),
            },
        },
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClientController.prototype, "placeOrder", null);
tslib_1.__decorate([
    (0, rest_1.get)('/clients/{clientId}/orders'),
    (0, rest_1.response)(200, {
        description: 'Get all orders for a client',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: (0, rest_1.getModelSchemaRef)(models_1.Order),
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('clientId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], ClientController.prototype, "getClientOrders", null);
tslib_1.__decorate([
    (0, rest_1.post)('/clients/{clientId}/delete'),
    (0, rest_1.response)(200, {
        description: 'Delete a client account',
    }),
    tslib_1.__param(0, rest_1.param.path.string('clientId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], ClientController.prototype, "deleteClient", null);
tslib_1.__decorate([
    (0, rest_1.post)('/clients/{clientId}/update'),
    (0, rest_1.response)(200, {
        description: 'Update client profile',
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Client, { exclude: ['password'] }),
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('clientId')),
    tslib_1.__param(1, (0, rest_1.requestBody)({
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Client, {
                    title: 'ClientProfileUpdate',
                    exclude: ['id', 'createdAt', 'updatedAt', 'password'],
                }),
            },
        },
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClientController.prototype, "updateClientProfile", null);
tslib_1.__decorate([
    (0, rest_1.post)('/clients/{clientId}/change-password'),
    (0, rest_1.response)(200, {
        description: 'Change client password',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('clientId')),
    tslib_1.__param(1, (0, rest_1.requestBody)({
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    required: ['oldPassword', 'newPassword'],
                    properties: {
                        oldPassword: { type: 'string' },
                        newPassword: { type: 'string', minLength: 8 },
                    },
                },
            },
        },
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClientController.prototype, "changePassword", null);
exports.ClientController = ClientController = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)('repositories.ClientRepository')),
    tslib_1.__param(1, (0, core_1.inject)('repositories.OrderRepository')),
    tslib_1.__param(2, (0, core_1.inject)('services.ClientUserService')),
    tslib_1.__param(3, (0, core_1.inject)('repositories.VendorRepository')),
    tslib_1.__metadata("design:paramtypes", [repositories_1.ClientRepository,
        repositories_1.OrderRepository,
        client_user_service_1.ClientUserService,
        repositories_1.VendorRepository])
], ClientController);
//# sourceMappingURL=client.controller.js.map