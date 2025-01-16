import { getLocaleFromNavigator, init, register } from 'svelte-i18n';

// Registrar os idiomas
register('en', () => import('./locales/en.json'));
register('pt', () => import('./locales/pt.json'));
register('es', () => import('./locales/es.json'));

// Inicializar a configuração
init({
  fallbackLocale: 'pt',
  initialLocale: getLocaleFromNavigator(), // Pode ser alterado dinamicamente
});
