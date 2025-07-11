'use client'

import { ColumnDef } from '@tanstack/react-table'
import { User } from '@/types/user'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Edit, Trash2, Undo2, MoreHorizontal, Copy, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface ColumnsProps {
  onEdit: (user: User) => void
  onSoftDelete: (user: User) => void
  onRestore: (user: User) => void
  onHardDelete: (user: User) => void
}

export const createColumns = ({ onEdit, onSoftDelete, onRestore, onHardDelete }: ColumnsProps): ColumnDef<User>[] => [
  {
    accessorKey: 'fullName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 justify-start px-2 text-left font-semibold text-gray-700 hover:bg-gray-100"
        >
          Tên
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="px-2 font-medium text-gray-900">{row.getValue('fullName')}</div>
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 justify-start px-2 text-left font-semibold text-gray-700 hover:bg-gray-100"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="px-2 text-gray-600">{row.getValue('email')}</div>
  },
  {
    accessorKey: 'phone',
    header: () => <div className="px-2 font-semibold text-gray-700">Số điện thoại</div>,
    cell: ({ row }) => <div className="px-2 text-gray-600">{row.getValue('phone') || '-'}</div>
  },
  {
    accessorKey: 'role',
    header: () => <div className="px-2 font-semibold text-gray-700">Vai trò</div>,
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      const roleColors = {
        ADMIN: 'destructive',
        MANAGER: 'secondary',
        NURSE: 'default',
        PARENT: 'outline'
      } as const

      return (
        <div className="px-2">
          <Badge variant={roleColors[role as keyof typeof roleColors]}>{role}</Badge>
        </div>
      )
    }
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 justify-start px-2 text-left font-semibold text-gray-700 hover:bg-gray-100"
        >
          Trạng thái
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original
      if (!user.isActive) {
        return (
          <div className="px-2">
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-muted-foreground px-1.5">
                  <XCircle className="mr-1 h-4 w-4 fill-red-500 text-white" />
                  Đã xóa
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đã xóa lúc {user.deletedAt ? new Date(user.deletedAt).toLocaleString('vi-VN') : 'N/A'}</p>
                <p>Lý do: {user.deleteReason || 'Không có'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )
      }
      return (
        <div className="px-2">
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            <CheckCircle className="mr-1 h-4 w-4 fill-green-500 text-gray-800" />
            Hoạt động
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 justify-start px-2 text-left font-semibold text-gray-700 hover:bg-gray-100"
        >
          Ngày tạo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt')

      // Debug logging
      console.log('CreatedAt raw value:', createdAt)
      console.log('CreatedAt type:', typeof createdAt)

      if (!createdAt || createdAt === null || createdAt === undefined) {
        console.log('CreatedAt is null/undefined/empty')
        return (
          <div className="px-2">
            <div className="text-sm">
              <div className="font-medium text-gray-400">--</div>
              <div className="text-xs text-gray-300">Chưa có</div>
            </div>
          </div>
        )
      }

      try {
        let date: Date

        // Check if createdAt is an array (Java LocalDateTime format)
        if (Array.isArray(createdAt) && createdAt.length >= 6) {
          // Array format: [year, month, day, hour, minute, second, nanosecond]
          const [year, month, day, hour, minute, second, nanosecond = 0] = createdAt

          // Convert nanoseconds to milliseconds
          const millisecond = Math.floor(nanosecond / 1000000)

          // Note: month in Java is 1-indexed, but JavaScript Date is 0-indexed
          date = new Date(year, month - 1, day, hour, minute, second, millisecond)

          console.log('Parsed from array:', { year, month, day, hour, minute, second, nanosecond, millisecond })
        } else if (typeof createdAt === 'string') {
          // String format
          date = new Date(createdAt)
        } else if (typeof createdAt === 'number') {
          // Timestamp format
          date = new Date(createdAt)
        } else {
          // Invalid format
          console.log('Unknown createdAt format:', createdAt)
          return (
            <div className="px-2">
              <div className="text-sm">
                <div className="font-medium text-gray-400">--</div>
                <div className="text-xs text-gray-300">Format không hỗ trợ</div>
              </div>
            </div>
          )
        }

        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.log('Invalid date created from:', createdAt)
          return (
            <div className="px-2">
              <div className="text-sm">
                <div className="font-medium text-gray-400">--</div>
                <div className="text-xs text-gray-300">Ngày không hợp lệ</div>
              </div>
            </div>
          )
        }

        const formattedDate = date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
        const formattedTime = date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        })

        console.log('Formatted date:', formattedDate, 'time:', formattedTime)

        return (
          <div className="px-2">
            <div className="text-sm">
              <div className="font-medium text-gray-900">{formattedDate}</div>
              <div className="text-xs text-gray-500">{formattedTime}</div>
            </div>
          </div>
        )
      } catch (error) {
        console.error('Error parsing date:', error, 'Raw value:', createdAt)
        return (
          <div className="px-2">
            <div className="text-sm">
              <div className="font-medium text-gray-400">--</div>
              <div className="text-xs text-gray-300">Lỗi format</div>
            </div>
          </div>
        )
      }
    }
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className="px-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Sửa
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                <Copy className="mr-2 h-4 w-4" />
                Sao chép email
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {user.isActive ? (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onSoftDelete(user)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => onRestore(user)}>
                    <Undo2 className="mr-2 h-4 w-4" />
                    Khôi phục
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onHardDelete(user)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa vĩnh viễn
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  }
]
