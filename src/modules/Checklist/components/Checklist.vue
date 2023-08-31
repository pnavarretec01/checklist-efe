<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import useChecklist from '../composables/useChecklist'
import TabsComponent from './TabsComponent.vue'

const route = useRoute();
const id = ref(route.params.id);
const itemId = ref(route.params.id);


onMounted(() => {
  fetchFormDataById(id.value); // carga formulario de acuerdo a id que se le pasa por ruta
});

const nombreSupervisor = ref('');
const fecha = ref('');
const subdivision = ref('');
const pkInicio = ref(null);
const pkTermino = ref(null);
const observacionGeneral = ref('');



const {
  currentTab,
  parentItems,
  addCaracteristica,
  removeEntry,
  saveData,
  fetchFormDataById,
  updateData,
  snackbar,
  snackbarMessage,
  snackbarColor,
  cerrado
} = useChecklist(nombreSupervisor, fecha, subdivision, pkInicio, pkTermino, observacionGeneral, itemId);


</script>


<template>
  <VCard>
    <div class="d-flex justify-end align-start gap-3 mb-4 mt-4 me-5">
      <VBtn prepend-icon="tabler-arrow-left" color="error" :to="{ name: 'checklist-page' }">
        Volver
      </VBtn>
    </div>
    <div class="ma-sm-4">
      <div class="d-flex align-center mb-6">
        <h6 class="font-weight-bold text-xl ml-3 ml-sm-0">
          Checklist Revisión de Infraestructura Zona Norte
        </h6>

      </div>

      <div class="pa-5 flex-grow-1">
        <VRow>
          <VCol cols="12" md="6">
            <VTextField v-model="nombreSupervisor" rows="2" label="Nombre Supervisor" placeholder="Nombre Supervisor" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="fecha" type="date" label="Fecha" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="subdivision" rows="2" label="Subdivisión" placeholder="Subdivisión" />
          </VCol>
          <VCol cols="12" md="3" sm="4">
            <VTextField v-model="pkInicio" type="number" label="Pk Inicio" />
          </VCol>
          <VCol cols="12" md="3" sm="4">
            <VTextField v-model="pkTermino" type="number" label="Pk Término" />
          </VCol>
          <VCol cols="12">
            <VTextarea v-model="observacionGeneral" rows="3" label="Observación general"></VTextarea>
          </VCol>
        </VRow>
      </div>
    </div>
    <TabsComponent v-model:current-tab="currentTab" :parent-items="parentItems" @addCaracteristica="addCaracteristica"
      @removeEntry="removeEntry" />
    <div class="mt-2 mb-2">
      <hr>
      <VBtn v-if="!cerrado" class="ma-sm-1" color="primary" @click="updateData(0)">
        Editar
      </VBtn>

      <VBtn v-if="!cerrado" class="ma-sm-1" color="primary" @click="updateData(1)">
        Editar y Cerrar
      </VBtn>
    </div>
    <VSnackbar  v-model="snackbar" :color="snackbarColor" location="top end" :timeout="2000">
      {{ snackbarMessage }}
    </VSnackbar>
  </VCard>
</template>
