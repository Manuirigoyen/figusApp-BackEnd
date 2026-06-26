import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Controlador de Usuarios.
 * * Proporciona los endpoints REST para la gestión de usuarios, 
 * incluyendo registro (con soporte para archivos), búsqueda, actualización y eliminación.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Registra un nuevo usuario en el sistema.
   * * @param createUserDto Datos del usuario.
   * * @param file Imagen de perfil opcional (Multer).
   */
  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('profile_picture'))
  create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.create(createUserDto, file);
  }

  /**
   * Obtiene todos los usuarios registrados.
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Busca un usuario por correo electrónico mediante query param.
   */
  @Get('email')
  findByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  /**
   * Busca usuarios por nombre o apellido.
   */
  @Get('search')
  searchByName(@Query('search') search: string) {
    return this.usersService.searchByName(search);
  }

  /**
   * Cuenta usuarios registrados por nacionalidad.
   */
  @Get('nationality/:nationality/count')
  countByNationality(@Param('nationality') nationality: string) {
    return this.usersService.countByNationality(nationality);
  }

  /**
   * Cuenta el total de compras realizadas por un usuario.
   */
  @Get(':id/purchases/count')
  countPurchasesByUserId(@Param('id', ParseIntPipe) userId: number) {
    return this.usersService.countPurchasesByUserId(userId);
  }

  /**
   * Obtiene el detalle de un usuario por su ID.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /**
   * Actualiza la información de un usuario.
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Sube o actualiza la foto de perfil de un usuario.
   */
  @Post(':id/profile-picture')
  @UseInterceptors(FileInterceptor('profile_picture'))
  updateProfilePicture(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateProfilePicture(id, file);
  }

  /**
   * Elimina un usuario permanentemente del sistema.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}