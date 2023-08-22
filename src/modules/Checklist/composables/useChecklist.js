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

  const saveData = (cerrado) => {
    const dataToSave = {
      parentItems: parentItems.value,
      cerrado: cerrado,
    };

    console.log(dataToSave);
  };

  return {
    items,
    fetchItems,
    currentTab,
    parentItems,
    addCaracteristica,
    removeEntry,
    saveData,
  };
}
