<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const currentTab = ref(1);
const emit = defineEmits();
const props = defineProps(['parentItems', 'pkInicio', 'pkTermino']);

const snackbar = ref(false);
const snackbarColor = ref('error');
const snackbarMessage = ref('');

const addCaracteristica = subitem => {
  emit('addCaracteristica', subitem);
}

const removeEntry = (subitem, index) => {
  emit('removeEntry', subitem, index);
}

watchEffect(() => {
  if (props.parentItems && props.parentItems.length > 0) {
    currentTab.value = props.parentItems[0].id;
  }
});

const isMobile = ref(window.innerWidth <= 768);

onMounted(() => {
  window.addEventListener('resize', handleResize);
  handleResize();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

function handleResize() {
  isMobile.value = window.innerWidth <= 768;
}

watch(() => props.parentItems, (newItems) => {
  setTimeout(() => {
    newItems.forEach(item => {
      item.items.forEach(subitem => {
        subitem.data.forEach(dataSubitem => {
          let minPK, maxPK;
          // subdivision editar o nueva
          if (props.pkInicio && props.pkTermino) {
            minPK = props.pkInicio;
            maxPK = props.pkTermino;
          } else if (item.subdivision) {
            minPK = item.subdivision.pk_inicio;
            maxPK = item.subdivision.pk_termino;
          }
          // validacion
          if (minPK && dataSubitem.pk < minPK) {
            dataSubitem.pk = minPK;
            snackbarMessage.value = `El PK mínimo permitido es ${minPK}`;
            snackbar.value = true;
          } else if (maxPK && dataSubitem.pk > maxPK) {
            dataSubitem.pk = maxPK;
            snackbarMessage.value = `El PK máximo permitido es ${maxPK}`;
            snackbar.value = true;
          }
        });
      });
    });
  }, 1000);
}, { deep: true });
</script>
<template>
  <VCard>
    <VCardText>
      <!-- en movil -->
      <div v-if="isMobile" v-for="item in parentItems" :key="item.id">
        <VTabs v-model="currentTab">
          <VTab :value="item.id">
            {{ item.nombre }}
          </VTab>
        </VTabs>
      </div>
      <!-- en escritorio -->
      <VTabs v-else next-icon="tabler-arrow-right" prev-icon="tabler-arrow-left" v-model="currentTab">
        <VTab v-for="item in parentItems" :key="item.id" :value="item.id">
          {{ item.nombre }}
        </VTab>
      </VTabs>
      <VWindow v-model="currentTab">
        <VWindowItem v-for="item in parentItems" :key="item.id" :value="item.id">
          <h2 class="pa-5">{{ item.nombre }}</h2>
          <div v-for="(subitem, indexSubItem) in item.items" :key="indexSubItem">
            <h3>{{ subitem.nombre }}</h3>
            <VRow v-for="(dataSubitem, dataIndex) in subitem.data" :key="dataIndex" align="center" class="mb-2">
              <VCol cols="6" md="3">
                <VTextField v-model.number="dataSubitem.pk" type="number" label="PK" />
              </VCol>
              <VCol cols="6" md="3">
                <VTextField v-model="dataSubitem.collera" type="number" label="Collera" />
              </VCol>
              <VCol cols="12" md="5" v-if="dataSubitem.pk && dataSubitem.collera">
                <VTextarea v-model="dataSubitem.observacion" rows="2" label="Observación" placeholder="Observación" />
              </VCol>
              <VCol cols="12" md="1">
                <VBtn v-if="!item.cerrado" icon size="x-small" color="default" variant="text"
                  @click="() => removeEntry(subitem, dataIndex)">
                  <VIcon size="20" icon="tabler-x" />
                </VBtn>
              </VCol>
            </VRow>
            <VBtn v-if="!item.cerrado" @click="addCaracteristica(subitem)">
              Agregar
            </VBtn>
          </div>
        </VWindowItem>
      </VWindow>
    </VCardText>
    <VSnackbar v-model="snackbar" :color="snackbarColor" location="top end" :timeout="2000">
      {{ snackbarMessage }}
    </VSnackbar>
  </VCard>
</template>


