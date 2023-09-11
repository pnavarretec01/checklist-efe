<script setup>
import Checklist from '@/modules/Checklist/components/Checklist.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const id = ref(route.params.id || Math.floor(Math.random() * 9999));
const formulario = ref(null);

const isLoading = ref(true);

onMounted(() => {
  const storedFormulario = localStorage.getItem('formulario');
  formulario.value = storedFormulario ? JSON.parse(storedFormulario) : null;
  isLoading.value = false; 
});
</script>
<template>
  <div>
    <VCard title="Checklist">
      <VCardText v-if="isLoading">
          <VProgressCircular
            :size="60"
            color="primary"
            indeterminate
          />
      </VCardText>
      <!-- Contenido del Checklist, solo se muestra cuando no está cargando -->
      <VCardText v-else>
        <Checklist :id="id" :formulario="formulario" />
      </VCardText>
    </VCard>
  </div>
</template>


