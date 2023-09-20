import axios from "axios";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const apiURL = import.meta.env.VITE_API_URL;

export default function useChecklist(
  nombreSupervisor,
  fecha,
  subdivision,
  pkInicio,
  pkTermino,
  observacionGeneral,
  subseleccionado
) {
  const isConnected = ref(navigator.onLine);
  const isSavedOffline = ref(false);

  const updateConnectionStatus = () => {
    isConnected.value = navigator.onLine;
    if (isConnected.value) {
      alert("Conexión a Internet restaurada!");
      syncOfflineData();
    } else {
      console.log("Sin Conexión a Internet!");
      alert("Sin Conexión a Internet!");
    }
  };

  const manualSync = async () => {
    syncOfflineData();
  };

  const pendingForms = getFromLocalStorage("formDataToSave") || [];

  onMounted(() => {
    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);
  });

  onUnmounted(() => {
    window.removeEventListener("online", updateConnectionStatus);
    window.removeEventListener("offline", updateConnectionStatus);
  });

  const router = useRouter();
  const currentTab = ref(0);
  const items = ref([]);
  const error = ref(null);

  const snackbar = ref(false);
  const snackbarMessage = ref("");
  const snackbarColor = ref("info");

  const parentItems = ref([]);

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

  const mapStructure = (apiData) => {
    return apiData.map((item) => ({
      id: item.pk_item_id,
      nombre: item.nombre,
      items: item.subitems.map((subitem) => ({
        id: subitem.pk_subitem_id,
        nombre: subitem.nombre,
        data: [],
      })),
    }));
  };

  const fetchStructure = async () => {
    try {
      const response = await axios.get(apiURL + "items");
      if (response.data.success) {
        parentItems.value = mapStructure(response.data.data);
        saveToLocalStorage("checklistData", parentItems.value); // guardo los datos en LocalStorage
      } else {
        console.error("Error");
        // Si la API responde con un error pero aún hay una conexión, puedes intentar recuperar los datos del caché
        const cachedData = getFromLocalStorage("checklistData");
        if (cachedData) {
          parentItems.value = cachedData;
          console.log(
            "Uso de datos almacenados en caché de LocalStorage debido a un error de API"
          );
        }
      }
    } catch (err) {
      const cachedData = getFromLocalStorage("checklistData"); // obtengo los datos desde LocalStorage en caso de error
      if (cachedData) {
        parentItems.value = cachedData;
        console.log("Usando data precargada");
      } else {
        error.value = err.message;
      }
    }
  };

  function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    if (data) {
      let parsedData = JSON.parse(data);
      return Array.isArray(parsedData) ? parsedData : null;
    }
    return null;
  }

  const fetchItems = async () => {
    try {
      const response = await axios.get(apiURL + "formularios");
      items.value = response.data;
      return response.data.data;
    } catch (err) {
      error.value = err.message;
      console.error("Error al obtener los datos:", err);
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
    const dataToSave = {
      parentItems: parentItems.value,
      cerrado: cerrado,
    };

    await sendCaracteristicas(dataToSave);
  };

  const sendCaracteristicas = async (dataToSave) => {
    try {
      if (!isConnected.value) {
        console.log("sin conexion?");
        const dataToSaveLocal = {
          formulario: {
            nombre_supervisor: nombreSupervisor.value,
            fecha: fecha.value,
            subdivision: subdivision.value,
            pk_inicio: pkInicio.value,
            pk_termino: pkTermino.value,
            observacion_general: observacionGeneral.value,
            subdivision: subseleccionado,
            cerrado: dataToSave.cerrado,
            needsSync: true,
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
                subitem_id: subitem.id,
                item_id: item.id,
              });
            }
          }
        }

        let offlineForms = getFromLocalStorage("formDataToSave") || [];

        offlineForms.push(dataToSaveLocal);
        saveToLocalStorage("formDataToSave", offlineForms);
        isSavedOffline.value = true;
        snackbar.value = true;
        snackbarMessage.value =
          "Datos guardados localmente. Se enviarán cuando haya conexión.";
        snackbarColor.value = "info";

        //data para pushear a la tabla offline, cambia estructura de la que se envía
        const datatoPushTable = {
          nombre_supervisor: nombreSupervisor.value,
          fecha: fecha.value,
          subdivision: subdivision.value,
          pk_inicio: pkInicio.value,
          pk_termino: pkTermino.value,
          observacion_general: observacionGeneral.value,
          subdivision: subseleccionado,
          cerrado: dataToSave.cerrado,
          needsSync: true,

          items: [],
        };
        for (let item of parentItems.value) {
          for (let subitem of item.items) {
            for (let data of subitem.data) {
              datatoPushTable.items.push({
                pk: data.pk,
                collera: data.collera,
                observacion: data.observacion,
                subitem_id: subitem.id,
                item_id: item.id,
              });
            }
          }
        }
        console.log("paso a pushear a tabla");

        const storedChecklistData =
          getFromLocalStorage("checklist_datatabla") || [];
        storedChecklistData.push(datatoPushTable);
        saveToLocalStorage("checklist_datatabla", storedChecklistData);

        router.push({ name: "checklist-page" });
        return;
      }

      const dataToSend = {
        formulario: {
          nombre_supervisor: nombreSupervisor.value,
          fecha: fecha.value,
          subdivision: subdivision.value,
          pk_inicio: pkInicio.value,
          pk_termino: pkTermino.value,
          observacion_general: observacionGeneral.value,
          cerrado: dataToSave.cerrado,
          subdivision: subseleccionado
        },
        features: [],
      };

      for (let item of parentItems.value) {
        for (let subitem of item.items) {
          for (let data of subitem.data) {
            dataToSend.features.push({
              pk: data.pk,
              collera: data.collera,
              observacion: data.observacion,
              subitem_id: subitem.id,
              item_id: item.id,
            });
          }
        }
      }

      const response = await axios.post(apiURL + "formularios/", dataToSend);

      snackbar.value = true;
      snackbarMessage.value = "Datos cargados con éxito!";
      snackbarColor.value = "success";
      router.push({ name: "checklist-page" });
    } catch (err) {
      error.value = err.message;
      snackbar.value = true;
      snackbarMessage.value = err.message;
      snackbarColor.value = "error";
    }
  };

  const syncOfflineData = async () => {
    const offlineForms = getFromLocalStorage("formDataToSave");

    if (offlineForms && isConnected.value) {
      for (let dataToSave of offlineForms) {
        try {
          const response = await axios.post(
            apiURL + "formularios/",
            dataToSave
          );

          snackbar.value = true;
          snackbarMessage.value = "Datos sincronizados con éxito";
          snackbarColor.value = "success";
        } catch (err) {
          console.error("syncOfflineData: Error al sincronizar", err);
        }
      }
      // Una vez que hayamos intentado sincronizar todos los formularios, limpiamos el almacenamiento local.
      localStorage.removeItem("formDataToSave");
    } else {
      snackbar.value = true;
      snackbarMessage.value = "No hay datos para sincronizar";
      snackbarColor.value = "warning";
    }
  };

  // Sincronizar datos guardados offline cuando hay conexión
  // watch(isConnected, (newValue) => {
  //   if (newValue) syncOfflineData();
  // });

  onMounted(() => {
    fetchStructure();
    fetchSubdivisions();
  });

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
    snackbar,
    snackbarMessage,
    snackbarColor,
    isSavedOffline,
    syncOfflineData,
    manualSync,
    subdivisions,
  };
}
