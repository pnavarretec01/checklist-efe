
<script setup>
import { VDataTable } from 'vuetify/labs/VDataTable'
import useChecklist from '../composables/useChecklist'
import useChecklistNuevo from '../composables/useChecklistNuevo'
import useExportData from '../composables/useExportData';
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const showDialog = ref(false);
const itemToDelete = ref({});

const handleDelete = (item) => {
  deleteData(item.value.pk_formulario_id);
  //fetchItems();
  showDialog.value = false;
};

const closeDialog = () => {
  showDialog.value = false;
};

const { exportData } = useExportData();

const {
  items,
  fetchItems,
  deleteData,
  snackbar: snackbar1,
  snackbarMessage: snackbarMessage1,
  snackbarColor: snackbarColor1,
} = useChecklist();

const {
  manualSync,
  snackbar: snackbar2,
  snackbarMessage: snackbarMessage2,
  snackbarColor: snackbarColor2,
} = useChecklistNuevo();

const sincronizar = () => {
  manualSync()
  fetchItems()
}

onMounted(() => {
  fetchItems()
  manualSync()
})

const headers = [
  { title: 'Supervisor', key: 'nombre_supervisor' },
  { title: 'Fecha', key: 'fecha' },
  { title: 'PK Inicio', key: 'pk_inicio' },
  { title: 'PK Termino', key: 'pk_termino' },
  { title: 'Sub División', key: 'subdivision' },
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
  const id = (item.value.pk_formulario_id || Math.floor(Math.random() * 9999))
  localStorage.setItem('formulario', JSON.stringify(item.value));
  router.push({ name: 'checklist-id', params: { id: id } });
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
    <div class="me-3 d-flex gap-3 mb-4 mt-1">
      <VBtn prepend-icon="mdi-sync" @click="sincronizar">
        Sincronizar
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
        <VBtn icon variant="text" size="small" color="medium-emphasis">
          <VIcon size="24" icon="tabler-dots-vertical" />
          <VMenu activator="parent">
            <VList>
              <VListItem @click="exportData(item.value, 'csv')">
                <template #prepend>
                  <VIcon icon="mdi-file-export" />
                </template>
                <VListItemTitle>CSV</VListItemTitle>
              </VListItem>
              <VListItem @click="exportData(item.value, 'xlsx')">
                <template #prepend>
                  <VIcon icon="mdi-file-export" />
                </template>
                <VListItemTitle>XLSX</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>
        </VBtn>
        <VIcon small @click="editItem(item)">mdi-pencil</VIcon>
        <VIcon small @click="prepareDeleteItem(item)">mdi-delete</VIcon>
        <VIcon v-if="item.value.needsSync" small class="me-2">mdi-sync</VIcon>
        <VIcon v-else small class="me-2">mdi-check</VIcon>
      </template>
      <template v-slot:item.subdivision="{ item }">
        {{ item.value.subdivision.nombre }}
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
    <VSnackbar v-model="snackbar2" :color="snackbarColor2" location="top end" :timeout="2000">
      {{ snackbarMessage2 }}
    </VSnackbar>
    <VSnackbar v-model="snackbar1" :color="snackbarColor1" location="top end" :timeout="2000">
      {{ snackbarMessage1 }}
    </VSnackbar>
  </div>
</template>
<style scoped>
.badge {
  border-radius: 12px;
  color: white;
  font-weight: bold;
  padding-block: 5px;
  padding-inline: 10px;
}

.badge-success {
  background-color: green;
}

.badge-warning {
  background-color: orange;
}
</style>

