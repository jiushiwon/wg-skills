import React from 'react'
import './button.css'

export interface ButtonProps {
  /** 按钮类型 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 风格主题：default-默认 | elegant-优雅 | gradient-渐变 */
  theme?: 'default' | 'elegant' | 'gradient'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 是否占满宽度 */
  block?: boolean
  /** 子元素 */
  children: React.ReactNode
  /** 点击事件 */
  onClick?: (event: React.MouseEvent) => void
  /** 按钮类型 */
  type?: 'button' | 'submit' | 'reset'
  className?: string
  style?: React.CSSProperties
}

export default function Button({
  variant = 'primary',
  size = 'md',
  theme = 'default',
  disabled = false,
  loading = false,
  block = false,
  children,
  onClick,
  type = 'button',
  className = '',
  style
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    `btn-theme-${theme}`,
    block ? 'btn-block' : '',
    loading ? 'btn-loading' : '',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      style={style}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      <span className="btn-text">{children}</span>
    </button>
  )
}
