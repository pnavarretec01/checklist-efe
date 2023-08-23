import { ref } from 'vue';

export function useItemLogic(handleApiResponse) {
  const editedItem = ref({
    nombre: '',
    orden: '',
    subitems: []
  });

  async function editItem(item) {
    editedItem.value = { ...item };
  }

  function createNewItem() {
    editedItem.value = {
      nombre: '',
      orden: ''
    };
  }

  return {
    editedItem,
    editItem,
    createNewItem,
  }
}
