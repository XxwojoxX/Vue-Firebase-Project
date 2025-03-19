import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Importuj komponenty
import Home from '../views/Home.vue';
import AdvertisementList from '../components/AdvertisementList.vue';
import AdvertisementForm from '../components/AdvertisementForm.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/advertisements', name: 'AdvertisementList', component: AdvertisementList },
  { path: '/advertisements/new', name: 'AdvertisementForm', component: AdvertisementForm, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

let isAuthResolved = false;

function ensureAuthState() {
  return new Promise((resolve) => {
    const auth = getAuth();
    if (isAuthResolved) {
      resolve(auth.currentUser);
    } else {
      onAuthStateChanged(auth, (user) => {
        isAuthResolved = true;
        resolve(user);
      });
    }
  });
}

router.beforeEach(async (to, from, next) => {
  const user = await ensureAuthState();
  if (to.meta.requiresAuth && !user) {
    next('/login');
  } else {
    next();
  }
});

export default router;
