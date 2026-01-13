import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

/**
 * DO Spaces Service
 * Servicio para interactuar con DigitalOcean Spaces (compatible S3)
 */
@Injectable()
export class DOSpacesService {
  private readonly logger = new Logger(DOSpacesService.name);
  private s3Client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('DO_SPACES_ENDPOINT');
    const region = this.configService.get<string>('DO_SPACES_REGION');
    const accessKeyId = this.configService.get<string>('DO_SPACES_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('DO_SPACES_SECRET_KEY');
    this.bucket = this.configService.get<string>('DO_SPACES_BUCKET');

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Usar path-style URLs: https://endpoint/bucket/key
    });

    this.logger.log(`DO Spaces initialized: ${endpoint} (bucket: ${this.bucket})`);
  }

  /**
   * Sube un archivo a DO Spaces
   * @param file - Archivo de Express Multer
   * @param key - Path completo en el bucket (ej: tenants/2/products/image.jpg)
   * @returns Promise con el path del archivo
   */
  async uploadFile(
    file: Express.Multer.File,
    key: string,
  ): Promise<{ path: string; url: string }> {
    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read', // Hacer público para acceso directo
        },
      });

      await upload.done();

      const doSpacesUrl = this.configService.get<string>('DO_SPACES_URL');
      const url = `${doSpacesUrl}/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        path: key,
        url,
      };
    } catch (error) {
      this.logger.error(`Error uploading file to DO Spaces: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Elimina un archivo de DO Spaces
   * @param key - Path del archivo en el bucket
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file from DO Spaces: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Verifica si un archivo existe en DO Spaces
   * @param key - Path del archivo
   * @returns true si existe, false si no
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }
}
