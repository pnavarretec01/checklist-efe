import axios from "axios";
import { ref } from "vue";

const apiBaseURL = import.meta.env.VITE_API_URL;

export function useApis(snackbar, snackbarColor, snackbarMessage) {
  const data = ref([]);

  const fetchItems = async () => {
    try {
      const response = await axios.get(apiBaseURL + "subdivision");
      data.value = response.data.data;
      return response.data.data;
    } catch (err) {
      console.error("Error al obtener los items", err);
      snackbarMessage.value = "Error al obtener los items";
      snackbarColor.value = "error";
      snackbar.value = true;
    }
  };

  const createItem = async (item) => {
    try {
      const response = await axios.post(apiBaseURL + "subdivision", {
        nombre: item.nombre,
        pk_inicio: item.pk_inicio,
        pk_termino: item.pk_termino,
      });
      data.value.unshift(response.data.data);
      snackbarMessage.value = "Elemento creado con éxito";
      snackbarColor.value = "success";
      snackbar.value = true;
      return response.data.data;
    } catch (err) {
      snackbarMessage.value = err.response.data.message;
      snackbarColor.value = "error";
      snackbar.value = true;
      throw err;
    }
  };

  const editItem = async (item) => {
    try {
      const response = await axios.put(
        apiBaseURL + "subdivision/" + item.pk_subdivision_id,
        item
      );
      snackbarMessage.value = "Elemento editado con éxito";
      snackbarColor.value = "success";
      snackbar.value = true;
      return response.data.data;
    } catch (err) {
      snackbarMessage.value = err.response.data.message;
      snackbarColor.value = "error";
      snackbar.value = true;
      throw err;
    }
  };

  const deleteItemApi = async (id) => {
    try {
      await axios.delete(apiBaseURL + "subdivision/" + id);
      snackbarMessage.value = "Elemento eliminado con éxito";
      snackbarColor.value = "success";
      snackbar.value = true;
    } catch (err) {
      snackbarMessage.value = err.response.data.message;
      snackbarColor.value = "error";
      snackbar.value = true;
      throw err;
    }
  };

  return {
    fetchItems,
    data,
    createItem,
    editItem,
    deleteItemApi,
  };
}
