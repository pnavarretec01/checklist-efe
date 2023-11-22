import axios from "axios";
import { ref } from "vue";
import { useRouter } from "vue-router";

const apiURL = import.meta.env.VITE_API_URL;

export default function useChecklist(
  nombreSupervisor,
  fecha,
  subdivision,
  pkInicio,
  pkTermino,
  observacionGeneral,
  itemId,
  formulario,
  subseleccionado
) {
  const isConnected = ref(navigator.onLine);
  const router = useRouter();
  const currentTab = ref(0);
  const items = ref([]);
  const error = ref(null);
  const parentItems = ref([]);
  const cerrado = ref("");
  const loading = ref(false);
  const snackbar = ref(false);
  const snackbarMessage = ref("");
  const snackbarColor = ref("info");
  const online = ref(navigator.onLine);
  const subdivisions = ref([]);

  const syncButtonDisabled = ref(false);
  const syncButtonLabel = ref("Sincronizar");

  const sincronizarFunc = () => {
    if (syncButtonLabel.value === "Sincronizando") {
      fetchItemsSinSincronizar();
    } else {
      fetchItems();
      syncButtonDisabled.value = true;
      syncButtonLabel.value = "Sincronizando";
      setTimeout(() => {
        syncButtonDisabled.value = false;
        syncButtonLabel.value = "Sincronizar";
      }, 10000);
    }
  };

  const fetchSubdivisions = async () => {
    try {
      const response = await axios.get(apiURL + "subdivision");
      if (response.data.success) {
        subdivisions.value = response.data.data;
        saveToLocalStorage("subdivisionsData", subdivisions.value);
      } else {
        console.error("Error obteniendo subdivisiones");
        // Intenta recuperar del caché
        const cachedData = getFromLocalStorage("subdivisionsData");
        if (cachedData) {
          subdivisions.value = cachedData;
        }
      }
    } catch (err) {
      const cachedData = getFromLocalStorage("subdivisionsData");
      if (cachedData) {
        subdivisions.value = cachedData;
      } else {
        error.value = "Error obteniendo subdivisiones: " + err.message;
      }
    }
  };

  //watcher para detectar cambios en el estado de conexion
  window.addEventListener("online", () => (online.value = true));
  window.addEventListener("offline", () => (online.value = false));
  const updateConnectionStatus = () => {
    isConnected.value = navigator.onLine;
    if (isConnected.value) {
      snackbar.value = true;
      snackbarMessage.value = "Conexión a Internet Restaurada";
      snackbarColor.value = "success";
      fetchItems();
      fetchSubdivisions();

      syncButtonDisabled.value = true;
      syncButtonLabel.value = "Sincronizando";
      setTimeout(() => {
        syncButtonDisabled.value = false;
        syncButtonLabel.value = "Sincronizar";
      }, 10000);
    } else {
      snackbar.value = true;
      snackbarMessage.value = "Sin Conexión a Internet";
      snackbarColor.value = "warning";
    }
  };

  onMounted(() => {
    fetchSubdivisions();
    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);
  });

  onUnmounted(() => {
    window.removeEventListener("online", updateConnectionStatus);
    window.removeEventListener("offline", updateConnectionStatus);
  });

  function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // Mapea la estructura de los datos provenientes de la API
  const mapStructure = (apiData) => {
    return apiData.items.map((item) => ({
      id: item.pk_item_id,
      nombre: item.nombre,
      cerrado: apiData.cerrado,
      subdivision: apiData.subdivision,
      items: item.subitems.map((subitem) => ({
        id: subitem.pk_subitem_id,
        nombre: subitem.nombre,
        data: subitem.data,
      })),
    }));
  };

  // Obtiene la estructura de items de la API
  const fetchStructure = async () => {
    try {
      const response = await axios.get(apiURL + "items");
      if (response.data.success) {
        parentItems.value = mapStructure(response.data.data);
      } else {
      }
    } catch (err) {
      error.value = err.message;
      console.error("Error al obtener la estructura:", err);
    }
  };

  const storeItemsInLocalStorage = (items) => {
    localStorage.setItem("checklist_datatabla", JSON.stringify(items));
  };

  const getItemsFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem("checklist_datatabla") || "[]");
  };

  const fetchItems = async () => {
    if (online.value) {
      syncButtonDisabled.value = true;
      syncButtonLabel.value = "Sincronizando";
      setTimeout(() => {
        syncButtonDisabled.value = false;
        syncButtonLabel.value = "Sincronizar";
      }, 10000);

      await syncPendingItems();
      await syncEditedItems();
      await syncDeletedItems();
      try {
        const response = await axios.get(apiURL + "formularios");
        items.value = response.data.map((item) => ({
          ...item,
          needsSync: false,
        }));
        storeItemsInLocalStorage(items.value);
        snackbar.value = true;
        snackbarMessage.value = "Datos cargados con éxito!";
        snackbarColor.value = "success";
        return response.data.data;
      } catch (err) {
        error.value = err.message;
        snackbar.value = true;
        snackbarMessage.value = err.message;
        snackbarColor.value = "error";
      }
    } else {
      items.value = getItemsFromLocalStorage();
      snackbar.value = true;
      snackbarMessage.value =
        "Estás offline. Cargando datos desde el almacenamiento local";
      snackbarColor.value = "warning";
    }
  };
  const fetchItemsSinSincronizar = async () => {
    syncButtonDisabled.value = true;
    syncButtonLabel.value = "Sincronizando";
    setTimeout(() => {
      syncButtonDisabled.value = false;
      syncButtonLabel.value = "Sincronizar";
    }, 10000);

    if (online.value) {
      try {
        const response = await axios.get(apiURL + "formularios");
        items.value = response.data.map((item) => ({
          ...item,
          needsSync: false,
        }));
        storeItemsInLocalStorage(items.value);
        snackbar.value = true;
        snackbarMessage.value = "Datos cargados con éxito!";
        snackbarColor.value = "success";
        return response.data.data;
      } catch (err) {
        error.value = err.message;
        snackbar.value = true;
        snackbarMessage.value = err.message;
        snackbarColor.value = "error";
      }
    } else {
      items.value = getItemsFromLocalStorage();
      snackbar.value = true;
      snackbarMessage.value =
        "Estás offline. Cargando datos desde el almacenamiento local!";
      snackbarColor.value = "warning";
    }
  };

  const addCaracteristica = (subitem) => {
    subitem.data.push({
      id: Date.now(),
      pk: 0,
      collera: "",
      observacion: "",
    });
  };

  const removeEntry = (subitem, index) => {
    subitem.data.splice(index, 1);
  };

  function validateForm() {
    if (!nombreSupervisor.value) {
      snackbarMessage.value = "Por favor, ingrese el nombre del supervisor.";
      snackbar.value = true;
      return false;
    }

    if (!fecha.value) {
      snackbarMessage.value = "Por favor, seleccione una fecha.";
      snackbar.value = true;
      return false;
    }

    if (!subseleccionado.value) {
      snackbarMessage.value = "Por favor, seleccione una subdivisión.";
      snackbar.value = true;
      return false;
    }

    if (
      pkInicio.value === null ||
      pkInicio.value === undefined ||
      isNaN(pkInicio.value) ||
      pkInicio.value < 0
    ) {
      snackbarMessage.value =
        "PK Inicio debe ser un número no negativo y es requerido.";
      snackbarColor.value = "info";
      snackbar.value = true;
      return false;
    }

    if (
      pkTermino.value === null ||
      pkTermino.value === undefined ||
      isNaN(pkTermino.value) ||
      pkTermino.value < 0
    ) {
      snackbarMessage.value =
        "PK Inicio debe ser un número no negativo y es requerido.";
      snackbarColor.value = "info";
      snackbar.value = true;
      return false;
    }

    if (!observacionGeneral.value) {
      snackbarMessage.value = "Por favor, ingrese una observación.";
      snackbar.value = true;
      return false;
    }

    return true;
  }

  const saveData = async (cerrado) => {
    if (cerrado === 1 && !validateForm()) {
      return;
    }
    loading.value = true;
    try {
      if (online.value) {
        await sendCaracteristicas({
          parentItems: parentItems.value,
          cerrado: cerrado,
        });
      } else {
        // si esta offline, guardar el ítem en localStorage
        const pendingItems = getItemsFromLocalStorage();
        pendingItems.push({
          ...dataToSend,
          needsSync: true, //marca el item como pendiente de sincronización
        });
        storeItemsInLocalStorage(pendingItems);
        snackbar.value = true;
        snackbarMessage.value =
          "Guardado localmente. Se sincronizará cuando esté online.";
        snackbarColor.value = "warning";
        router.push({ name: "checklist-page" });
      }
    } catch (error) {
    } finally {
      loading.value = false;
    }
  };

  const syncPendingItems = async () => {
    const pendingItems = getItemsFromLocalStorage().filter(
      (item) => item.needsSync
    );

    for (const item of pendingItems) {
      try {
        await axios.post(apiURL + "formularios/", item);
        // Si se sincroniza con éxito, elimina la marca de sincronización pendiente
        item.needsSync = false;
      } catch (err) {
        error.value = err.message;
        snackbar.value = true;
        snackbarMessage.value = err.message;
        snackbarColor.value = "error";
      }
    }
    storeItemsInLocalStorage(pendingItems); // Actualizar localStorage
  };

  // Envía las características a la API
  const sendCaracteristicas = async (dataToSave) => {
    const dataToSend = {
      formulario: {
        pk_formulario_id: Number(itemId.value),
        nombre_supervisor: nombreSupervisor.value,
        fecha: fecha.value,
        subdivision: subseleccionado.value.pk_subdivision_id,
        pk_inicio: pkInicio.value,
        pk_termino: pkTermino.value,
        observacion_general: observacionGeneral.value,
        cerrado: dataToSave.cerrado,
      },

      features: parentItems.value.flatMap((item) =>
        item.items.flatMap((subitem) =>
          subitem.data.map((data) => ({
            pk_formulario_id: itemId.value,
            pk: data.pk,
            collera: data.collera,
            observacion: data.observacion,
            fk_subitem_id: subitem.id,
            fk_item_id: item.id,
            nombreItem: item.nombre,
            nombreSubitem: subitem.nombre,
          }))
        )
      ),
    };

    try {
      const response = await axios.post(apiURL + "formularios/", dataToSend);
      snackbar.value = true;
      snackbarMessage.value = "Checklist agregado con éxito";
      snackbarColor.value = "success";
      router.push({ name: "checklist-page" });
    } catch (err) {
      error.value = err.message;
      snackbar.value = true;
      snackbarMessage.value = err.message;
      snackbarColor.value = "error";
    } finally {
      loading.value = false;
    }
  };

  // Obtiene el formulario por ID.
  const fetchFormDataById = async (id) => {
    try {
      nombreSupervisor.value = formulario.nombre_supervisor;
      fecha.value = formulario.fecha;
      subdivision.value = formulario.subdivision;
      pkInicio.value = formulario.pk_inicio;
      pkTermino.value = formulario.pk_termino;
      observacionGeneral.value = formulario.observacion_general;
      subseleccionado.value = formulario.subdivision;
      cerrado.value = formulario.cerrado;
      parentItems.value = mapStructure(formulario);
    } catch (err) {
      error.value = err.message;
      console.error("Error al obtener el formulario por ID:", err);
    }
  };

  const updateItemInLocalStorage = (item) => {
    const localItems = getItemsFromLocalStorage();
    const index = localItems.findIndex((localItem) => localItem.id == item.id);
    if (index !== -1) {
      localItems[index] = item;
    } else {
      localItems.push(item);
    }
    storeItemsInLocalStorage(localItems);
  };

  const updateItemInDataTableLocalStorage = (updatedItem) => {
    let items = getFromLocalStorage("checklist_datatabla") || [];

    // encuentra el índice del ítem basado en el ID (si es que existe)
    const index = items.findIndex((item) => {
      return item.pk_formulario_id === updatedItem.pk_formulario_id;
    });

    if (index !== -1) {
      // si el item existe, reemplaza el item viejo con el nuevo
      items[index] = updatedItem;
    } else {
      // si el item no existe, añade el nuevo item a la lista
      items.push(updatedItem);
    }

    saveToLocalStorage("checklist_datatabla", items);
  };

  const getFormDataToSaveFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem("formDataToSave") || "[]");
  };

  const storeFormDataToSaveInLocalStorage = (item) => {
    let formDataToSave = getFormDataToSaveFromLocalStorage();
    const index = formDataToSave.findIndex(
      (fItem) => fItem.pk_formulario_id === item.pk_formulario_id
    );
    if (index !== -1) {
      formDataToSave[index] = item;
    } else {
      formDataToSave.push(item);
    }
    localStorage.setItem("formDataToSave", JSON.stringify(formDataToSave));
  };

  const updateData = async (cerrado) => {
    if (!validateForm()) {
      return;
    }

    const baseData = {
      ...parentItems.value,
      nombre_supervisor: nombreSupervisor.value,
      fecha: fecha.value,
      subdivision: subdivision.value,
      pk_inicio: pkInicio.value,
      pk_termino: pkTermino.value,
      observacion_general: observacionGeneral.value,
      cerrado: cerrado,
      needsSync: true,
      items: parentItems.value.map((item) => ({
        pk_item_id: item.id,
        nombre: item.nombre,
        subitems: item.items.map((subitem) => ({
          pk_subitem_id: subitem.id,
          nombre: subitem.nombre,
          data: subitem.data.map((data) => ({
            pk: data.pk,
            collera: data.collera,
            observacion: data.observacion,
          })),
        })),
      })),
    };

    let pkFormularioId;
    if (itemId.value.includes("a")) {
      pkFormularioId = itemId.value;
    } else {
      pkFormularioId = Number(itemId.value);
    }

    const dataToSaveLocal = {
      formulario: {
        pk_formulario_id: pkFormularioId,
        nombre_supervisor: nombreSupervisor.value,
        fecha: fecha.value,
        pk_inicio: pkInicio.value,
        pk_termino: pkTermino.value,
        observacion_general: observacionGeneral.value,
        cerrado: cerrado,
        subdivision: subseleccionado.value.pk_subdivision_id,
      },
      features: [],
    };
    for (let item of parentItems.value) {
      for (let subitem of item.items) {
        for (let data of subitem.data) {
          dataToSaveLocal.features.push({
            pk: data.pk,
            collera: data.collera,
            observacion: data.observacion,
            fk_subitem_id: subitem.id,
            fk_item_id: item.id,
            nombreItem: item.nombre,
            nombreSubitem: subitem.nombre,
          });
        }
      }
    }

    let itemToUpdate, itemToUpdateTablaOffline;
    if (itemId.value.includes("a")) {
      updateItemInFormDataToSaveLocalStorage(dataToSaveLocal);
      itemToUpdateTablaOffline = {
        ...baseData,
        pk_formulario_id: itemId.value,
        subdivision: subseleccionado.value,
      };
      snackbar.value = true;
      snackbarMessage.value = "Edición guardada localmente.";
      snackbarColor.value = "warning";
      router.push({ name: "checklist-page" });
    } else {
      itemToUpdateTablaOffline = {
        ...baseData,
        pk_formulario_id: Number(itemId.value),
        subdivision: subseleccionado.value,
      };
      snackbar.value = true;
      snackbarMessage.value =
        "Edición guardada localmente. Se sincronizará cuando esté online.";
      snackbarColor.value = "warning";
      router.push({ name: "checklist-page" });
    }

    const dataToSave = {
      parentItems: parentItems.value,
      cerrado: cerrado,
    };

    if (online.value) {
      await sendCaracteristicas(dataToSave);
    } else {
      updateItemInDataTableLocalStorage(itemToUpdateTablaOffline);
      storeEditedItemsInLocalStorage(dataToSaveLocal);
      snackbar.value = true;
      snackbarColor.value = "warning";
      router.push({ name: "checklist-page" });
    }
  };

  function updateItemInFormDataToSaveLocalStorage(updatedItem) {
    let formDataToSave = getFormDataToSaveFromLocalStorage();
    const index = formDataToSave.findIndex(
      (fItem) =>
        fItem.formulario.pk_formulario_id ===
        updatedItem.formulario.pk_formulario_id
    );

    if (index !== -1) {
      formDataToSave[index] = updatedItem;
    } else {
      formDataToSave.push(updatedItem);
    }

    localStorage.setItem("formDataToSave", JSON.stringify(formDataToSave));
  }

  // function updateItemInDataTableLocalStorage(updatedItem) {
  //   let items = getItemsFromLocalStorage();
  //   const index = items.findIndex(
  //     (item) =>
  //       item.pk_formulario_id === updatedItem.formulario.pk_formulario_id
  //   );

  //   if (index !== -1) {
  //     items[index] = updatedItem;
  //   } else {
  //     items.push(updatedItem);
  //   }

  //   localStorage.setItem("checklist_datatabla", JSON.stringify(items));
  // }

  // Actualiza las características en la API
  const updateCaracteristicas = async (cerrado) => {
    const dataToSend = {
      pk_formulario_id: itemId.value,
      nombre_supervisor: nombreSupervisor.value,
      fecha: fecha.value,
      subdivision: subdivision.value,
      pk_inicio: pkInicio.value,
      pk_termino: pkTermino.value,
      observacion_general: observacionGeneral.value,
      subdivision: subseleccionado.value.pk_subdivision_id,
      cerrado: cerrado,
      items: parentItems.value.map((item) => ({
        pk_item_id: item.id,
        nombre: item.nombre,
        subitems: item.items.map((subitem) => ({
          pk_subitem_id: subitem.id,
          nombre: subitem.nombre,
          data: subitem.data.map((data) => ({
            pk: data.pk,
            collera: data.collera,
            observacion: data.observacion,
          })),
        })),
      })),
    };

    try {
      const response = await axios.put(
        apiURL + "formularios/" + Number(itemId.value),
        dataToSend
      );
      snackbar.value = true;
      snackbarMessage.value = "Datos editados con éxito!";
      snackbarColor.value = "success";
      router.push({ name: "checklist-page" });
    } catch (err) {
      error.value = err.message;
      snackbar.value = true;
      snackbarMessage.value = err.message;
      snackbarColor.value = "error";
    }
  };

  //elimina un formulario
  const deleteData = async (id) => {
    if (online.value) {
      try {
        const response = await axios.delete(apiURL + "formularios/" + id);
        if (response.data.success) {
          const index = items.value.findIndex((i) => i.pk_formulario_id === id);
          if (index !== -1) {
            items.value.splice(index, 1);
          }
          snackbar.value = true;
          snackbarMessage.value = "Checklist eliminado con éxito";
          snackbarColor.value = "success";
        } else {
          error.value = err.message;
          snackbar.value = true;
          snackbarMessage.value = err.message;
          snackbarColor.value = "error";
        }
      } catch (err) {
        error.value = err.message;
        snackbar.value = true;
        snackbarMessage.value = err.message;
        snackbarColor.value = "error";
      }
    } else {
      storeDeletedItemsInLocalStorage(id);
      const index = items.value.findIndex((i) => i.pk_formulario_id === id);
      if (index !== -1) {
        items.value.splice(index, 1);
      }
      snackbar.value = true;
      snackbarMessage.value =
        "Checklist marcado para eliminar. Se eliminará cuando esté online.";
      snackbarColor.value = "warning";
    }
  };

  const storeEditedItemsInLocalStorage = (item) => {
    const editedItems = getEditedItemsFromLocalStorage();
    const index = editedItems.findIndex(
      (eItem) => eItem.pk_formulario_id === item.pk_formulario_id
    );
    if (index !== -1) {
      editedItems[index] = item;
    } else {
      editedItems.push(item);
    }
    localStorage.setItem("checklist_editedItems", JSON.stringify(editedItems));
  };

  const getEditedItemsFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem("checklist_editedItems") || "[]");
  };

  const syncEditedItems = async () => {
    const editedItems = getEditedItemsFromLocalStorage();

    for (const item of editedItems) {
      try {
        await axios.put(
          apiURL + "formularios/" + Number(item.formulario.pk_formulario_id),
          item
        );
        // Si se sincroniza con éxito, elimina el ítem de la lista de items editados.
        const index = editedItems.findIndex(
          (eItem) => eItem.pk_formulario_id === item.pk_formulario_id
        );
        if (index !== -1) {
          editedItems.splice(index, 1);
        }
      } catch (err) {
        console.error("Error al sincronizar (editar):", err);
      }
    }
    localStorage.setItem("checklist_editedItems", JSON.stringify(editedItems)); // Actualizar localStorage.
  };

  const storeDeletedItemsInLocalStorage = (id) => {
    const deletedItems = getDeletedItemsFromLocalStorage();
    deletedItems.push(id);
    localStorage.setItem(
      "checklist_deletedItems",
      JSON.stringify(deletedItems)
    );
  };

  const getDeletedItemsFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem("checklist_deletedItems") || "[]");
  };

  const syncDeletedItems = async () => {
    const deletedItems = getDeletedItemsFromLocalStorage();

    for (const id of deletedItems) {
      try {
        await axios.delete(apiURL + "formularios/" + id);
        // Si se sincroniza con éxito, elimina el ítem de la lista de items eliminados.
        const index = deletedItems.indexOf(id);
        if (index !== -1) {
          deletedItems.splice(index, 1);
        }
      } catch (err) {
        console.error("Error al sincronizar (eliminar):", err);
      }
    }
    localStorage.setItem(
      "checklist_deletedItems",
      JSON.stringify(deletedItems)
    );
  };

  return {
    items,
    fetchItems,
    currentTab,
    parentItems,
    addCaracteristica,
    removeEntry,
    saveData,
    sendCaracteristicas,
    fetchStructure,
    fetchFormDataById,
    updateData,
    deleteData,
    snackbar,
    snackbarMessage,
    snackbarColor,
    cerrado,
    subdivisions,
    fetchItemsSinSincronizar,
    syncButtonDisabled,
    syncButtonLabel,
    sincronizarFunc,
  };
}
