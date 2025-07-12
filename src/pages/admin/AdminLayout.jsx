// import { createClient } from "@supabase/supabase-js";
// import { useState } from "react";
// import { toast } from "react-toastify";
// import { Zoom } from "react-toastify";
import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import AdminTaskbar from './components/AdminTaskbar'
import { Outlet } from 'react-router-dom'
const AdminLayout = () => {
  // const adminSupabase = createClient(
  // 	import.meta.env.VITE_SUPABASE_URL,
  // 	import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  // 	{
  // 		auth: {
  // 			autoRefreshToken: false,
  // 			persistSession: false,
  // 		},
  // 	}
  // );
  // const [userId, setUserId] = useState("");
  // const handleDeleteUser = async () => {
  // 	const { error } = await adminSupabase.auth.admin.deleteUser(userId);
  // 	if (!error) {
  // 		toast.success("User deleted successfully", {
  // 			position: "bottom-center",
  // 			autoClose: 2000,
  // 			hideProgressBar: false,
  // 			closeOnClick: true,
  // 			pauseOnHover: true,
  // 			draggable: true,
  // 			progress: undefined,
  // 			theme: "light",
  // 			transition: Zoom,
  // 		});
  // 	}
  // 	if (error) {
  // 		console.error("Error deleting user:", error);
  // 		toast.error("Error deleting user: " + error.message, {
  // 			position: "bottom-center",
  // 			autoClose: 2000,
  // 			hideProgressBar: false,
  // 			closeOnClick: true,
  // 			pauseOnHover: true,
  // 			draggable: true,
  // 			progress: undefined,
  // 			theme: "light",
  // 			transition: Zoom,
  // 		});
  // 	}
  // };

  return (
    <div className="font-inter">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default AdminLayout
