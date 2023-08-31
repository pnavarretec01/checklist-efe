<script setup>
import { ref, watchEffect, watch } from 'vue';

const emit = defineEmits();

const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({})
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
  <VDialog v-model="localDialog" max-width="600px" @click:outside="close">
    <DialogCloseBtn @click="close" />
    <VCard>
      <VCardTitle>

      </VCardTitle>
      <VCardText>
        <h3>¿Estás seguro que deseas eliminar este Checklist? Puede tener información importante</h3>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="error" variant="outlined" @click="close">Cancelar</VBtn>
        <VBtn color="success" variant="elevated" @click="confirm">Aceptar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
