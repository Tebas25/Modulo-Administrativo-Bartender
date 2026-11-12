import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createNewDrink } from '../api/drinks.request';
import { DRINKS_ERROR_MESSAGES } from '../constants/endpoints.constants';
import type { CreateNewDrinkDto } from '../types/drinks.dto';
import { useToast } from '../components/Toast.provider';

const DEFAULT_VALUES: Partial<CreateNewDrinkDto> = {
  itemName: '',
  ingredients: '',
  image: '',
};

const toInputState = (message?: string) => ({
  helperText: message,
  status: message ? ('error' as const) : ('default' as const),
});

export const useCreateDrinkForm = (onSuccess: () => void) => {
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateNewDrinkDto>({
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  });

  const handleCreateNewDrink = handleSubmit(async (formData) => {
    setError(null);
    try {
      await createNewDrink(formData);

      toast.success({
        title: 'Bebida creada',
        body: `${formData.itemName} se agregó al menú correctamente.`,
      });

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : DRINKS_ERROR_MESSAGES.createNewDrink,
      );
      toast.success({
        title: 'Error al crear la bebida',
        body: `${DRINKS_ERROR_MESSAGES.createNewDrink}`,
      });
    }
  });

  return {
    fields: {
      itemName: {
        ...register('itemName', {
          required: 'Ingrese el nombre de la bebida',
          maxLength: { value: 64, message: 'Máximo 64 caracteres' },
        }),
        ...toInputState(errors.itemName?.message),
      },
      ingredients: {
        ...register('ingredients', { required: 'Ingrese los ingredientes' }),
        ...toInputState(errors.ingredients?.message),
      },
      image: {
        ...register('image', {
          required: 'Copie la URL de la imagen a guardar',
        }),
        ...toInputState(errors.image?.message),
      },
      modbusCode: {
        ...register('modbusCode', {
          valueAsNumber: true,
          required: 'Ingrese el código Modbus',
          min: { value: 1, message: 'Debe ser 1 o mayor' },
          validate: (value) =>
            Number.isInteger(value) || 'Debe ser un número entero',
        }),
        ...toInputState(errors.modbusCode?.message),
      },
    },
    error,
    isSubmitting,
    handleCreateNewDrink,
  };
};
