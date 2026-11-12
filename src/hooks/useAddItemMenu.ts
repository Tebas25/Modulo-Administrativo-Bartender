import { useState } from 'react';
import type { AddMenuItemDto } from '../types/menu.dto';
import { useController, useForm } from 'react-hook-form';
import { addDrinkMenu } from '../api/menu.request';
import { MENU_ERROR_MESSAGES } from '../constants/endpoints.constants';
import { useToast } from '../components/Toast.provider';

const DEFAULT_VALUES: Partial<AddMenuItemDto> = {
  cobotId: '',
  itemName: '',
};

const toInputState = (message?: string) => ({
  helperText: message,
  status: message ? ('error' as const) : ('default' as const),
});

export const useAddItemMenu = (onSuccess: () => void) => {
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddMenuItemDto>({
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  });

  const cobot = useController({
    name: 'cobotId',
    control,
    rules: { required: 'Seleccione un Cobot' },
  });

  const itemDrink = useController({
    name: 'itemName',
    control,
    rules: { required: 'Seleccione una bebida' },
  });

  const handleCreateItemMenu = handleSubmit(async (formData) => {
    setError(null);
    try {
      await addDrinkMenu(formData);

      toast.success({
        title: 'Bebida agregada al menú',
        body: `${formData.itemName} se agregó al menú correctamente.`,
      });

      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : MENU_ERROR_MESSAGES.addMenu;

      setError(message);
      toast.error({
        title: 'No se pudo agregar la bebida',
        body: message,
      });
    }
  });

  return {
    itemNameField: {
      value: itemDrink.field.value,
      onChange: itemDrink.field.onChange,
      error: itemDrink.fieldState.error?.message,
    },
    cobotField: {
      value: cobot.field.value,
      onChange: cobot.field.onChange,
      error: cobot.fieldState.error?.message,
    },
    fields: {
      itemPrice: {
        ...register('itemPrice', {
          valueAsNumber: true,
          required: 'Agregue el precio de la bebida',
          min: { value: 0.01, message: 'El precio debe ser mayor a 0' },
        }),
        ...toInputState(errors.itemPrice?.message),
      },
    },
    error,
    isSubmitting,
    handleCreateItemMenu,
  };
};
