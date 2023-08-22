<script setup>
import { ref, watch, defineEmits, isRef } from 'vue';
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

const editar = ref({});
const subItemsBackup = ref({}); // Para almacenar la versión original de los subítems en edición
// Función para iniciar la edición
const startEdit = (subitem, index) => {
  editar.value[index] = true;
  subItemsBackup.value[index] = { ...subitem }; // Creamos una copia del subítem antes de editar
};
// Función para cancelar la edición
const cancelEdit = (subitem, index) => {
  editar.value[index] = false;
  Object.assign(subitem, subItemsBackup.value[index]); // Restauramos el subítem a su estado original
  delete subItemsBackup.value[index]; // Limpiamos el backup
};

const localDialog = ref(props.dialog);

watch(() => props.dialog, newVal => {
  localDialog.value = newVal;
});
watch(() => props.item, newVal => {
  props.item = newVal;
});
const close = () => {
  emit('closeSubItem');
};

watch(localDialog, (newVal) => {
  emit('update:dialog', newVal);
});

const save = (subitem, index) => {
  emit('saveSubitem', subitem);
  editar.value[index] = false;
  delete subItemsBackup.value[index];
};

const addingMode = ref(false);
const newSubItem = ref({ nombre: '', orden: '' });

const startAdding = () => {
  addingMode.value = true;
};

const saveNewSubitem = () => {
  let data = { itemId: props.item.pk_item_id, subitem: newSubItem.value }
  emit('saveSubitem', data);

  newSubItem.value = { nombre: '', orden: '' };
  addingMode.value = false;
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
              <VTextField v-model="newSubItem.nombre" label="Nombre" />
            </VCol>
            <VCol cols="12" sm="12" md="12">
              <VTextField v-model="newSubItem.orden" label="Orden" />
            </VCol>
            <VCol cols="12" sm="12" md="12">
              <VBtn color="success" @click="saveNewSubitem">Guardar</VBtn>
              <VBtn color="error" @click="cancelAdding">Cancelar</VBtn>
            </VCol>
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
                    <VTextField v-model="subitem.nombre" label="Nombre" v-if="editar[index]" />
                  </VCol>
                  <VCol cols="12" sm="12" md="12">
                    <div v-if="!editar[index]">
                      <label>Orden</label>
                      <p>{{ subitem.orden }}</p>
                    </div>
                    <VTextField v-model="subitem.orden" label="Orden" v-if="editar[index]" />
                  </VCol>
                  <VCol cols="12">
                    <VBtn size="small" color="success" variant="elevated" @click="startEdit(subitem, index)"
                      v-if="!editar[index]">Editar</VBtn>
                    <VBtn size="small" color="success" variant="elevated" v-if="editar[index]"
                      @click="save(subitem, index)">Guardar</VBtn>
                    <VBtn size="small" color="error" variant="outlined" @click="cancelEdit(subitem, index)"
                      v-if="editar[index]">Cancelar</VBtn>
                    <VBtn size="small" color="error" variant="outlined" v-if="!editar[index]">Eliminar</VBtn>
                  </VCol>
                </VListItemTitle>
              </VListItem>
              <VDivider v-if="index !== subitem.length - 1" />
            </template>
          </VList>
        </VContainer>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="outlined" @click="close">Cerrar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
