import { ref } from "vue";

export const useLogica = (data, abrirDialog, abrirDialogEliminar, createItem) => {
  const itemEditar = ref({
    nombre: "",
    pk_inicio: null,
    pk_termino: null,
  });

  const servicioExiste = (nombre, excludeId = null) => {
    return data.value.some((item) => {
      if (excludeId && item.id === excludeId) {
        return false;
      }
      return item.categoria.toLowerCase() === nombre.toLowerCase();
    });
  };

  const guardar = async () => {
    const { id, nombre, pk_inicio, pk_termino } = itemEditar.value;

    if (servicioExiste(nombre, id)) {
      alert("Este Servicio ya existe!");
      return;
    }

    if (id) {
      const index = data.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        data.value[index] = { ...itemEditar.value };
      }
    } else {
      const item = {
        nombre: nombre,
        pk_inicio: pk_inicio,
        pk_termino: pk_termino,
      };
      createItem(item);
      return
      data.value.unshift(item);
    }
  };

  const abrirEditarItem = (item) => {
    itemEditar.value = {
      id: item.raw.id,
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

  const confirmarEliminar = (itemId) => {
    const index = data.value.findIndex((item) => item.id === itemId.id);
    data.value.splice(index, 1);
    closeDelete();
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
