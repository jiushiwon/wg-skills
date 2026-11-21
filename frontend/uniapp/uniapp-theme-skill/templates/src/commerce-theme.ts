import { ref } from 'vue'
export type CommerceThemeId = 'coral' | 'forest' | 'ink'
export const commerceThemes = [
  {
    "id": "coral",
    "name": "珊瑚优选",
    "primary": "#C2410C",
    "secondary": "#1D4ED8",
    "bg": "#FFF7ED",
    "radius": "24rpx",
    "gap": "16rpx",
    "gutter": "24rpx",
    "layout": "grid",
    "scene": "生活好物 / 品牌零售"
  },
  {
    "id": "forest",
    "name": "森林日常",
    "primary": "#15803D",
    "secondary": "#DCFCE7",
    "bg": "#FFFFFF",
    "radius": "16rpx",
    "gap": "16rpx",
    "gutter": "20rpx",
    "layout": "category",
    "scene": "家居 / 户外 / 有机生活"
  },
  {
    "id": "ink",
    "name": "都市黑标",
    "primary": "#18181B",
    "secondary": "#FACC15",
    "bg": "#F4F4F5",
    "radius": "20rpx",
    "gap": "16rpx",
    "gutter": "20rpx",
    "layout": "waterfall",
    "scene": "数码 / 潮流 / 简洁品牌"
  }
] as const
// 应用级单一状态。项目有 Pinia 时合并到其设置 store，不能每页创建一份。
export const commerceThemeId = ref<CommerceThemeId>('coral')
export function setCommerceTheme(id: string) {
  if (commerceThemes.some(item => item.id === id)) commerceThemeId.value = id as CommerceThemeId
}
