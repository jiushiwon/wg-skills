import { defineStore } from 'pinia'

export interface AppConfig {
  title: string
  logo: string
  theme: 'light' | 'dark'
  locale: 'zh-CN' | 'en-US'
  sidebarCollapsed: boolean
}

export const useAppStore = defineStore('app', () => {
  // --------------- State ---------------
  const config = useState<AppConfig>('app_config', () => ({
    title: 'Nuxt Admin',
    logo: '/logo.svg',
    theme: 'light',
    locale: 'zh-CN',
    sidebarCollapsed: false,
  }))

  // --------------- Actions ---------------
  function toggleSidebar(): void {
    config.value.sidebarCollapsed = !config.value.sidebarCollapsed
  }

  function setTheme(theme: AppConfig['theme']): void {
    config.value.theme = theme
  }

  function setLocale(locale: AppConfig['locale']): void {
    config.value.locale = locale
  }

  return {
    config,
    toggleSidebar,
    setTheme,
    setLocale,
  }
})
