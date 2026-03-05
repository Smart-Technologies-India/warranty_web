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
import { Button, Card, Input, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

interface DealerB2BSale {
  id: number;
  quantity: number;
  batch_number: string;
  sale_date: string;
  dealer_purch: {
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
    data: DealerB2BSale[];
  };
}

interface SearchPaginationInput {
  skip: number;
  take: number;
  search?: string;
}

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
        id
        quantity
        batch_number
        sale_date
        dealer_purch {
          name
        }
        product {
          id
          name
        }
      }
    }
  }
`;

const fetchB2BSales = async (
  dealerId: number,
  input: SearchPaginationInput
): Promise<{
  skip: number;
  take: number;
  total: number;
  data: DealerB2BSale[];
}> => {
  const response = await ApiCall<GetPaginatedDealerSalesResponse>({
    query: GET_PAGINATED_DEALER_SALES,
    variables: {
      searchPaginationInput: input,
      whereSearchInput: {
        dealer_seller_id: dealerId,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getPaginatedDealerSales;
};

interface DealerB2BPageProps {
  params: {
    id: string;
  };
}

const DealerB2BPage: React.FC<DealerB2BPageProps> = () => {
  const router = useRouter();
  const params = useParams();
  const parsedDealerId = Number.parseInt(params.id as string, 10);
  const dealerId = Number.isNaN(parsedDealerId) ? 0 : parsedDealerId;

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
    queryKey: ["dealerB2BSales", dealerId, searchInput],
    queryFn: () => fetchB2BSales(dealerId, searchInput),
    placeholderData: (previousData) => previousData,
    enabled: !!dealerId,
  });

  const columnHelper = createColumnHelper<DealerB2BSale>();

  const columns = useMemo<ColumnDef<DealerB2BSale, any>[]>( // eslint-disable-line @typescript-eslint/no-explicit-any
    () => [
      columnHelper.accessor("id", {
        header: "Sale ID",
        cell: (info) => (
          <div className="flex items-center">
            <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
              <span className="text-xs font-semibold text-green-600">
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
            <div className="text-xs text-gray-500">
              ID: {info.row.original.product.id}
            </div>
          </div>
        ),
        size: 220,
      }),
      columnHelper.accessor("dealer_purch.name", {
        header: "Buyer Dealer",
        cell: (info) => (
          <div className="flex items-center">
            <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100">
              <span className="text-xs font-semibold text-orange-600">
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
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            📦 {info.getValue()} units
          </span>
        ),
        size: 120,
      }),
      columnHelper.accessor("batch_number", {
        header: "Batch Number",
        cell: (info) => (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
            🏷️ {info.getValue()}
          </span>
        ),
        size: 160,
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
        size: 160,
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

  const handleBack = () => {
    router.push(`/dealer/${dealerId}`);
  };

  const handleAddB2BSale = () => {
    router.push(`/dealer/${dealerId}/b2b/add`);
  };

  if (isError) {
    return (
      <div className="p-6">
        <Card>
          <div className="py-8 text-center">
            <p className="mb-4 text-red-500">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button onClick={() => refetch()} type="primary">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                type="text"
                className="hover:bg-gray-50"
              >
                Back to Dealer
              </Button>
              <div>
                <Title level={3} className="mb-0! text-gray-900">
                  B2B Sales
                </Title>
                <p className="mt-1 text-gray-500">Sales from this dealer to other dealers</p>
              </div>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddB2BSale}
            >
              Add B2B Sale
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Search B2B sales..."
              prefix={<SearchOutlined />}
              value={globalFilter ?? ""}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-64"
              size="large"
              allowClear
            />

            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-sm font-medium text-gray-700">
                Show:
              </span>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  setPagination({
                    ...pagination,
                    pageSize: Number(e.target.value),
                    pageIndex: 0,
                  });
                }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                onClick={() => refetch()}
                loading={isLoading}
                size="large"
                className="hover:bg-gray-50"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Loading B2B sales...</span>
            </div>
          )}

          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b border-gray-200 bg-gray-50"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-4 text-left text-sm font-semibold tracking-wider text-gray-900 uppercase"
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? "flex cursor-pointer select-none items-center gap-2 transition-colors duration-200 hover:text-green-600"
                                  : "flex items-center gap-2",
                                onClick:
                                  header.column.getToggleSortingHandler(),
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
                <tbody className="divide-y divide-gray-200 bg-white">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-colors duration-150 hover:bg-gray-50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 align-middle">
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

              {table.getRowModel().rows.length === 0 && (
                <div className="py-12 text-center">
                  <div className="mb-2 text-4xl">📦</div>
                  <h3 className="mb-1 text-lg font-medium text-gray-900">
                    No B2B sales found
                  </h3>
                  <p className="text-gray-500">
                    There are no dealer-to-dealer sales matching your filter.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{table.getRowModel().rows.length}</span> of{" "}
                <span className="font-medium">{salesData?.total || 0}</span> results
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  size="small"
                >
                  Previous
                </Button>

                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount() || 1}
                </span>

                <Button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  size="small"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerB2BPage;
