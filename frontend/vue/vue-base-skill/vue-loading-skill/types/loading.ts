// Loading 类型定义

export type LoadingType = 'spin' | 'dots' | 'pulse'

export type SkeletonType = 'avatar' | 'paragraph' | 'table' | 'card'

export interface LoadingProps {
  type?: LoadingType
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export interface SkeletonProps {
  type?: SkeletonType
  rows?: number
  columns?: number
  avatarShape?: 'circle' | 'square'
  animated?: boolean
}

export interface LoadingMaskProps {
  visible: boolean
  text?: string
  fullscreen?: boolean
  transparent?: boolean
}
