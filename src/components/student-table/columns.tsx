import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash2, ArrowUpDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

export interface Student {
  studentId: number
  studentCode: string
  fullName: string
  classCode: string
  dateOfBirth: number[]
  address: string
  gender: 'MALE' | 'FEMALE'
  enrollmentDate: number[]
  emergencyContact: string
  emergencyPhone: string
  status: 'ACTIVE' | 'INACTIVE'
  avatar: string | null
}

interface ColumnsProps {
  onEdit: (student: Student) => void
  onDelete: (student: Student) => void
}

export const createStudentColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Student>[] => [
  {
    accessorKey: 'studentCode',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 justify-start px-2 text-left font-semibold text-gray-700 hover:bg-gray-100"
        >
          Mã học sinh
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('studentCode')}</div>
    }
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 justify-start px-2 text-left font-semibold text-gray-700 hover:bg-gray-100"
        >
          Họ và tên
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('fullName')}</div>
    }
  },
  {
    accessorKey: 'classCode',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 justify-start px-2 text-left font-semibold text-gray-700 hover:bg-gray-100"
        >
          Lớp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div>{row.getValue('classCode')}</div>
    }
  },
  {
    accessorKey: 'dateOfBirth',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 justify-start px-2 text-left font-semibold text-gray-700 hover:bg-gray-100"
        >
          Ngày sinh
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.getValue('dateOfBirth') as number[]
      const dateB = rowB.getValue('dateOfBirth') as number[]

      if (!dateA || dateA.length !== 3) return 1
      if (!dateB || dateB.length !== 3) return -1

      const [yearA, monthA, dayA] = dateA
      const [yearB, monthB, dayB] = dateB

      const dateObjA = new Date(yearA, monthA - 1, dayA)
      const dateObjB = new Date(yearB, monthB - 1, dayB)

      return dateObjA.getTime() - dateObjB.getTime()
    },
    cell: ({ row }) => {
      const dateArray = row.getValue('dateOfBirth') as number[]
      if (dateArray && dateArray.length === 3) {
        const [year, month, day] = dateArray
        return <div>{`${day}/${month}/${year}`}</div>
      }
      return <div>N/A</div>
    }
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 justify-start px-2 text-left font-semibold text-gray-700 hover:bg-gray-100"
        >
          Giới tính
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const gender = row.getValue('gender') as string
      return <Badge variant={gender === 'MALE' ? 'default' : 'secondary'}>{gender === 'MALE' ? 'Nam' : 'Nữ'}</Badge>
    }
  },
  {
    accessorKey: 'emergencyPhone',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 justify-start px-2 text-left font-semibold text-gray-700 hover:bg-gray-100"
        >
          Số điện thoại khẩn cấp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div>{row.getValue('emergencyPhone') || 'N/A'}</div>
    }
  },
  {
    accessorKey: 'emergencyContact',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 justify-start px-2 text-left font-semibold text-gray-700 hover:bg-gray-100"
        >
          Liên hệ khẩn cấp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div>{row.getValue('emergencyContact') || 'N/A'}</div>
    }
  },
  {
    accessorKey: 'status',
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
      const status = row.getValue('status') as string
      return (
        <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
          {status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
        </Badge>
      )
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const student = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(student)}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(student)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
