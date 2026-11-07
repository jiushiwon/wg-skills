# 状态管理 (Context + Hooks)

基于 super-shell 项目的 appContext 实现。

## 核心模式

```typescript
// src/renderer/store/appContext.tsx
import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react'

// 类型定义
interface Connection {
  id: number
  name: string
  connection_type: string
  host: string
  port: number
  // ...
}

interface Tab {
  id: string
  type: 'ssh' | 'mysql' | 'postgres' | 'mongo' | 'redis' | 'dashboard' | 'file'
  title: string
  connection_id?: number
  // ...
}

interface Auth {
  userId: string
  email?: string
  nickname?: string
  provider: 'wechat' | 'offline'
  tier: 'pro' | 'user' | 'guest'
}

interface License {
  tier: 'pro' | 'free'
  licenseKey?: string
  expiresAt?: string
  remainingDays: number | null
}

interface AppState {
  connections: Connection[]
  groups: Group[]
  tabs: Tab[]
  activeTabId: string | null
  loading: boolean
  error: string | null
  auth: Auth
  license: License
  proModalOpen: boolean
  commandLibraryOpen: boolean
  version?: string
  updateInfo?: {
    hasUpdate: boolean
    latest: string
    url: string
  }
}

// Action 类型
type Action =
  | { type: 'SET_CONNECTIONS'; payload: Connection[] }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'ADD_TAB'; payload: Tab }
  | { type: 'REMOVE_TAB'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'UPDATE_TAB'; payload: { id: string; updates: Partial<Tab> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTH'; payload: Auth }
  | { type: 'SET_LICENSE'; payload: License }
  | { type: 'SET_PRO_MODAL'; payload: boolean }
  | { type: 'SET_COMMAND_LIBRARY'; payload: boolean }

// Reducer
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CONNECTIONS':
      return { ...state, connections: action.payload }
    case 'SET_GROUPS':
      return { ...state, groups: action.payload }
    case 'ADD_TAB':
      return { ...state, tabs: [...state.tabs, action.payload] }
    case 'REMOVE_TAB':
      return {
        ...state,
        tabs: state.tabs.filter((t) => t.id !== action.payload),
        activeTabId: state.activeTabId === action.payload
          ? state.tabs[0]?.id ?? null
          : state.activeTabId
      }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTabId: action.payload }
    case 'UPDATE_TAB':
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        )
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_AUTH':
      return { ...state, auth: action.payload }
    case 'SET_LICENSE':
      return { ...state, license: action.payload }
    case 'SET_PRO_MODAL':
      return { ...state, proModalOpen: action.payload }
    case 'SET_COMMAND_LIBRARY':
      return { ...state, commandLibraryOpen: action.payload }
    default:
      return state
  }
}

// 初始状态
const initialState: AppState = {
  connections: [],
  groups: [],
  tabs: [],
  activeTabId: null,
  loading: false,
  error: null,
  auth: { userId: '', tier: 'guest', provider: 'offline' },
  license: { tier: 'free' },
  proModalOpen: false,
  commandLibraryOpen: false
}

// Context
interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  // 常用 action 的封装
  openProModal: () => void
  closeProModal: () => void
  toggleCommandLibrary: () => void
  openTab: (tab: Tab) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // 常用操作的封装
  const openProModal = useCallback(() => dispatch({ type: 'SET_PRO_MODAL', payload: true }), [])
  const closeProModal = useCallback(() => dispatch({ type: 'SET_PRO_MODAL', payload: false }), [])
  const toggleCommandLibrary = useCallback(() => dispatch({ type: 'SET_COMMAND_LIBRARY', payload: !state.commandLibraryOpen }), [state.commandLibraryOpen])

  const openTab = useCallback((tab: Tab) => {
    const exists = state.tabs.find((t) => t.id === tab.id)
    if (!exists) {
      dispatch({ type: 'ADD_TAB', payload: tab })
    }
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })
  }, [state.tabs])

  const closeTab = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TAB', payload: id })
  }, [])

  const setActiveTab = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: id })
  }, [])

  const value: AppContextValue = {
    state,
    dispatch,
    openProModal,
    closeProModal,
    toggleCommandLibrary,
    openTab,
    closeTab,
    setActiveTab
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Hook
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

// 使用示例
/*
function MyComponent() {
  const { state, openTab, closeTab } = useApp()

  const handleOpenConnection = (conn: Connection) => {
    openTab({
      id: `tab-${conn.id}`,
      type: conn.connection_type as Tab['type'],
      title: conn.name,
      connection_id: conn.id
    })
  }

  return (
    <div>
      {state.tabs.map(tab => (
        <div key={tab.id} onClick={() => closeTab(tab.id)}>
          {tab.title}
        </div>
      ))}
    </div>
  )
}
*/
```

## 设计原则

1. **单一 reducer** - 所有状态变更通过一个 reducer 管理
2. **派生状态不存** - 如 isPro = license.tier === 'pro' 在组件中计算
3. **封装常用操作** - 在 Provider 中封装 openTab、closeTab 等高频操作
4. **类型安全** - 每个 action 有明确的类型定义
