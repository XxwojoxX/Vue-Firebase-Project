<template>
  <div class="register">
    <h1>Rejestracja</h1>
    <form @submit.prevent="register">
      <div>
        <label for="email">Email:</label>
        <input v-model="email" type="email" id="email" required />
      </div>
      <div>
        <label for="password">Hasło:</label>
        <input v-model="password" type="password" id="password" required />
      </div>
      <button type="submit">Zarejestruj się</button>
    </form>
    <p>Masz już konto? <router-link to="/login">Zaloguj się</router-link></p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "vue-router";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const email = ref("");
const password = ref("");
const router = useRouter();

const register = async () => {
  try {
    // Tworzenie użytkownika (rejestracja)
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    console.log(
      "Rejestracja udana, użytkownik stworzony:",
      userCredential.user
    );

    // Dodanie użytkownika do kolekcji "Users" w Firestore
    const userDocRef = doc(db, "Users", userCredential.user.uid);
    console.log("Tworzenie dokumentu użytkownika w Firestore:", userDocRef);

    await setDoc(userDocRef, {
      email: userCredential.user.email,
      role: "client", // Domyślna rola
    });

    // Automatyczne logowanie po rejestracji
    await signInWithEmailAndPassword(auth, email.value, password.value);

    // Po udanym logowaniu przekierowanie na stronę główną
    router.push("/");
  } catch (error) {
    console.error("Błąd rejestracji:", error);
    alert("Rejestracja nie powiodła się.");
  }
};
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
</style>
