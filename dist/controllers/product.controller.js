"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const authentication_1 = require("@loopback/authentication");
const authorization_1 = require("@loopback/authorization");
const core_1 = require("@loopback/core");
const security_1 = require("@loopback/security");
const models_1 = require("../models");
const repositories_1 = require("../repositories");
const file_upload_1 = require("../config/file-upload");
const rest_2 = require("@loopback/rest");
const multer_1 = tslib_1.__importDefault(require("multer"));
let ProductController = class ProductController {
    constructor(productRepository, vendorRepository) {
        this.productRepository = productRepository;
        this.vendorRepository = vendorRepository;
    }
    async create(request, response, currentUser) {
        // product.vendorId = currentUser.id;
        // return this.productRepository.create(product);
        // 3. ---> VÉRIFICATION MANUELLE DE L'AUTHENTIFICATION ET DE L'AUTORISATION <---
        // 2. ---> LE TYPE GUARD <---
        // On vérifie que le résultat n'est PAS une redirection.
        // La propriété `[securityId]` n'existe que sur un UserProfile.
        // if (!(securityId in authResult)) {
        //     // Si ce n'est pas un UserProfile, c'est une redirection, ce qui est une erreur dans ce contexte.
        //     throw new HttpErrors.InternalServerError('Authentication resulted in a redirect, which is not supported here.');
        // }
        // // 3. A partir d'ici, TypeScript est certain que authResult est un UserProfile
        // const userProfile = authResult; // On peut même le réassigner pour plus de clarté.
        // if (!userProfile.roles || !userProfile.roles.includes('vendor')) {
        //   // On vérifie manuellement les rôles.
        //   throw new HttpErrors.Forbidden('ACCESS_DENIED: User is not a vendor');
        // }
        //const currentUser = userProfile;
        return new Promise((resolve, reject) => {
            const upload = (0, multer_1.default)(file_upload_1.multerOptions).any(); // .any() accepte tous les fichiers
            upload(request, response, async (err) => {
                if (err)
                    reject(err);
                // 4. On extrait les données une fois l'upload terminé
                const body = request.body; // 'body' contient les champs de texte (name, price, etc.)
                const files = request.files; // 'files' contient les fichiers
                if (!files || files.length === 0) {
                    return reject(new Error("Aucun fichier n'a été uploadé."));
                }
                // 5. On reconstruit l'objet Product à partir des données extraites
                try {
                    // On s'assure de convertir les types, car tout arrive en string depuis FormData
                    const productData = {
                        name: body.name,
                        description: body.description,
                        price: Number(body.price),
                        category: body.category,
                        isAvailable: body.isAvailable === 'true',
                        // On ajoute l'ID du vendeur récupéré grâce à l'injection
                        vendorId: currentUser.id,
                        // On stocke le chemin ou le nom des fichiers
                        images: files.map(f => `http://localhost:3000/uploads/${f.filename}`),
                    };
                    // 6. On crée le produit dans la base de données
                    const newProduct = await this.productRepository.create(productData);
                    resolve(newProduct);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async count(where) {
        return this.productRepository.count(where);
    }
    async find(filter) {
        return this.productRepository.find(filter);
    }
    async getFeed() {
        return this.productRepository.findAvailableProducts();
    }
    async findByVendor(vendorId, filter) {
        return this.productRepository.find({
            ...filter,
            where: { vendorId, ...filter?.where },
        });
    }
    async getMyProducts(currentUser, filter) {
        return this.productRepository.find({
            ...filter,
            where: { vendorId: currentUser.id, ...filter?.where },
        });
    }
    async findById(id, filter) {
        return this.productRepository.findById(id, filter);
    }
    async updateById(id, product, currentUser) {
        // Verify ownership
        const existingProduct = await this.productRepository.findById(id);
        if (existingProduct.vendorId !== currentUser.id) {
            throw new Error('Unauthorized');
        }
        product.updatedAt = new Date();
        await this.productRepository.updateById(id, product);
    }
    async toggleAvailability(id, currentUser) {
        const product = await this.productRepository.findById(id);
        if (product.vendorId !== currentUser.id) {
            throw new Error('Unauthorized');
        }
        await this.productRepository.updateById(id, {
            isAvailable: !product.isAvailable,
            updatedAt: new Date(),
        });
    }
    async deleteById(id, currentUser) {
        const product = await this.productRepository.findById(id);
        if (product.vendorId !== currentUser.id) {
            throw new Error('Unauthorized');
        }
        await this.productRepository.deleteById(id);
    }
};
exports.ProductController = ProductController;
tslib_1.__decorate([
    (0, rest_1.post)('/products'),
    (0, authentication_1.authenticate)('jwt')
    //@authorize.allowAuthenticated()
    ,
    (0, rest_1.response)(200, {
        description: 'Product model instance',
        content: { 'application/json': { schema: (0, rest_1.getModelSchemaRef)(models_1.Product) } },
    }),
    tslib_1.__param(0, (0, rest_1.requestBody)({
        content: {
            // 'application/json': {
            //   schema: getModelSchemaRef(Product, {
            //     title: 'NewProduct',
            //     exclude: ['id', 'createdAt', 'updatedAt'],
            //   }),
            // },
            'multipart/form-data': {
                'x-parser': 'stream',
                schema: { type: 'object' },
            },
        },
    })),
    tslib_1.__param(1, (0, core_1.inject)(rest_2.RestBindings.Http.RESPONSE)),
    tslib_1.__param(2, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "create", null);
tslib_1.__decorate([
    (0, rest_1.get)('/products/count'),
    (0, rest_1.response)(200, {
        description: 'Product model count',
        content: { 'application/json': { schema: repository_1.CountSchema } },
    }),
    tslib_1.__param(0, rest_1.param.where(models_1.Product)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "count", null);
tslib_1.__decorate([
    (0, rest_1.get)('/products'),
    (0, rest_1.response)(200, {
        description: 'Array of Product model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: (0, rest_1.getModelSchemaRef)(models_1.Product, { includeRelations: true }),
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.filter(models_1.Product)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "find", null);
tslib_1.__decorate([
    (0, rest_1.get)('/products/feed'),
    (0, rest_1.response)(200, {
        description: 'Available products for feed',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: (0, rest_1.getModelSchemaRef)(models_1.Product, { includeRelations: true }),
                },
            },
        },
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "getFeed", null);
tslib_1.__decorate([
    (0, rest_1.get)('/products/vendor/{vendorId}'),
    (0, rest_1.response)(200, {
        description: 'Products by vendor',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: (0, rest_1.getModelSchemaRef)(models_1.Product, { includeRelations: true }),
                },
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.number('vendorId')),
    tslib_1.__param(1, rest_1.param.filter(models_1.Product)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "findByVendor", null);
tslib_1.__decorate([
    (0, rest_1.get)('/products/my-products'),
    (0, authentication_1.authenticate)('jwt')
    //@authorize({allowedRoles: ['vendor']})
    ,
    (0, rest_1.response)(200, {
        description: 'Current vendor products',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: (0, rest_1.getModelSchemaRef)(models_1.Product, { includeRelations: true }),
                },
            },
        },
    }),
    tslib_1.__param(0, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.filter(models_1.Product)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "getMyProducts", null);
tslib_1.__decorate([
    (0, rest_1.get)('/products/{id}'),
    (0, rest_1.response)(200, {
        description: 'Product model instance',
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Product, { includeRelations: true }),
            },
        },
    }),
    tslib_1.__param(0, rest_1.param.path.string('id')),
    tslib_1.__param(1, rest_1.param.filter(models_1.Product, { exclude: 'where' })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "findById", null);
tslib_1.__decorate([
    (0, rest_1.patch)('/products/{id}'),
    (0, authentication_1.authenticate)('jwt'),
    (0, authorization_1.authorize)({ allowedRoles: ['vendor'] }),
    (0, rest_1.response)(204, {
        description: 'Product PATCH success',
    }),
    tslib_1.__param(0, rest_1.param.path.number('id')),
    tslib_1.__param(1, (0, rest_1.requestBody)({
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(models_1.Product, { partial: true, exclude: ['id', 'vendorId'] }),
            },
        },
    })),
    tslib_1.__param(2, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "updateById", null);
tslib_1.__decorate([
    (0, rest_1.patch)('/products/{id}/availability'),
    (0, authentication_1.authenticate)('jwt')
    //@authorize({allowedRoles: ['vendor']})
    ,
    (0, rest_1.response)(204, {
        description: 'Toggle product availability',
    }),
    tslib_1.__param(0, rest_1.param.path.string('id')),
    tslib_1.__param(1, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "toggleAvailability", null);
tslib_1.__decorate([
    (0, rest_1.del)('/products/{id}'),
    (0, authentication_1.authenticate)('jwt'),
    (0, authorization_1.authorize)({ allowedRoles: ['vendor'] }),
    (0, rest_1.response)(204, {
        description: 'Product DELETE success',
    }),
    tslib_1.__param(0, rest_1.param.path.string('id')),
    tslib_1.__param(1, (0, core_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProductController.prototype, "deleteById", null);
exports.ProductController = ProductController = tslib_1.__decorate([
    tslib_1.__param(0, (0, repository_1.repository)(repositories_1.ProductRepository)),
    tslib_1.__param(1, (0, repository_1.repository)(repositories_1.VendorRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.ProductRepository,
        repositories_1.VendorRepository])
], ProductController);
//# sourceMappingURL=product.controller.js.map