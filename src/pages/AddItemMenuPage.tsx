import { Button } from '../components/Button.component';
import { FloatingInput } from '../components/FloatingLabel.component';
import { Modal } from '../components/Modal.component';
import {
  SelectList,
  type SelectOption,
} from '../components/SelectList.component';
import { useAddItemMenu } from '../hooks/useAddItemMenu';
import { useItemDrinks } from '../hooks/useItemDrink';

const FORM_ID = 'add-item-menu-form';

interface AddItemMenuProps {
  cobotOptions: SelectOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AddItemMenuModal({
  cobotOptions,
  onClose,
  onSuccess,
}: AddItemMenuProps) {
  const {
    fields,
    itemNameField,
    cobotField,
    error,
    isSubmitting,
    handleCreateItemMenu,
  } = useAddItemMenu(onSuccess);

  const { itemDrinks } = useItemDrinks();
  const drinksOptions = itemDrinks.map((item) => ({
    value: item.nombre_item,
    label: item.nombre_item,
  }));

  return (
    <Modal
      title="Agregar bebidas al menú"
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
        onSubmit={handleCreateItemMenu}
        noValidate
        className="space-y-10"
      >
        <SelectList
          label="Cobot"
          options={cobotOptions}
          placeholder="Buscar un cobot"
          emptyMessage="No hay cobots que coincidad"
          {...cobotField}
        />
        <SelectList
          label="Bebida"
          options={drinksOptions}
          placeholder="Buscar una bebida"
          emptyMessage="No existen bebidas"
          {...itemNameField}
        />

        <FloatingInput
          label="Precio"
          tone="light"
          type="number"
          step="0.01"
          {...fields.itemPrice}
        />

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
