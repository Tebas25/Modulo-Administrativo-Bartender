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
  precio_item: number;
  estado: boolean;
  ingredientes: string;
  codigo_modbus: number;
  id_cobot: string;
}

export interface CreateNewDrinkDto {
  itemName: string;
  itemPrice: number;
  state: boolean;
  ingredients: string;
  modbusCode: number;
  cobotId: string;
}
