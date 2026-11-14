export type Scenario = 'simple' | 'service' | 'commerce' | 'enterprise' | 'member'
export type PageState = 'ready' | 'loading' | 'error' | 'guest' | 'empty'
export interface ProfileAction { id: string; label: string; icon: string; description?: string; badge?: number }
export interface ProfileStat extends ProfileAction { value: string }
export interface ProfileProduct { id: string; name: string; image: string; price: string; unit: string }
export interface ProfileData {
  scenario: Scenario; title: string; theme: string; nickname: string; subtitle: string; avatar: string;
  stats: ProfileStat[]; menus: ProfileAction[]; tools: ProfileAction[]; orders: ProfileAction[];
  products: ProfileProduct[]; organization: string; appointment: string; orderTitle: string; orderStatus: string;
  memberLevel: string; points: number; progress: number; checkedIn: boolean;
}
