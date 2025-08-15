"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRefresh?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRefresh,
}: DataTableProps<TData, TValue>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const toggleRowExpansion = (rowId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Define which columns to show on mobile (first 2-3 most important ones)
  const getMobileColumns = () => {
    return columns.slice(0, 3); // Show first 3 columns on mobile
  };

  const getHiddenColumnsData = (row: any) => {
    const hiddenColumns = columns.slice(3); // Columns 4+ are hidden on mobile
    return hiddenColumns.map((column, index) => ({
      key: index,
      header: typeof column.header === 'function' 
        ? 'Details' 
        : column.header as string,
      content: column.cell 
        ? flexRender(column.cell, row.getVisibleCells()[index + 3]?.getContext() ?? row.getContext())
        : null
    }));
  };

  return (
    <div className="data-table">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <Table className="shad-table min-w-full">
          <TableHeader className="bg-dark-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="shad-table-row-header">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap px-4 py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="shad-table-row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden overflow-x-auto">
        <Table className="shad-table min-w-full">
          <TableHeader className="bg-dark-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="shad-table-row-header">
                {headerGroup.headers.slice(0, 4).map((header) => {
                  return (
                    <TableHead key={header.id} className="px-3 py-2 text-sm">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="shad-table-row"
                >
                  {row.getVisibleCells().slice(0, 4).map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const isExpanded = expandedRows.has(row.id);
            const hiddenData = getHiddenColumnsData(row);
            
            return (
              <div key={row.id} className="bg-dark-200 rounded-lg p-4 space-y-3">
                {/* Main visible content */}
                <div className="space-y-2">
                  {row.getVisibleCells().slice(0, 3).map((cell, index) => (
                    <div key={cell.id} className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-400">
                        {typeof columns[index].header === 'function' 
                          ? `Field ${index + 1}` 
                          : columns[index].header as string}:
                      </span>
                      <div className="text-sm text-right max-w-[60%]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expand/Collapse Button for additional info */}
                {hiddenData.length > 0 && (
                  <button
                    onClick={() => toggleRowExpansion(row.id)}
                    className="flex items-center justify-center w-full py-2 text-sm text-blue-400 hover:text-blue-300 border-t border-dark-300 mt-3 pt-3"
                  >
                    {isExpanded ? (
                      <>
                        Show Less <ChevronUp className="ml-1 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Show More <ChevronDown className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </button>
                )}

                {/* Expandable content */}
                {isExpanded && hiddenData.length > 0 && (
                  <div className="space-y-2 border-t border-dark-300 pt-3 mt-3">
                    {row.getVisibleCells().slice(3).map((cell, index) => (
                      <div key={cell.id} className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-400">
                          {typeof columns[index + 3].header === 'function' 
                            ? `Field ${index + 4}` 
                            : columns[index + 3].header as string}:
                        </span>
                        <div className="text-sm text-right max-w-[60%]">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-dark-200 rounded-lg p-8 text-center">
            <p className="text-gray-400">No results found.</p>
          </div>
        )}
      </div>

      {/* Responsive Pagination */}
      <div className="table-actions mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Page Info */}
          <div className="text-sm text-gray-400 order-2 sm:order-1">
            <span className="hidden sm:inline">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              of {table.getFilteredRowModel().rows.length} results
            </span>
            <span className="sm:hidden">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="shad-gray-btn"
            >
              <Image
                src="/assets/icons/arrow.svg"
                width={20}
                height={20}
                alt="previous"
                className="sm:w-6 sm:h-6"
              />
              <span className="hidden sm:inline ml-2">Previous</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="shad-gray-btn"
            >
              <span className="hidden sm:inline mr-2">Next</span>
              <Image
                src="/assets/icons/arrow.svg"
                width={20}
                height={20}
                alt="next"
                className="rotate-180 sm:w-6 sm:h-6"
              />
            </Button>
          </div>
        </div>

        {/* Page Size Selector for larger screens */}
        <div className="hidden md:flex items-center justify-center mt-4">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="bg-dark-200 text-white rounded px-3 py-1 text-sm border border-dark-300"
          >
            {[5, 10, 20, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}