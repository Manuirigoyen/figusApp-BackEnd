import { PartialType } from "@nestjs/mapped-types";
import { CreateStickerDto } from "./create-sticker.dto";

/**
 * DTO para actualizar un sticker existente.
 */
export class UpdateStickerDto extends PartialType(CreateStickerDto) {}