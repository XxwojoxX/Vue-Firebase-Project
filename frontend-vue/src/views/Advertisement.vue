<template>
    <div v-if="advertisement">
      <h1>{{ advertisement.title }}</h1>
      <p>{{ advertisement.description }}</p>
      <p><strong>Cena:</strong> {{ advertisement.price }}</p>
    </div>
    <div v-else>
      <p>Ładowanie ogłoszenia...</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { doc, getDoc } from 'firebase/firestore';
  import { db } from '../firebase';
  
  const advertisement = ref(null);
  const route = useRoute();
  
  async function fetchAdvertisement() {
    const docRef = doc(db, 'Advertisement', route.params.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      advertisement.value = docSnap.data();
    }
  }
  
  onMounted(() => {
    fetchAdvertisement();
  });
  </script>
  
  <style scoped>
.advertisement-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2rem;
  color: #4CAF50;
}

p {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-top: 10px;
}
  </style>