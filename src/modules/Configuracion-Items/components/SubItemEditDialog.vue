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
const localItem = ref(JSON.parse(JSON.stringify(props.item)));

const editar = ref({});
const subItemsBackup = ref({});
const snackbar = ref(false);
const snackbarColor = ref('info');
const snackbarMessage = ref('');
const nombreRef = ref(null);
const ordenRef = ref(null);


const startEdit = (subitem, index) => {
  editar.value[index] = true;
  subItemsBackup.value[index] = { ...subitem };
};
// Función para cancelar la edición
const cancelEdit = (subitem, index) => {
  editar.value[index] = false;
  Object.assign(subitem, subItemsBackup.value[index]);
  delete subItemsBackup.value[index];
};

const localDialog = ref(props.dialog);

watch(() => props.dialog, newVal => {
  localDialog.value = newVal;
});
watch(() => props.item, newVal => {
  localItem.value = JSON.parse(JSON.stringify(newVal));
});
const close = () => {
  emit('closeSubItem');
};

watch(localDialog, (newVal) => {
  emit('update:dialog', newVal);
});

const validateSubItem = (nombre, orden) => {
  if (!nombre.trim()) {
    snackbarMessage.value = "El campo 'Nombre' es obligatorio.";
    snackbarColor.value = "info";
    snackbar.value = true;
    return false;
  }

  if (!orden || isNaN(orden) || parseInt(orden) <= 0) {
    snackbarMessage.value = "El campo 'Orden' debe ser un número entero positivo y es requerido.";
    snackbarColor.value = "info";
    snackbar.value = true;
    return false;
  }

  return true;
};

const save = (subitem, index) => {
  if (!validateSubItem(subitem.nombre, subitem.orden)) return;

  let data = { itemId: props.item.pk_item_id, subitem: subitem };
  emit('saveSubItem', data);

  editar.value[index] = false;
  delete subItemsBackup.value[index];
};

const addingMode = ref(false);
const newSubItem = ref({ nombre: '', orden: '' });

const startAdding = () => {
  addingMode.value = true;
};

const saveNewSubitem = () => {
  const isNombreValid = nombreRef.value.validate();
  const isOrdenValid = ordenRef.value.validate();

  if (isNombreValid && isOrdenValid && validateSubItem(newSubItem.value.nombre, newSubItem.value.orden)) {
    let data = { itemId: props.item.pk_item_id, subitem: newSubItem.value };
    emit('saveSubItem', data);

    newSubItem.value = { nombre: '', orden: '' };
    addingMode.value = false;
  }
};

const cancelAdding = () => {
  newSubItem.value = { nombre: '', orden: '' };
  addingMode.value = false;
};

</script>

<template>
  <VDialog v-model="localDialog" max-width="600px" @click:outside="close">
    <DialogCloseBtn @click="close" />
    <VCard>
      <VCardTitle>
        <span class="headline">SubItems de {{ item.nombre }}</span>
      </VCardTitle>
      <VCardText>
        <VContainer>
          <VBtn color="primary" @click="startAdding" v-if="!addingMode">Agregar</VBtn>
          <div v-if="addingMode">
            <VCol cols="12" sm="12" md="12">
              <VTextField ref="nombreRef" v-model="newSubItem.nombre" label="Nombre" :rules="[v => !!v || 'El nombre es requerido']" />
            </VCol>
            <VCol cols="12" sm="12" md="12">
              <VTextField ref="ordenRef" v-model="newSubItem.orden" label="Orden" type="number"
                :rules="[v => !!v || 'El orden es requerido', v => v > 0 || 'El orden debe ser un número positivo']" />
            </VCol>

            <VBtn color="success" @click="saveNewSubitem">Guardar</VBtn>
            <VBtn class="ml-1" color="error" @click="cancelAdding">Cancelar</VBtn>

          </div>
        </VContainer>
        <!--termino form agregar nuevo-->
        <VContainer v-if='item.subitems != ""'>
          <VList lines="two" border>
            <template v-for="( subitem, index ) in  item.subitems " :key="index">
              <VListItem>
                <VListItemTitle>
                  <VCol cols="12" sm="12" md="12">
                    <div v-if="!editar[index]">
                      <label>Nombre</label>
                      <p>{{ subitem.nombre }}</p>
                    </div>
                    <VTextField v-model="subitem.nombre" label="Nombre" v-if="editar[index]"
                      :rules="[v => !!v || 'El nombre es requerido']" />
                  </VCol>
                  <VCol cols="12" sm="12" md="12">
                    <div v-if="!editar[index]">
                      <label>Orden</label>
                      <p>{{ subitem.orden }}</p>
                    </div>
                    <VTextField v-model="subitem.orden" label="Orden" v-if="editar[index]" type="number"
                      :rules="[v => !!v || 'El orden es requerido', v => v > 0 || 'El orden debe ser un número positivo']" />
                  </VCol>
                  <VCol cols="12">
                    <VBtn size="small" color="success" variant="elevated" @click="startEdit(subitem, index)"
                      v-if="!editar[index]">Editar</VBtn>
                    <VBtn size="small" color="success" variant="elevated" v-if="editar[index]"
                      @click="save(subitem, index)">Guardar</VBtn>
                    <VBtn class="ml-1" size="small" color="error" variant="outlined" @click="cancelEdit(subitem, index)"
                      v-if="editar[index]">Cancelar</VBtn>
                    <VBtn class="ml-1" size="small" color="error" variant="outlined" v-if="!editar[index]"
                      @click="emit('deleteSubitem', subitem)">Eliminar</VBtn>
                  </VCol>
                </VListItemTitle>
              </VListItem>
              <VDivider v-if="index !== item.subitems.length - 1" />
            </template>
          </VList>
        </VContainer>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="outlined" color="success" @click="close">Cerrar</VBtn>
      </VCardActions>
    </VCard>
    <VSnackbar v-model="snackbar" :color="snackbarColor" location="top end" :timeout="2000">
      {{ snackbarMessage }}
    </VSnackbar>

  </VDialog>
</template>
