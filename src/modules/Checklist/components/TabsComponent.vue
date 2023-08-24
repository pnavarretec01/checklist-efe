<script setup>
const props = defineProps(['currentTab', 'parentItems'])
const emit = defineEmits()

const addCaracteristica = subitem => {
  emit('addCaracteristica', subitem)
}

const removeEntry = (subitem, index) => {
  emit('removeEntry', subitem, index)
}
props.parentItems.forEach(item => {
  item.items.forEach(subitem => {
    subitem.data.forEach((entry, entryIndex) => {
      watch(
        () => [entry.pk, entry.collera],
        ([newPk, newCollera]) => {
          if (!newPk || !newCollera) {
            entry.observacion = '';

            if (!newPk && !newCollera) {
              subitem.data.splice(entryIndex, 1);
            }
          }
        }
      );
    });
  });
});

</script>

<template>
  <div>
    <VTabs :value="currentTab" @input="$emit('update:currentTab', $event)">
      <VTab v-for="item in parentItems" :key="item.id" :value="item.id">
        {{ item.title }}
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow :value="currentTab" @input="$emit('update:currentTab', $event)">
        <VWindowItem v-for="(item, index) in parentItems" :key="item.id" :value="item.id">
          <div v-for="(subitem, indexSubItem) in item.items" :key="indexSubItem">
            <h3>{{ subitem.title }}</h3>
            <VRow v-for="(entry, entryIndex) in subitem.data" :key="entryIndex" align="center" class="mb-2">
              <VCol cols="6" md="3">
                <VTextField v-model="entry.pk" type="number" label="PK" />
              </VCol>
              <VCol cols="6" md="3">
                <VTextField v-model="entry.collera" type="number" label="Collera" />
              </VCol>
              <VCol cols="12" md="5" v-if="entry.pk && entry.collera">
                <VTextarea v-model="entry.observacion" rows="2" label="Observación" placeholder="Observación" />
              </VCol>
              <VCol cols="12" md="1">
                <VBtn icon size="x-small" color="default" variant="text" @click="() => removeEntry(subitem, entryIndex)">
                  <VIcon size="20" icon="tabler-x" />
                </VBtn>
              </VCol>
            </VRow>
            <VBtn @click="addCaracteristica(subitem)">
              Agregar
            </VBtn>
          </div>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </div>
</template>
