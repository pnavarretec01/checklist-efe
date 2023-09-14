<script setup>
import { ref, watch  } from 'vue';

const emit = defineEmits();

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  dialog: {
    type: Boolean,
    required: true
  },
});

const localDialog = ref(props.dialog);

watch(() => props.dialog, newVal => {
  localDialog.value = newVal;
});

const close = () => {
  emit('closeDelete');
};

const confirm = () => {
  emit('confirmarEliminar', props.item);
};

</script>
<template>
  <VDialog v-model="localDialog" max-width="500px" @click:outside="close">
    <DialogCloseBtn @click="close" />
    <VCard title="Advertencia">
      <VCardTitle>
        ¿Estás seguro que deseas eliminar esta Sub División?
      </VCardTitle>
      <VCardActions>
        <VSpacer />
        <VBtn color="error" variant="outlined" @click="close">Cancelar</VBtn>
        <VBtn color="success" variant="elevated" @click="confirm">Aceptar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
