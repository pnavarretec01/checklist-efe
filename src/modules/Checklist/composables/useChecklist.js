import axios from "axios";
import { ref } from "vue";

const apiURL = "http://localhost:3000/api/v1/";

export default function useChecklist() {
  const currentTab = ref(0);
  const items = ref([]);
  const error = ref(null);

  const parentItems = ref([
    {
      id: 1,
      title: "Inspección de Vía",
      items: [
        {
          id: 1,
          title: "Eclisas quebradas",
          data: [],
        },
        {
          id: 2,
          title: "Rieles quebrados",
          data: [],
        },
        {
          id: 3,
          title: "Durmientes en malas condiciones",
          data: [],
        },
      ],
    },
    {
      id: 2,
      title: "Aparatos de cambio de vía",
      items: [
        {
          id: 4,
          title: "Falta de lubricación",
          data: [],
        },
        {
          id: 5,
          title: "Tirantes doblados",
          data: [],
        },
        {
          id: 6,
          title: "Agujas y/o cruzamientos quebrados",
          data: [],
        },
      ],
    },
    {
      id: 3,
      title: "Inspección de Vía",
      items: [
        {
          id: 1,
          title: "Eclisas quebradas",
          data: [],
        },
        {
          id: 2,
          title: "Rieles quebrados",
          data: [],
        },
        {
          id: 3,
          title: "Durmientes en malas condiciones",
          data: [],
        },
      ],
    },
    {
      id: 4,
      title: "Aparatos de cambio de vía",
      items: [
        {
          id: 4,
          title: "Falta de lubricación",
          data: [],
        },
        {
          id: 5,
          title: "Tirantes doblados",
          data: [],
        },
        {
          id: 6,
          title: "Agujas y/o cruzamientos quebrados",
          data: [],
        },
      ],
    },
  ]);

  const mapStructure = (apiData) => {
    return apiData.map((item) => ({
      id: item.pk_item_id,
      title: item.nombre,
      items: item.subitems.map((subitem) => ({
        id: subitem.pk_subitem_id,
        title: subitem.nombre,
        data: [], // inicializamos con un array vacío para las entradas
      })),
    }));
  };
  const fetchStructure = async () => {
    try {
      const response = await axios.get(apiURL + "items");
      if (response.data.success) {
        parentItems.value = mapStructure(response.data.data);
      } else {
        console.error("Error: API responded with success: false");
      }
    } catch (err) {
      error.value = err.message;
      console.error("Error al obtener la estructura:", err);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(apiURL + "formularios");
      items.value = response.data;
      console.log(response);
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

  const saveData = (cerrado) => {
    const dataToSave = {
      parentItems: parentItems.value,
      cerrado: cerrado,
    };

    console.log(dataToSave);
  };

  const sendCaracteristicas = async () => {
    try {
      const dataToSend = [];
      for (let item of parentItems.value) {
        for (let subitem of item.items) {
          for (let data of subitem.data) {
            dataToSend.push({
              pk: data.pk,
              collera: data.collera,
              observacion: data.observacion,
              // Suponiendo que necesitas enviar también el id del subitem y del formulario:
              subitem_id: subitem.id,
              // formulario_id: ...
            });
          }
        }
      }

      const response = await axios.post(apiURL + "add-multiple-features", {
        features: dataToSend,
      });

      console.log(response.data);
    } catch (err) {
      error.value = err.message;
      console.error("Error al enviar las características:", err);
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
  };
}
