"use client";

import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Input,
  Spin,
  Modal,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  ArrowLeftOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;

// Types
interface Customer {
  id: number;
  name: string;
  contact1: string;
  email?: string;
}

interface Product {
  id: number;
  name: string;
  model_no?: string;
}

interface Company {
  id: number;
  name: string;
}

interface Dealer {
  id: number;
  name: string;
}

interface CustomerSale {
  id: number;
  sale_date: string;
  warranty_till: number;
  product: {
    id: number;
    name: string;
    subcategory: {
      name: string;
      product_category: {
        name: string;
      };
    };
  };
}

interface PaginatedSalesResponse {
  skip: number;
  take: number;
  total: number;
  data: CustomerSale[];
}

// GraphQL queries
const GET_PAGINATED_SALES = `
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
        product {
          name
          id
          subcategory {
            name
            product_category {
              name
            }
          }
        }
      }
    }
  }
`;

// API functions
const fetchCustomerSales = async (
  dealerId: number,
  searchPaginationInput: {
    take: number;
    skip: number;
    search?: string;
  }
): Promise<PaginatedSalesResponse> => {
  const whereSearchInput: Record<string, any> = {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    dealer_id: dealerId,
  };

  const response = await ApiCall<{ getPaginatedSales: PaginatedSalesResponse }>(
    {
      query: GET_PAGINATED_SALES,
      variables: {
        searchPaginationInput,
        whereSearchInput,
      },
    }
  );

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getPaginatedSales;
};

interface CustomerSalesPageProps {
  params: Promise<{
    id: string;
  }>;
}

const CustomerSalesPage: React.FC<CustomerSalesPageProps> = () => {
  const router = useRouter();
  const params = useParams();

  const dealerId = parseInt(params.id as string);

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch customer sales
  const {
    data: salesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customerSales", dealerId, searchTerm, currentPage, pageSize],
    queryFn: () =>
      fetchCustomerSales(dealerId, {
        take: pageSize,
        skip: (currentPage - 1) * pageSize,
        ...(searchTerm && { search: searchTerm }),
      }),
    enabled: !!dealerId,
  });

  const customerSales = salesResponse?.data || [];
  const totalSales = salesResponse?.total || 0;

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle back navigation
  const handleBack = () => {
    router.push(`/dealer/${dealerId}`);
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      render: (id: number) => (
        <Tag color="blue" className="text-xs">
          #{id}
        </Tag>
      ),
    },
    {
      title: "Product",
      key: "product",
      width: 200,
      render: (record: CustomerSale) => (
        <div className="max-w-48">
          <div
            className="font-medium text-gray-900 text-sm truncate"
            title={record.product.name}
          >
            {record.product.name}
          </div>
          <div
            className="text-xs text-gray-500 truncate"
            title={`ID: ${record.product.id}`}
          >
            ID: {record.product.id}
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      key: "category",
      width: 150,
      render: (record: CustomerSale) => (
        <div>
          <div className="text-xs font-medium text-purple-700 mb-1">
            {record.product.subcategory.product_category.name}
          </div>
          <div className="text-xs text-gray-600">
            {record.product.subcategory.name}
          </div>
        </div>
      ),
    },
    {
      title: "Warranty",
      dataIndex: "warranty_till",
      key: "warranty_till",
      width: 90,
      render: (warranty: number) => (
        <Tag color="green" className="text-xs">
          {warranty}d
        </Tag>
      ),
    },
    {
      title: "Sale Date",
      dataIndex: "sale_date",
      key: "sale_date",
      width: 110,
      render: (date: string) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900">
            {new Date(date).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 70,
      render: (record: CustomerSale) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/dealer/${dealerId}/sale/${record.id}`)}
          title="View Details"
          className="hover:bg-blue-50 hover:text-blue-600"
        />
      ),
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <Title level={4} className="text-red-600">
              Failed to Load Sales
            </Title>
            <p className="text-gray-600 mb-4">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred"}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
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
                Back to Dealer
              </Button>
              <div>
                <Title
                  level={3}
                  className="!mb-0 text-gray-900 flex items-center gap-2"
                >
                  <ShoppingCartOutlined className="text-green-600" />
                  Customer Sales
                </Title>
                <p className="text-gray-500 mt-1">
                  Manage customer sales for dealer #{dealerId}
                </p>
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push(`/dealer/${dealerId}/sale/add`)}
              className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
              size="large"
            >
              Add New Sale
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Search
                placeholder="Search by customer name..."
                onSearch={handleSearch}
                onChange={(e) => {
                  if (!e.target.value) {
                    handleSearch("");
                  }
                }}
                allowClear
                size="large"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Total Sales:</span>
              <Tag color="blue">{totalSales}</Tag>
            </div>
          </div>
        </Card>

        {/* Sales Table */}
        <Card title="Customer Sales" className="shadow-sm">
          <Table
            columns={columns}
            dataSource={customerSales}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalSales,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} sales`,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, size) => {
                setCurrentPage(page);
                if (size !== pageSize) {
                  setPageSize(size);
                  setCurrentPage(1);
                }
              },
            }}
            scroll={{ x: 800 }}
            locale={{
              emptyText: (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">🛒</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Sales Found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm
                      ? `No sales found matching "${searchTerm}"`
                      : "No customer sales have been created yet"}
                  </p>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => router.push(`/dealer/${dealerId}/sale/add`)}
                    className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                  >
                    Create First Sale
                  </Button>
                </div>
              ),
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default CustomerSalesPage;
