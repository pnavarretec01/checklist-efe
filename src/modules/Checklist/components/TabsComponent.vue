<script setup>
const currentTab = ref(1)
const emit = defineEmits()
const props = defineProps(['parentItems'])

const addCaracteristica = subitem => {
  emit('addCaracteristica', subitem)
}
const removeEntry = (subitem, index) => {
  emit('removeEntry', subitem, index)
}

watchEffect(() => {
  if (props.parentItems && props.parentItems.length > 0) {
    currentTab.value = props.parentItems[0].id
  }
})

</script>

<template>
  <VCard>
    <VTabs next-icon="tabler-arrow-right" prev-icon="tabler-arrow-left" v-model="currentTab">
      <VTab v-for="item in parentItems" :key="item.id" :value="item.id">
        {{ item.nombre }}
      </VTab>
    </VTabs>
    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem v-for="item in parentItems" :key="item.id" :value="item.id">
          <div v-for="(subitem, indexSubItem) in item.items" :key="indexSubItem">
            <h3>{{ subitem.nombre }}</h3>
            <VRow v-for="(dataSubitem, dataIndex) in subitem.data" :key="dataIndex" align="center" class="mb-2">
              <VCol cols="6" md="3">
                <VTextField v-model="dataSubitem.pk" type="number" label="PK" />
              </VCol>
              <VCol cols="6" md="3">
                <VTextField v-model="dataSubitem.collera" type="number" label="Collera" />
              </VCol>
              <VCol cols="12" md="5" v-if="dataSubitem.pk && dataSubitem.collera">
                <VTextarea v-model="dataSubitem.observacion" rows="2" label="Observación" placeholder="Observación" />
              </VCol>
              <VCol cols="12" md="1">
                <VBtn icon size="x-small" color="default" variant="text" @click="() => removeEntry(subitem, dataIndex)">
                  <VIcon size="20" icon="tabler-x" />
                </VBtn>
              </VCol>
            </VRow>
            <VBtn v-if="!item.cerrado" @click="addCaracteristica(subitem)">
              Agregar
            </VBtn>

          </div>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
