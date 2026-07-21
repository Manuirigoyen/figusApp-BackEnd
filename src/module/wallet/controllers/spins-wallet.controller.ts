import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

import { SpinsWalletService } from "./../services/spins-wallet.service";
import { UpdateSpinsWalletDto } from "./../dto/update-spins-wallet.dto";
import { Roles } from "./../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "./../../auth/guards/jwt-auth.guard";

interface AuthenticatedRequest extends Request {
  user: {
    id?: number;
    sub?: number;
    userId?: number;
  };
}

/**
 * Controlador de Billetera de Giros (SpinsWalletController).
 * Expone los endpoints para interactuar con el inventario de giros de usuario,
 * incluyendo la ejecución de giros y operaciones de administración.
 */
@Controller("spins-wallet")
export class SpinsWalletController {
  constructor(private readonly spinsWalletService: SpinsWalletService) { }

  /**
   * Ejecuta un giro de ruleta para el usuario autenticado.
   */
  @UseGuards(JwtAuthGuard)
  @Post("spin")
  executeSpin(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id ?? req.user.sub ?? req.user.userId;

    if (userId === undefined) {
      throw new UnauthorizedException(
        "No se pudo extraer un ID de usuario válido desde el token de autenticación."
      );
    }

    return this.spinsWalletService.executeSecureSpin(userId);
  }

  @Post()
  async create(@Body() body: { user_id: number; spins: number }) {
    return this.spinsWalletService.addSpinsToUser(body.user_id, body.spins);
  }

  /**
   * Lista todas las billeteras de giros existentes.
   */
  @Get()
  findAll() {
    return this.spinsWalletService.findAll();
  }

  /**
   * Obtiene la billetera de giros por user_id.
   * Debe ir antes de :id para que Nest no lo interprete como un id numérico.
   */
  @UseGuards(JwtAuthGuard)
  @Get("user/:userId")
  @Header("Cache-Control", "no-store")
  findByUser(@Param("userId", ParseIntPipe) userId: number) {
    return this.spinsWalletService.findByUser(userId);
  }

  /**
   * Obtiene la billetera de giros por ID de fila.
   */
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.spinsWalletService.findOne(id);
  }

  /**
   * Actualiza los datos de una billetera de giros.
   * Restringido a usuarios con rol "admin".
   */
  @Roles("admin")
  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateSpinsWalletDto: UpdateSpinsWalletDto,
  ) {
    return this.spinsWalletService.update(id, updateSpinsWalletDto);
  }

  /**
   * Elimina un registro de billetera de giros.
   * Restringido a usuarios con rol "admin".
   */
  @Roles("admin")
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.spinsWalletService.remove(id);
  }
}