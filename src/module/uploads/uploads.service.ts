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
   * Normaliza un valor de cover_image guardado en la base de datos (que puede
   * venir con prefijos legacy como "/uploads/private/" o "/uploads/") a la
   * key real que espera el bucket de Supabase Storage.
   * @param storedPath Valor crudo tal como está guardado en la DB.
   */
  private normalizeStorageKey(storedPath: string): string {
    return storedPath
      .replace(/^\/?uploads\/(private\/|public\/)?/, '')
      .replace(/^\/+/, '');
  }

  /**
   * Si la URL recibida es en realidad un link firmado viejo de NUESTRO propio
   * proyecto de Supabase (ej: guardado a mano en la DB alguna vez desde el
   * dashboard), devuelve la key real del objeto para poder volver a firmarlo.
   * Si es una URL externa genuina (otro dominio), devuelve null y se respeta
   * tal cual.
   * @param url URL absoluta a inspeccionar.
   */
  private extractSupabaseObjectKey(url: string): string | null {
    try {
      const supabaseHost = new URL(process.env.SUPABASE_URL!).host;
      const parsed = new URL(url);

      if (parsed.host !== supabaseHost) {
        return null;
      }

      const match = parsed.pathname.match(
        /\/storage\/v1\/object\/(?:sign|public|authenticated)\/(.+)$/,
      );

      if (!match) {
        return null;
      }

      let objectPath = decodeURIComponent(match[1]);

      // El path del objeto incluye el nombre del bucket como primer segmento
      // (ej: "private/albums/1/3.png"), hay que sacarlo antes de re-firmar.
      if (objectPath.startsWith(`${this.bucketName}/`)) {
        objectPath = objectPath.slice(this.bucketName.length + 1);
      }

      return objectPath;
    } catch {
      return null;
    }
  }

  /**
   * Resuelve en lote una lista de valores de cover_image (de stickers, álbumes, etc.)
   * a URLs firmadas y utilizables directamente por el frontend.
   *
   * - Si es una ruta/legacy path o una key de Supabase, se firma contra el bucket.
   * - Si es un link http/https VIEJO de nuestro propio Supabase (por ejemplo
   *   pegado a mano en la DB desde el dashboard), se re-firma de cero en vez
   *   de reutilizar el token, que puede estar vencido.
   * - Si es una URL absoluta realmente externa (otro dominio), se devuelve tal cual.
   * - Si el archivo no existe o Supabase falla, se devuelve null para esa posición
   *   (no rompe el resto de la respuesta ni tira una excepción).
   *
   * @param coverImages Lista de valores crudos (pueden incluir null/undefined).
   * @returns Lista de URLs resueltas, en el mismo orden y largo que la entrada.
   */
  async resolveManyImageUrls(
    coverImages: Array<string | null | undefined>,
  ): Promise<Array<string | null>> {
    const results: Array<string | null> = new Array(coverImages.length).fill(null);
    const pending: { index: number; key: string }[] = [];

    coverImages.forEach((coverImage, index) => {
      if (!coverImage) return;

      if (coverImage.startsWith('http')) {
        const supabaseKey = this.extractSupabaseObjectKey(coverImage);

        if (supabaseKey) {
          // Es (o parece) un link firmado viejo de nuestro propio bucket:
          // lo re-firmamos en vez de arriesgarnos a que el token ya venció.
          pending.push({ index, key: supabaseKey });
        } else {
          // URL externa genuina (otro host): la respetamos tal cual.
          results[index] = coverImage;
        }
        return;
      }

      pending.push({ index, key: this.normalizeStorageKey(coverImage) });
    });

    if (pending.length === 0) {
      return results;
    }

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrls(
        pending.map((item) => item.key),
        3600,
      );

    // Si Supabase falla por completo, no rompemos la respuesta:
    // simplemente esas imágenes quedan en null (mismo comportamiento que antes).
    if (error || !data) {
      return results;
    }

    data.forEach((item, i) => {
      const { index } = pending[i];
      if (!item.error && item.signedUrl) {
        results[index] = item.signedUrl;
      }
    });

    return results;
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