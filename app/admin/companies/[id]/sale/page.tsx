"use client";

import React, { useState, useMemo } from "react";
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
import { Input, Button,  Card, Typography, Dropdown } from "antd";
import { useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { useRouter } from "next/navigation";

import {
  SearchOutlined,
  ReloadOutlined,
  MoreOutlined,
  EditOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

// Types for the dealer sales data
interface DealerSale {
  id: number;
  quantity: number;
  batch_number: string;
  sale_date: string;
  dealer: {
    name: string;
  };
  product: {
    id: number;
    name: string;
  };
}

interface GetPaginatedDealerSalesResponse {
  getPaginatedDealerSales: {
    skip: number;
    take: number;
    total: number;
    data: DealerSale[];
  };
}

interface SearchPaginationInput {
  skip: number;
  take: number;
  search?: string;
}

// GraphQL queries
const GET_PAGINATED_DEALER_SALES = `
  query Query(
    $searchPaginationInput: SearchPaginationInput!
    $whereSearchInput: WhereDealerSalesSearchInput!
  ) {
    getPaginatedDealerSales(
      searchPaginationInput: $searchPaginationInput
      whereSearchInput: $whereSearchInput
    ) {
      skip
      take
      total
      data {
        id,
        quantity,
        batch_number,
        sale_date,
        dealer {
          name
        }
        product {
          id
          name,
        }
      }
    }
  }
`;

// API functions
const fetchDealerSales = async (
  companyId: number,
  input: SearchPaginationInput
): Promise<{
  skip: number;
  take: number;
  total: number;
  data: DealerSale[];
}> => {
  const response = await ApiCall<GetPaginatedDealerSalesResponse>({
    query: GET_PAGINATED_DEALER_SALES,
    variables: {
      searchPaginationInput: input,
      whereSearchInput: {
        company_id: companyId,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }


  return response.data.getPaginatedDealerSales;
};

interface DealerSalesPageProps {
  params: {
    id: string;
  };
}

const DealerSalesPage: React.FC<DealerSalesPageProps> = ({ params }) => {
  // Router for navigation
  const router = useRouter();
  const companyId = parseInt(params.id);

  // State management
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Prepare search input for API
  const searchInput: SearchPaginationInput = {
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
    ...(globalFilter && { search: globalFilter }),
  };

  // Fetch data using React Query
  const {
    data: salesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dealerSales", companyId, searchInput],
    queryFn: () => fetchDealerSales(companyId, searchInput),
    placeholderData: (previousData) => previousData,
    enabled: !!companyId,
  });

  // Create column helper
  const columnHelper = createColumnHelper<DealerSale>();

  // Define columns
  const columns = useMemo<ColumnDef<DealerSale, any>[]>( // eslint-disable-line @typescript-eslint/no-explicit-any
    () => [
      columnHelper.accessor("id", {
        header: "Sale ID",
        cell: (info) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
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
      columnHelper.accessor("dealer.name", {
        header: "Dealer",
        cell: (info) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-orange-600 font-semibold text-xs">
                {info.getValue().charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{info.getValue()}</div>
              <div className="text-xs text-gray-500">Dealer</div>
            </div>
          </div>
        ),
        size: 180,
      }),
      columnHelper.accessor("quantity", {
        header: "Quantity",
        cell: (info) => (
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              📦 {info.getValue()} units
            </span>
          </div>
        ),
        size: 120,
      }),
      columnHelper.accessor("batch_number", {
        header: "Batch Number",
        cell: (info) => (
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              🏷️ {info.getValue()}
            </span>
          </div>
        ),
        size: 150,
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
      // Actions column
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const sale = row.original;
          return (
            <div className="flex items-center justify-center">
              <Dropdown
                menu={{
                  items: getActionMenuItems(sale),
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  size="small"
                  className="hover:bg-green-50 hover:text-green-600 rounded-full h-8 w-8 flex items-center justify-center transition-all duration-200"
                />
              </Dropdown>
            </div>
          );
        },
        size: 100,
        enableSorting: false,
      },
    ],
    [columnHelper]
  );

  // Filter data based on global filter
  const filteredData = useMemo(() => {
    if (!salesData?.data) return [];
    return [...salesData.data];
  }, [salesData]);

  // Create table instance
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

  // Handle search
  const handleSearch = (value: string) => {
    setGlobalFilter(value);
    setPagination({ ...pagination, pageIndex: 0 }); // Reset to first page
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Handle back navigation
  const handleBack = () => {
    router.push(`/admin/companies/${companyId}`);
  };

  // Handle add sale navigation
  const handleAddSale = () => {
    router.push(`/admin/companies/${companyId}/sale/add`);
  };

  // Handle view action
  const handleView = (sale: DealerSale) => {
    router.push(`/admin/companies/${companyId}/sale/${sale.id}`);
  };

  // Handle edit action
  const handleEdit = (sale: DealerSale) => {
    router.push(`/admin/companies/${companyId}/sale/${sale.id}/edit`);
  };

  // Get action menu items for each row
  const getActionMenuItems = (sale: DealerSale) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View',
      onClick: () => handleView(sale),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => handleEdit(sale),
    },
  ];

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
        {/* Header */}
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
                <Title level={3} className="!mb-0 text-gray-900">
                  Dealer Sales
                </Title>
                <p className="text-gray-500 mt-1">Company sales to dealers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                onClick={handleAddSale}
                className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
              >
                Add Dealer Sale
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search sales..."
                prefix={<SearchOutlined />}
                value={globalFilter ?? ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64"
                size="large"
                allowClear
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  setPagination({ ...pagination, pageSize: Number(e.target.value), pageIndex: 0 });
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Loading sales...</span>
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
                          {header.isPlaceholder ? null : (
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? "cursor-pointer select-none hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                                  : "flex items-center gap-2",
                                onClick: header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              <span className="text-xs">
                                {{
                                  asc: "↑",
                                  desc: "↓",
                                }[header.column.getIsSorted() as string] ?? "↕"}
                              </span>
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`transition-colors duration-200 hover:bg-green-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredData.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">💰</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
                  <p className="text-gray-500">No dealer sales have been made by this company yet</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{pagination.pageIndex * pagination.pageSize + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  salesData?.total || 0
                )}
              </span>{" "}
              of <span className="font-medium">{salesData?.total || 0}</span> sales
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                size="small"
                className="hover:bg-white"
              >
                First
              </Button>
              <Button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                size="small"
                className="hover:bg-white"
              >
                Previous
              </Button>

              <span className="flex items-center gap-2 px-3 py-1 bg-white rounded border">
                <span className="text-sm">Page</span>
                <span className="font-semibold text-green-600">
                  {table.getState().pagination.pageIndex + 1}
                </span>
                <span className="text-sm">of</span>
                <span className="font-semibold">
                  {table.getPageCount()}
                </span>
              </span>

              <Button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                size="small"
                className="hover:bg-white"
              >
                Next
              </Button>
              <Button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                size="small"
                className="hover:bg-white"
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

export default DealerSalesPage;