<script setup>
import { ref, watch, isRef } from 'vue';
const emit = defineEmits(['close', 'save']);


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

const snackbar = ref(false);
const snackbarColor = ref('info');
const snackbarMessage = ref('');


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

const nombreRef = ref(null);
const ordenRef = ref(null);

const save = async () => {
  const nombreValidationResult = await nombreRef.value.validate();
  const ordenValidationResult = await ordenRef.value.validate();

  if (nombreValidationResult.length === 0 && ordenValidationResult.length === 0) {
    emit('save', props.item);
  } else {
    snackbarMessage.value = "Por favor, corrija los errores antes de guardar.";
    snackbarColor.value = "error";
    snackbar.value = true;
  }
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
              <VTextField ref="nombreRef" v-model="item.nombre" label="Nombre"
                :rules="[v => !!v || 'El nombre es requerido']" />
            </VCol>
            <VCol cols="12" sm="6" md="4">
              <VTextField ref="ordenRef" v-model="item.orden" label="Orden" type="number"
                :rules="[v => !!v || 'El orden es requerido', v => v > 0 || 'El orden debe ser un número positivo']" />
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
  <VSnackbar v-model="snackbar" :color="snackbarColor" location="top end" :timeout="2000">
    {{ snackbarMessage }}
  </VSnackbar>
</template>
