import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css';
import Particles from "vue3-particles";
import masonry from 'vue-next-masonry';

createApp(App).use(router).use(masonry).use(Particles).mount('#app');

