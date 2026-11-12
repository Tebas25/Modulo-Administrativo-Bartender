export interface CobotItemDto {
  id_cobot: string;
  nombre_cobot: string;
}

export interface CobotDto {
  items: CobotItemDto[];
}
