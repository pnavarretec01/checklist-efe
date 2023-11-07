import axios from "axios";
import { ref } from "vue";

const apiBaseURL = import.meta.env.VITE_API_URL
const apiURL = `${apiBaseURL}items`;
const apiURLSubItems = `${apiBaseURL}subitems`;

export function useItemsApi() {
  const items = ref([]);
  const subitems = ref([]);
  const error = ref(null);

  const fetchItems = async () => {
    try {
      const response = await axios.get(apiURL);
      items.value = response.data.data;
      return response.data.data;
    } catch (err) {
      error.value = err.message;
      console.error("Error al obtener los items", err);
    }
  };

  const createItem = async (item) => {
    try {
      const response = await axios.post(apiURL, {
        nombre: item.nombre,
        orden: item.orden,
      });
      items.value.unshift(response.data.data);
      return response.data.data;
    } catch (err) {
      throw err;
    }
  };

  const updateItem = async (item) => {
    try {
      const response = await axios.put(`${apiURL}/${item.pk_item_id}`, {
        nombre: item.nombre,
        orden: item.orden,
      });
      const index = items.value.findIndex(
        (i) => i.pk_item_id === item.pk_item_id
      );
      if (index !== -1) {
        items.value[index] = response.data;
      }
      return response;
    } catch (err) {
      throw err;
    }
  };

  const apiDeleteItem = async (itemId) => {
    try {
      const response = await axios.delete(`${apiURL}/${itemId}`);
      const index = items.value.findIndex((i) => i.pk_item_id === itemId);
      if (index !== -1) {
        items.value.splice(index, 1);
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
    }
  };

  /**
   *
   * parte subitems
   */
  const fetchSubitemsForItem = async (itemId) => {
    try {
      const response = await axios.get(`${apiURLSubItems}/${itemId}/subitems`);
      subitems.value = response.data.data;
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error(`Error al obtener subitems`, err);
    }
  };

  const apiCreateSubitem = async (itemId, subitemData) => {
    try {
      const response = await axios.post(
        `${apiURLSubItems}/${itemId}`,
        subitemData
      );
      return response;
    } catch (err) {
      throw err;
    }
  };


  async function apiUpdateSubitem(itemId, subitemId, subitemData) {
    try {
      const response = await axios.put(
        `${apiURLSubItems}/${itemId}/subitems/${subitemId}`,
        subitemData
      );
      return response;
    } catch (error) {
      throw error; 
    }
  }

  const apiDeleteSubitem = async (itemId, subitemId) => {
    try {
      const response = await axios.delete(`${apiURLSubItems}/${subitemId}`);
      return response.data;
    } catch (err) {
      error.value = err.message;
    }
  };

  return {
    items,
    subitems,
    error,
    fetchItems,
    fetchSubitemsForItem,
    createItem,
    apiCreateSubitem,
    updateItem,
    apiUpdateSubitem,
    apiDeleteItem,
    apiDeleteSubitem,
  };
}
