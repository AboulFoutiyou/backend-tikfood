/// <reference types="express" />
import { Request } from '@loopback/rest';
import multer from 'multer';
export declare const FILE_UPLOAD_SERVICE = "services.FileUpload";
export declare const STORAGE_DIRECTORY: string;
export declare const multerOptions: multer.Options;
export interface FileUploadHandler {
    (request: Request, response: object): Promise<object>;
}
