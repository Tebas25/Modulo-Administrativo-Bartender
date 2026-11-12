export interface DrinkItemDto {
  nombre_item: string;
  precio_item: string;
  estado: boolean;
}

export interface DrinksDto {
  items: DrinkItemDto[];
}

export interface UpdateItemStateDto {
  item_state: boolean;
  item_name: string;
  id_cobot: string;
}

export interface UpdateItemPriceDto {
  item_price: number;
  item_name: string;
  id_cobot: string;
}

export interface SentCreateNewDrinkDto {
  nombre_item: string;
  ingredientes: string;
  imagen: string;
  codigo_modbus: number;
}

export interface CreateNewDrinkDto {
  itemName: string;
  ingredients: string;
  image: string;
  modbusCode: number;
}

export interface GetItemDto {
  id_item: number;
  nombre_item: string;
}

export interface GetDrinkCatalogDto {
  items: GetItemDto[];
}
