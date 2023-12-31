<script setup>

const apiUrl = import.meta.env.VITE_API_URL;
import useChecklist from '../composables/useChecklistNuevo'
import TabsComponent from './TabsComponent.vue'
import logoEfe from '../../../assets/images/logo-efe.svg'
import { watch } from 'vue';

const nombreSupervisor = ref('Patricio Navarrete');
const fecha = ref(formatDateTime(new Date()));
const subdivision = ref('');
const pkInicio = ref(null);
const pkTermino = ref(null);
const observacionGeneral = ref('');
const subseleccionado = ref([]);

function formatDateTime(date) {
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
}

watch(subseleccionado, (nuevoValor, oldName) => {
  pkInicio.value = nuevoValor.pk_inicio
  pkTermino.value = nuevoValor.pk_termino
});

const {
  currentTab,
  parentItems,
  addCaracteristica,
  removeEntry,
  saveData,
  sendCaracteristicas,
  snackbar,
  snackbarMessage,
  snackbarColor,
  subdivisions
} = useChecklist(nombreSupervisor, fecha, subdivision, pkInicio, pkTermino, observacionGeneral, subseleccionado);
</script>


<template>
  <div class="d-flex justify-end align-start gap-3 mb-4 mt-4 me-5">
    <VBtn prepend-icon="tabler-arrow-left" color="error" :to="{ name: 'checklist-page' }">
      Volver
    </VBtn>
  </div>
  <div class="ma-sm-4">
    <div class="d-flex align-center mb-6">
      <img :src="logoEfe" alt="logo" style="width: 12vw; max-width: 100px; min-width: 60px;">
      <h6 class="font-weight-bold text-xl ml-3 ml-sm-0">
        Checklist Revisión de Infraestructura Zona Norte
      </h6>
    </div>
    <div class="pt-5 pb-5 flex-grow-1">
      <VRow>
        <VCol cols="12" md="6">
          <VTextField v-model="nombreSupervisor" rows="2" label="Nombre Supervisor" placeholder="Nombre Supervisor" />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField v-model="fecha" type="datetime-local" label="Fecha" />
        </VCol>
        <VCol cols="12" md="6">
          <v-autocomplete :items="subdivisions" item-title="nombre" label="Subdivisión" v-model="subseleccionado"
            return-object clearable>
            <template v-slot:no-data>
              <div class="px-4">No existen datos</div>
            </template>
          </v-autocomplete>
        </VCol>
        <VCol cols="12" md="3" sm="4">
          <VTextField v-model="pkInicio" type="number" label="Pk Inicio" readonly />
        </VCol>
        <VCol cols="12" md="3" sm="4">
          <VTextField v-model="pkTermino" type="number" label="Pk Término" readonly />
        </VCol>
        <VCol cols="12">
          <VTextarea v-model="observacionGeneral" rows="3" label="Observación general"></VTextarea>
        </VCol>
      </VRow>
    </div>
  </div>
  <TabsComponent v-model:current-tab="currentTab" :parent-items="parentItems" @addCaracteristica="addCaracteristica"
    @removeEntry="removeEntry" :pk-inicio="pkInicio" :pk-termino="pkTermino"/>
  <div class="mt-2 mb-2">
    <hr>
    <VBtn color="primary" @click="() => saveData(0)">
      Guardar
    </VBtn>
    <VBtn class="ma-sm-1" color="primary" @click="() => saveData(1)">
      Guardar y Cerrar
    </VBtn>
  </div>
  <VSnackbar v-model="snackbar" :color="snackbarColor" location="top end" :timeout="2000">
    {{ snackbarMessage }}
  </VSnackbar>
</template>
