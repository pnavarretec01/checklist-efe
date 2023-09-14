import axios from "axios";
import { ref } from "vue";

const apiBaseURL = import.meta.env.VITE_API_URL;

export function useApis() {
  const data = ref([
    {
      id: 1,
      nombre: "Norte",
      pk_inicio: 5,
      pk_termino: 15,
    },
    {
      id: 2,
      nombre: "Sur",
      pk_inicio: 5,
      pk_termino: 15,
    },
    {
      id: 3,
      nombre: "Este",
      pk_inicio: 5,
      pk_termino: 15,
    },
    {
      id: 4,
      nombre: "Oeste",
      pk_inicio: 5,
      pk_termino: 15,
    },
  ]);

  const fetchItems = async () => {
    try {
      const response = await axios.get(apiBaseURL + "subdivision");
      data.value = response.data.data;
      return response.data.data;
    } catch (err) {
      error.value = err.message;
      console.error("Error al obtener los items", err);
    }
  };

  const createItem = async (item) => {
    console.log(item);
    try {
      const response = await axios.post(apiBaseURL + 'subdivision', {
        nombre: item.nombre,
        pk_inicio: item.pk_inicio,
        pk_termino: item.pk_termino,
      });
      console.log(response);
      data.value.unshift(response.data.data);
      return response.data.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    fetchItems,
    data,
    createItem
  };
}
