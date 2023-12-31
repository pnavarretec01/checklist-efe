import { ref } from "vue";

export const useLogica = (
  data,
  abrirDialog,
  abrirDialogEliminar,
  createItem,
  editItem,
  deleteItemApi
) => {
  const itemEditar = ref({
    nombre: "",
    pk_inicio: null,
    pk_termino: null,
  });

  const servicioExiste = (nombre, excludeId = null) => {
    return data.value.some((item) => {
      if (excludeId && item.pk_subdivision_id === excludeId) {
        return false;
      }
      if (typeof nombre === "string" && item.nombre) {
        return item.nombre.toLowerCase() === nombre.toLowerCase();
      }
      return item.nombre === nombre;
    });
  };

  const guardar = async () => {
    const { pk_subdivision_id, nombre, pk_inicio, pk_termino } = itemEditar.value;

    if (servicioExiste(nombre, pk_subdivision_id)) {
      alert("Este Servicio ya existe!");
      return;
    }

    try {
      if (pk_subdivision_id) {
        await editItem(itemEditar.value);
        const index = data.value.findIndex(
          (item) => item.pk_subdivision_id === pk_subdivision_id
        );
        if (index !== -1) {
          data.value[index] = { ...itemEditar.value };
        }
      } else {
        const item = {
          nombre: nombre,
          pk_inicio: pk_inicio,
          pk_termino: pk_termino,
        };
        await createItem(item);
      }
      close();
    } catch (error) {
      console.error("Hubo un error al guardar el servicio.", error);
    }
  };

  const abrirEditarItem = (item) => {
    itemEditar.value = {
      pk_subdivision_id: item.raw.pk_subdivision_id,
      nombre: item.raw.nombre,
      pk_inicio: item.raw.pk_inicio,
      pk_termino: item.raw.pk_termino,
    };
    abrirDialog.value = true;
  };

  const crearServicio = () => {
    itemEditar.value = {
      nombre: "",
      pk_inicio: null,
      pk_termino: null,
    };
    abrirDialog.value = true;
  };

  const close = () => {
    abrirDialog.value = false;
    itemEditar.value = {};
  };
  const closeDelete = () => {
    abrirDialogEliminar.value = false;
    itemEditar.value = {};
  };

  const abrirEliminarItem = (item) => {
    itemEditar.value = {
      id: item,
    };
    abrirDialogEliminar.value = true;
  };

  const confirmarEliminar = async (itemId) => {
    try {
      await deleteItemApi(itemId.id.pk_subdivision_id);
      const index = data.value.findIndex(
        (item) => item.pk_subdivision_id === itemId.id.pk_subdivision_id
      );
      if (index !== -1) {
        data.value.splice(index, 1);
      }
      closeDelete();
    } catch (error) {
      console.error("Hubo un error al eliminar el servicio.", error);
    }
  };

  return {
    itemEditar,
    guardar,
    abrirEditarItem,
    crearServicio,
    close,
    confirmarEliminar,
    closeDelete,
    abrirEliminarItem,
  };
};
