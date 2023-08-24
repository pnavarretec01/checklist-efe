<script setup>
import Checklist from '@/modules/Checklist/components/Checklist.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const id = ref(route.params.id);

onMounted(() => {
  console.log('[id].vue montado');
});

// Si necesitas el ID dentro de Checklist, puedes pasarlo como prop, asegúrate de que Checklist lo acepte.
</script>

<template>
  <div>
    <VCard title="Checklist">
      <VCardText>
        <Checklist :id="id" />
      </VCardText>
    </VCard>
  </div>
</template>
