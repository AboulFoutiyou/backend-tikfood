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
import {inject} from '@loopback/core';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Product} from '../models';
import {ProductRepository, VendorRepository} from '../repositories';
import {Request, Response, RestBindings} from '@loopback/rest';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { HttpErrors } from '@loopback/rest';


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
    @inject(RestBindings.Http.REQUEST) req: Request,
    @inject(RestBindings.Http.RESPONSE) res: Response,
    @inject(SecurityBindings.USER) currentUser: UserProfile,
  ): Promise<Product> {
    // Utilisation de multer pour parser le form-data (mémoire, pas disque)
    const multerInstance = multer({ storage: multer.memoryStorage() });
    return new Promise<Product>((resolve, reject) => {
      multerInstance.any()(req as any, res as any, async (err: any) => {
        if (err) {
          console.error('Erreur multer:', err);
          return reject(new HttpErrors.BadRequest('Erreur lors du parsing du fichier.'));
        }
        try {
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });

          // body et fichiers sont maintenant accessibles
          const body = req.body;
          if (!body || typeof body !== 'object') {
            console.error('Request body is missing or not an object:', body);
            return reject(new HttpErrors.BadRequest('Le corps de la requête (body) est manquant ou mal formé.'));
          }
          if (!body.name) {
            console.error('Missing product name in request body:', body);
            return reject(new HttpErrors.BadRequest('Le nom du produit (name) est obligatoire.'));
          }

          let imageUrls: string[] = [];
          if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            for (const file of req.files as Express.Multer.File[]) {
              const url = await new Promise<string>((resolveUpload, rejectUpload) => {
                const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
                  if (error) return rejectUpload(error);
                  resolveUpload(result?.secure_url || '');
                });
                streamifier.createReadStream(file.buffer).pipe(uploadStream);
              });
              if (url) imageUrls.push(url);
            }
          }

          const productData = {
            name: body.name,
            description: body.description,
            price: Number(body.price),
            category: body.category,
            isAvailable: body.isAvailable === 'true',
            composition: body.composition ? JSON.parse(body.composition) : undefined,
            vendorId: currentUser.id,
            images: imageUrls, // URLs Cloudinary
          };
          const newProduct = await this.productRepository.create(productData);
          resolve(newProduct);
        } catch (error) {
          console.error('Error in product creation:', error);
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
  //@authorize({allowedRoles: ['vendor']})
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
  //@authorize({allowedRoles: ['vendor']})
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