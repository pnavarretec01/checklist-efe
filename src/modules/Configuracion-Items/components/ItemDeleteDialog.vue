<script setup>
import { ref, watchEffect, watch  } from 'vue';

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
  emit('confirmDelete', props.item);
};

</script>
<template>
  <VDialog v-model="localDialog" max-width="500px" @click:outside="close">
    <DialogCloseBtn @click="close" />
    <VCard>
      <VCardTitle>
        ¿Estás seguro que deseas eliminar este Item?
      </VCardTitle>
      <VCardActions>
        <VSpacer />
        <VBtn color="error" variant="outlined" @click="close">Cancelar</VBtn>
        <VBtn color="success" variant="elevated" @click="confirm">Aceptar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
