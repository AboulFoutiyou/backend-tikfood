// src/config/file-upload.ts
import {Request} from '@loopback/rest';
import multer from 'multer';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import fs from 'fs';

export const FILE_UPLOAD_SERVICE = 'services.FileUpload';
export const STORAGE_DIRECTORY = path.join(__dirname, '../../.sandbox');

if (!fs.existsSync(STORAGE_DIRECTORY)) {
  fs.mkdirSync(STORAGE_DIRECTORY, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, STORAGE_DIRECTORY);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const multerOptions: multer.Options = {
  storage: storage,
};

export interface FileUploadHandler {
  (request: Request, response: object): Promise<object>;
}