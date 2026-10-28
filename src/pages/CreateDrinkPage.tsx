import { Button } from '../components/Button.component';
import { FloatingInput } from '../components/FloatingLabel.component';
import { Modal } from '../components/Modal.component';
import {
  SelectList,
  type SelectOption,
} from '../components/SelectList.component';
import { Switch } from '../components/Switch.component';
import { useCreateDrinkForm } from '../hooks/useCreateDrinkForm';

const FORM_ID = 'create-drink-form';

interface CreateDrinkModalProps {
  cobotOptions: SelectOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateDrinkModal({
  cobotOptions,
  onClose,
  onSuccess,
}: CreateDrinkModalProps) {
  const {
    fields,
    cobotField,
    stateField,
    error,
    isSubmitting,
    handleCreateNewDrink,
  } = useCreateDrinkForm(onSuccess);

  return (
    <Modal
      title="Agregar bebida"
      size="lg"
      onClose={onClose}
      isBusy={isSubmitting}
      footer={
        <>
          <Button
            variant="destructive"
            size="lg"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="primary"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleCreateNewDrink}
        noValidate
        className="space-y-10"
      >
        <SelectList
          label="Cobot"
          options={cobotOptions}
          placeholder="Seleccione un cobot"
          searchPlaceholder="Buscar cobot..."
          emptyMessage="No hay cobots que coincidan"
          {...cobotField}
        />

        <FloatingInput
          label="Nombre"
          tone="light"
          autoComplete="off"
          {...fields.itemName}
        />

        <FloatingInput
          label="Ingredientes"
          tone="light"
          autoComplete="off"
          {...fields.ingredients}
        />

        <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
          <FloatingInput
            label="Precio"
            tone="light"
            type="number"
            step="0.01"
            inputMode="decimal"
            {...fields.itemPrice}
          />

          <FloatingInput
            label="Código Modbus"
            tone="light"
            type="number"
            step="0.01"
            inputMode="decimal"
            {...fields.modbusCode}
          />
        </div>

        <div>
          <p className="mb-2 text-lg font-bold text-black">
            Disponibilidad inicial
          </p>
          <div className="flex items-center gap-4">
            <Switch label="Disponible al crear la bebida" {...stateField} />
            <span className="text-lg text-slate-800">
              {stateField.checked ? 'Disponible' : 'No disponible'}
            </span>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-300 bg-red-50 px-5 py-4 text-base font-medium text-red-700"
          >
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
