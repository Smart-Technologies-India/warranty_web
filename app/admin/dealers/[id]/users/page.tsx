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
import { Input, Button, Select, Card, Typography, Dropdown, Modal } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Icons
import {
  SearchOutlined,
  ReloadOutlined,
  MoreOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

// Types
interface User {
  id: number;
  name: string;
  contact1: string;
  contact2?: string;
  address?: string;
  dob?: string;
  email?: string;
  is_dealer: boolean;
  role: string;
  is_manufacturer: boolean;
  status: "ACTIVE" | "INACTIVE";
  zone?: {
    id: number;
    name: string;
    city: {
      id: number;
      name: string;
    };
  };
}

interface GetPaginatedUserCompanyResponse {
  getPaginatedUserCompany: {
    skip: number;
    take: number;
    total: number;
    data: {
      user: User;
    }[];
  };
}

interface SearchPaginationInput {
  skip: number;
  take: number;
  search?: string;
}



interface DealerInfo {
  id: number;
  name: string;
  email: string;
  contact1: string;
}

// GraphQL queries
const GET_PAGINATED_USER_COMPANY = `
  query GetPaginatedUserCompany(
    $searchPaginationInput: SearchPaginationInput!
    $whereSearchInput: WhereUserCompanySearchInput!
  ) {
    getPaginatedUserCompany(
      searchPaginationInput: $searchPaginationInput
      whereSearchInput: $whereSearchInput
    ) {
      take
      skip
      total
      data {
        user {
          id
          name
          contact1
          contact2
          address
          dob
          email
          is_dealer
          role
          is_manufacturer
          status
          zone {
            id
            name
            city {
              id
              name
            }
          }
        }
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

const DELETE_USER = `
  mutation DeleteUser($deleteUserId: Int!, $userid: Int!) {
    deleteUser(id: $deleteUserId, userid: $userid) {
      id  
    }
  }
`;

const UPDATE_USER_STATUS = `
  mutation UpdateUser($updateUserId: Int!, $updateType: UpdateUserInput!) {
    updateUser(id: $updateUserId, updateType: $updateType) {
      id  
    }
  }
`;

// API functions
const fetchUsers = async (
  input: SearchPaginationInput,
  dealerId: number
): Promise<{
  skip: number;
  take: number;
  total: number;
  data: User[];
}> => {
  const response = await ApiCall<GetPaginatedUserCompanyResponse>({
    query: GET_PAGINATED_USER_COMPANY,
    variables: {
      searchPaginationInput: input,
      whereSearchInput: {
        company_id: dealerId,
        deletedAt: null,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  // Transform the nested user structure to flat User array
  const transformedData = {
    ...response.data.getPaginatedUserCompany,
    data: response.data.getPaginatedUserCompany.data.map((item) => item.user),
  };

  return transformedData;
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

const deleteUserApi = async (
  userId: number,
  deletedById: number
): Promise<{ id: number }> => {
  const response = await ApiCall<{ deleteUser: { id: number } }>({
    query: DELETE_USER,
    variables: {
      deleteUserId: userId,
      userid: deletedById,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.deleteUser;
};

const updateUserStatusApi = async (
  userId: number,
  status: "ACTIVE" | "INACTIVE"
): Promise<{ id: number }> => {
  const response = await ApiCall<{ updateUser: { id: number } }>({
    query: UPDATE_USER_STATUS,
    variables: {
      updateUserId: userId,
      updateType: {
        status,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateUser;
};

interface DealerUsersPageProps {
  params: Promise<{
    id: string;
  }>;
}

const DealerUsersPage: React.FC<DealerUsersPageProps> = ({ params }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const unwrappedParams = React.use(params) as { id: string };
  const dealerId = parseInt(unwrappedParams.id);

  // State management
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [userToUpdateStatus, setUserToUpdateStatus] = useState<User | null>(
    null
  );

  // Prepare search input for API
  const searchInput: SearchPaginationInput = {
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
    ...(globalFilter && { search: globalFilter }),
  };

  // Fetch dealer info
  const { data: dealerInfo, isLoading: isDealerLoading } = useQuery({
    queryKey: ["dealer", dealerId],
    queryFn: () => fetchDealerById(dealerId),
    enabled: !!dealerId,
  });

  // Fetch data using React Query
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dealerUsers", dealerId, searchInput],
    queryFn: () => fetchUsers(searchInput, dealerId),
    placeholderData: (previousData) => previousData,
    enabled: !!dealerId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({
      userId,
      deletedById,
    }: {
      userId: number;
      deletedById: number;
    }) => deleteUserApi(userId, deletedById),
    onSuccess: () => {
      toast.success(`User deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["dealerUsers", dealerId] });
      // Also invalidate the user query to refresh data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      console.error("Delete user failed:", error);
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  // Status update mutation
  const statusUpdateMutation = useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: number;
      status: "ACTIVE" | "INACTIVE";
    }) => updateUserStatusApi(userId, status),
    onSuccess: (data, variables) => {
      const statusText = variables.status.toLowerCase();
      toast.success(`User status updated to ${statusText}`);
      queryClient.invalidateQueries({ queryKey: ["dealerUsers", dealerId] });
      // Also invalidate the user query to refresh data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      console.error("Status update failed:", error);
      toast.error(`Failed to update user status: ${error.message}`);
    },
  });

  // Create column helper
  const columnHelper = createColumnHelper<User>();

  // Define columns
  const columns = useMemo<ColumnDef<User, any>[]>( // eslint-disable-line @typescript-eslint/no-explicit-any
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
        size: 80,
      }),
      columnHelper.accessor("name", {
        header: "User Name",
        cell: (info) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold text-xs">
                {info.getValue().charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {info.getValue()}
              </div>
              <div className="text-xs text-gray-500">
                ID: {info.row.original.id}
              </div>
            </div>
          </div>
        ),
        size: 250,
      }),
      columnHelper.accessor("contact1", {
        header: "Contact",
        cell: (info) => (
          <div>
            <div className="font-medium text-gray-900">{info.getValue()}</div>
            {info.row.original.contact2 && (
              <div className="text-xs text-gray-500">
                {info.row.original.contact2}
              </div>
            )}
          </div>
        ),
        size: 150,
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => {
          const role = info.getValue();
          const roleColors: Record<string, string> = {
            DEALER_ADMIN: "bg-purple-100 text-purple-800",
            DEALER_ACCOUNTS: "bg-green-100 text-green-800",
            DEALER_MANAGER: "bg-blue-100 text-blue-800",
            DEALER_SALES: "bg-orange-100 text-orange-800",
          };

          return (
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  roleColors[role as keyof typeof roleColors] ||
                  "bg-gray-100 text-gray-800"
                }`}
              >
                {role.replace("DEALER_", "")}
              </span>
            </div>
          );
        },
        size: 120,
        filterFn: "equals",
      }),
      columnHelper.accessor("zone", {
        header: "Location",
        cell: (info) => {
          const zone = info.getValue();
          return zone ? (
            <div>
              <div className="font-medium text-gray-900">
                {zone.city?.name || "N/A"}
              </div>
              <div className="text-xs text-gray-500">{zone.name}</div>
            </div>
          ) : (
            <span className="text-gray-400">Not assigned</span>
          );
        },
        size: 150,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) =>
          info.getValue() || (
            <span className="text-gray-400">Not provided</span>
          ),
        size: 200,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const user = info.row.original;
          const isUpdating = statusUpdateMutation.isPending;

          return (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    status === "ACTIVE" ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                {status}
              </div>
              <Button
                type="text"
                size="small"
                loading={isUpdating}
                onClick={() => handleStatusToggle(user)}
                className={`hover:scale-105 transition-transform duration-200 ${
                  status === "ACTIVE"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-green-600 hover:bg-green-50"
                }`}
                title={`Click to ${
                  status === "ACTIVE" ? "deactivate" : "activate"
                } user`}
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
          const user = row.original;
          return (
            <div className="flex items-center justify-center">
              <Dropdown
                menu={{
                  items: getActionMenuItems(user),
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  size="small"
                  className="hover:bg-blue-50 hover:text-blue-600 rounded-full h-8 w-8 flex items-center justify-center transition-all duration-200"
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

  // Filter data based on status and role filter
  const filteredData = useMemo(() => {
    if (!usersData?.data) return [];

    let filtered = [...usersData.data];

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    if (roleFilter && roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    return filtered;
  }, [usersData, statusFilter, roleFilter]);

  // Create table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    pageCount: usersData
      ? Math.ceil(usersData.total / pagination.pageSize)
      : -1,
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

  // Handle role filter
  const handleRoleFilter = (value: string) => {
    setRoleFilter(value === "all" ? undefined : value);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Handle edit action
  const handleEdit = (user: User) => {
    router.push(`/admin/dealers/${dealerId}/users/${user.id}/edit`);
  };

  // Handle view action
  const handleView = (user: User) => {
    router.push(`/admin/dealers/${dealerId}/users/${user.id}`);
  };

  // Handle delete action
  const handleDelete = (user: User) => {
    const userId = getCookie("id");

    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!userToDelete) return;

    const userId = getCookie("id");
    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    deleteMutation.mutate(
      {
        userId: userToDelete.id,
        deletedById: parseInt(userId.toString()),
      },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        },
        onError: () => {
          // Keep modal open on error so user can retry
        },
      }
    );
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // Handle status toggle
  const handleStatusToggle = (user: User) => {
    const userId = getCookie("id");

    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    setUserToUpdateStatus(user);
    setIsStatusModalOpen(true);
  };

  // Handle confirm status update
  const handleConfirmStatusUpdate = () => {
    if (!userToUpdateStatus) return;

    const userId = getCookie("id");
    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    const newStatus =
      userToUpdateStatus.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    statusUpdateMutation.mutate(
      {
        userId: userToUpdateStatus.id,
        status: newStatus,
      },
      {
        onSuccess: () => {
          setIsStatusModalOpen(false);
          setUserToUpdateStatus(null);
        },
        onError: () => {
          // Keep modal open on error so user can retry
        },
      }
    );
  };

  // Handle cancel status update
  const handleCancelStatusUpdate = () => {
    setIsStatusModalOpen(false);
    setUserToUpdateStatus(null);
  };

  // Handle add user navigation
  const handleAddUser = () => {
    router.push(`/admin/dealers/${dealerId}/users/create`);
  };

  // Handle back to dealer details
  const handleBackToDealer = () => {
    router.push(`/admin/dealers/${dealerId}`);
  };

  // Get action menu items for each row
  const getActionMenuItems = (user: User) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "View",
      onClick: () => handleView(user),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => handleEdit(user),
    },
    {
      key: "delete",
      icon: deleteMutation.isPending ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <DeleteOutlined />
      ),
      label: deleteMutation.isPending ? "Deleting..." : "Delete",
      danger: true,
      disabled: deleteMutation.isPending,
      onClick: () => handleDelete(user),
    },
  ];

  if (isDealerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dealer information...</p>
        </div>
      </div>
    );
  }

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
            <span className="text-lg font-semibold text-gray-900">
              Delete User
            </span>
          </div>
        }
        open={isDeleteModalOpen}
        onCancel={handleCancelDelete}
        footer={null}
        width={500}
        centered
      >
        {userToDelete && (
          <div className="py-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the user:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-400">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">
                      {userToDelete.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {userToDelete.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      ID: {userToDelete.id} • {userToDelete.role}
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
                      This action cannot be undone. All data associated with
                      this user will be permanently deleted.
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
                {deleteMutation.isPending ? "Deleting..." : "Delete User"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                userToUpdateStatus?.status === "ACTIVE"
                  ? "bg-red-100"
                  : "bg-green-100"
              }`}
            >
              <span className="text-lg">
                {userToUpdateStatus?.status === "ACTIVE" ? "📴" : "✅"}
              </span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {userToUpdateStatus?.status === "ACTIVE"
                ? "Deactivate"
                : "Activate"}{" "}
              User
            </span>
          </div>
        }
        open={isStatusModalOpen}
        onCancel={handleCancelStatusUpdate}
        footer={null}
        width={500}
        centered
      >
        {userToUpdateStatus && (
          <div className="py-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to{" "}
                <strong>
                  {userToUpdateStatus.status === "ACTIVE"
                    ? "deactivate"
                    : "activate"}
                </strong>{" "}
                the user:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {userToUpdateStatus.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {userToUpdateStatus.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      ID: {userToUpdateStatus.id} • {userToUpdateStatus.role}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`mt-4 p-3 rounded-lg border ${
                  userToUpdateStatus.status === "ACTIVE"
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">
                    {userToUpdateStatus.status === "ACTIVE" ? "⚠️" : "ℹ️"}
                  </span>
                  <div>
                    <p
                      className={`font-medium text-sm ${
                        userToUpdateStatus.status === "ACTIVE"
                          ? "text-red-800"
                          : "text-green-800"
                      }`}
                    >
                      Status Change
                    </p>
                    <p
                      className={`text-sm ${
                        userToUpdateStatus.status === "ACTIVE"
                          ? "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      This will change the user status from{" "}
                      <strong>{userToUpdateStatus.status}</strong> to{" "}
                      <strong>
                        {userToUpdateStatus.status === "ACTIVE"
                          ? "INACTIVE"
                          : "ACTIVE"}
                      </strong>
                      .
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
                  userToUpdateStatus.status === "ACTIVE"
                    ? "bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                    : "bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                }
                icon={
                  statusUpdateMutation.isPending
                    ? null
                    : userToUpdateStatus.status === "ACTIVE"
                    ? "📴"
                    : "✅"
                }
              >
                {statusUpdateMutation.isPending
                  ? "Updating..."
                  : `${
                      userToUpdateStatus.status === "ACTIVE"
                        ? "Deactivate"
                        : "Activate"
                    } User`}
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
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToDealer}
                type="text"
                className="hover:bg-gray-50"
              >
                Back to Dealer
              </Button>
              <div>
                <Title level={3} className="!mb-0 text-gray-900">
                  {dealerInfo?.name} - Users
                </Title>
                <p className="text-sm text-gray-500 mt-1">
                  Dealer ID: {dealerId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                onClick={handleAddUser}
                icon={<PlusOutlined />}
                className="bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700"
              >
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search users..."
                prefix={<SearchOutlined />}
                value={globalFilter ?? ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64"
                size="large"
                allowClear
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Status:
              </span>
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
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Role:
              </span>
              <Select
                placeholder="All Roles"
                className="w-40"
                size="large"
                value={roleFilter}
                onChange={handleRoleFilter}
                allowClear
              >
                <Option value="all">All Roles</Option>
                <Option value="DEALER_ADMIN">Admin</Option>
                <Option value="DEALER_ACCOUNTS">Accounts</Option>
                <Option value="DEALER_MANAGER">Manager</Option>
                <Option value="DEALER_SALES">Sales</Option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Show:
              </span>
              <Select
                value={pagination.pageSize}
                onChange={(value) => {
                  setPagination({
                    ...pagination,
                    pageSize: value,
                    pageIndex: 0,
                  });
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
          )}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="bg-gray-50 border-b border-gray-200"
                    >
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
                                  ? "cursor-pointer select-none hover:text-blue-600 transition-colors duration-200 flex items-center gap-2"
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
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`transition-colors duration-200 hover:bg-blue-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm"
                        >
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
                  <div className="text-gray-400 text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No users found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or add a new user
                  </p>
                  <Button
                    type="primary"
                    onClick={handleAddUser}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700"
                  >
                    Add User
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {pagination.pageIndex * pagination.pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    (pagination.pageIndex + 1) * pagination.pageSize,
                    usersData?.total || 0
                  )}
                </span>{" "}
                of <span className="font-medium">{usersData?.total || 0}</span>{" "}
                users
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
                  <span className="font-semibold text-blue-600">
                    {table.getState().pagination.pageIndex + 1}
                  </span>
                  <span className="text-sm">of</span>
                  <span className="font-semibold">{table.getPageCount()}</span>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DealerUsersPage;
