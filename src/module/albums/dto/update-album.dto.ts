import { PartialType } from "@nestjs/mapped-types";
import { CreateAlbumDto } from "./create-album.dto";

/**
 * DTO para actualizar un álbum existente.
 */
export class UpdateAlbumDto extends PartialType(CreateAlbumDto) {}