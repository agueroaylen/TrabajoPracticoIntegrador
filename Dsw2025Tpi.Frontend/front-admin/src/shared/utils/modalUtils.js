import React from 'react'
import { createRoot } from 'react-dom/client'
import AlertModal from '../components/AlertModal'
import ConfirmModal from '../components/ConfirmModal'

// Función para mostrar alertas
export const showAlert = (message, title = 'Información', type = 'info') => {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    const handleClose = () => {
      root.unmount()
      setTimeout(() => {
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }, 100)
      resolve()
    }

    root.render(
      React.createElement(AlertModal, {
        isOpen: true,
        onClose: handleClose,
        title: title,
        message: message,
        type: type
      })
    )
  })
}

// Función para mostrar confirmaciones
export const showConfirm = (message, title = 'Confirmar', confirmText = 'Confirmar', cancelText = 'Cancelar') => {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    const handleClose = () => {
      root.unmount()
      setTimeout(() => {
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }, 100)
      resolve(false)
    }

    const handleConfirm = () => {
      root.unmount()
      setTimeout(() => {
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }, 100)
      resolve(true)
    }

    root.render(
      React.createElement(ConfirmModal, {
        isOpen: true,
        onClose: handleClose,
        onConfirm: handleConfirm,
        title: title,
        message: message,
        confirmText: confirmText,
        cancelText: cancelText
      })
    )
  })
}

// Funciones de conveniencia
export const alertSuccess = (message, title = 'Éxito') => showAlert(message, title, 'success')
export const alertError = (message, title = 'Error') => showAlert(message, title, 'error')
export const alertWarning = (message, title = 'Advertencia') => showAlert(message, title, 'warning')
export const alertInfo = (message, title = 'Información') => showAlert(message, title, 'info')

