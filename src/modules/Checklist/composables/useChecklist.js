import { ref } from 'vue'

export default function useChecklist() {
  const currentTab = ref(0)
  
  const parentItems = ref([
    {
      id: 1,
      title: 'Inspección de Vía',
      items: [
        {
          id: 1,
          title: 'Eclisas quebradas',
          data: [],
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
          data: [],
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

  const addCaracteristica = subitem => {
    subitem.data.push({
      id: Date.now(),
      pk: 0,
      collera: '',
      observacion: '',
    })
  }

  const removeEntry = (subitem, index) => {
    subitem.data.splice(index, 1)
  }

  const saveData = cerrado => {
    const dataToSave = {
      parentItems: parentItems.value,
      cerrado: cerrado,
    }

    console.log(dataToSave)
  }

  return {
    currentTab,
    parentItems,
    addCaracteristica,
    removeEntry,
    saveData,
  }
}
