import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadsService } from '../uploads/uploads.service';
import { TurnstileService } from '../turnstile/turnstile.service';
import * as bcrypt from 'bcrypt';

/**
 * Servicio para la gestión de usuarios.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly uploadsService: UploadsService,
    private readonly turnstileService: TurnstileService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea un nuevo usuario utilizando una transacción y procesa su imagen de perfil.
   * @param createUserDto Datos de creación del usuario.
   * @param file Archivo opcional de imagen de perfil.
   * @returns El usuario recién creado.
   */
  async create(
    createUserDto: CreateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    await this.turnstileService.validate(createUserDto.captcha_token);

    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email.trim().toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = this.userRepository.create({
        first_name: createUserDto.first_name.trim(),
        last_name: createUserDto.last_name.trim(),
        date_of_birth: new Date(createUserDto.date_of_birth),
        nationality: createUserDto.nationality.trim().toUpperCase(),
        email: createUserDto.email.trim().toLowerCase(),
        phone_number: createUserDto.phone_number?.trim(),
        password: hashedPassword,
      });

      const savedUser = await queryRunner.manager.save(user);

      if (file) {
        savedUser.profile_picture =
          await this.uploadsService.saveUserProfilePicture(
            savedUser.id,
            file,
          );

        await queryRunner.manager.save(savedUser);
      }

      await queryRunner.commitTransaction();

      return savedUser;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error occurred';

      throw new InternalServerErrorException(
        'Error creating user: ' + errorMessage,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Recupera todos los usuarios con sus relaciones.
   * @returns Lista de usuarios.
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: [
        'offers',
        'exchanges',
        'purchases',
        'spinsWallets',
        'stickersWallets',
        'packsWallets',
      ],
    });
  }

  /**
   * Busca un usuario por ID e incluye sus relaciones y URL firmada de perfil.
   * @param id Identificador del usuario.
   * @returns El usuario encontrado.
   */
 /**
   * Busca un usuario por ID e incluye sus relaciones y URL firmada de perfil.
   * @param id Identificador del usuario.
   * @returns El usuario encontrado.
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relationLoadStrategy: 'query',
      relations: [
        'offers',
        'exchanges',
        'purchases',
        'spinsWallets',
        'stickersWallets',
        'packsWallets',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    if (user.profile_picture) {
      try {
        user.profile_picture = await this.uploadsService.getSignedUrl(
          user.profile_picture,
        );
      } catch (storageError) {
        console.warn(
          `No se pudo firmar la imagen del usuario #${id} (Posiblemente no exista en el Storage):`,
          storageError instanceof Error ? storageError.message : storageError
        );
        
        user.profile_picture = undefined; 
      }
    }

    return user;
  }

  /**
   * Busca un usuario por ID sin cargar relaciones.
   * @param id Identificador del usuario.
   * @returns El usuario encontrado o null.
   */
  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  /**
   * Busca un usuario por correo electrónico exacto.
   * @param email Correo electrónico.
   * @returns El usuario encontrado o null.
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  /**
   * Actualiza datos específicos de un usuario existente.
   * @param id Identificador del usuario.
   * @param updateUserDto Objeto con los datos a actualizar.
   * @returns El usuario actualizado.
   */
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: {
          email: updateUserDto.email.trim().toLowerCase(),
        },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedData: Partial<User> = {};

    if (updateUserDto.first_name !== undefined) {
      updatedData.first_name = updateUserDto.first_name.trim();
    }

    if (updateUserDto.last_name !== undefined) {
      updatedData.last_name = updateUserDto.last_name.trim();
    }

    if (updateUserDto.date_of_birth !== undefined) {
      updatedData.date_of_birth = new Date(
        updateUserDto.date_of_birth,
      );
    }

    if (updateUserDto.nationality !== undefined) {
      updatedData.nationality =
        updateUserDto.nationality.trim().toUpperCase();
    }

    if (updateUserDto.email !== undefined) {
      updatedData.email =
        updateUserDto.email.trim().toLowerCase();
    }

    if (updateUserDto.phone_number !== undefined) {
      updatedData.phone_number =
        updateUserDto.phone_number.trim();
    }

    if (updateUserDto.password !== undefined) {
      updatedData.password = await bcrypt.hash(
        updateUserDto.password,
        10,
      );
    }

    Object.assign(user, updatedData);

    return await this.userRepository.save(user);
  }

  /**
   * Actualiza el archivo de imagen de perfil de un usuario.
   * @param userId Identificador del usuario.
   * @param file Archivo de imagen.
   * @returns El usuario actualizado.
   */
  async updateProfilePicture(
    userId: number,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    const previousProfilePicture = user.profile_picture;

    const profilePath =
      await this.uploadsService.saveUserProfilePicture(
        userId,
        file,
      );

    user.profile_picture = profilePath;

    const savedUser = await this.userRepository.save(user);

    if (
      previousProfilePicture &&
      previousProfilePicture !== profilePath
    ) {
      try {
        await this.uploadsService.deleteProfilePicture(
          previousProfilePicture,
        );
      } catch {
        // Si la imagen anterior ya no existe, no rompemos la actualización.
      }
    }

    savedUser.profile_picture =
      await this.uploadsService.getSignedUrl(profilePath);

    return savedUser;
  }

  /**
   * Elimina un usuario de la base de datos y sus archivos asociados en el almacenamiento.
   * @param id Identificador del usuario.
   */
  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    await this.userRepository.delete(id);

    if (user.profile_picture) {
      await this.uploadsService.deleteProfilePicture(
        user.profile_picture,
      );
    }

    await this.uploadsService.removeUserDirectory(id);
  }

  /**
   * Cuenta la cantidad de usuarios registrados por una nacionalidad específica.
   * @param nationality Nacionalidad a buscar.
   * @returns Número total de usuarios.
   */
  async countByNationality(nationality: string): Promise<number> {
    return await this.userRepository.count({
      where: { nationality: nationality.toUpperCase() },
    });
  }

  /**
   * Busca usuarios cuyos nombres o apellidos coincidan parcialmente con la búsqueda.
   * @param search Texto a buscar.
   * @returns Lista de usuarios que coinciden.
   */
  async searchByName(search: string): Promise<User[]> {
    return await this.userRepository.find({
      where: [
        { first_name: Like(`%${search}%`) },
        { last_name: Like(`%${search}%`) },
      ],
      relations: ['purchases'],
    });
  }

  /**
   * Cuenta el total de compras asociadas a un usuario en particular.
   * @param userId Identificador del usuario.
   * @returns Número total de compras realizadas.
   */
  async countPurchasesByUserId(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['purchases'],
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return user.purchases.length;
  }
}
