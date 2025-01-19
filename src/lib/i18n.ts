import { getLocaleFromNavigator, init, register, locale } from 'svelte-i18n';

// Registrar os idiomas
register('en', () => import('./locales/en.json'));
register('pt', () => import('./locales/pt.json'));
register('es', () => import('./locales/es.json'));

// Função para obter o idioma inicial, verificando o ambiente
function getInitialLocale() {
  if (typeof window !== 'undefined') {
    // No ambiente do cliente, usa localStorage ou navegador
    return localStorage.getItem('user-locale');
  }
  // No ambiente do servidor, retorna o idioma padrão
  return null;
}

// Inicializar a configuração
init({
  fallbackLocale: 'pt', // Idioma de fallback
  initialLocale: getInitialLocale() || getLocaleFromNavigator(), // Obter idioma inicial de forma segura
});

// Salvar o idioma selecionado quando ele for alterado (somente no cliente)
if (typeof window !== 'undefined') {
  locale.subscribe((newLocale) => {
    if (newLocale) {
      localStorage.setItem('user-locale', newLocale);
    }
  });
}
