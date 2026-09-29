import React from 'react'
import './drawer.css'

export interface DrawerProps {
  open: boolean
  placement?: 'left' | 'right'
  title?: string
  width?: number | string
  onClose?: () => void
  children: React.ReactNode
}

export default function Drawer(props: DrawerProps) {
  const {
    open,
    placement = 'right',
    title,
    width = 400,
    onClose,
    children
  } = props

  if (!open) {
    return null
  }

  const style = { width: typeof width === 'number' ? `${width}px` : width }

  return (
    <div className="drawer-root">
      <div className="drawer-mask" onClick={onClose} />
      <div className={`drawer-panel drawer-${placement}`} style={style}>
        <div className="drawer-header">
          <div className="drawer-title">{title}</div>
          <button
            type="button"
            className="drawer-close"
            aria-label="关闭"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  )
}
