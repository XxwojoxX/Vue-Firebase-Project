<template>
    <div class="login">
      <h1>Logowanie</h1>
      <form @submit.prevent="login">
        <div>
          <label for="email">Email:</label>
          <input v-model="email" type="email" id="email" required />
        </div>
        <div>
          <label for="password">Hasło:</label>
          <input v-model="password" type="password" id="password" required />
        </div>
        <button type="submit">Zaloguj</button>
      </form>
      <p>
        Nie masz konta? <router-link to="/register">Zarejestruj się</router-link>
      </p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
  import { auth } from '../firebase';
  import { useRouter } from 'vue-router';
  
  const email = ref('');
  const password = ref('');
  const router = useRouter();
  
  const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push('/'); // Przekierowanie po zalogowaniu
  } catch (error) {
    console.error('Błąd logowania:', error);
    alert('Nieprawidłowy email lub hasło');
  }
};
  </script>
  
  <style scoped>
  .login {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  </style>
  