import { PartialType } from "@nestjs/mapped-types";
import { CreatePackDto } from "./create-pack.dto";

/**
 * DTO para actualizar un paquete existente.
 */
export class UpdatePackDto extends PartialType(CreatePackDto) {}