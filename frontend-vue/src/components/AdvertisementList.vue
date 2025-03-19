<template>
  <div class="container">
    <button
      v-if="role === 'admin' || role === 'client'"
      @click="addNewAdvertisement"
    >
      Dodaj nowe ogłoszenie
    </button>

    <AdvertisementForm v-if="isAddingNew" :ad="null" @save="onSave" />

    <div v-if="user">
      <h2>Twoje ogłoszenia</h2>
      <div v-if="!isAddingNew || !editingAd">
        <label for="user-sort-select">Sortuj Twoje ogłoszenia:</label>
        <select
          v-model="sortByUserAds"
          id="user-sort-select"
          @change="sortUserAdvertisements"
        >
          <option value="date-asc">Rosnąco (od najstarszego)</option>
          <option value="date-desc">Malejąco (od najnowszego)</option>
        </select>
      </div>
      <ul>
        <li v-for="ad in sortedUserAdvertisements" :key="ad.id">
          <div class="ad-content">
            <!-- Wyświetlanie zdjęcia, jeśli dostępne -->
            <div v-if="ad.imageName">
              <img
                :src="ad.imageName"
                alt="Obraz ogłoszenia"
                class="ad-image"
              />
            </div>

            <!-- Tytuł, opis, cena -->
            <div class="ad-text">
              <h3>{{ ad.title }}</h3>
              <p>{{ ad.description }}</p>
              <p><strong>Cena:</strong> {{ ad.price }} zł</p>
            </div>
          </div>

          <!-- Przycisk usuń/edytuj -->
          <div class="button-container">
            <button @click="deleteAdvertisement(ad.id)">Usuń</button>
            <button @click="editAdvertisement(ad)">Edytuj</button>
          </div>

          <!-- Formularz edycji -->
          <AdvertisementForm
            v-if="editingAd && editingAd.id === ad.id"
            :ad="ad"
            @save="onSave"
          />
        </li>
      </ul>
    </div>

    <h2>{{ user ? "Pozostałe ogłoszenia" : "Ogłoszenia" }}</h2>

    <div v-if="!isAddingNew || !editingAd">
      <label for="other-sort-select">
        {{ user ? "Sortuj pozostałe ogłoszenia:" : "Sortuj ogłoszenia:" }}
      </label>
      <select
        v-model="sortByOtherAds"
        id="other-sort-select"
        @change="sortOtherAdvertisements"
      >
        <option value="date-asc">Rosnąco (od najstarszego)</option>
        <option value="date-desc">Malejąco (od najnowszego)</option>
      </select>
    </div>

    <ul>
      <li v-for="ad in sortedOtherAdvertisements" :key="ad.id">
        <div class="ad-content">
          <!-- Wyświetlanie zdjęcia, jeśli dostępne -->
          <div v-if="ad.imageName">
            <img :src="ad.imageName" alt="Obraz ogłoszenia" class="ad-image" />
          </div>

          <!-- Tytuł, opis, cena -->
          <div class="ad-text">
            <h3>{{ ad.title }}</h3>
            <p>{{ ad.description }}</p>
            <p><strong>Cena:</strong> {{ ad.price }} zł</p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import AdvertisementForm from "./AdvertisementForm.vue";
import { getAuth } from "firebase/auth";

const advertisements = ref([]);
const editingAd = ref(null);
const isAddingNew = ref(false);
const role = ref(null);
const userAdvertisements = ref([]);
const otherAdvertisements = ref([]);

// Odczytaj sortowanie z localStorage lub ustaw domyślne
const sortByUserAds = ref(localStorage.getItem("sortByUserAds") || "date-desc");
const sortByOtherAds = ref(localStorage.getItem("sortByOtherAds") || "date-desc");

const user = getAuth().currentUser;

const fetchAdvertisements = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    const adsSnapshot = await getDocs(
      query(collection(db, "advertisement"), orderBy("createdAt", "desc"))
    );
    advertisements.value = adsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    userAdvertisements.value = [];
    otherAdvertisements.value = advertisements.value;
    role.value = null;
    return;
  }

  const userDoc = await getDoc(doc(db, "user", user.uid));
  role.value = userDoc.exists() ? userDoc.data().role : "client";

  const adsSnapshot = await getDocs(
    query(collection(db, "advertisement"), orderBy("createdAt", "desc"))
  );
  advertisements.value = adsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  userAdvertisements.value = advertisements.value.filter(
    (ad) => ad.userId === user.uid
  );
  otherAdvertisements.value = advertisements.value.filter(
    (ad) => ad.userId !== user.uid
  );
};

// Sortowanie listy ogłoszeń użytkownika
const sortUserAdvertisements = () => {
  userAdvertisements.value.sort((a, b) => {
    const dateA = a.createdAt.toMillis();
    const dateB = b.createdAt.toMillis();
    return sortByUserAds.value === "date-asc" ? dateA - dateB : dateB - dateA;
  });
};

// Sortowanie pozostałych ogłoszeń
const sortOtherAdvertisements = () => {
  otherAdvertisements.value.sort((a, b) => {
    const dateA = a.createdAt.toMillis();
    const dateB = b.createdAt.toMillis();
    return sortByOtherAds.value === "date-asc" ? dateA - dateB : dateB - dateA;
  });
};

// Posortowane ogłoszenia użytkownika
const sortedUserAdvertisements = computed(() => {
  return userAdvertisements.value.sort((a, b) => {
    const dateA = a.createdAt.toMillis();
    const dateB = b.createdAt.toMillis();
    return sortByUserAds.value === "date-asc" ? dateA - dateB : dateB - dateA;
  });
});

// Posortowane pozostałe ogłoszenia
const sortedOtherAdvertisements = computed(() => {
  return otherAdvertisements.value.sort((a, b) => {
    const dateA = a.createdAt.toMillis();
    const dateB = b.createdAt.toMillis();
    return sortByOtherAds.value === "date-asc" ? dateA - dateB : dateB - dateA;
  });
});

// Obserwuj zmiany w sortowaniu i zapisuj je w localStorage
watch(sortByUserAds, (newValue) => {
  localStorage.setItem("sortByUserAds", newValue);
  sortUserAdvertisements();
});

watch(sortByOtherAds, (newValue) => {
  localStorage.setItem("sortByOtherAds", newValue);
  sortOtherAdvertisements();
});

async function deleteAdvertisement(id) {
  try {
    await deleteDoc(doc(db, "advertisement", id)); // Usuwanie ogłoszenia z Firestore
    await fetchAdvertisements(); // Odświeżenie listy ogłoszeń po usunięciu
  } catch (error) {
    console.error("Błąd podczas usuwania ogłoszenia:", error); // Logowanie szczegółów błędu
    alert("Nie udało się usunąć ogłoszenia. Spróbuj ponownie.");
  }
}

function editAdvertisement(ad) {
  editingAd.value = ad;
  isAddingNew.value = false;
}

function addNewAdvertisement() {
  editingAd.value = null;
  isAddingNew.value = true;
}

function onSave() {
  fetchAdvertisements();
  isAddingNew.value = false;
  editingAd.value = null;
}

onMounted(() => {
  fetchAdvertisements();
});
</script>

<style scoped>
.container {
  max-width: 90%;
  margin: 0 auto;
  padding: 20px;
  color: black;
}

.ad-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 80%;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ad-text {
  text-align: center;
  flex-grow: 1;
  margin-left: 20%;
}

.ad-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

h1 {
  font-size: 2.5rem;
  color: #4caf50;
  margin-bottom: 20px;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 40%;
  margin: 5px 0;
}

button:hover {
  background-color: #45a049;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #ddd;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

li:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
