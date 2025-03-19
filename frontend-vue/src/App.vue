<template>
  <div id="app">
    <header v-if="authResolved">
      <nav>
        <ul>
          <li><router-link to="/">Strona Główna</router-link></li>
          <li><router-link to="/advertisements">Ogłoszenia</router-link></li>
          <!-- Jeśli użytkownik nie jest zalogowany, pokaż przyciski logowania i rejestracji -->
          <li v-if="!user"><router-link to="/login">Zaloguj</router-link></li>
          <li v-if="!user"><router-link to="/register">Zarejestruj</router-link></li>
          <!-- Jeśli użytkownik jest zalogowany, pokaż przycisk wylogowania -->
          <li v-else><a @click="logout">Wyloguj ({{ user.email }})</a></li>
        </ul>
      </nav>
    </header>

    <main v-if="authResolved">
      <router-view />
    </main>
    <div v-else class="loading">Ładowanie...</div>
  </div>
</template>

<script setup>
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, defineComponent } from 'vue';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';

const userRole = ref(null);
const user = ref(null);
const authResolved = ref(false);
const router = useRouter();

const logout = async () => {
  try {
    await signOut(auth); // Wylogowanie użytkownika z Firebase Authentication
    router.push('/login'); // Przekierowanie do strony logowania
  } catch (error) {
    console.error('Błąd podczas wylogowywania:', error);
  }
};

onAuthStateChanged(auth, async (currentUser) => {
  if (currentUser) {
    user.value = currentUser;

    // Pobranie roli użytkownika z Firestore
    const userDoc = await getDoc(doc(db, 'Users', currentUser.uid));
    if (userDoc.exists()) {
      userRole.value = userDoc.data().role;
    }
  } else {
    user.value = null;
    userRole.value = null;
  }
  authResolved.value = true;
});
</script>

<style scoped>
header {
  background-color: #4CAF50;
  padding: 5px;
  text-align: center;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

nav ul {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 30px;
}

nav ul li {
  font-size: 1.2rem;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

nav a:hover {
  background-color: #45a049;
}

main {
  margin-top: 10px;
  margin-bottom: 60px;
}

footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 10px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
</style>
