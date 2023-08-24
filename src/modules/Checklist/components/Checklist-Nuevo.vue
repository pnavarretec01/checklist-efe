<script setup>
import useChecklist from '../composables/useChecklist'
import TabsComponent from './TabsComponent.vue'

const {
  currentTab,
  parentItems,
  addCaracteristica,
  removeEntry,
  saveData,
  sendCaracteristicas
} = useChecklist();
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
            <VTextField rows="2" label="Nombre Supervisor" placeholder="Nombre Supervisor" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField type="date" label="Fecha" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField rows="2" label="Subdivisión" placeholder="Subdivisión" />
          </VCol>
          <VCol cols="12" md="3" sm="4">
            <VTextField type="number" label="Pk Inicio" />
          </VCol>
          <VCol cols="12" md="3" sm="4">
            <VTextField type="number" label="Pk Término" />
          </VCol>
        </VRow>
      </div>
    </div>


    <TabsComponent v-model:current-tab="currentTab" :parent-items="parentItems" @addCaracteristica="addCaracteristica"
      @removeEntry="removeEntry" />

    <div class="mt-2 mb-2">
      <hr>
      <VBtn color="primary" @click="() => saveData(0)">
        Guardar
      </VBtn>
      <VBtn class="ma-sm-1" color="primary" @click="() => saveData(1)">
        Guardar y Cerrar
      </VBtn>
    </div>
  </VCard>
</template>
