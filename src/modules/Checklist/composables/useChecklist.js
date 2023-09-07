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
  formulario
) {
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

  // Este es un watcher para detectar cambios en el estado de conexión.
  window.addEventListener("online", () => (online.value = true));
  window.addEventListener("offline", () => (online.value = false));

  // Mapea la estructura de los datos provenientes del API.
  const mapStructure = (apiData) => {
    return apiData.items.map((item) => ({
      id: item.pk_item_id,
      nombre: item.nombre,
      cerrado: apiData.cerrado,
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
      try {
        const response = await axios.get(apiURL + "formularios");
        items.value = response.data.map((item) => ({
          ...item,
          needsSync: false,
        })); // Añadido para marcar como sincronizado
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

  const saveData = async (cerrado) => {
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
        await axios.post(apiURL + "formularios/addForm", item);
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
      const response = await axios.post(
        apiURL + "formularios/addForm",
        dataToSend
      );
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
      cerrado.value = formulario.cerrado;

      parentItems.value = mapStructure(formulario);
      //console.log(parentItems.value);
    } catch (err) {
      error.value = err.message;
      console.error("Error al obtener el formulario por ID:", err);
    }
  };

  const updateData = async (cerrado) => {
    await updateCaracteristicas(cerrado);
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
  };
}
