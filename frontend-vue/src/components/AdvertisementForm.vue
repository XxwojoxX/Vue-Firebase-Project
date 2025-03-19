<template>
  <form @submit.prevent="saveAdvertisement">
    <input v-model="title" placeholder="Tytuł" required />
    <textarea v-model="description" placeholder="Opis" required></textarea>
    <input v-model="price" type="number" placeholder="Cena" required />

    <!-- Komponent do zarządzania plikami -->
    <FileManager @update:imageName="imageName = $event" />

    <button type="submit">
      {{ ad ? "Zapisz zmiany" : "Dodaj ogłoszenie" }}
    </button>
  </form>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { useRouter } from "vue-router";
import { getAuth } from "firebase/auth";
import FileManager from "@/components/FileManager.vue";

const props = defineProps(["ad"]);
const emit = defineEmits(["save"]);
const router = useRouter();

const title = ref(props.ad ? props.ad.title : "");
const description = ref(props.ad ? props.ad.description : "");
const price = ref(props.ad ? props.ad.price : "");
const imageName = ref(props.ad ? props.ad.imageName : ""); // Nowa zmienna na nazwę obrazu

const saveAdvertisement = async () => {
  const user = getAuth().currentUser;

  if (!user) {
    alert("Musisz być zalogowany, aby dodać ogłoszenie!");
    return;
  }

  try {
    const adData = {
      title: title.value,
      description: description.value,
      price: price.value,
      userId: user.uid,
      createdAt: new Date(),
      imageName: imageName.value || "", // Dodanie domyślnej wartości dla imageName
    };

    if (props.ad) {
      // Aktualizacja istniejącego ogłoszenia
      await updateDoc(doc(db, "advertisement", props.ad.id), adData);
    } else {
      // Dodanie nowego ogłoszenia
      await addDoc(collection(db, "advertisement"), adData);
    }

    emit("save"); // Informujemy komponent nadrzędny o zapisaniu
  } catch (error) {
    console.error("Błąd zapisywania ogłoszenia:", error);
    alert("Nie udało się zapisać ogłoszenia. Spróbuj ponownie.");
  }
};

watch(
  () => props.ad,
  (newAd) => {
    if (newAd) {
      title.value = newAd.title;
      description.value = newAd.description;
      price.value = newAd.price;
      imageName.value = newAd.imageName || ""; // Ładowanie obrazu
    }
  }
);
</script>

<style scoped>
form {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  max-width: 500px;
}

input,
textarea {
  width: 90%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  resize: none;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 12px;
  font-size: 1.1rem;
  border-radius: 5px;
  width: 100%;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
