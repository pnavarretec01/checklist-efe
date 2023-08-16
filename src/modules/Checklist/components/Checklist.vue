<script setup>
import { ref } from 'vue';

const currentTab = ref(0)

const parentItems = ref([
  {
    id: 1,
    title: 'Inspección de Vía',
    items: [
      {
        id: 1,
        title: 'Eclisas quebradas',
        data: [], // Aquí se llenarán los datos obtenidos de la API
      },
      {
        id: 2,
        title: 'Rieles quebrados',
        data: [],
      },
      {
        id: 3,
        title: 'Durmientes en malas condiciones',
        data: [],
      },
    ],
  },
  {
    id: 2,
    title: 'Aparatos de cambio de vía',
    items: [
      {
        id: 4,
        title: 'Falta de lubricación',
        data: [],
      },
      {
        id: 5,
        title: 'Tirantes doblados',
        data: [],
      },
      {
        id: 6,
        title: 'Agujas y/o cruzamientos quebrados',
        data: [],
      },
    ],
  },
  {
    id: 3,
    title: 'Inspección de Vía',
    items: [
      {
        id: 1,
        title: 'Eclisas quebradas',
        data: [], // Aquí se llenarán los datos obtenidos de la API
      },
      {
        id: 2,
        title: 'Rieles quebrados',
        data: [],
      },
      {
        id: 3,
        title: 'Durmientes en malas condiciones',
        data: [],
      },
    ],
  },
  {
    id: 4,
    title: 'Aparatos de cambio de vía',
    items: [
      {
        id: 4,
        title: 'Falta de lubricación',
        data: [],
      },
      {
        id: 5,
        title: 'Tirantes doblados',
        data: [],
      },
      {
        id: 6,
        title: 'Agujas y/o cruzamientos quebrados',
        data: [],
      },
    ],
  },
])

const addCaracteristica = (subitem) => {
  subitem.data.push({
    id: Date.now(),
    pk: 0,
    collera: '',
    observacion: ''
  })
}
</script>

<template>
  <VCard>
    <VTabs v-model="currentTab">
      <VTab v-for="item in parentItems" :key="item.id" :value="item.id">
        {{ item.title }}
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem v-for="item in parentItems" :key="item.id" :value="item.id">
          <div v-for="subitem in item.items">
            <h3>{{ subitem.title }}</h3>
            <div v-for="entry in subitem.data">
              <input v-model="entry.pk" placeholder="PK" />
              <input v-model="entry.collera" placeholder="Collera" />
              <textarea v-model="entry.observacion" placeholder="Observación"></textarea>
            </div>
            <button @click="addCaracteristica(subitem)">Añadir</button>
          </div>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
