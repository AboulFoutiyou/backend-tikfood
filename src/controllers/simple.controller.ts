import {post, requestBody, response} from '@loopback/rest';
import {inject} from '@loopback/core';
import {SimpleUserService} from '../services/simple-user.service';
import {Credentials} from '../types';

export class SimpleController {
  constructor(
    @inject('services.SimpleUserService')
    public simpleUserService: SimpleUserService,
  ) {}

  @post('/login')
  @response(200, {
    description: 'Login for vendor or client',
    content: {'application/json': {schema: {type: 'object'}}},
  })
    async login(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['password'],
              properties: {
                email: {type: 'string'},
                phone: {type: 'string'},
                password: {type: 'string'},
              },
            },
          },
        },
      })
      credentials: Credentials,
    ): Promise<object> {
      try {
        const user = await this.simpleUserService.verifyCredentials(credentials);
        const userProfile = this.simpleUserService.convertToUserProfile(user);
        const token = await this.simpleUserService.generateToken(user);
        return {success: true, user: userProfile, token};
      } catch (error) {
        return {success: false, message: error.message};
      }
    }
}
