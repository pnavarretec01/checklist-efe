<script setup>
import { ref, onMounted, watchEffect, computed } from 'vue';
import ItemEditDialog from './ItemEditDialog.vue';
import SubItemEditDialog from './SubItemEditDialog.vue';
import ItemDeleteDialog from './ItemDeleteDialog.vue';
import SubItemDeleteDialog from './SubItemDeleteDialog.vue';
import { useItemsApi } from '../composables/useItem';
import { VDataTable } from 'vuetify/labs/VDataTable'

const { items, subitems, error, fetchItems, fetchSubitemsForItem, createItem, apiCreateSubitem,
  updateItem, apiUpdateSubitem, apiDeleteItem, apiDeleteSubitem } = useItemsApi();


/** funcionalidades tabla */
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
const search = ref('');
/** fin funcionalidades tabla */


onMounted(refreshItems);

const editedItem = ref({
  nombre: '',
  orden: '',
  subitems: []
});
const loading = ref(false);
const editDialog = ref(false);
const editSubItemDialog = ref(false);
const deleteDialog = ref(false);
const deleteDialogSubItem = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("");
const deletedSubItem = ref([]);


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

/**
 * subitem
 */
async function abrirSubitem(item) {
  editedItem.value = { ...item.value };
  editSubItemDialog.value = true;
}
function closeSubItem() {
  editSubItemDialog.value = false;
  editedItem.value = {};
}

const addSubitem = (subitem) => {
  editedItem.value.subitems.unshift(subitem);
};

async function saveSubItem(payload) {
  try {
    let responseData;
    const itemId = payload.itemId;
    const subitem = payload.subitem;

    if (subitem.pk_subitem_id) {
      responseData = await apiUpdateSubitem(itemId, subitem.pk_subitem_id, subitem);
      if (responseData.code < 200 || responseData.code >= 300) {
        throw new Error(responseData.status || "Error al actualizar el subítem");
      }
      snackbarMessage.value = "SubItem actualizado con éxito";

      // encuentra y reemplaza el subitem en la lista en lugar de agregar uno nuevo
      const index = editedItem.value.subitems.findIndex(s => s.pk_subitem_id === subitem.pk_subitem_id);
      if (index !== -1) {
        editedItem.value.subitems[index] = subitem;
      }
    } else {
      responseData = await apiCreateSubitem(itemId, subitem);
      if (responseData.code < 200 || responseData.code >= 300) {
        throw new Error(responseData.status || "Error al crear el subítem");
      }
      snackbarMessage.value = "SubItem creado con éxito";

      // solo añade el subitem si es uno nuevo
      addSubitem(subitem);
    }

    snackbarColor.value = "success";
    await refreshItems();
  } catch (error) {
    snackbarMessage.value = error.response.data.message;
    snackbarColor.value = "error";
    snackbar.value = true;
  } finally {
    snackbar.value = true;
  }
}

async function confirmDeleteSubitem(subitem) {
  const index = editedItem.value.subitems.indexOf(subitem);
  if (index !== -1) {
    try {
      if (subitem.pk_subitem_id) {
        const response = await apiDeleteSubitem(editedItem.value.pk_item_id, subitem.pk_subitem_id);
        if (response.code < 200 || response.code >= 300) {
          throw new Error(response.status || "Error al eliminar el subítem");
        }
        snackbarMessage.value = "SubItem eliminado con éxito";
        snackbarColor.value = "success";
      }
      editedItem.value.subitems.splice(index, 1);
    } catch (error) {
      snackbarMessage.value = error.response.data.message;
      snackbarColor.value = "error";
      snackbar.value = true;
    } finally {
      snackbar.value = true;
    }
    closeDeleteSubItem();
  }
}

function deleteSubitem(item) {
  deletedSubItem.value = item
  deleteDialogSubItem.value = true;
}

function closeDeleteSubItem() {
  deleteDialogSubItem.value = false;
  deletedSubItem.value = {};
}

/**
 * fin subitem
 */

/**
* item
*/
function prepareDeleteItem(item) {
  editedItem.value = { ...item.value };
  deleteDialog.value = true;
}

async function confirmDelete() {
  try {
    const response = await apiDeleteItem(editedItem.value.pk_item_id);
    if (response.code < 200 || response.code >= 300) {
      throw new Error(response.status || "Error al eliminar el ítem");
    }

    snackbarMessage.value = "Ítem eliminado con éxito";
    snackbarColor.value = "success";
    await refreshItems();
  } catch (error) {
    snackbarMessage.value = error.response.data.message;
    snackbarColor.value = "error";
    snackbar.value = true;
  } finally {
    snackbar.value = true;
  }
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
      responseData = await updateItem(editedItem.value);
      if (responseData.code < 200 || responseData.code >= 300) {
        throw new Error(responseData.status || "Error al actualizar el ítem");
      }
      snackbarMessage.value = "Ítem actualizado con éxito";
    } else {
      responseData = await createItem(editedItem.value);
      if (responseData.code < 200 || responseData.code >= 300) {
        throw new Error(responseData.status || "Error al crear el ítem");
      }
      snackbarMessage.value = "Ítem creado con éxito";
    }

    snackbarColor.value = "success";
    close();
    await refreshItems();
  } catch (error) {
    snackbarMessage.value = error.response.data.message;
    snackbarColor.value = "error";
    snackbar.value = true;
  } finally {
    snackbar.value = true;
  }
}


function close() {
  editDialog.value = false;
  editedItem.value = {};
}
/**
* item
*/

async function handleApiResponse(promise) {
  try {
    const response = await promise;
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Error en la operación");
    }
  } catch (error) {
    console.log(error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Error en la operación");
    }
    throw error;
  }
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
      @deleteSubitem="deleteSubitem" @saveSubItem="saveSubItem" />
    <ItemEditDialog :item="editedItem" :dialog="editDialog" @close="close" @save="saveItem" />
    <ItemDeleteDialog :item="editedItem" :dialog="deleteDialog" @closeDelete="closeDelete"
      @confirmDelete="confirmDelete" />
    <SubItemDeleteDialog :item="deletedSubItem" :dialog="deleteDialogSubItem" @closeDelete="closeDeleteSubItem"
      @confirmDelete="confirmDeleteSubitem" />

  </div>
  <VSnackbar v-model="snackbar" :color="snackbarColor" location="top end" :timeout="2000">
    {{ snackbarMessage }}
  </VSnackbar>
</template>
