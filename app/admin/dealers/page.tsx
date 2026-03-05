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
import { Input, Button, Select, Tag, Space, Card, Typography, Dropdown, Modal } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  SearchOutlined,
  ReloadOutlined,
  MoreOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const { Title } = Typography;
const { Option } = Select;

// Types for the dealer data
interface Dealer {
  id: number;
  name: string;
  zone: {
    name: string;
    city: {
      name: string;
    };
  };
  contact1: string;
  status: "ACTIVE" | "INACTIVE";
}

interface GetPaginatedDealerResponse {
  getPaginatedCompany: {
    skip: number;
    take: number;
    total: number;
    data: Dealer[];
  };
}

interface SearchPaginationInput {
  skip: number;
  take: number;
  search?: string;
}


// GraphQL queries
const GET_PAGINATED_DEALER = `
  query GetPaginatedCompany($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: WhereCompanySearchInput!) {
    getPaginatedCompany(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
      skip
      take
      total
      data {
        id
        name
        zone {
          name
          city {
            name
          }
        }
        contact1
        status
      }
    }
  }
`;

const DELETE_DEALER = `
  mutation DeleteCompany($deleteCompanyId: Int!, $userid: Int!) {
    deleteCompany(id: $deleteCompanyId, userid: $userid) {
      id  
    }
  }
`;

const UPDATE_DEALER_STATUS = `
  mutation UpdateCompany($updateCompanyId: Int!, $updateType: UpdateCompanyInput!) {
    updateCompany(id: $updateCompanyId, updateType: $updateType) {
      id  
    }
  }
`;

// API functions
const fetchDealers = async (input: SearchPaginationInput): Promise<{
  skip: number;
  take: number;
  total: number;
  data: Dealer[];
}> => {
  const response = await ApiCall<GetPaginatedDealerResponse>({
    query: GET_PAGINATED_DEALER,
    variables: {
      searchPaginationInput: input,
      whereSearchInput: {
        is_dealer: true,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getPaginatedCompany;
};

const deleteDealerApi = async (dealerId: number, userId: number): Promise<{ id: number }> => {
  const response = await ApiCall<{ deleteCompany: { id: number } }>({
    query: DELETE_DEALER,
    variables: {
      deleteCompanyId: dealerId,
      userid: userId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.deleteCompany;
};

const updateDealerStatusApi = async (
  dealerId: number,
  status: "ACTIVE" | "INACTIVE",
  updatedById: number
): Promise<{ id: number }> => {
  const response = await ApiCall<{ updateCompany: { id: number } }>({
    query: UPDATE_DEALER_STATUS,
    variables: {
      updateCompanyId: dealerId,
      updateType: {
        status,
        updatedById,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateCompany;
};

const DealersPageComponent = () => {
  // Router for navigation
  const router = useRouter();

  // State management
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dealerToDelete, setDealerToDelete] = useState<Dealer | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [dealerToUpdateStatus, setDealerToUpdateStatus] = useState<Dealer | null>(null);

  // Query client for invalidating queries
  const queryClient = useQueryClient();

  // Prepare search input for API
  const searchInput: SearchPaginationInput = {
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
    ...(globalFilter && { search: globalFilter }),
  };

  // Fetch data using React Query
  const {
    data: dealersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dealers", searchInput],
    queryFn: () => fetchDealers(searchInput),
    placeholderData: (previousData) => previousData,
    enabled: typeof window !== 'undefined', // Only run on client side
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({ dealerId, userId }: { dealerId: number; userId: number }) =>
      deleteDealerApi(dealerId, userId),
    onSuccess: (data, variables) => {
      toast.success(`Dealer deleted successfully`);
      // Invalidate and refetch dealers data
      queryClient.invalidateQueries({ queryKey: ["dealers"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete dealer: ${error.message}`);
    },
  });

  // Status update mutation
  const statusUpdateMutation = useMutation({
    mutationFn: ({
      dealerId,
      status,
      updatedById
    }: {
      dealerId: number;
      status: "ACTIVE" | "INACTIVE";
      updatedById: number
    }) => updateDealerStatusApi(dealerId, status, updatedById),
    onSuccess: (data, variables) => {
      const statusText = variables.status.toLowerCase();
      toast.success(`Dealer status updated to ${statusText}`);
      // Invalidate and refetch dealers data
      queryClient.invalidateQueries({ queryKey: ["dealers"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update dealer status: ${error.message}`);
    },
  });

  // Create column helper
  const columnHelper = createColumnHelper<Dealer>();

  // Define columns
  const columns = useMemo<ColumnDef<Dealer, any>[]>( 
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
        size: 80,
      }),
      columnHelper.accessor("name", {
        header: "Dealer Name",
        cell: (info) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-orange-600 font-semibold text-xs">
                {info.getValue().charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{info.getValue()}</div>
              <div className="text-xs text-gray-500">ID: {info.row.original.id}</div>
            </div>
          </div>
        ),
        size: 250,
      }),
      columnHelper.accessor("zone.city.name", {
        header: "Location",
        cell: (info) => (
          <div>
            <div className="font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-xs text-gray-500">{info.row.original.zone.name}</div>
          </div>
        ),
        size: 150,
      }),
      columnHelper.accessor("contact1", {
        header: "Contact",
        cell: (info) => (
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              📞 {info.getValue()}
            </span>
          </div>
        ),
        size: 150,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const dealer = info.row.original;
          const isUpdating = statusUpdateMutation.isPending;

          return (
            <div className="flex items-center gap-2">
              <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${status === "ACTIVE"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
                }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${status === "ACTIVE" ? "bg-green-400" : "bg-red-400"
                  }`}></div>
                {status}
              </div>
              <Button
                type="text"
                size="small"
                loading={isUpdating}
                onClick={() => handleStatusToggle(dealer)}
                className={`hover:scale-105 transition-transform duration-200 ${status === "ACTIVE"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-green-600 hover:bg-green-50"
                  }`}
                title={`Click to ${status === "ACTIVE" ? "deactivate" : "activate"} dealer`}
              >
                {status === "ACTIVE" ? "📴" : "✅"}
              </Button>
            </div>
          );
        },
        size: 160,
        filterFn: "equals",
      }),
      // Actions column
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const dealer = row.original;
          return (
            <div className="flex items-center justify-center">
              <Dropdown
                menu={{
                  items: getActionMenuItems(dealer),
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  size="small"
                  className="hover:bg-orange-50 hover:text-orange-600 rounded-full h-8 w-8 flex items-center justify-center transition-all duration-200"
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

  // Filter data based on status filter
  const filteredData = useMemo(() => {
    if (!dealersData?.data) return [];

    let filtered = [...dealersData.data];

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((dealer) => dealer.status === statusFilter);
    }

    return filtered;
  }, [dealersData, statusFilter]);

  // Create table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    pageCount: dealersData ? Math.ceil(dealersData.total / pagination.pageSize) : -1,
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

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === "all" ? undefined : value);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Handle edit action
  const handleEdit = (dealer: Dealer) => {
    router.push(`/admin/dealers/${dealer.id}/edit`);
  };
  // Handle view action
  const handleView = (dealer: Dealer) => {
    router.push(`/admin/dealers/${dealer.id}`);
  };

  // Handle delete action
  const handleDelete = (dealer: Dealer) => {
    try {
      const userId = getCookie("id");

      if (!userId) {
        toast.error("User not authenticated. Please login again.");
        return;
      }

      setDealerToDelete(dealer);
      setIsDeleteModalOpen(true);
    } catch (error) {
      toast.error("Authentication error. Please login again.");
      console.error("Error accessing user ID:", error);
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!dealerToDelete) return;

    try {
      const userId = getCookie("id");
      if (!userId) {
        toast.error("User not authenticated. Please login again.");
        return;
      }

      deleteMutation.mutate(
        {
          dealerId: dealerToDelete.id,
          userId: parseInt(userId.toString()),
        },
        {
          onSuccess: () => {
            setIsDeleteModalOpen(false);
            setDealerToDelete(null);
          },
          onError: () => {
            // Keep modal open on error so user can retry
          },
        }
      );
    } catch (error) {
      toast.error("Authentication error. Please login again.");
      console.error("Error accessing user ID:", error);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDealerToDelete(null);
  };

  // Handle status toggle
  const handleStatusToggle = (dealer: Dealer) => {
    try {
      const userId = getCookie("id");

      if (!userId) {
        toast.error("User not authenticated. Please login again.");
        return;
      }

      setDealerToUpdateStatus(dealer);
      setIsStatusModalOpen(true);
    } catch (error) {
      toast.error("Authentication error. Please login again.");
      console.error("Error accessing user ID:", error);
    }
  };

  // Handle confirm status update
  const handleConfirmStatusUpdate = () => {
    if (!dealerToUpdateStatus) return;

    try {
      const userId = getCookie("id");
      if (!userId) {
        toast.error("User not authenticated. Please login again.");
        return;
      }

      const newStatus = dealerToUpdateStatus.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      statusUpdateMutation.mutate(
        {
          dealerId: dealerToUpdateStatus.id,
          status: newStatus,
          updatedById: parseInt(userId.toString()),
        },
        {
          onSuccess: () => {
            setIsStatusModalOpen(false);
            setDealerToUpdateStatus(null);
          },
          onError: () => {
            // Keep modal open on error so user can retry
          },
        }
      );
    } catch (error) {
      toast.error("Authentication error. Please login again.");
      console.error("Error accessing user ID:", error);
    }
  };

  // Handle cancel status update
  const handleCancelStatusUpdate = () => {
    setIsStatusModalOpen(false);
    setDealerToUpdateStatus(null);
  };

  // Handle add dealer navigation
  const handleAddDealer = () => {
    router.push('/admin/adddealer');
  };

  // Get action menu items for each row
  const getActionMenuItems = (dealer: Dealer) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View',
      onClick: () => handleView(dealer),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => handleEdit(dealer),
    },
    {
      key: 'delete',
      icon: deleteMutation.isPending ? <span className="animate-spin">⏳</span> : <DeleteOutlined />,
      label: deleteMutation.isPending ? 'Deleting...' : 'Delete',
      danger: true,
      disabled: deleteMutation.isPending,
      onClick: () => handleDelete(dealer),
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
      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <DeleteOutlined className="text-red-600 text-lg" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Delete Dealer</span>
          </div>
        }
        open={isDeleteModalOpen}
        onCancel={handleCancelDelete}
        footer={null}
        width={500}
        centered
      >
        {dealerToDelete && (
          <div className="py-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the dealer:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-400">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">
                      {dealerToDelete.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{dealerToDelete.name}</h4>
                    <p className="text-sm text-gray-500">
                      ID: {dealerToDelete.id} • {dealerToDelete.zone.city.name}, {dealerToDelete.zone.name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <div>
                    <p className="text-red-800 font-medium text-sm">Warning</p>
                    <p className="text-red-700 text-sm">
                      This action cannot be undone. All data associated with this dealer will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                size="large"
                onClick={handleCancelDelete}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                danger
                size="large"
                loading={deleteMutation.isPending}
                onClick={handleConfirmDelete}
                icon={deleteMutation.isPending ? null : <DeleteOutlined />}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Dealer"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dealerToUpdateStatus?.status === "ACTIVE"
              ? "bg-red-100"
              : "bg-green-100"
              }`}>
              <span className="text-lg">
                {dealerToUpdateStatus?.status === "ACTIVE" ? "📴" : "✅"}
              </span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {dealerToUpdateStatus?.status === "ACTIVE" ? "Deactivate" : "Activate"} Dealer
            </span>
          </div>
        }
        open={isStatusModalOpen}
        onCancel={handleCancelStatusUpdate}
        footer={null}
        width={500}
        centered
      >
        {dealerToUpdateStatus && (
          <div className="py-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to{" "}
                <strong>
                  {dealerToUpdateStatus.status === "ACTIVE" ? "deactivate" : "activate"}
                </strong>{" "}
                the dealer:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-400">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">
                      {dealerToUpdateStatus.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{dealerToUpdateStatus.name}</h4>
                    <p className="text-sm text-gray-500">
                      ID: {dealerToUpdateStatus.id} • {dealerToUpdateStatus.zone.city.name}, {dealerToUpdateStatus.zone.name}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`mt-4 p-3 rounded-lg border ${dealerToUpdateStatus.status === "ACTIVE"
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
                }`}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">
                    {dealerToUpdateStatus.status === "ACTIVE" ? "⚠️" : "ℹ️"}
                  </span>
                  <div>
                    <p className={`font-medium text-sm ${dealerToUpdateStatus.status === "ACTIVE"
                      ? "text-red-800"
                      : "text-green-800"
                      }`}>
                      Status Change
                    </p>
                    <p className={`text-sm ${dealerToUpdateStatus.status === "ACTIVE"
                      ? "text-red-700"
                      : "text-green-700"
                      }`}>
                      This will change the dealer status from{" "}
                      <strong>{dealerToUpdateStatus.status}</strong> to{" "}
                      <strong>
                        {dealerToUpdateStatus.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}
                      </strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                size="large"
                onClick={handleCancelStatusUpdate}
                disabled={statusUpdateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                loading={statusUpdateMutation.isPending}
                onClick={handleConfirmStatusUpdate}
                className={
                  dealerToUpdateStatus.status === "ACTIVE"
                    ? "bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                    : "bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                }
                icon={statusUpdateMutation.isPending ? null : (
                  dealerToUpdateStatus.status === "ACTIVE" ? "📴" : "✅"
                )}
              >
                {statusUpdateMutation.isPending
                  ? "Updating..."
                  : `${dealerToUpdateStatus.status === "ACTIVE" ? "Deactivate" : "Activate"} Dealer`
                }
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <Title level={3} className="!mb-0 text-gray-900">
                  Dealers
                </Title>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                onClick={handleAddDealer}
                className="bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700"
              >
                Add Dealer
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search dealers..."
                prefix={<SearchOutlined />}
                value={globalFilter ?? ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64"
                size="large"
                allowClear
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</span>
              <Select
                placeholder="All"
                className="w-32"
                size="large"
                value={statusFilter}
                onChange={handleStatusFilter}
                allowClear
              >
                <Option value="all">All</Option>
                <Option value="ACTIVE">Active</Option>
                <Option value="INACTIVE">Inactive</Option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</span>
              <Select
                value={pagination.pageSize}
                onChange={(value) => {
                  setPagination({ ...pagination, pageSize: value, pageIndex: 0 });
                }}
                className="w-20"
                size="large"
              >
                <Option value={5}>5</Option>
                <Option value={10}>10</Option>
                <Option value={20}>20</Option>
                <Option value={50}>50</Option>
              </Select>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600">Loading dealers...</span>
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
                                  ? "cursor-pointer select-none hover:text-orange-600 transition-colors duration-200 flex items-center gap-2"
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
                      className={`transition-colors duration-200 hover:bg-orange-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
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
                  <div className="text-gray-400 text-6xl mb-4">🏪</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No dealers found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
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
                  dealersData?.total || 0
                )}
              </span>{" "}
              of <span className="font-medium">{dealersData?.total || 0}</span> dealers
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
                <span className="font-semibold text-orange-600">
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

export default DealersPageComponent;