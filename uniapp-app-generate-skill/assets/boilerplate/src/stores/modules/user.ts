import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref('');
  const nickname = ref('');
  const avatar = ref('');

  const isLogin = computed(() => !!token.value);

  function setToken(value: string) {
    token.value = value;
  }

  function setUserInfo(name: string, url: string) {
    nickname.value = name;
    avatar.value = url;
  }

  function logout() {
    token.value = '';
    nickname.value = '';
    avatar.value = '';
  }

  return {
    token,
    nickname,
    avatar,
    isLogin,
    setToken,
    setUserInfo,
    logout,
  };
});
