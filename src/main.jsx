import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/index.css';
import { AuthContextProvider } from './context/AuthContext';
import { RouterProvider } from 'react-router-dom';
import router from './utils/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
          <RouterProvider router={router}/>
          <ToastContainer />
      </AuthContextProvider>
    </QueryClientProvider>
  </StrictMode>,
)
