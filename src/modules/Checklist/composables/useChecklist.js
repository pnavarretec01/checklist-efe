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

  const snackbar = ref(false);
  const snackbarMessage = ref("");
  const snackbarColor = ref("info");

  const online = ref(navigator.onLine);

  const subdivisions = ref([]);

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
          console.log(
            "Uso de datos de subdivisiones almacenados en caché de LocalStorage debido a un error de API"
          );
        }
      }
    } catch (err) {
      const cachedData = getFromLocalStorage("subdivisionsData");
      if (cachedData) {
        subdivisions.value = cachedData;
        console.log("Usando datos de subdivisiones precargadas");
      } else {
        error.value = "Error obteniendo subdivisiones: " + err.message;
      }
    }
  };

  // Este es un watcher para detectar cambios en el estado de conexión.
  window.addEventListener("online", () => (online.value = true));
  window.addEventListener("offline", () => (online.value = false));
  const updateConnectionStatus = () => {
    isConnected.value = navigator.onLine;
    if (isConnected.value) {
      alert("Conexión a Internet restaurada!");
    } else {
      alert("Sin Conexión a Internet!");
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

  // Mapea la estructura de los datos provenientes del API.
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

  // Obtiene la estructura de items del API.
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

    if (!pkInicio.value) {
      snackbarMessage.value = "Por favor, ingrese un Pk Inicio.";
      snackbar.value = true;
      return false;
    }

    if (!pkTermino.value) {
      snackbarMessage.value = "Por favor, ingrese un Pk Termino.";
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
    if (online.value) {
      await sendCaracteristicas({
        parentItems: parentItems.value,
        cerrado: cerrado,
      });
    } else {
      // Si estás offline, guardar el ítem en localStorage.
      const pendingItems = getItemsFromLocalStorage();
      pendingItems.push({
        ...dataToSend,
        needsSync: true, // Marcar el ítem como pendiente de sincronización.
      });
      storeItemsInLocalStorage(pendingItems);
      snackbar.value = true;
      snackbarMessage.value =
        "Guardado localmente. Se sincronizará cuando esté online.";
      snackbarColor.value = "warning";
    }
  };

  const syncPendingItems = async () => {
    const pendingItems = getItemsFromLocalStorage().filter(
      (item) => item.needsSync
    );

    for (const item of pendingItems) {
      try {
        await axios.post(apiURL + "formularios/", item);
        // Si se sincroniza con éxito, elimina la marca de sincronización pendiente.
        item.needsSync = false;
      } catch (err) {
        console.error("Error al sincronizar:", err);
      }
    }
    storeItemsInLocalStorage(pendingItems); // Actualizar localStorage.
  };

  // Envía las características al API.
  const sendCaracteristicas = async (dataToSave) => {
    const dataToSend = {
      formulario: {
        nombre_supervisor: nombreSupervisor.value,
        fecha: fecha.value,
        subdivision: subdivision.value,
        pk_inicio: pkInicio.value,
        pk_termino: pkTermino.value,
        observacion_general: observacionGeneral.value,
        subdivision: subseleccionado.value.pk_subdivision_id,
        cerrado: dataToSave.cerrado,
      },
      features: parentItems.value.flatMap((item) =>
        item.items.flatMap((subitem) =>
          subitem.data.map((data) => ({
            pk: data.pk,
            collera: data.collera,
            observacion: data.observacion,
            subitem_id: subitem.id,
            item_id: item.id,
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
    }
  };

  // Obtiene el formulario por ID.
  const fetchFormDataById = async (id) => {
    try {
      // const response = await axios.get(apiURL + "formularios/" + id);
      //const formData = response.data;
      nombreSupervisor.value = formulario.nombre_supervisor;
      fecha.value = formulario.fecha;
      subdivision.value = formulario.subdivision;
      pkInicio.value = formulario.pk_inicio;
      pkTermino.value = formulario.pk_termino;
      observacionGeneral.value = formulario.observacion_general;
      subseleccionado.value = formulario.subdivision;
      cerrado.value = formulario.cerrado;

      parentItems.value = mapStructure(formulario);
      //console.log(parentItems.value);
    } catch (err) {
      error.value = err.message;
      console.error("Error al obtener el formulario por ID:", err);
    }
  };

  const updateItemInLocalStorage = (item) => {
    const localItems = getItemsFromLocalStorage();
    const index = localItems.findIndex((localItem) => localItem.id === item.id);
    if (index !== -1) {
      localItems[index] = item;
    } else {
      localItems.push(item);
    }
    storeItemsInLocalStorage(localItems);
  };

  const updateData = async (cerrado) => {
    if (cerrado === 1 && !validateForm()) {
      return;
    }
    if (online.value) {
      await updateCaracteristicas(cerrado);
    } else {
      if (!itemId.value) {
        // Si no tiene un ID, es un nuevo registro que aún no ha sido subido.
        updateItemInLocalStorage({
          ...parentItems.value,
          nombre_supervisor: nombreSupervisor.value,
          fecha: fecha.value,
          subdivision: subdivision.value,
          pk_inicio: pkInicio.value,
          pk_termino: pkTermino.value,
          observacion_general: observacionGeneral.value,
          subdivision: subseleccionado.value.pk_subdivision_id,
          cerrado: cerrado,
          needsSync: true,
        });
        snackbar.value = true;
        snackbarMessage.value = "Edición guardada localmente.";
        snackbarColor.value = "warning";
      } else {
        // Tiene un ID, por lo que marcamos para ser sincronizado luego.
        const itemToUpdate = {
          ...parentItems.value,
          pk_formulario_id: itemId.value,
          nombre_supervisor: nombreSupervisor.value,
          fecha: fecha.value,
          subdivision: subdivision.value,
          pk_inicio: pkInicio.value,
          pk_termino: pkTermino.value,
          observacion_general: observacionGeneral.value,
          subdivision: subseleccionado.value.pk_subdivision_id,
          cerrado: cerrado,
          needsSync: true,
        };
        storeEditedItemsInLocalStorage(itemToUpdate);
        snackbar.value = true;
        snackbarMessage.value =
          "Edición guardada localmente. Se sincronizará cuando esté online.";
        snackbarColor.value = "warning";
      }
    }
  };

  // Actualiza las características en el API.
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
        apiURL + "formularios/" + itemId.value,
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
        await axios.put(apiURL + "formularios/" + item.pk_formulario_id, item);
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
    ); // Actualizar localStorage.
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
  };
}
