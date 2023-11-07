<script setup>
import { ref, watch, isRef } from 'vue';
const emit = defineEmits(['close', 'guardarItem']);

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
const snackbar = ref(false);
const snackbarColor = ref('error');
const snackbarMessage = ref('');

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
const pkInicioRef = ref(null);
const pkTerminoRef = ref(null);

const validateItem = () => {
  if (!nombreRef.value.validate() || !pkInicioRef.value.validate() || !pkTerminoRef.value.validate()) {
    snackbarMessage.value = "Por favor, corrija los errores antes de guardar.";
    snackbarColor.value = "error";
    snackbar.value = true;
    return false;
  }
  return true;
};

const guardar = () => {
  if (validateItem()) {
    emit('guardarItem', props.item);
  }
};
</script>

<template>
  <VDialog v-model="localDialog" width="500" @click:outside="close">
    <DialogCloseBtn @click="close" />

    <VCard :title="item && item.pk_subdivision_id ? 'Editar Sub-División' : 'Crear Sub-División'">
      <VCardText>
        <VRow>
          <VCol cols="12" sm="12" md="12">
            <VTextField ref="nombreRef" v-model="item.nombre" label="Nombre"
              :rules="[v => !!v || 'El nombre es requerido']" />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VTextField ref="pkInicioRef" v-model="item.pk_inicio" label="PK Inicio" type="number"
              :rules="[v => !!v || 'PK Inicio es requerido', v => v >= 0 || 'PK Inicio debe ser un número positivo']" />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VTextField ref="pkTerminoRef" v-model="item.pk_termino" label="PK Término" type="number"
              :rules="[v => !!v || 'PK Término es requerido', v => v >= 0 || 'PK Término debe ser un número positivo']" />
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn color="error" variant="outlined" @click="close">Cancelar</VBtn>
        <VBtn color="success" variant="elevated" @click="guardar">Guardar</VBtn>
      </VCardActions>
    </VCard>

    <VSnackbar v-model="snackbar" :color="snackbarColor" location="top end" :timeout="2000">
      {{ snackbarMessage }}
    </VSnackbar>
  </VDialog>
</template>
