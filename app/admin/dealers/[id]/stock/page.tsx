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
import { Input, Button, Select, Tag, Card, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { useRouter } from "next/navigation";

import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

// Types
interface DealerStock {
    id: number;
    batch_number: string;
    quantity: number;
    status: "ACTIVE" | "INACTIVE";
    product: {
        id: number;
        name: string;
    };
    dealer: {
        id: number;
        name: string;
    };
    company: {
        id: number;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface DealerInfo {
    id: number;
    name: string;
    email: string;
    contact1: string;
}

// GraphQL queries
const GET_PAGINATED_DEALER_STOCK = `
  query GetPaginatedDealerStock($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: WhereDealerStockSearchInput!) {
    getPaginatedDealerStock(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
      take
      skip
      total
      data {
        id
        batch_number
        quantity
        status
        product {
          id
          name
        }
        dealer {
          id
          name
        }
        company {
          id
          name
        }
        createdAt
        updatedAt
      }
    }
  }
`;

const GET_DEALER_BY_ID = `
  query GetCompanyById($getCompanyByIdId: Int!) {
    getCompanyById(id: $getCompanyByIdId) {
      id
      name
      email
      contact1
    }
  }
`;



// API functions
const fetchDealerStock = async (
    dealerId: number,
    searchText: string,
    skip: number,
    take: number,
): Promise<{ data: DealerStock[]; total: number }> => {

    const whereSearchInput: Record<string, any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
        dealer_id: dealerId,
        status: "ACTIVE"
    };

    const response = await ApiCall<{
        getPaginatedDealerStock: { data: DealerStock[]; total: number };
    }>({
        query: GET_PAGINATED_DEALER_STOCK,
        variables: {
            searchPaginationInput: {
                search: searchText,
                skip: skip,
                take: take,
            },
            whereSearchInput,
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.getPaginatedDealerStock;
};

const fetchDealerById = async (dealerId: number): Promise<DealerInfo> => {
    const response = await ApiCall<{ getCompanyById: DealerInfo }>({
        query: GET_DEALER_BY_ID,
        variables: {
            getCompanyByIdId: dealerId,
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.getCompanyById;
};



interface DealerStockPageProps {
    params: Promise<{
        id: string;
    }>;
}

const DealerStockPage: React.FC<DealerStockPageProps> = ({ params }) => {
    const router = useRouter();
    const unwrappedParams = React.use(params) as { id: string };
    const dealerId = parseInt(unwrappedParams.id);

    // State for search, pagination, and sorting
    const [searchText, setSearchText] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // Fetch dealer info
    const {
        data: dealerInfo,
        isLoading: isDealerLoading,
    } = useQuery({
        queryKey: ["dealer", dealerId],
        queryFn: () => fetchDealerById(dealerId),
        enabled: !!dealerId,
    });

    // Fetch stock data
    const {
        data: stockData,
        isLoading: isStockLoading,
        refetch: refetchStock,
    } = useQuery({
        queryKey: [
            "dealerStock",
            dealerId,
            searchText,
            pagination.pageIndex * pagination.pageSize,
            pagination.pageSize,
        ],
        queryFn: () =>
            fetchDealerStock(
                dealerId,
                searchText,
                pagination.pageIndex * pagination.pageSize,
                pagination.pageSize,
            ),
        enabled: !!dealerId,
    });



    // Table columns
    const columnHelper = createColumnHelper<DealerStock>();

    const columns = useMemo<ColumnDef<DealerStock, any>[]>( // eslint-disable-line @typescript-eslint/no-explicit-any
        () => [
            columnHelper.accessor("id", {
                header: "Stock ID",
                cell: (info) => (
                    <span className="font-mono text-sm text-gray-600">#{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("product", {
                header: "Product",
                cell: (info) => {
                    const product = info.getValue();
                    return (
                        <div>
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-400">ID: {product.id}</div>
                        </div>
                    );
                },
            }),
            columnHelper.accessor("batch_number", {
                header: "Batch Number",
                cell: (info) => (
                    <Tag color="blue" className="font-mono">
                        {info.getValue()}
                    </Tag>
                ),
            }),
            columnHelper.accessor("quantity", {
                header: "Quantity",
                cell: (info) => (
                    <div className="font-semibold text-lg text-gray-900">
                        {info.getValue()} <span className="text-sm text-gray-500">units</span>
                    </div>
                ),
            }),
            columnHelper.accessor("status", {
                header: "Status",
                cell: (info) => (
                    <Tag color={info.getValue() === "ACTIVE" ? "green" : "red"}>
                        {info.getValue()}
                    </Tag>
                ),
            }),
            columnHelper.accessor("createdAt", {
                header: "Created",
                cell: (info) => (
                    <div className="text-sm text-gray-600">
                        {new Date(info.getValue()).toLocaleDateString()}
                    </div>
                ),
            }),
            columnHelper.display({
                id: "actions",
                header: "Actions",
                cell: (info) => {
                    const stock = info.row.original;
                    return (
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => router.push(`/admin/dealers/${dealerId}/stock/${stock.id}`)}
                            className="bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700"
                        >
                            View Details
                        </Button>
                    );
                },
            }),
        ],
        [dealerId, router]
    );

    const table = useReactTable({
        data: stockData?.data || [],
        columns,
        state: {
            sorting,
            columnFilters,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        pageCount: Math.ceil((stockData?.total || 0) / pagination.pageSize),
    });

    const handleBack = () => {
        router.push(`/admin/dealers/${dealerId}`);
    };

    // const handleAddStock = () => {
    //     router.push(`/admin/dealers/${dealerId}/stock/add`);
    // };

    if (isDealerLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dealer information...</p>
                </div>
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
                                Back to Dealer
                            </Button>
                            <div>
                                <Title level={3} className="!mb-0 text-gray-900">
                                    {dealerInfo?.name} - Stock Management
                                </Title>
                                <p className="text-gray-500 mt-1">Manage dealer inventory and stock levels</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => refetchStock()}
                                loading={isStockLoading}
                            >
                                Refresh
                            </Button>
                            {/* <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddStock}
                                className="bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700"
                            >
                                Add Stock
                            </Button> */}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card title="Filters & Search" className="shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Stock
                            </label>
                            <Input
                                placeholder="Search by product name, batch number..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                                allowClear
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={() => {
                                    setSearchText("");
                                    setPagination({ pageIndex: 0, pageSize: 10 });
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </Card>
                <div></div>
                {/* Stock Table */}
                <Card
                    title={
                        <div className="flex justify-between items-center">
                            <span>Stock Inventory ({stockData?.total || 0} items)</span>
                            <div className="text-sm text-gray-500">
                                Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                                {Math.min((pagination.pageIndex + 1) * pagination.pageSize, stockData?.total || 0)}{" "}
                                of {stockData?.total || 0}
                            </div>
                        </div>
                    }
                    className="shadow-sm"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getIsSorted() === "asc" && <span>↑</span>}
                                                    {header.column.getIsSorted() === "desc" && <span>↓</span>}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isStockLoading ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                                                <span className="ml-2 text-gray-600">Loading stock...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <div className="text-4xl mb-4">📦</div>
                                                <p className="text-lg font-medium">No stock found</p>
                                                <p className="text-sm">Try adjusting your search criteria or add new stock.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Rows per page:</span>
                            <Select
                                value={pagination.pageSize}
                                onChange={(value) => setPagination({ ...pagination, pageSize: value, pageIndex: 0 })}
                                size="small"
                            >
                                <Option value={5}>5</Option>
                                <Option value={10}>10</Option>
                                <Option value={20}>20</Option>
                                <Option value={50}>50</Option>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                size="small"
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {pagination.pageIndex + 1} of {table.getPageCount()}
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
                </Card>
            </div>
        </div>
    );
};

export default DealerStockPage;