import axios from "axios";
import { ref } from "vue";

const apiURL = "http://localhost:3000/api/v1/items";

export function useItemsApi() {
  const items = ref([]);
  const error = ref(null);

  const fetchItems = async () => {
    try {
      const response = await axios.get(apiURL);
      items.value = response.data.data;
      return response.data.data;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching items:", err);
    }
  };

  const createItem = async (item) => {
    try {
      const response = await axios.post(apiURL, {
        nombre: item.nombre,
        orden: item.orden,
      });
      items.value.push(response.data.data);
    } catch (err) {
      error.value = err.message;
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
        items.value[index] = response.data.data;
      }
    } catch (err) {
      error.value = err.message;
    }
  };

  const apiDeleteItem = async (itemId) => {
    try {
      await axios.delete(`${apiURL}/${itemId}`);
      const index = items.value.findIndex((i) => i.pk_item_id === itemId);
      if (index !== -1) {
        items.value.splice(index, 1);
      }
    } catch (err) {
      error.value = err.message;
    }
  };

  return {
    items,
    error,
    fetchItems,
    createItem,
    updateItem,
    apiDeleteItem,
  };
}
