import * as React from 'react'
import { BookOpen, Home, LifeBuoy, SquareTerminal, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import logoNoText from '../assets/logo-notext.png'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Trang chủ',
      url: '/admin',
      icon: Home
    },
    {
      title: 'Bảng điều khiển',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Lịch sử đăng nhập',
          url: '/admin/login-history'
        },
        {
          title: 'Gửi email',
          url: '/admin/email-sending'
        },
        {
          title: 'Xuất pdf',
          url: '/admin/pdf-export'
        }
      ]
    },
    {
      title: 'Quản lý người dùng',
      url: '/admin/user-management',
      icon: Users,
      isActive: true,
      items: [
        {
          title: 'Tài khoản',
          url: '/admin/user-management'
        },
        {
          title: 'Học sinh',
          url: '/admin/student-management'
        },
        {
          title: 'Phụ huynh - Học sinh',
          url: '/admin/parent-student-management'
        }
      ]
    },
    {
      title: 'Tài liệu hướng dẫn',
      url: '#',
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: 'Hướng dẫn sử dụng',
          url: '/admin/user-guide'
        },
        {
          title: 'API Documentation',
          url: '/admin/api-documentation'
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: 'Hỗ trợ',
      url: '#',
      icon: LifeBuoy
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin">
                <div className="flex aspect-square size-12 items-center justify-center">
                  <img src={logoNoText} alt="Medischool" className="size-10 object-contain" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Medischool</span>
                  <span className="truncate text-xs">Admin Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
