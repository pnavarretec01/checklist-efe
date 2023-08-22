<script setup>
import { ref, onMounted, watchEffect, computed } from 'vue';
import ItemEditDialog from './ItemEditDialog.vue';
import SubItemEditDialog from './SubItemEditDialog.vue';
import ItemDeleteDialog from './ItemDeleteDialog.vue';
import { useItemsApi } from '../composables/useItem';
import { VDataTable } from 'vuetify/labs/VDataTable'

const { items, subitems, error, fetchItems, fetchSubitemsForItem, createItem, apiCreateSubitem,
  updateItem, apiUpdateSubitem, apiDeleteItem, apiDeleteSubitem } = useItemsApi();



const headers = [
  { title: 'ID', key: 'pk_item_id' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Orden', key: 'orden' },
  { title: 'Acciones', key: 'actions' },
];
const options = ref({
  page: 1,
  itemsPerPage: 5,
  sortBy: [''],
  sortDesc: [false],
})
const totalPages = computed(() => Math.ceil(items.value.length / options.value.itemsPerPage));
const computedItems = computed(() => {
  const start = (options.value.page - 1) * options.value.itemsPerPage;
  const end = start + options.value.itemsPerPage;
  return items.value.slice(start, end);
});

const editedItem = ref({
  nombre: '',
  orden: '',
  subitems: []
});
const search = ref('');
const loading = ref(false);
const editDialog = ref(false);
const editSubItemDialog = ref(false);
const deleteDialog = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("");

onMounted(refreshItems);

async function refreshItems() {
  loading.value = true;
  try {
    await fetchItems();
  } catch {
    snackbarMessage.value = "Error al cargar los ítems";
    snackbarColor.value = "error";
    snackbar.value = true;
  }
  loading.value = false;
}

function prepareDeleteItem(item) {
  editedItem.value = { ...item.value };
  deleteDialog.value = true;
}

async function confirmDelete() {
  try {
    await handleApiResponse(apiDeleteItem(editedItem.value.pk_item_id));
    snackbarMessage.value = "Ítem eliminado con éxito";
    snackbarColor.value = "success";
    await refreshItems();
  } catch (error) {
    snackbarMessage.value = error.message || "Error al eliminar el ítem";
    snackbarColor.value = "error";
  }
  snackbar.value = true;
  closeDelete();
}

function closeDelete() {
  deleteDialog.value = false;
  editedItem.value = {};
}

async function editItem(item) {
  editedItem.value = { ...item.value };
  editDialog.value = true;
}

async function abrirSubitem(item) {
  editedItem.value = { ...item.value };
  editSubItemDialog.value = true;
}
function closeSubItem() {
  editSubItemDialog.value = false;
  editedItem.value = {};
}

const addSubitem = () => {
  editedItem.value.subitems.push({});
};

async function saveSubItem(payload) {
  try {
    let responseData;
    const { itemId, subitem } = payload;

    if (subitem.pk_subitem_id) {
      responseData = await handleApiResponse(apiUpdateSubitem(itemId, subitem.pk_subitem_id, subitem));
      snackbarMessage.value = "SubItem actualizado con éxito";
    } else {
      responseData = await handleApiResponse(apiCreateSubitem(itemId, subitem));
      snackbarMessage.value = "SubItem creado con éxito";
    }

    snackbarColor.value = "success";
    await refreshItems();
  } catch (error) {
    snackbarMessage.value = error.message || "Error al guardar el subitem";
    snackbarColor.value = "error";
  }
  snackbar.value = true;
}

const deleteSubitem = (subitem) => {
  const index = editedItem.value.subitems.indexOf(subitem);
  if (index !== -1) {
    editedItem.value.subitems.splice(index, 1);
    if (subitem.pk_subitem_id) {
      apiDeleteSubitem(editedItem.value.pk_item_id, subitem.pk_subitem_id);
    }
  }
};

function createNewItem() {
  editedItem.value = {
    nombre: '',
    orden: ''
  };
  editDialog.value = true;
}

async function saveItem() {
  try {
    let responseData;
    if (editedItem.value.pk_item_id) {
      responseData = await handleApiResponse(updateItem(editedItem.value));
      snackbarMessage.value = "Ítem actualizado con éxito";
      close();
    } else {
      responseData = await handleApiResponse(createItem(editedItem.value));
      snackbarMessage.value = "Ítem creado con éxito";
      close();
    }

    snackbarColor.value = "success";
    await refreshItems();
  } catch (error) {
    // snackbarMessage.value = "Error al guardar el ítem";
    snackbarMessage.value = error.message || "Error al guardar el ítem";
    snackbarColor.value = "error";
  }
  snackbar.value = true;

}

function close() {
  editDialog.value = false;
  editedItem.value = {};
}

function handleApiResponse(response) {
  if (response.status >= 200 && response.status < 300) {
    snackbarMessage.value = "Operación exitosa";
    snackbarColor.value = "success";
  } else {
    snackbarMessage.value = "Error en la operación";
    snackbarColor.value = "error";
  }
  snackbar.value = true;
}
</script>
<template>
  <div>
    <div class="me-3 d-flex gap-3 mb-4 mt-1">
      <VBtn prepend-icon="tabler-plus" @click="createNewItem">
        Crear Nuevo Item
      </VBtn>
    </div>
    <VRow>
      <VCol cols="12" offset-md="8" md="4">
        <AppTextField v-model="search" density="compact" placeholder="Buscar" append-inner-icon="tabler-search"
          single-line hide-details dense outlined />
      </VCol>
    </VRow>

    <VDataTable :headers="headers" :items="items" :loading="loading" :items-per-page="options.itemsPerPage"
      :page="options.page" :search="search" @update:options="options = $event">
      <template v-slot:item.actions="{ item }">
        <VIcon small @click="abrirSubitem(item)">mdi-plus-box-multiple</VIcon>
        <VIcon small @click="editItem(item)">mdi-pencil</VIcon>
        <VIcon small @click="prepareDeleteItem(item)">mdi-delete</VIcon>
      </template>
      <template v-slot:no-data>
        No hay datos disponibles.
      </template>
      <template #bottom>
        <VCardText class="pt-2">
          <VRow>
            <VCol lg="2" cols="3">
              <VTextField v-model="options.itemsPerPage" label="Items por página:" type="number" min="1" max="15"
                hide-details variant="underlined" />
            </VCol>
            <VCol lg="10" cols="9" class="d-flex justify-end">
              <VPagination v-model="options.page" total-visible="5"
                :length="Math.ceil(items.length / options.itemsPerPage)" />
            </VCol>
          </VRow>
        </VCardText>
      </template>
    </VDataTable>

    <SubItemEditDialog :item="editedItem" :dialog="editSubItemDialog" @closeSubItem="closeSubItem"
      @deleteSubitem="deleteSubitem" @saveSubitem="saveSubItem" />
    <ItemEditDialog :item="editedItem" :dialog="editDialog" @close="close" @save="saveItem" />
    <ItemDeleteDialog :item="editedItem" :dialog="deleteDialog" @closeDelete="closeDelete"
      @confirmDelete="confirmDelete" />

  </div>
  <VSnackbar v-model="snackbar" :color="snackbarColor" location="top end" :timeout="2000">
    {{ snackbarMessage }}
  </VSnackbar>
</template>
