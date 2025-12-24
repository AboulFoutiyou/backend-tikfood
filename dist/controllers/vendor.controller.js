"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const authentication_1 = require("@loopback/authentication");
const core_1 = require("@loopback/core");
const security_1 = require("@loopback/security");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
const vendor_user_service_1 = require("../services/vendor-user.service");
const validator_service_1 = require("../services/validator.service");
const bcrypt = tslib_1.__importStar(require("bcryptjs"));
const models_2 = require("../models");
const rest_2 = require("@loopback/rest");
const repositories_2 = require("../repositories");
let VendorController = class VendorController {
    constructor(vendorRepository, vendorUserService, clientRepository) {
        this.vendorRepository = vendorRepository;
        this.vendorUserService = vendorUserService;
        this.clientRepository = clientRepository;
    }
    async register(vendor) {
        console.log('--- REQUÊTE REÇUE SUR /vendors/register ---');
        console.log('Données brutes reçues :', JSON.stringify(vendor, null, 2));
        if (vendor.email) {
            (0, validator_service_1.validateCredentials)({ email: vendor.email, password: vendor.password });
        }
        if (vendor.phone) {
            (0, validator_service_1.validateCredentials)({ phone: vendor.phone, password: vendor.password });
        }
        // Check if email or phone already exists in vendors
        if (vendor.email) {
            const existingVendor = await this.vendorRepository.findOne({
                where: { email: vendor.email },
            });
            if (existingVendor) {
                throw new rest_2.HttpErrors.UnprocessableEntity('Un compte avec cet email existe déjà');
            }
            const existingClient = await this.clientRepository.findOne({
                where: { email: vendor.email },
            });
            if (existingClient) {
                throw new rest_2.HttpErrors.UnprocessableEntity('Un compte client avec cet email existe déjà');
            }
        }
        if (vendor.phone) {
            const existingVendorByPhone = await this.vendorRepository.findOne({
                where: { phone: vendor.phone },
            });
            if (existingVendorByPhone) {
                throw new rest_2.HttpErrors.UnprocessableEntity('Un compte avec ce numéro de téléphone existe déjà');
            }
            const existingClientByPhone = await this.clientRepository.findOne({
                where: { phone: vendor.phone },
            });
            if (existingClientByPhone) {
                throw new rest_2.HttpErrors.UnprocessableEntity('Un compte client avec ce numéro de téléphone existe déjà');
            }
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(vendor.password, 10);
        vendor.password = hashedPassword;
        const savedVendor = await this.vendorRepository.create(vendor);
        delete savedVendor.password;
        const token = await this.vendorUserService.generateToken(savedVendor);
        return {
            token,
            vendor: savedVendor,
        };
    }
    async login(credentials) {
        const vendor = await this.vendorUserService.verifyCredentials(credentials);
        const token = await this.vendorUserService.generateToken(vendor);
        delete vendor.password;
        return {
            token,
            vendor,
        };
    }
    async getCurrentVendor(currentUser) {
        const vendor = await this.vendorRepository.findById(currentUser.id, {
            fields: { password: false },
        });
        return vendor;
    }
    async count(where) {
        return this.vendorRepository.count(where);
    }
    async find(filter) {
        return this.vendorRepository.find({
            ...filter,
            fields: { password: false, ...filter?.fields },
        });
    }
    async findById(id, filter) {
        return this.vendorRepository.findById(id, {
            ...filter,
            fields: { password: false, ...filter?.fields },
        });
    }
    async updateById(id, vendor, currentUser) {
        // Ensure vendor can only update their own profile
        if (currentUser.id !== id) {
            throw new rest_2.HttpErrors.Unauthorized('Non autorisé');
        }
        // Verify if phone number is being updated and is unique
        if (vendor.phone) {
            const existingVendor = await this.vendorRepository.findOne({
                where: {
                    phone: vendor.phone,
                    id: { neq: id },
                },
            });
            if (existingVendor) {
                throw new rest_2.HttpErrors.UnprocessableEntity('Un compte avec ce numéro de téléphone existe déjà');
            }
            const existingClient = await this.clientRepository.findOne({
                where: {
                    phone: vendor.phone,
                },
            });
            if (existingClient) {
                throw new rest_2.HttpErrors.UnprocessableEntity('Un compte client avec ce numéro de téléphone existe déjà');
            }
        }
        vendor.updatedAt = new Date();
        await this.vendorRepository.updateById(id, vendor);
    }
    async toggleAvailability(id, currentUser) {
        if (currentUser.id !== id) {
            throw new Error('Unauthorized');
        }
        const vendor = await this.vendorRepository.findById(id);
        await this.vendorRepository.updateById(id, {
            isAvailable: !vendor.isAvailable,
            updatedAt: new Date(),
        });
    }
    async deleteById(id, currentUser) {
        if (currentUser.id !== id) {
            throw new rest_2.HttpErrors.Unauthorized('Non autorisé');
        }
        // Verify if vendor has associated orders that are not completed or cancelled
        // Essayons de voir s'il y a une commande associée à ce vendeur non complétée ni annulée
        const orders = await this.vendorRepository.orders(id).find({
            where: {
                and: [
                    { status: { neq: models_2.OrderStatus.DELIVERED } },
                    { status: { neq: models_2.OrderStatus.CANCELLED } },
                ],
            },
        });
        if (orders.length > 0) {
            throw new rest_2.HttpErrors.BadRequest('Impossible de supprimer le compte. Des commandes en cours existent.');
        }
        // Rendre les produits du vendeur inactifs avant la suppression
        await this.vendorRepository.products(id).patch({ isAvailable: false, updatedAt: new Date() }, {});
        await this.vendorRepository.deleteById(id);
    }
    // Change vendor password
    async changePassword(id, passwords, currentUser) {
        if (currentUser.id !== id) {
            throw new rest_2.HttpErrors.Unauthorized('Non autorisé');
        }
        const vendor = await this.vendorRepository.findById(id);
        // Verify old password
        const passwordMatched = await bcrypt.compare(passwords.oldPassword, vendor.password);
        if (!passwordMatched) {
            throw new rest_2.HttpErrors.Unauthorized('Ancien mot de passe incorrect.');
        }
        // Validate new password
        (0, validator_service_1.validateCredentials)({ email: vendor.email, password: passwords.newPassword });
        // Hash new password
        const hashedPassword = await bcrypt.hash(passwords.newPassword, 10);
        await this.vendorRepository.updateById(id, {
            password: hashedPassword,
            updatedAt: new Date(),
        });
    }
};
exports.VendorController = VendorController;
tslib_1.__decorate([
    (0, rest_1.post)('/vendors/register'),
    (0, rest_1.response)(200, {
        description: 'Vendor registration',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                        vendor: (0, rest_1.getModelSchemaRef)(models_1.Vendor, { exclude: ['password'] }),
                    },
                },
            },
        },
    }),
    tslib_1.__param(0, (0, rest_1.requestBody)({
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Vendor, {
                    title: 'VendorRegistration',
                    exclude: ['id', 'createdAt', 'updatedAt'],
                }),
            },
        },
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VendorController.prototype, "register", null);
tslib_1.__decorate([
    (0, rest_1.post)('/vendors/login'),
    (0, rest_1.response)(200, {
        description: 'Vendor login',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                        vendor: (0, rest_1.getModelSchemaRef)(models_1.Vendor, { exclude: ['password'] }),
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
], VendorController.prototype, "login", null);
tslib_1.__decorate([
    (0, rest_1.get)('/vendors/me'),
    (0, authentication_1.authenticate)('jwt'),
    (0, rest_1.response)(200, {
        description: 'Current vendor profile',
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Vendor, { exclude: ['password'] }),
            },
        },
    }),
    tslib_1.__param(0, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VendorController.prototype, "getCurrentVendor", null);
tslib_1.__decorate([
    (0, rest_1.get)('/vendors/count'),
    (0, rest_1.response)(200, {
        description: 'Vendor model count',
        content: { 'application/json': { schema: repository_1.CountSchema } },
    }),
    tslib_1.__param(0, rest_1.param.where(models_1.Vendor)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VendorController.prototype, "count", null);
tslib_1.__decorate([
    (0, rest_1.get)('/vendors'),
    (0, rest_1.response)(200, {
        description: 'Array of Vendor model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: (0, rest_1.getModelSchemaRef)(models_1.Vendor, {
                        includeRelations: true,
                        exclude: ['password'],
                    }),
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.filter(models_1.Vendor)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VendorController.prototype, "find", null);
tslib_1.__decorate([
    (0, rest_1.get)('/vendors/{id}'),
    (0, rest_1.response)(200, {
        description: 'Vendor model instance',
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Vendor, {
                    includeRelations: true,
                    exclude: ['password'],
                }),
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('id')),
    tslib_1.__param(1, rest_1.param.filter(models_1.Vendor, { exclude: 'where' })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VendorController.prototype, "findById", null);
tslib_1.__decorate([
    (0, rest_1.patch)('/vendors/{id}'),
    (0, authentication_1.authenticate)('jwt'),
    (0, rest_1.response)(204, {
        description: 'Vendor PATCH success',
    }),
    tslib_1.__param(0, rest_1.param.path.string('id')),
    tslib_1.__param(1, (0, rest_1.requestBody)({
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Vendor, { partial: true, exclude: ['id', 'createdAt', 'password'] }),
            },
        },
    })),
    tslib_1.__param(2, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VendorController.prototype, "updateById", null);
tslib_1.__decorate([
    (0, rest_1.patch)('/vendors/{id}/availability'),
    (0, authentication_1.authenticate)('jwt')
    //@authorize({allowedRoles: ['vendor']})
    ,
    (0, rest_1.response)(204, {
        description: 'Toggle vendor availability',
    }),
    tslib_1.__param(0, rest_1.param.path.string('id')),
    tslib_1.__param(1, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VendorController.prototype, "toggleAvailability", null);
tslib_1.__decorate([
    (0, rest_1.del)('/vendors/{id}'),
    (0, authentication_1.authenticate)('jwt'),
    (0, rest_1.response)(204, {
        description: 'Vendor DELETE success',
    }),
    tslib_1.__param(0, rest_1.param.path.number('id')),
    tslib_1.__param(1, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VendorController.prototype, "deleteById", null);
tslib_1.__decorate([
    (0, rest_1.post)('/vendors/{id}/change-password'),
    (0, authentication_1.authenticate)('jwt'),
    (0, rest_1.response)(204, {
        description: 'Change vendor password',
    }),
    tslib_1.__param(0, rest_1.param.path.string('id')),
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
    tslib_1.__param(2, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VendorController.prototype, "changePassword", null);
exports.VendorController = VendorController = tslib_1.__decorate([
    tslib_1.__param(0, (0, repository_1.repository)(repositories_1.VendorRepository)),
    tslib_1.__param(1, (0, core_1.inject)('services.VendorUserService')),
    tslib_1.__param(2, (0, repository_1.repository)(repositories_2.ClientRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.VendorRepository,
        vendor_user_service_1.VendorUserService,
        repositories_2.ClientRepository])
], VendorController);
//# sourceMappingURL=vendor.controller.js.map