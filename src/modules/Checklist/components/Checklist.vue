<script setup>
import { useRoute } from 'vue-router';
import { ref } from 'vue';
import useChecklist from '../composables/useChecklist'
import TabsComponent from './TabsComponent.vue'
import logoEfe from '../../../assets/images/logo-efe.svg'

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  },
  formulario: {
    type: Object,
    required: true
  }
});

const route = useRoute();
const id = ref(route.params.id);
const itemId = ref(route.params.id);

const nombreSupervisor = ref('');
const fecha = ref('');
const subdivision = ref('');
const pkInicio = ref(null);
const pkTermino = ref(null);
const observacionGeneral = ref('');
const subseleccionado = ref([]);

watch(subseleccionado, (nuevoValor, oldName) => {
  if (nuevoValor.pk_inicio !== null || nuevoValor.pk_inicio !== undefined &&
    nuevoValor.pk_termino !== null || nuevoValor.pk_termino !== undefined) {
    pkInicio.value = nuevoValor.pk_inicio
    pkTermino.value = nuevoValor.pk_termino
  }
});

function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();
  let hh = d.getHours();
  let mm = d.getMinutes();
  const ss = '00';

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return `${year}-${month}-${day}T${hh}:${mm}:${ss}`;
}

watch(fecha, (nuevoValor, oldValue) => {
  // Comprueba si el valor nuevo ya está en el formato que necesito
  if (!esFechaEnFormatoISO(nuevoValor)) {
    const fechaFormateada = formatDate(nuevoValor);
    if (fechaFormateada !== nuevoValor) {
      fecha.value = fechaFormateada;
    }
  }
});

function esFechaEnFormatoISO(fecha) {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
  return regex.test(fecha);
}



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
  cerrado,
  subdivisions, loading
} = useChecklist(nombreSupervisor, fecha, subdivision, pkInicio, pkTermino, observacionGeneral, itemId, props.formulario, subseleccionado);

onMounted(() => {
  fetchFormDataById(id.value);
});
</script>
<template>
  <div class="d-flex justify-end align-start gap-3 mb-4 mt-4 me-5">
    <VBtn prepend-icon="tabler-arrow-left" color="error" :to="{ name: 'checklist-page' }">
      Volver
    </VBtn>
  </div>
  <div class="ma-sm-4">
    <div class="d-flex align-center mb-6">
      <img :src="logoEfe" alt="logo" style="width: 12vw; min-width: 60px; max-width: 100px;">
      <h6 class="font-weight-bold text-xl ml-3 ml-sm-0">
        Checklist Revisión de Infraestructura Zona Norte
      </h6>
    </div>
    <div class="pt-5 pb-5 flex-grow-1">
      <VRow>
        <VCol cols="12" md="6">
          <VTextField v-model="nombreSupervisor" rows="2" label="Nombre Supervisor" placeholder="Nombre Supervisor"
            disabled />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField v-model="fecha" type="datetime-local" label="Fecha" :readonly="cerrado" disabled />
        </VCol>
        <VCol cols="12" md="6">
          <v-autocomplete :items="subdivisions"
            :item-title="(item) => `${item.nombre}  (PKs: ${item.pk_inicio} - ${item.pk_termino})`" label="Subdivisión"
            v-model="subseleccionado" return-object>
            <template v-slot:no-data>
              <div class="px-4">No existen datos</div>
            </template>
          </v-autocomplete>
        </VCol>
        <VCol cols="12" md="3" sm="4">
          <VTextField v-model="pkInicio" type="number" label="Pk Inicio" />
        </VCol>
        <VCol cols="12" md="3" sm="4">
          <VTextField v-model="pkTermino" type="number" label="Pk Término" />
        </VCol>
        <VCol cols="12">
          <VTextarea v-model="observacionGeneral" rows="3" label="Observación general" :readonly="cerrado"></VTextarea>
        </VCol>
      </VRow>
    </div>
  </div>
  <TabsComponent v-model:current-tab="currentTab" :parent-items="parentItems" @addCaracteristica="addCaracteristica"
    @removeEntry="removeEntry" :pk-inicio="pkInicio" :pk-termino="pkTermino" :subseleccionado="subseleccionado" />
  <div class="mt-2 mb-2">
    <hr>
    <VBtn :disabled="loading" v-if="!cerrado" class="ma-sm-1" color="primary" @click="updateData(0)">
      Guardar
    </VBtn>

    <VBtn :disabled="loading" v-if="!cerrado" class="ma-sm-1" color="primary" @click="updateData(1)">
      Guardar y Cerrar
    </VBtn>

    <v-overlay :model-value="loading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
      <span class="mt-3">Se está procesando el Checklist, por favor espere...</span>
    </v-overlay>
  </div>

  <VSnackbar v-model="snackbar" :color="snackbarColor" location="top end" :timeout="2000">
    {{ snackbarMessage }}
  </VSnackbar>
</template>
