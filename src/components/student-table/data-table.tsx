import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import type { Student } from './columns'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchText: string
  onSearchChange: (value: string) => void
  includeInactive: boolean
  onIncludeInactiveChange: (value: boolean) => void
  onCreateStudent: () => void
  onImportExcel: () => void
  loading?: boolean
}

const LoadingSkeleton = React.memo(() => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index} className="border-b border-gray-100">
        {Array.from({ length: 6 }).map((_, colIndex) => (
          <TableCell key={colIndex} className="h-14 px-2">
            <div className="px-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
            </div>
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
))

LoadingSkeleton.displayName = 'LoadingSkeleton'

const PaginationButtons = React.memo(({ table, loading }: { table: any; loading: boolean }) => (
  <div className="ml-auto flex items-center gap-2 lg:ml-0">
    <Button
      variant="outline"
      className="hidden h-8 w-8 p-0 lg:flex"
      onClick={() => table.setPageIndex(0)}
      disabled={!table.getCanPreviousPage() || loading}
    >
      <span className="sr-only">Đi đến trang đầu</span>
      <ChevronsLeft />
    </Button>
    <Button
      variant="outline"
      className="size-8"
      size="icon"
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage() || loading}
    >
      <span className="sr-only">Trang trước</span>
      <ChevronLeft />
    </Button>
    <Button
      variant="outline"
      className="size-8"
      size="icon"
      onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage() || loading}
    >
      <span className="sr-only">Trang sau</span>
      <ChevronRight />
    </Button>
    <Button
      variant="outline"
      className="hidden size-8 lg:flex"
      size="icon"
      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
      disabled={!table.getCanNextPage() || loading}
    >
      <span className="sr-only">Đi đến trang cuối</span>
      <ChevronsRight />
    </Button>
  </div>
))

PaginationButtons.displayName = 'PaginationButtons'

export const DataTable = React.memo(
  <TData extends Student, TValue>({
    columns,
    data,
    searchText,
    onSearchChange,
    includeInactive,
    onIncludeInactiveChange,
    onCreateStudent,
    onImportExcel,
    loading = false
  }: DataTableProps<TData, TValue>) => {
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({
      pageIndex: 0,
      pageSize: 10
    })

    const table = useReactTable({
      data,
      columns,
      state: {
        sorting,
        columnVisibility,
        rowSelection,
        columnFilters,
        pagination
      },
      getRowId: row => row.studentId.toString(),
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues()
    })

    const handleSearchChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(event.target.value)
      },
      [onSearchChange]
    )

    const handleIncludeInactiveChange = React.useCallback(
      (checked: boolean) => {
        onIncludeInactiveChange(checked)
      },
      [onIncludeInactiveChange]
    )

    const handlePageSizeChange = React.useCallback(
      (value: string) => {
        table.setPageSize(Number(value))
      },
      [table]
    )

    const pageSizeOptions = React.useMemo(() => [10, 20, 30, 40, 50], [])

    const selectedRowCount = React.useMemo(() => table.getFilteredSelectedRowModel().rows.length, [table])
    const totalRowCount = React.useMemo(() => table.getFilteredRowModel().rows.length, [table])

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Tìm kiếm học sinh..."
              value={searchText}
              onChange={handleSearchChange}
              className="max-w-sm"
              disabled={loading}
            />
            <div className="flex items-center space-x-2">
              <Switch
                id="include-inactive"
                checked={includeInactive}
                onCheckedChange={handleIncludeInactiveChange}
                disabled={loading}
              />
              <Label htmlFor="include-inactive">
                {includeInactive ? 'Hiện tất cả học sinh' : 'Chỉ hiện học sinh hoạt động'}
              </Label>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onImportExcel} className="ml-auto hidden h-8 lg:flex">
              <Download className="mr-2 h-4 w-4" />
              Import Excel
            </Button>
            <Button size="sm" onClick={onCreateStudent} className="ml-auto hidden h-8 lg:flex">
              <Plus className="mr-2 h-4 w-4" />
              Thêm học sinh
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border bg-white">
          <Table>
            <TableHeader className="bg-gray-50/80">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="border-b border-gray-200">
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="h-12 bg-gray-50/80 px-2 text-left font-semibold text-gray-700"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <LoadingSkeleton />
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="h-14 border-b border-gray-100 transition-colors hover:bg-gray-50/50"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="px-2 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                    {loading ? 'Đang tải...' : 'Không có học sinh nào.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {selectedRowCount} trong {totalRowCount} hàng được chọn.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Số hàng mỗi trang
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={handlePageSizeChange}
                disabled={loading}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map(pageSize => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Trang {table.getState().pagination.pageIndex + 1} trong {table.getPageCount()}
            </div>
            <PaginationButtons table={table} loading={loading} />
          </div>
        </div>
      </div>
    )
  }
)

DataTable.displayName = 'DataTable'
