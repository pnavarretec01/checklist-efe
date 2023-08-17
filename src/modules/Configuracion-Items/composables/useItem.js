import { ref } from 'vue'

export default function useChecklist() {
  const currentTab = ref(0)
  
  const parentItems = ref([  
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
