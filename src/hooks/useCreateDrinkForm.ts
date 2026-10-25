import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { createNewDrink } from '../api/drinks.request';
import { DRINKS_ERROR_MESSAGES } from '../constants/endpoints.constants';
import type { CreateNewDrinkDto } from '../types/drinks.dto';

const DEFAULT_VALUES: Partial<CreateNewDrinkDto> = {
  cobotId: '',
  itemName: '',
  ingredients: '',
  state: true,
};

const toInputState = (message?: string) => ({
  helperText: message,
  status: message ? ('error' as const) : ('default' as const),
});

export const useCreateDrinkForm = (onSuccess: () => void) => {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateNewDrinkDto>({
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  });

  const cobot = useController({
    name: 'cobotId',
    control,
    rules: { required: 'Seleccione un cobot' },
  });
  const state = useController({ name: 'state', control });

  const handleCreateNewDrink = handleSubmit(async (formData) => {
    setError(null);
    try {
      await createNewDrink(formData);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : DRINKS_ERROR_MESSAGES.createNewDrink,
      );
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
      itemPrice: {
        ...register('itemPrice', {
          valueAsNumber: true,
          required: 'Ingrese el precio',
          min: { value: 0.01, message: 'El precio debe ser mayor a 0' },
        }),
        ...toInputState(errors.itemPrice?.message),
      },
    },
    cobotField: {
      value: cobot.field.value,
      onChange: cobot.field.onChange,
      error: cobot.fieldState.error?.message,
    },
    stateField: {
      checked: state.field.value,
      onChange: state.field.onChange,
    },
    error,
    isSubmitting,
    handleCreateNewDrink,
  };
};
