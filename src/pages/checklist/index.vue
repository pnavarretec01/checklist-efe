<script setup>
import Checklist from '@/modules/Checklist/components/Checklist-Nuevo.vue';
onMounted(() => {
  //console.log('index.vue montado');
});
</script>

<template>
  <div>
    <VCard title="Checklist">
      <VCardText>
        <Checklist />
      </VCardText>
    </VCard>
  </div>
</template>
