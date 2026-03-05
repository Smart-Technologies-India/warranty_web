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
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";

import {
  SearchOutlined,
  ReloadOutlined,
  MoreOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

// Types for the product data
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  company_id: number;
  warranty_time: number;
  status: "ACTIVE" | "INACTIVE";
  subcategory: {
    name: string;
    product_category: {
      name: string;
    };
  };
}

interface GetPaginatedProductResponse {
  getPaginatedProduct: {
    skip: number;
    take: number;
    total: number;
    data: Product[];
  };
}

interface SearchPaginationInput {
  skip: number;
  take: number;
  search?: string;
}

// GraphQL queries
const GET_PAGINATED_PRODUCT = `
  query GetPaginatedProduct($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: WhereProductSearchInput!) {
    getPaginatedProduct(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
      take
      skip
      total
      data {
        id
        name
        price
        description
        company_id
        warranty_time
        status
        subcategory {
          name
          product_category {
            name
          }
        }
      }  
    }
  }
`;

const DELETE_PRODUCT = `
  mutation DeleteProduct($deleteProductId: Int!, $userid: Int!) {
    deleteProduct(id: $deleteProductId, userid: $userid) {
      id  
    }
  }
`;

const UPDATE_PRODUCT_STATUS = `
  mutation UpdateProduct($updateProductId: Int!, $updateType: UpdateProductInput!) {
    updateProduct(id: $updateProductId, updateType: $updateType) {
      id  
    }
  }
`;

// API functions
const fetchProducts = async (
  input: SearchPaginationInput,
  companyId: number
): Promise<{
  skip: number;
  take: number;
  total: number;
  data: Product[];
}> => {
  const response = await ApiCall<GetPaginatedProductResponse>({
    query: GET_PAGINATED_PRODUCT,
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

  return response.data.getPaginatedProduct;
};

const deleteProductApi = async (
  productId: number,
  userId: number
): Promise<{ id: number }> => {
  const response = await ApiCall<{ deleteProduct: { id: number } }>({
    query: DELETE_PRODUCT,
    variables: {
      deleteProductId: productId,
      userid: userId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.deleteProduct;
};

const updateProductStatusApi = async (
  productId: number,
  status: "ACTIVE" | "INACTIVE",
  updatedById: number
): Promise<{ id: number }> => {
  const response = await ApiCall<{ updateProduct: { id: number } }>({
    query: UPDATE_PRODUCT_STATUS,
    variables: {
      updateProductId: productId,
      updateType: {
        status,
        updatedById,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateProduct;
};

const ProductsPage = () => {
  // Router for navigation
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);

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
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [productToUpdateStatus, setProductToUpdateStatus] =
    useState<Product | null>(null);

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
    data: productsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products", companyId, searchInput],
    queryFn: () => fetchProducts(searchInput, companyId),
    placeholderData: (previousData) => previousData,
    enabled: !!companyId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({
      productId,
      userId,
    }: {
      productId: number;
      userId: number;
    }) => deleteProductApi(productId, userId),
    onSuccess: () => {
      toast.success(`Product deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["products", companyId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

  // Status update mutation
  const statusUpdateMutation = useMutation({
    mutationFn: ({
      productId,
      status,
      updatedById,
    }: {
      productId: number;
      status: "ACTIVE" | "INACTIVE";
      updatedById: number;
    }) => updateProductStatusApi(productId, status, updatedById),
    onSuccess: (data, variables) => {
      const statusText = variables.status.toLowerCase();
      toast.success(`Product status updated to ${statusText}`);
      queryClient.invalidateQueries({ queryKey: ["products", companyId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product status: ${error.message}`);
    },
  });

  // Create column helper
  const columnHelper = createColumnHelper<Product>();

  // Define columns
  const columns = useMemo<ColumnDef<Product, any>[]>( // eslint-disable-line @typescript-eslint/no-explicit-any
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
        size: 80,
      }),
      columnHelper.accessor("name", {
        header: "Product Name",
        cell: (info) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-semibold text-xs">
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
      columnHelper.accessor("subcategory.product_category.name", {
        header: "Category",
        cell: (info) => (
          <div>
            <div className="font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-xs text-gray-500">
              {info.row.original.subcategory.name}
            </div>
          </div>
        ),
        size: 150,
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => (
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ₹{info.getValue().toLocaleString()}
            </span>
          </div>
        ),
        size: 120,
      }),
      columnHelper.accessor("warranty_time", {
        header: "Warranty",
        cell: (info) => {
          const days = info.getValue();
          const years = Math.floor(days / 365);
          const months = Math.floor((days % 365) / 30);
          const remainingDays = days % 30;

          let displayText = "";
          if (years > 0) displayText += `${years}y `;
          if (months > 0) displayText += `${months}m `;
          if (remainingDays > 0 || displayText === "")
            displayText += `${remainingDays}d`;

          return (
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                ⏱️ {displayText.trim()}
              </span>
            </div>
          );
        },
        size: 120,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const product = info.row.original;
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
                onClick={() => handleStatusToggle(product)}
                className={`hover:scale-105 transition-transform duration-200 ${
                  status === "ACTIVE"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-green-600 hover:bg-green-50"
                }`}
                title={`Click to ${
                  status === "ACTIVE" ? "deactivate" : "activate"
                } product`}
              >
                {status === "ACTIVE" ? "📴" : "✅"}
              </Button>
            </div>
          );
        },
        size: 160,
        filterFn: "equals",
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <div
            className="max-w-xs truncate text-gray-700"
            title={info.getValue()}
          >
            {info.getValue()}
          </div>
        ),
        size: 200,
      }),
      // Actions column
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center justify-center">
              <Dropdown
                menu={{
                  items: getActionMenuItems(product),
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  size="small"
                  className="hover:bg-purple-50 hover:text-purple-600 rounded-full h-8 w-8 flex items-center justify-center transition-all duration-200"
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
    if (!productsData?.data) return [];

    let filtered = [...productsData.data];

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    return filtered;
  }, [productsData, statusFilter]);

  // Create table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    pageCount: productsData
      ? Math.ceil(productsData.total / pagination.pageSize)
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
  const handleEdit = (product: Product) => {
    router.push(`/admin/companies/${companyId}/products/${product.id}/edit`);
  };

  // Handle view action
  const handleView = (product: Product) => {
    router.push(`/admin/companies/${companyId}/products/${product.id}`);
  };

  // Handle delete action
  const handleDelete = (product: Product) => {
    const userId = getCookie("id");

    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!productToDelete) return;

    const userId = getCookie("id");
    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    deleteMutation.mutate(
      {
        productId: productToDelete.id,
        userId: parseInt(userId.toString()),
      },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
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
    setProductToDelete(null);
  };

  // Handle status toggle
  const handleStatusToggle = (product: Product) => {
    const userId = getCookie("id");

    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    setProductToUpdateStatus(product);
    setIsStatusModalOpen(true);
  };

  // Handle confirm status update
  const handleConfirmStatusUpdate = () => {
    if (!productToUpdateStatus) return;

    const userId = getCookie("id");
    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    const newStatus =
      productToUpdateStatus.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    statusUpdateMutation.mutate(
      {
        productId: productToUpdateStatus.id,
        status: newStatus,
        updatedById: parseInt(userId.toString()),
      },
      {
        onSuccess: () => {
          setIsStatusModalOpen(false);
          setProductToUpdateStatus(null);
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
    setProductToUpdateStatus(null);
  };

  // Handle add product navigation
  const handleAddProduct = () => {
    router.push(`/admin/companies/${companyId}/products/create`);
  };

  // Handle back to company details
  const handleBackToCompany = () => {
    router.push(`/admin/companies/${companyId}`);
  };

  // Get action menu items for each row
  const getActionMenuItems = (product: Product) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "View",
      onClick: () => handleView(product),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => handleEdit(product),
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
      onClick: () => handleDelete(product),
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
            <span className="text-lg font-semibold text-gray-900">
              Delete Product
            </span>
          </div>
        }
        open={isDeleteModalOpen}
        onCancel={handleCancelDelete}
        footer={null}
        width={500}
        centered
      >
        {productToDelete && (
          <div className="py-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the product:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-400">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">
                      {productToDelete.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {productToDelete.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      ID: {productToDelete.id} •{" "}
                      {productToDelete.subcategory.product_category.name}
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
                      this product will be permanently deleted.
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
                {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
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
                productToUpdateStatus?.status === "ACTIVE"
                  ? "bg-red-100"
                  : "bg-green-100"
              }`}
            >
              <span className="text-lg">
                {productToUpdateStatus?.status === "ACTIVE" ? "📴" : "✅"}
              </span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {productToUpdateStatus?.status === "ACTIVE"
                ? "Deactivate"
                : "Activate"}{" "}
              Product
            </span>
          </div>
        }
        open={isStatusModalOpen}
        onCancel={handleCancelStatusUpdate}
        footer={null}
        width={500}
        centered
      >
        {productToUpdateStatus && (
          <div className="py-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to{" "}
                <strong>
                  {productToUpdateStatus.status === "ACTIVE"
                    ? "deactivate"
                    : "activate"}
                </strong>{" "}
                the product:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-400">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">
                      {productToUpdateStatus.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {productToUpdateStatus.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      ID: {productToUpdateStatus.id} •{" "}
                      {productToUpdateStatus.subcategory.product_category.name}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`mt-4 p-3 rounded-lg border ${
                  productToUpdateStatus.status === "ACTIVE"
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">
                    {productToUpdateStatus.status === "ACTIVE" ? "⚠️" : "ℹ️"}
                  </span>
                  <div>
                    <p
                      className={`font-medium text-sm ${
                        productToUpdateStatus.status === "ACTIVE"
                          ? "text-red-800"
                          : "text-green-800"
                      }`}
                    >
                      Status Change
                    </p>
                    <p
                      className={`text-sm ${
                        productToUpdateStatus.status === "ACTIVE"
                          ? "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      This will change the product status from{" "}
                      <strong>{productToUpdateStatus.status}</strong> to{" "}
                      <strong>
                        {productToUpdateStatus.status === "ACTIVE"
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
                  productToUpdateStatus.status === "ACTIVE"
                    ? "bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                    : "bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                }
                icon={
                  statusUpdateMutation.isPending
                    ? null
                    : productToUpdateStatus.status === "ACTIVE"
                    ? "📴"
                    : "✅"
                }
              >
                {statusUpdateMutation.isPending
                  ? "Updating..."
                  : `${
                      productToUpdateStatus.status === "ACTIVE"
                        ? "Deactivate"
                        : "Activate"
                    } Product`}
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
                type="text"
                onClick={handleBackToCompany}
                className="hover:bg-gray-100"
              >
                ← Back to Company
              </Button>
              <div>
                <Title level={3} className="!mb-0 text-gray-900">
                  Products
                </Title>
                <p className="text-sm text-gray-500 mt-1">
                  Company ID: {companyId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                onClick={handleAddProduct}
                className="bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700"
              >
                Add Product
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search products..."
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading products...</span>
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
                                  ? "cursor-pointer select-none hover:text-purple-600 transition-colors duration-200 flex items-center gap-2"
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
                      className={`transition-colors duration-200 hover:bg-purple-50 ${
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
                  <div className="text-gray-400 text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or add a new product
                  </p>
                  <Button
                    type="primary"
                    onClick={handleAddProduct}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700"
                  >
                    Add Product
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
                    productsData?.total || 0
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{productsData?.total || 0}</span>{" "}
                products
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
                  <span className="font-semibold text-purple-600">
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

export default ProductsPage;
