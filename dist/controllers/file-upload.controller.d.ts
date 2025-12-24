/// <reference types="express" />
import { Request, Response } from '@loopback/rest';
export declare class FileUploadController {
    constructor();
    uploadFile(request: Request, response: Response): Promise<object>;
}
