import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Servicio de gestión de archivos en Supabase Storage.
 * Maneja perfiles de usuario y directorios virtuales de álbumes.
 */
@Injectable()
export class UploadsService {
  private readonly supabase: SupabaseClient;
  private readonly bucketName = 'private';

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  /**
   * Valida que el archivo subido sea una imagen.
   */
  private validateImage(file: Express.Multer.File): void {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Archivo inválido, solo se permiten imágenes');
    }
  }

  /**
   * Sube una foto de perfil al bucket de Supabase.
   * @param userId ID del usuario.
   * @param file Archivo a subir.
   * @returns Ruta del archivo guardado.
   */
  async saveUserProfilePicture(userId: number, file: Express.Multer.File): Promise<string> {
    this.validateImage(file);
    const path = `users/${userId}/profile${Date.now()}${file.originalname.slice(file.originalname.lastIndexOf('.'))}`;

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw new InternalServerErrorException(error.message);
    return path;
  }

  /**
   * Obtiene una URL firmada para acceder a imágenes privadas.
   * @param path Ruta del archivo en el bucket.
   * @returns URL temporal firmada.
   */
  async getSignedUrl(path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrl(path, 3600);

    if (error) throw new InternalServerErrorException(error.message);
    return data.signedUrl;
  }

  /**
   * Elimina un archivo específico del bucket.
   * @param path Ruta exacta del archivo.
   */
  async deleteProfilePicture(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) throw new InternalServerErrorException(error.message);
  }

  /**
   * Elimina todos los archivos del prefijo de un usuario.
   * @param userId ID del usuario.
   */
  async removeUserDirectory(userId: number): Promise<void> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .list(`users/${userId}`);

    if (error) throw new InternalServerErrorException(error.message);

    if (data && data.length > 0) {
      const filesToRemove = data.map((file) => `users/${userId}/${file.name}`);
      const { error: removeError } = await this.supabase.storage
        .from(this.bucketName)
        .remove(filesToRemove);
        
      if (removeError) throw new InternalServerErrorException(removeError.message);
    }
  }

  /**
   * Elimina todos los archivos bajo el prefijo de un álbum.
   * @param albumId ID del álbum.
   */
  async removeAlbumDirectory(albumId: number): Promise<void> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .list(`albums/${albumId}`);

    if (error) throw new InternalServerErrorException(error.message);

    if (data && data.length > 0) {
      const filesToRemove = data.map((file) => `albums/${albumId}/${file.name}`);
      const { error: removeError } = await this.supabase.storage
        .from(this.bucketName)
        .remove(filesToRemove);
        
      if (removeError) throw new InternalServerErrorException(removeError.message);
    }
  }

  /**
   * Elimina todos los archivos bajo el prefijo de un pack en el bucket.
   * @param packId ID del pack.
   */
  async removePackDirectory(packId: number): Promise<void> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .list(`packs/${packId}`);

    if (error) throw new InternalServerErrorException(error.message);

    if (data && data.length > 0) {
      const filesToRemove = data.map((file) => `packs/${packId}/${file.name}`);
      const { error: removeError } = await this.supabase.storage
        .from(this.bucketName)
        .remove(filesToRemove);
        
      if (removeError) throw new InternalServerErrorException(removeError.message);
    }
  }

  /**
   * Elimina todos los archivos asociados a un sticker específico dentro de un álbum.
   * @param albumId ID del álbum.
   * @param stickerId ID del sticker.
   */
  async removeStickerDirectory(albumId: number, stickerId: number): Promise<void> {
    const prefix = `packs/${albumId}/${stickerId}`;
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .list(prefix);

    if (error) throw new InternalServerErrorException(error.message);

    if (data && data.length > 0) {
      const filesToRemove = data.map((file) => `${prefix}/${file.name}`);
      const { error: removeError } = await this.supabase.storage
        .from(this.bucketName)
        .remove(filesToRemove);
        
      if (removeError) throw new InternalServerErrorException(removeError.message);
    }
  }
}