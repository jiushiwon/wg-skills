import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { setupPermissionDirective } from './directives/permission';
import './styles/tokens.css';
import './styles/global.css';
import './styles/page.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
setupPermissionDirective(app);

app.mount('#app');
