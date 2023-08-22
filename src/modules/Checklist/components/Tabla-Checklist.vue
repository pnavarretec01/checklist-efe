
<script setup>
import { VDataTable } from 'vuetify/labs/VDataTable'
import useChecklist from '../composables/useChecklist'

const { items,
  fetchItems,
} = useChecklist();

onMounted(fetchItems);

const headers = [
  { title: 'Supervisor', key: 'nombre_supervisor' },
  { title: 'Fecha', key: 'fecha' },
  { title: 'PK Inicio', key: 'pk_inicio' },
  { title: 'PK Termino', key: 'pk_termino' },
  { title: 'Observación', key: 'observacion_general' },
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
  </div>
</template>
