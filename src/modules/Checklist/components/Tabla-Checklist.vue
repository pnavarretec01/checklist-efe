
<script setup>
import { VDataTable } from 'vuetify/labs/VDataTable'
import useChecklist from '../composables/useChecklist'
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const showDialog = ref(false);
const itemToDelete = ref({});

const handleDelete = (item) => {
  deleteData(item.value.pk_formulario_id);
  fetchItems();
  showDialog.value = false;
};

const closeDialog = () => {
  showDialog.value = false;
};


const {
  items,
  fetchItems,
  deleteData,
  snackbar,
  snackbarMessage,
  snackbarColor
} = useChecklist();

onMounted(fetchItems);

const headers = [
  { title: 'Supervisor', key: 'nombre_supervisor' },
  { title: 'Fecha', key: 'fecha' },
  { title: 'PK Inicio', key: 'pk_inicio' },
  { title: 'PK Termino', key: 'pk_termino' },
  { title: 'Observación', key: 'observacion_general' },
  { title: 'Estado', key: 'cerrado' },
  { title: 'Acciones', key: 'actions' },
];

const options = ref({
  page: 1,
  itemsPerPage: 5,
  sortBy: [''],
  sortDesc: [false],
});

const totalPages = computed(() => Math.ceil(items.value.length / options.value.itemsPerPage));
const computedItems = computed(() => {
  const start = (options.value.page - 1) * options.value.itemsPerPage;
  const end = start + options.value.itemsPerPage;
  return items.value.slice(start, end);
});


const search = ref('');
const loading = ref(false);


watch(options, newVal => {
  if (newVal.itemsPerPage <= 0) {
    options.value.itemsPerPage = 1
  }
});

const editItem = (item) => {
  router.push({ name: 'checklist-id', params: { id: item.value.pk_formulario_id } });
}

const prepareDeleteItem = (item) => {
  itemToDelete.value = item;
  showDialog.value = true;
};
const isClosed = (value) => {
  return value === true || value === 1;
};

</script>

<template>
  <div>
    <div class="me-3 d-flex gap-3 mb-4 mt-1">
      <VBtn prepend-icon="tabler-plus" :to="{ name: 'checklist' }">
        Crear Nuevo Checklist
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
        <!-- <VIcon small @click="abrirSubitem(item)">mdi-plus-box-multiple</VIcon> -->
        <VIcon small @click="editItem(item)">mdi-pencil</VIcon>
        <VIcon small @click="prepareDeleteItem(item)">mdi-delete</VIcon>
      </template>
      <template v-slot:item.cerrado="{ item }">
        <span :class="['badge', isClosed(item.value.cerrado) ? 'badge-success' : 'badge-warning']">
          {{ isClosed(item.value.cerrado) ? 'Cerrado' : 'Abierto' }}
        </span>
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

    <DeleteConfirmationDialog v-if="itemToDelete" :dialog="showDialog" :item="itemToDelete" @closeDelete="closeDialog"
      @confirmDelete="handleDelete" />
    <VSnackbar v-model="snackbar" :color="snackbarColor" location="top end" :timeout="2000">
      {{ snackbarMessage }}
    </VSnackbar>
  </div>
</template>
<style scoped>
.badge {
  padding: 5px 10px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
}

.badge-success {
  background-color: green;
}

.badge-warning {
  background-color: orange;
}
</style>

