import { computed, onMounted, ref } from "vue";
import { useItemsApi } from "../composables/useItem";

export function useTableLogic() {
  const {
    items,
    fetchItems,
    createItem,
    updateItem,
    apiDeleteItem,
    apiUpdateSubitem,
    apiCreateSubitem,
    apiDeleteSubitem,
  } = useItemsApi();

  // Variables para la tabla
  const headers = [
    { title: "ID", key: "pk_item_id" },
    { title: "Nombre", key: "nombre" },
    { title: "Orden", key: "orden" },
    { title: "Acciones", key: "actions" },
  ];

  const options = ref({
    page: 1,
    itemsPerPage: 5,
    sortBy: [""],
    sortDesc: [false],
  });

  const totalPages = computed(() =>
    Math.ceil(items.value.length / options.value.itemsPerPage)
  );

  const computedItems = computed(() => {
    // ... (código para calcular items basado en tus requerimientos)
  });

  const search = ref("");

  // Funcionalidades para subitems
  const subitems = ref([]);
  const fetchSubitems = async (itemId) => {
    // ... (lógica para obtener subitems)
  };

  // Funcionalidades para los diálogos
  const showDialog = ref(false);
  const showDeleteDialog = ref(false);
  const showSubitemDialog = ref(false);
  const showDeleteSubitemDialog = ref(false);

  const selectedItemId = ref(null);
  const selectedSubitemId = ref(null);

  const editItem = (itemId) => {
    selectedItemId.value = itemId;
    showDialog.value = true;
  };

  const deleteItemDialog = (itemId) => {
    selectedItemId.value = itemId;
    showDeleteDialog.value = true;
  };

  const editSubitem = (subitemId) => {
    selectedSubitemId.value = subitemId;
    showSubitemDialog.value = true;
  };

  const deleteSubitemDialog = (subitemId) => {
    selectedSubitemId.value = subitemId;
    showDeleteSubitemDialog.value = true;
  };

  // Funcionalidad de búsqueda
  const searchItems = (query) => {
    // ... (lógica de búsqueda de items)
  };

  // Si deseas realizar alguna lógica cuando el componente se monta, puedes hacerlo con onMounted.
  onMounted(() => {
    fetchItems();
  });

  return {
    // Para la tabla
    headers,
    options,
    totalPages,
    computedItems,
    search,

    // Para subitems
    subitems,
    fetchSubitems,

    // Para los diálogos
    showDialog,
    showDeleteDialog,
    showSubitemDialog,
    showDeleteSubitemDialog,
    selectedItemId,
    selectedSubitemId,
    editItem,
    deleteItemDialog,
    editSubitem,
    deleteSubitemDialog,

    // Para la API y CRUD
    items,
    fetchItems,
    createItem,
    updateItem,
    apiDeleteItem,
    apiUpdateSubitem,
    apiCreateSubitem,
    apiDeleteSubitem,

    // Y cualquier otro estado o función que necesites.
  };
}
