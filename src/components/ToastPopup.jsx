import { toast, Zoom } from "react-toastify";

export const successToast = (message, position = "top-right") => {
    toast.success(message, {
        position: position,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Zoom,
    });
};


export const errorToast = (message, position = "top-right") => {
    toast.error(message, {
        position: position,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Zoom,
    });
};

export default successToast;