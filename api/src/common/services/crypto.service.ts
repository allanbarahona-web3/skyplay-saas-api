import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scrypt, CipherGCM, DecipherGCM } from 'crypto';
import { promisify } from 'util';

/**
 * Crypto Service
 * Servicio para encriptar/desencriptar datos sensibles (passwords SMTP, API keys, etc)
 * Usa AES-256-GCM
 */
@Injectable()
export class CryptoService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private tagLength = 16;

  /**
   * Encripta un string
   */
  async encrypt(text: string, secret: string): Promise<string> {
    const iv = randomBytes(this.ivLength);
    const key = await this.deriveKey(secret);
    
    const cipher = createCipheriv(this.algorithm, key, iv) as CipherGCM;
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Retorna: IV + AuthTag + EncryptedData (todo en hex)
    return iv.toString('hex') + authTag.toString('hex') + encrypted;
  }

  /**
   * Desencripta un string
   */
  async decrypt(encryptedData: string, secret: string): Promise<string> {
    const iv = Buffer.from(encryptedData.slice(0, this.ivLength * 2), 'hex');
    const authTag = Buffer.from(
      encryptedData.slice(this.ivLength * 2, (this.ivLength + this.tagLength) * 2),
      'hex',
    );
    const encrypted = encryptedData.slice((this.ivLength + this.tagLength) * 2);
    
    const key = await this.deriveKey(secret);
    
    const decipher = createDecipheriv(this.algorithm, key, iv) as DecipherGCM;
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Deriva una key desde un secret usando scrypt
   */
  private async deriveKey(secret: string): Promise<Buffer> {
    const scryptAsync = promisify(scrypt);
    return (await scryptAsync(secret, 'salt', this.keyLength)) as Buffer;
  }
}
