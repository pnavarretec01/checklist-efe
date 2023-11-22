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
  const loading = ref(false);

  const updateConnectionStatus = () => {
    isConnected.value = navigator.onLine;
    if (isConnected.value) {
      syncOfflineData();
      snackbar.value = true;
      snackbarMessage.value = "Conexión a Internet Restaurada";
      snackbarColor.value = "success";
    } else {
      snackbar.value = true;
      snackbarMessage.value = "Sin Conexión a Internet";
      snackbarColor.value = "warning";
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
        }
      }
    } catch (err) {
      const cachedData = getFromLocalStorage("checklistData"); // obtengo los datos desde LocalStorage en caso de error
      if (cachedData) {
        parentItems.value = cachedData;
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
    // Validaciones

    if (!subseleccionado.value || subseleccionado.value.length === 0) {
      snackbarMessage.value = "Por favor, seleccione una subdivisión.";
      snackbar.value = true;
      return false;
    }

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

    // Continuar con la lógica de guardado si todas las validaciones pasan

    loading.value = true;
    const dataToSave = {
      parentItems: parentItems.value,
      cerrado: cerrado,
    };

    await sendCaracteristicas(dataToSave);
  };

  const sendCaracteristicas = async (dataToSave) => {
    try {
      if (!isConnected.value) {
        const id = localStorage.getItem("formularioID");
        const idFake = Math.floor(Math.random() * 9999) + "a";

        const dataToSaveLocal = {
          formulario: {
            pk_formulario_id: idFake,
            nombre_supervisor: nombreSupervisor.value,
            fecha: fecha.value,
            pk_inicio: pkInicio.value,
            pk_termino: pkTermino.value,
            observacion_general: observacionGeneral.value,
            cerrado: dataToSave.cerrado,
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
          pk_formulario_id: idFake,
          nombre_supervisor: nombreSupervisor.value,
          fecha: fecha.value,
          pk_inicio: pkInicio.value,
          pk_termino: pkTermino.value,
          observacion_general: observacionGeneral.value,
          subdivision: subseleccionado.value,
          cerrado: dataToSave.cerrado,
          needsSync: true,
          items: parentItems.value.map((item) => {
            return {
              pk_item_id: item.id,
              nombre: item.nombre,
              subitems: item.items.map((subitem) => {
                return {
                  pk_subitem_id: subitem.id,
                  nombre: subitem.nombre,
                  fk_item_id: subitem.fk_item_id,
                  data: subitem.data.map((data) => {
                    return {
                      item_id: item.id,
                      subitem_id: subitem.id,
                      pk: data.pk,
                      collera: data.collera,
                      observacion: data.observacion,
                    };
                  }),
                };
              }),
            };
          }),
        };
        const storedChecklistData =
          getFromLocalStorage("checklist_datatabla") || [];
        storedChecklistData.unshift(datatoPushTable);
        saveToLocalStorage("checklist_datatabla", storedChecklistData);

        router.push({ name: "checklist-page" });

        return;
      }

      const dataToSend = {
        formulario: {
          nombre_supervisor: nombreSupervisor.value,
          fecha: fecha.value,
          pk_inicio: pkInicio.value,
          pk_termino: pkTermino.value,
          observacion_general: observacionGeneral.value,
          cerrado: dataToSave.cerrado,
          subdivision: subseleccionado.value.pk_subdivision_id,
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
              fk_subitem_id: subitem.id,
              fk_item_id: item.id,
              nombreItem: item.nombre,
              nombreSubitem: subitem.nombre,
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
      snackbarMessage.value = err.response.data.message;
      snackbarColor.value = "error";
      snackbar.value = true;
      return;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const syncOfflineData = async () => {
    const offlineForms = getFromLocalStorage("formDataToSave") || [];
    let failedSyncForms = [];
    loading.value = true; // Mostrar la alerta de carga

    if (offlineForms && isConnected.value) {
      for (let dataToSave of offlineForms) {
        try {
          await axios.post(apiURL + "formularios/", dataToSave);
          snackbar.value = true;
          snackbarMessage.value = "Datos sincronizados con éxito";
          snackbarColor.value = "success";
        } catch (err) {
          console.error("syncOfflineData: Error al sincronizar", err);
          failedSyncForms.push(dataToSave); // Agregar a la lista de formularios que fallaron
        }
      }

      if (failedSyncForms.length > 0) {
        // Si hay formularios que fallaron, actualiza localStorage con ellos
        saveToLocalStorage("formDataToSave", failedSyncForms);
      } else {
        // Si todos se sincronizaron con éxito, limpia el localStorage
        localStorage.removeItem("formDataToSave");
      }

      fetchItems(); // Actualizar lista de items
    } else {
      snackbar.value = true;
      snackbarMessage.value = "No hay datos para sincronizar";
      snackbarColor.value = "warning";
    }

    loading.value = false; // Ocultar la alerta de carga
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
    loading,
  };
}
