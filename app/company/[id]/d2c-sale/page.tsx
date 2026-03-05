"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from "@tanstack/react-table";
import { Input, Button, Card, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { useParams, useRouter } from "next/navigation";

import {
  SearchOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

interface D2CSale {
  id: number;
  sale_date: string;
  warranty_till: number;
  customer: {
    id: number;
    name: string;
    contact1: string;
  };
  product: {
    id: number;
    name: string;
  };
}

interface GetPaginatedSalesResponse {
  getPaginatedSales: {
    skip: number;
    take: number;
    total: number;
    data: D2CSale[];
  };
}

interface SearchPaginationInput {
  skip: number;
  take: number;
  search?: string;
}

const GET_PAGINATED_D2C_SALES = `
  query GetPaginatedSales(
    $searchPaginationInput: SearchPaginationInput!
    $whereSearchInput: WhereSalesSearchInput!
  ) {
    getPaginatedSales(
      searchPaginationInput: $searchPaginationInput
      whereSearchInput: $whereSearchInput
    ) {
      skip
      take
      total
      data {
        id
        sale_date
        warranty_till
        customer {
          id
          name
          contact1
        }
        product {
          id
          name
        }
      }
    }
  }
`;

const fetchD2CSales = async (
  companyId: number,
  input: SearchPaginationInput
): Promise<{
  skip: number;
  take: number;
  total: number;
  data: D2CSale[];
}> => {
  const response = await ApiCall<GetPaginatedSalesResponse>({
    query: GET_PAGINATED_D2C_SALES,
    variables: {
      searchPaginationInput: input,
      whereSearchInput: {
        company_id: companyId,
        dealer_id: companyId,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getPaginatedSales;
};

const D2CSalesPage = () => {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);

  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const searchInput: SearchPaginationInput = {
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
    ...(globalFilter && { search: globalFilter }),
  };

  const {
    data: salesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["d2cSales", companyId, searchInput],
    queryFn: () => fetchD2CSales(companyId, searchInput),
    placeholderData: (previousData) => previousData,
    enabled: !!companyId,
  });

  const columnHelper = createColumnHelper<D2CSale>();

  const columns = useMemo<ColumnDef<D2CSale, any>[]>(
    () => [
      columnHelper.accessor("id", {
        header: "Sale ID",
        cell: (info) => (
          <div className="flex items-center">
            <div className="shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 font-semibold text-xs">
                #{info.getValue()}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{info.getValue()}</div>
              <div className="text-xs text-gray-500">Sale ID</div>
            </div>
          </div>
        ),
        size: 120,
      }),
      columnHelper.accessor("product.name", {
        header: "Product",
        cell: (info) => (
          <div>
            <div className="font-semibold text-gray-900">{info.getValue()}</div>
            <div className="text-xs text-gray-500">ID: {info.row.original.product.id}</div>
          </div>
        ),
        size: 200,
      }),
      columnHelper.accessor("customer.name", {
        header: "Customer",
        cell: (info) => (
          <div>
            <div className="font-semibold text-gray-900">{info.getValue()}</div>
            <div className="text-xs text-gray-500">
              {info.row.original.customer.contact1}
            </div>
          </div>
        ),
        size: 180,
      }),
      columnHelper.accessor("warranty_till", {
        header: "Warranty",
        cell: (info) => (
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ⏱️ {info.getValue()} days
            </span>
          </div>
        ),
        size: 130,
      }),
      columnHelper.accessor("sale_date", {
        header: "Sale Date",
        cell: (info) => (
          <div>
            <div className="font-medium text-gray-900">
              {new Date(info.getValue()).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(info.getValue()).toLocaleTimeString()}
            </div>
          </div>
        ),
        size: 140,
      }),
    ],
    [columnHelper]
  );

  const filteredData = useMemo(() => {
    if (!salesData?.data) return [];
    return [...salesData.data];
  }, [salesData]);

  const table = useReactTable({
    data: filteredData,
    columns,
    pageCount: salesData ? Math.ceil(salesData.total / pagination.pageSize) : -1,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    debugTable: true,
  });

  const handleSearch = (value: string) => {
    setGlobalFilter(value);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleBack = () => {
    router.push(`/company/${companyId}`);
  };

  const handleAddD2CSale = () => {
    router.push(`/company/${companyId}/sale/add-d2c`);
  };

  if (isError) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button onClick={handleRefresh} type="primary">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                type="text"
                className="hover:bg-gray-50"
              >
                Back to Company
              </Button>
              <div>
                <Title level={3} className="mb-0! text-gray-900">
                  D2C Sales
                </Title>
                <p className="text-gray-500 mt-1">Company direct-to-customer sales</p>
              </div>
            </div>
            <Button
              type="primary"
              onClick={handleAddD2CSale}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
            >
              Add D2C Sale
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Search D2C sales..."
              prefix={<SearchOutlined />}
              value={globalFilter ?? ""}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-64"
              size="large"
              allowClear
            />

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  setPagination({
                    ...pagination,
                    pageSize: Number(e.target.value),
                    pageIndex: 0,
                  });
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="ml-auto">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
                size="large"
                className="hover:bg-gray-50"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading D2C sales...</span>
            </div>
          )}

          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="bg-gray-50 border-b border-gray-200">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left px-6 py-4 font-semibold text-gray-900 text-sm uppercase tracking-wider"
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`transition-colors duration-200 hover:bg-blue-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredData.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🧾</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No D2C sales found</h3>
                  <p className="text-gray-500">No direct-to-customer sales have been created yet</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{pagination.pageIndex * pagination.pageSize + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min((pagination.pageIndex + 1) * pagination.pageSize, salesData?.total || 0)}
              </span>{" "}
              of <span className="font-medium">{salesData?.total || 0}</span> sales
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} size="small">
                First
              </Button>
              <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} size="small">
                Previous
              </Button>

              <span className="flex items-center gap-2 px-3 py-1 bg-white rounded border">
                <span className="text-sm">Page</span>
                <span className="font-semibold text-blue-600">{table.getState().pagination.pageIndex + 1}</span>
                <span className="text-sm">of</span>
                <span className="font-semibold">{table.getPageCount()}</span>
              </span>

              <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} size="small">
                Next
              </Button>
              <Button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                size="small"
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default D2CSalesPage;
