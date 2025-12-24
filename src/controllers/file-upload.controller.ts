// src/controllers/file-upload.controller.ts

import {repository} from '@loopback/repository';
import {post, requestBody, Request, Response, RestBindings} from '@loopback/rest';
import {inject} from '@loopback/core';
import {multerOptions} from '../config/file-upload'; // Adaptez le chemin si nécessaire
import multer from 'multer';

export class FileUploadController {
  constructor() {}

  @post('/upload-file', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Fichier uploadé avec succès',
      },
    },
  })
  async uploadFile(
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      // On utilise multer pour parser un seul fichier avec la clé 'file'
      const upload = multer(multerOptions).single('file');

      upload(request, response, (err: any) => {
        if (err) {
          reject(err);
        } else {
          if (request.file) {
            // Si l'upload réussit, on renvoie les infos du fichier
            resolve({
              message: 'Fichier uploadé avec succès!',
              filename: request.file.filename,
              path: request.file.path,
            });
          } else {
            reject(new Error('Aucun fichier trouvé dans la requête.'));
          }
        }
      });
    });
  }
}