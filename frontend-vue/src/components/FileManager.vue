<template>
  <div>
    <input type="file" @change="uploadFile" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  storage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  listAll,
} from "../firebase"; // Import funkcji Firebase
import { useUserStore } from "../stores/userStore"; // Import stanu użytkownika

const emit = defineEmits();

const userStore = useUserStore();
const uploadSuccess = ref(false);
const imageUrl = ref([]);

// Funkcja do uploadowania pliku
const uploadFile = async (event) => {
  const file = event.target.files[0];
  if (file && userStore.userId) {
    const userId = userStore.userId;
    const fileRef = storageRef(storage, `pictures/${userId}/${file.name}`);

    try {
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      imageUrl.value = downloadUrl;
      uploadSuccess.value = true;

      // Emitowanie URL obrazu do komponentu nadrzędnego
      emit("update:imageName", imageUrl.value);

      setTimeout(() => (uploadSuccess.value = false), 5000);
    } catch (error) {
      console.error("Błąd podczas uploadu pliku:", error);
    }
  }
};

// Funkcja do ładowania plików
const loadFiles = async () => {
  if (userStore.userId) {
    const folderRef = storageRef(storage, `pictures/${userStore.userId}`);
    try {
      const result = await listAll(folderRef);
      const urls = await Promise.all(
        result.items.map((item) => getDownloadURL(item))
      );
      //imageUrls.value = urls;
    } catch (error) {
      console.error("Błąd podczas ładowania plików:", error);
    }
  }
};

onMounted(() => {
  loadFiles();
});
</script>

<style scoped>
.success-message {
  color: green;
  font-weight: bold;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
}

.image-item {
  width: 200px;
  height: 200px;
  object-fit: cover;
  margin: 10px;
}
</style>
