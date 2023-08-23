import { ref } from 'vue';

export function useSubitemLogic(handleApiResponse) {
  const editedItem = ref({
    nombre: '',
    orden: '',
    subitems: []
  });

  function addSubitem() {
    editedItem.value.subitems.push({});
  }

  function deleteSubitem(subitem) {
    const index = editedItem.value.subitems.indexOf(subitem);
    if (index !== -1) {
      editedItem.value.subitems.splice(index, 1);
      if (subitem.pk_subitem_id) {
        apiDeleteSubitem(editedItem.value.pk_item_id, subitem.pk_subitem_id);
      }
    }
  }

  return {
    editedItem,
    addSubitem,
    deleteSubitem,
  }
}
