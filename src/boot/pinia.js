import { boot } from 'quasar/wrappers'
import { createPinia } from 'pinia';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default ({ app }) => {
  // Initialize Pinia
  const pinia = createPinia()

  // Attach pinia to the app
  app.use(pinia)
}
