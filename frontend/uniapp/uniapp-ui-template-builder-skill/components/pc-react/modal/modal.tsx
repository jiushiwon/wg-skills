import React from 'react'
import './modal.css'

export interface ModalProps {
  open: boolean
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  onOk?: () => void
  onCancel?: () => void
  okText?: string
  cancelText?: string
  /** 风格：default-默认 | elegant-优雅 | gradient-深色科技 */
  theme?: 'default' | 'elegant' | 'gradient'
}

export default function Modal(props: ModalProps) {
  const {
    open,
    title,
    children,
    footer,
    onOk,
    onCancel,
    okText = '确认',
    cancelText = '取消',
    theme = 'default'
  } = props

  if (!open) {
    return null
  }

  const handleMaskClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel?.()
    }
  }

  return (
    <div className={`modal-mask modal-theme-${theme}`} onClick={handleMaskClick}>
      <div className="modal-dialog" role="dialog" aria-modal={true}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button type="button" className="modal-close" aria-label="关闭" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer !== undefined ? (
          <div className="modal-footer">{footer}</div>
        ) : (
          <div className="modal-footer">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={onCancel}>{cancelText}</button>
            <button type="button" className="modal-btn modal-btn-ok" onClick={onOk}>{okText}</button>
          </div>
        )}
      </div>
    </div>
  )
}
