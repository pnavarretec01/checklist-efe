import { defineStore } from 'pinia';

export const useItemsStore = defineStore({
  id: 'items',
  state: () => ({
    items: []
  }),

  actions: {
    setItems(data) {
      this.items = data;
   },

    addItem(item) {
      this.items.push(item);
    },

    editItem(item) {
      const index = this.items.findIndex(i => i.pk_item_id === item.pk_item_id);
      if (index !== -1) {
        this.items[index] = item;
      }
    },

    deleteItem(itemId) {
      const index = this.items.findIndex(i => i.pk_item_id === itemId);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
    },
  }
});
