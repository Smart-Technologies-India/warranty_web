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
import { Input, Button, Select, Typography, Dropdown, Modal } from "antd";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  useAdminCategoriesQuery,
  useAdminCreateCategoryMutation,
  useAdminDeleteCategoryMutation,
  useAdminUpdateCategoryStatusMutation,
} from "@/services/admin/category";

// Try importing icons differently
import {
  SearchOutlined,
  ReloadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

// Types for the category data
interface Category {
  id: number;
  name: string;
  priority: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

interface SearchPaginationInput {
  skip: number;
  take: number;
  search?: string;
}

const CategoriesPage = () => {
  // Router for navigation
  const router = useRouter();

  // State management
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [categoryToUpdateStatus, setCategoryToUpdateStatus] =
    useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  // Prepare search input for API
  const searchInput: SearchPaginationInput = {
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
    ...(globalFilter && { search: globalFilter }),
  };

  // Fetch data using React Query
  const {
    data: categoriesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminCategoriesQuery(searchInput);

  const deleteMutation = useAdminDeleteCategoryMutation();
  const statusUpdateMutation = useAdminUpdateCategoryStatusMutation();
  const createCategoryMutation = useAdminCreateCategoryMutation();

  // Create column helper
  const columnHelper = createColumnHelper<Category>();

  // Define columns
  const columns = useMemo<ColumnDef<Category, any>[]>( 
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
        size: 80,
      }),
      columnHelper.accessor("name", {
        header: "Category Name",
        cell: (info) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-emerald-600 font-semibold text-xs">
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
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => (
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              #{info.getValue()}
            </span>
          </div>
        ),
        size: 120,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const category = info.row.original;
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
                onClick={() => handleStatusToggle(category)}
                className={`hover:scale-105 transition-transform duration-200 ${
                  status === "ACTIVE"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-green-600 hover:bg-green-50"
                }`}
                title={`Click to ${
                  status === "ACTIVE" ? "deactivate" : "activate"
                } category`}
              >
                {status === "ACTIVE" ? "📴" : "✅"}
              </Button>
            </div>
          );
        },
        size: 160,
        filterFn: "equals",
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => (
          <div className="text-sm text-gray-600">
            {new Date(info.getValue()).toLocaleDateString()}
          </div>
        ),
        size: 120,
      }),
      // Actions column
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="flex items-center justify-center">
              <Dropdown
                menu={{
                  items: getActionMenuItems(category),
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  size="small"
                  className="hover:bg-emerald-50 hover:text-emerald-600 rounded-full h-8 w-8 flex items-center justify-center transition-all duration-200"
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
    if (!categoriesData?.data) return [];

    let filtered = [...categoriesData.data];

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(
        (category) => category.status === statusFilter
      );
    }

    return filtered;
  }, [categoriesData, statusFilter]);

  // Create table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    pageCount: categoriesData
      ? Math.ceil(categoriesData.total / pagination.pageSize)
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

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Handle edit action
  const handleEdit = (category: Category) => {
    router.push(`/admin/categories/${category.id}`);
  };

  // Handle delete action
  const handleDelete = (category: Category) => {
    const userId = getCookie("id");

    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;

    const userId = getCookie("id");
    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    deleteMutation.mutate(
      {
        categoryId: categoryToDelete.id,
        userId: parseInt(userId.toString()),
      },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
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
    setCategoryToDelete(null);
  };

  // Handle status toggle
  const handleStatusToggle = (category: Category) => {
    const userId = getCookie("id");

    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    setCategoryToUpdateStatus(category);
    setIsStatusModalOpen(true);
  };

  // Handle confirm status update
  const handleConfirmStatusUpdate = () => {
    if (!categoryToUpdateStatus) return;

    const userId = getCookie("id");
    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    const newStatus =
      categoryToUpdateStatus.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    statusUpdateMutation.mutate(
      {
        categoryId: categoryToUpdateStatus.id,
        status: newStatus,
        updatedById: parseInt(userId.toString()),
      },
      {
        onSuccess: () => {
          setIsStatusModalOpen(false);
          setCategoryToUpdateStatus(null);
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
    setCategoryToUpdateStatus(null);
  };

  // Handle add category modal
  const handleAddCategory = () => {
    setIsCategoryModalOpen(true);
  };

  // Handle category creation
  const handleCreateCategory = () => {
    const userId = getCookie("id");
    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    if (!categoryName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }

    createCategoryMutation.mutate(
      {
        name: categoryName.trim(),
        createdById: parseInt(userId.toString()),
      },
      {
        onSuccess: () => {
          setIsCategoryModalOpen(false);
          setCategoryName("");
        },
      }
    );
  };

  // Handle cancel category creation
  const handleCancelCategory = () => {
    setIsCategoryModalOpen(false);
    setCategoryName("");
  };

  // Get action menu items for each row
  const getActionMenuItems = (category: Category) => [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => handleEdit(category),
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
      onClick: () => handleDelete(category),
    },
  ];

  if (isError) {
    return (
      <div className="p-6">
        <div>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button onClick={handleRefresh} type="primary">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add Category Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 text-lg">📁</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Create New Category
            </span>
          </div>
        }
        open={isCategoryModalOpen}
        onCancel={handleCancelCategory}
        footer={null}
        width={500}
        centered
      >
        <div className="py-4">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Enter the name for the new product category:
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <Input
                  size="large"
                  placeholder="Enter category name (e.g., Electronics, Appliances)"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  onPressEnter={handleCreateCategory}
                  disabled={createCategoryMutation.isPending}
                  autoFocus
                />
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 text-lg">ℹ️</span>
                  <div>
                    <p className="text-emerald-800 font-medium text-sm">
                      Category Settings
                    </p>
                    <p className="text-emerald-700 text-sm mt-1">
                      This category will be created with{" "}
                      <strong>Priority 1</strong> and will be immediately
                      available for product assignment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              size="large"
              onClick={handleCancelCategory}
              disabled={createCategoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              loading={createCategoryMutation.isPending}
              onClick={handleCreateCategory}
              className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700"
              icon={createCategoryMutation.isPending ? null : "📁"}
            >
              {createCategoryMutation.isPending
                ? "Creating..."
                : "Create Category"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <DeleteOutlined className="text-red-600 text-lg" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Delete Category
            </span>
          </div>
        }
        open={isDeleteModalOpen}
        onCancel={handleCancelDelete}
        footer={null}
        width={500}
        centered
      >
        {categoryToDelete && (
          <div className="py-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the category:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-400">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">
                      {categoryToDelete.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {categoryToDelete.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      ID: {categoryToDelete.id} • Priority:{" "}
                      {categoryToDelete.priority}
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
                      This action cannot be undone. All subcategories and
                      products associated with this category may be affected.
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
                {deleteMutation.isPending ? "Deleting..." : "Delete Category"}
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
                categoryToUpdateStatus?.status === "ACTIVE"
                  ? "bg-red-100"
                  : "bg-green-100"
              }`}
            >
              <span className="text-lg">
                {categoryToUpdateStatus?.status === "ACTIVE" ? "📴" : "✅"}
              </span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {categoryToUpdateStatus?.status === "ACTIVE"
                ? "Deactivate"
                : "Activate"}{" "}
              Category
            </span>
          </div>
        }
        open={isStatusModalOpen}
        onCancel={handleCancelStatusUpdate}
        footer={null}
        width={500}
        centered
      >
        {categoryToUpdateStatus && (
          <div className="py-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to{" "}
                <strong>
                  {categoryToUpdateStatus.status === "ACTIVE"
                    ? "deactivate"
                    : "activate"}
                </strong>{" "}
                the category:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-emerald-400">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-semibold text-sm">
                      {categoryToUpdateStatus.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {categoryToUpdateStatus.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      ID: {categoryToUpdateStatus.id} • Priority:{" "}
                      {categoryToUpdateStatus.priority}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`mt-4 p-3 rounded-lg border ${
                  categoryToUpdateStatus.status === "ACTIVE"
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">
                    {categoryToUpdateStatus.status === "ACTIVE" ? "⚠️" : "ℹ️"}
                  </span>
                  <div>
                    <p
                      className={`font-medium text-sm ${
                        categoryToUpdateStatus.status === "ACTIVE"
                          ? "text-red-800"
                          : "text-green-800"
                      }`}
                    >
                      Status Change
                    </p>
                    <p
                      className={`text-sm ${
                        categoryToUpdateStatus.status === "ACTIVE"
                          ? "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      This will change the category status from{" "}
                      <strong>{categoryToUpdateStatus.status}</strong> to{" "}
                      <strong>
                        {categoryToUpdateStatus.status === "ACTIVE"
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
                  categoryToUpdateStatus.status === "ACTIVE"
                    ? "bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                    : "bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                }
                icon={
                  statusUpdateMutation.isPending
                    ? null
                    : categoryToUpdateStatus.status === "ACTIVE"
                    ? "📴"
                    : "✅"
                }
              >
                {statusUpdateMutation.isPending
                  ? "Updating..."
                  : `${
                      categoryToUpdateStatus.status === "ACTIVE"
                        ? "Deactivate"
                        : "Activate"
                    } Category`}
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
                  Categories
                </Title>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                onClick={handleAddCategory}
                className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700"
              >
                Add Category
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search categories..."
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-gray-600">Loading categories...</span>
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
                                  ? "cursor-pointer select-none hover:text-emerald-600 transition-colors duration-200 flex items-center gap-2"
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
                      className={`transition-colors duration-200 hover:bg-emerald-50 ${
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
                  <div className="text-gray-400 text-6xl mb-4">📁</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No categories found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
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
                  categoriesData?.total || 0
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium">{categoriesData?.total || 0}</span>{" "}
              categories
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
                <span className="font-semibold text-emerald-600">
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
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
