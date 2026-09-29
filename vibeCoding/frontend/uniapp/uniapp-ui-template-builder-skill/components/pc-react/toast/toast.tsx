import React, { useEffect, useState } from 'react'
import './toast.css'

export type ToastType = 'success' | 'error' | 'info' | 'warning'
export type ToastPosition = 'top-right' | 'top-center' | 'bottom-right'

const ICON = {
  success: '✓',
  error: '✕',
  info: 'i',
  warning: '!'
} as const

export interface ToastProps {
  message: string
  type?: ToastType
  position?: ToastPosition
  duration?: number
  onClose?: () => void
}

export default function Toast(props: ToastProps) {
  const {
    message,
    type = 'info',
    position = 'top-right',
    duration = 3000,
    onClose
  } = props

  const [show, setShow] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (duration <= 0) return
    const hide = setTimeout(() => setShow(false), Math.max(duration - 200, 0))
    const remove = setTimeout(() => onClose?.(), duration)
    return () => {
      clearTimeout(hide)
      clearTimeout(remove)
    }
  }, [duration, onClose])

  return (
    <div
      className={`toast toast-${type} toast-${position} ${show ? 'toast-show' : ''}`}
    >
      <span className="toast-icon" aria-hidden="true">
        {ICON[type]}
      </span>
      <span className="toast-message">{message}</span>
    </div>
  )
}
