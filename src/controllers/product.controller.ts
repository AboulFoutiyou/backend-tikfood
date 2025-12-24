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
import { AuthenticationBindings } from '@loopback/authentication';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Product} from '../models';
import {ProductRepository, VendorRepository} from '../repositories';
import {FileUploadHandler, multerOptions} from '../config/file-upload';
import {Request, Response, RestBindings} from '@loopback/rest';
import multer from 'multer';
import {AuthenticationStrategy} from '@loopback/authentication';
import { HttpErrors } from '@loopback/rest';
import { securityId } from '@loopback/security';
import { JWTAuthenticationStrategy } from '../authentication-strategies/jwt-strategy';

export class ProductController {
  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,
    @repository(VendorRepository)
    public vendorRepository: VendorRepository,
    //@inject(RestBindings.Http.REQUEST) private request: Request,
    //@inject(RestBindings.Http.RESPONSE) private response: Response,
    
  ) {}

  @post('/products')
  @authenticate('jwt')
  //@authorize.allowAuthenticated()
  @response(200, {
    description: 'Product model instance',
    content: {'application/json': {schema: getModelSchemaRef(Product)}},
  })
  async create(
    @requestBody({
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
    })
    request: Request,
    //product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
     @inject(RestBindings.Http.RESPONSE) response: Response,
    @inject(SecurityBindings.USER) currentUser: UserProfile,
  ): Promise<Product> {
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
    return new Promise<Product>((resolve, reject) => {
     const upload = multer(multerOptions).any(); // .any() accepte tous les fichiers

      upload(request, response, async (err: any) => {
        if (err) reject(err);

        // 4. On extrait les données une fois l'upload terminé
        const body = request.body; // 'body' contient les champs de texte (name, price, etc.)
        const files = request.files as Express.Multer.File[]; // 'files' contient les fichiers

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

        } catch (error) {
          reject(error);
        }
      });
    });
  
  }

  @get('/products/count')
  @response(200, {
    description: 'Product model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Product) where?: Where<Product>): Promise<Count> {
    return this.productRepository.count(where);
  }

  @get('/products')
  @response(200, {
    description: 'Array of Product model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Product, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Product) filter?: Filter<Product>): Promise<Product[]> {
    return this.productRepository.find(filter);
  }

  @get('/products/feed')
  @response(200, {
    description: 'Available products for feed',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Product, {includeRelations: true}),
        },
      },
    },
  })
  async getFeed(): Promise<Product[]> {
    return this.productRepository.findAvailableProducts();
  }

  @get('/products/vendor/{vendorId}')
  @response(200, {
    description: 'Products by vendor',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Product, {includeRelations: true}),
        },
      },
    },
  })
  async findByVendor(
    @param.path.number('vendorId') vendorId: string,
    @param.filter(Product) filter?: Filter<Product>,
  ): Promise<Product[]> {
    return this.productRepository.find({
      ...filter,
      where: {vendorId, ...filter?.where},
    });
  }

  @get('/products/my-products')
  @authenticate('jwt')
  //@authorize({allowedRoles: ['vendor']})
  @response(200, {
    description: 'Current vendor products',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Product, {includeRelations: true}),
        },
      },
    },
  })
  async getMyProducts(
    @inject(SecurityBindings.USER) currentUser: UserProfile,
    @param.filter(Product) filter?: Filter<Product>,
  ): Promise<Product[]> {
    return this.productRepository.find({
      ...filter,
      where: {vendorId: currentUser.id, ...filter?.where},
    });
  }

  @get('/products/{id}')
  @response(200, {
    description: 'Product model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Product, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Product, {exclude: 'where'})
    filter?: FilterExcludingWhere<Product>,
  ): Promise<Product> {
    return this.productRepository.findById(id, filter);
  }

  @patch('/products/{id}')
  @authenticate('jwt')
  @authorize({allowedRoles: ['vendor']})
  @response(204, {
    description: 'Product PATCH success',
  })
  async updateById(
    @param.path.number('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {partial: true, exclude: ['id', 'vendorId']}),
        },
      },
    })
    product: Partial<Product>,
    @inject(SecurityBindings.USER) currentUser: UserProfile,
  ): Promise<void> {
    // Verify ownership
    const existingProduct = await this.productRepository.findById(id);
    if (existingProduct.vendorId !== currentUser.id) {
      throw new Error('Unauthorized');
    }

    product.updatedAt = new Date();
    await this.productRepository.updateById(id, product);
  }

  @patch('/products/{id}/availability')
  @authenticate('jwt')
  //@authorize({allowedRoles: ['vendor']})
  @response(204, {
    description: 'Toggle product availability',
  })
  async toggleAvailability(
    @param.path.string('id') id: string,
    @inject(SecurityBindings.USER) currentUser: UserProfile,
  ): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (product.vendorId !== currentUser.id) {
      throw new Error('Unauthorized');
    }

    await this.productRepository.updateById(id, {
      isAvailable: !product.isAvailable,
      updatedAt: new Date(),
    });
  }

  @del('/products/{id}')
  @authenticate('jwt')
  @authorize({allowedRoles: ['vendor']})
  @response(204, {
    description: 'Product DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string,
    @inject(SecurityBindings.USER) currentUser: UserProfile,
  ): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (product.vendorId !== currentUser.id) {
      throw new Error('Unauthorized');
    }
    await this.productRepository.deleteById(id);
  }
}