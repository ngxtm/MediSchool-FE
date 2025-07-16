import { toast, Zoom } from 'react-toastify'

export const successToast = (message, position = 'top-right', timeClose = 3000) => {
  toast.success(message, {
    position: position,
    autoClose: timeClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: 'light',
    transition: Zoom
  })
}

export const errorToast = (message, position = 'top-right', timeClose = 3000) => {
  toast.error(message, {
    position: position,
    autoClose: timeClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: 'light',
    transition: Zoom
  })
}

export const pendingToast = (message, position = 'top-right') => {
  return toast.loading(message, {
    position: position,
    closeOnClick: false,
    draggable: false,
    theme: 'light',
    transition: Zoom
  })
}

export default successToast
