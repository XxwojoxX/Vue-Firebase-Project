import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const useUserStore = defineStore('user', () => {
  const userId = ref(null);

  const setUserId = (id) => {
    userId.value = id;
  };

  // Sprawdzanie stanu logowania użytkownika
  onAuthStateChanged(getAuth(), (user) => {
    if (user) {
      setUserId(user.uid); // Ustawiamy userId na podstawie zalogowanego użytkownika
    } else {
      setUserId(null); // Ustawiamy null, jeśli użytkownik jest wylogowany
    }
  });

  return { userId, setUserId };
});
