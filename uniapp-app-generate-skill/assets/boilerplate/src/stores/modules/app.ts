import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const isLoading = ref(false);
  const safeAreaBottom = ref(0);

  function setLoading(value: boolean) {
    isLoading.value = value;
  }

  return {
    isLoading,
    safeAreaBottom,
    setLoading,
  };
});
