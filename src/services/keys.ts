import {BindingKey} from '@loopback/core';
import {VendorUserService} from './vendor-user.service';

export namespace VendorUserServiceBindings {
  export const USER_SERVICE = BindingKey.create<VendorUserService>(
    'services.VendorUserService',
  );
}

export namespace TokenServiceConstants {
    export const TOKEN_SECRET_VALUE = process.env.JWT_SECRET ?? 'your-secret-key';
}