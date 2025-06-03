import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/index.css';
import { AuthContextProvider } from './context/AuthContext';
import { RouterProvider } from 'react-router-dom';
import router from './router';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
        <RouterProvider router={router}/>
    </AuthContextProvider>
  </StrictMode>,
)
