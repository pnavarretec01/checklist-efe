<script setup>
import { ref, watch, isRef } from 'vue';
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

if (isRef(props.dialog)) {
  watch(props.dialog, newVal => {
    localDialog.value = newVal;
  });
}

const close = () => {
  emit('close');
};

const save = () => {
  emit('save', props.item);
};

</script>

<template>
  <VDialog v-model="localDialog" max-width="600px" @click:outside="close">
    <DialogCloseBtn @click="close" />
    <VCard>
      <VCardTitle>
        <span class="headline">{{ item && item.pk_item_id ? 'Editar Item' : 'Nuevo Item' }}</span>
      </VCardTitle>
      <VCardText>
        <VContainer>
          <VRow>
            <VCol cols="12" sm="6" md="8">
              <VTextField v-model="item.nombre" label="Nombre" />
            </VCol>
            <VCol cols="12" sm="6" md="4">
              <VTextField v-model="item.orden" label="Orden" />
            </VCol>
          </VRow>
        </VContainer>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="error" variant="outlined" @click="close">Cancelar</VBtn>
        <VBtn color="success" variant="elevated" @click="save">{{ item && item.pk_item_id ? 'Editar' : 'Guardar' }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
