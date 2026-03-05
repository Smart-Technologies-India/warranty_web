"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Typography,
  Spin,
  Input,
  Card,
  Tag,
  Select,
  Row,
  Col,
  Empty,
  Pagination,
} from "antd";
import { ApiCall } from "@/services/api";
import {
  SearchOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getCookie } from "cookies-next";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// GraphQL Query
const GET_CUSTOMER_PRODUCTS = `
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
          image
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

// Interfaces
interface Product {
  name: string;
  id: number;
  image?: string;
  subcategory: {
    name: string;
    product_category: {
      name: string;
    };
  };
}

interface Sale {
  id: number;
  sale_date: string;
  warranty_till: number;
  product: Product;
}

interface SalesResponse {
  skip: number;
  take: number;
  total: number;
  data: Sale[];
}

// Fetch function
const fetchCustomerProducts = async (
  customerId: number,
  skip: number = 0,
  take: number = 20,
  search: string = ""
): Promise<SalesResponse> => {
  const response = await ApiCall<{ getPaginatedSales: SalesResponse }>({
    query: GET_CUSTOMER_PRODUCTS,
    variables: {
      searchPaginationInput: {
        skip,
        take,
        search,
      },
      whereSearchInput: {
        customer_id: customerId,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getPaginatedSales;
};

const CustomerProductsPage: React.FC = () => {
  const router = useRouter();
  const userId: number = parseInt(getCookie("id") as string);

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Calculate pagination values
  const pagination = useMemo(
    () => ({
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    [currentPage, pageSize]
  );

  // Fetch customer products
  const {
    data: salesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "customerProducts",
      userId,
      pagination.skip,
      pagination.take,
      searchTerm,
      selectedCategory,
    ],
    queryFn: () =>
      fetchCustomerProducts(
        userId,
        pagination.skip,
        pagination.take,
        searchTerm
      ),
    enabled: !!userId,
  });

  // Pagination handlers
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  // Reset pagination when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1); // Reset to first page
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page
  };

  // Group products by category
  const groupedProducts = useMemo(() => {
    if (!salesData?.data) return {};

    const grouped = salesData.data.reduce((acc, sale) => {
      const categoryName = sale.product.subcategory.product_category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(sale);
      return acc;
    }, {} as Record<string, Sale[]>);

    // Sort products within each category
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => {
        switch (sortBy) {
          case "recent":
            return (
              new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()
            );
          case "name":
            return a.product.name.localeCompare(b.product.name);
          case "warranty":
            return b.warranty_till - a.warranty_till;
          default:
            return 0;
        }
      });
    });

    return grouped;
  }, [salesData, sortBy]);

  // Filter categories
  const filteredCategories = useMemo(() => {
    if (selectedCategory === "all") return groupedProducts;

    return {
      [selectedCategory]: groupedProducts[selectedCategory] || [],
    };
  }, [groupedProducts, selectedCategory]);

  // Get all categories for filter
  const categories = useMemo(() => {
    return Object.keys(groupedProducts);
  }, [groupedProducts]);

  // Calculate warranty status
  const getWarrantyStatus = (saleDate: string, warrantyDays: number) => {
    const purchaseDate = new Date(saleDate);
    const warrantyEndDate = new Date(
      purchaseDate.getTime() + warrantyDays * 24 * 60 * 60 * 1000
    );
    const now = new Date();
    const daysLeft = Math.ceil(
      (warrantyEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft > 30) {
      return { status: "Active", color: "green", days: daysLeft };
    } else if (daysLeft > 0) {
      return { status: "Expiring Soon", color: "orange", days: daysLeft };
    } else {
      return { status: "Expired", color: "red", days: Math.abs(daysLeft) };
    }
  };

  // Render product card
  const renderProductCard = (sale: Sale) => {
    const warranty = getWarrantyStatus(sale.sale_date, sale.warranty_till);

    return (
      <Card
        key={sale.id}
        hoverable
        className="h-full"
        cover={
          <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
            {sale.product.image ? (
              <img
                alt={sale.product.name}
                src={sale.product.image}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <ShoppingOutlined style={{ fontSize: 48 }} />
                <Text className="mt-2 text-xs">No Image</Text>
              </div>
            )}
          </div>
        }
        actions={[
          <Button
            key="view"
            type="primary"
            size="small"
            className="w-44 mx-2"
            onClick={() =>
              router.push(`/customer/products/${sale.id}`)
            }
          >
            View Details
          </Button>,
        ]}
      >
        <Card.Meta
          title={
            <div className="space-y-2">
              <Text strong className="text-base line-clamp-2">
                {sale.product.name}
              </Text>
              <div className="flex items-center justify-between">
                <Tag color="blue" className="text-xs">
                  {sale.product.subcategory.name}
                </Tag>
                <Tag color={warranty.color} className="text-xs">
                  {warranty.status}
                </Tag>
              </div>
            </div>
          }
          description={
            <div className="space-y-2">
              <div className="flex items-center text-gray-600 text-xs">
                <CalendarOutlined className="mr-1" />
                <span>
                  Purchased: {new Date(sale.sale_date).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-gray-600">Warranty: </span>
                <span
                  className={`font-medium ${
                    warranty.color === "red"
                      ? "text-red-500"
                      : warranty.color === "orange"
                      ? "text-orange-500"
                      : "text-green-500"
                  }`}
                >
                  {warranty.days > 0
                    ? `${warranty.days} days ${
                        warranty.status === "Expired" ? "ago" : "left"
                      }`
                    : warranty.status}
                </span>
              </div>
            </div>
          }
        />
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Text type="danger">Error loading products: {error.message}</Text>
          <br />
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <Title level={2} className="!mb-1 text-gray-900">
                My Products
              </Title>
              <div className="space-y-1">
                <Text className="text-gray-600">
                  {salesData?.total || 0} total products in your warranty
                  portfolio
                </Text>
                {salesData && (
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span>
                      Page {currentPage} of{" "}
                      {Math.ceil(salesData.total / pageSize)}
                    </span>
                    <span>•</span>
                    <span>
                      Showing {Math.min(pageSize, salesData.data.length)}{" "}
                      products
                    </span>
                    {selectedCategory !== "all" && (
                      <>
                        <span>•</span>
                        <span>Filtered by: {selectedCategory}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button
              type="text"
              onClick={() => router.push(`/customer`)}
              className="self-start lg:self-center"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Warranty Summary */}
        {salesData && salesData.data.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Title level={4} className="!mb-4 text-gray-900">
              Warranty Overview (Current Page)
            </Title>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="text-green-700 text-sm font-medium">
                      Active Warranties
                    </Text>
                    <div className="text-2xl font-bold text-green-800">
                      {
                        salesData.data.filter((sale) => {
                          const warranty = getWarrantyStatus(
                            sale.sale_date,
                            sale.warranty_till
                          );
                          return warranty.status === "Active";
                        }).length
                      }
                    </div>
                  </div>
                  <CheckCircleOutlined className="text-3xl text-green-600" />
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="text-orange-700 text-sm font-medium">
                      Expiring Soon
                    </Text>
                    <div className="text-2xl font-bold text-orange-800">
                      {
                        salesData.data.filter((sale) => {
                          const warranty = getWarrantyStatus(
                            sale.sale_date,
                            sale.warranty_till
                          );
                          return warranty.status === "Expiring Soon";
                        }).length
                      }
                    </div>
                  </div>
                  <CalendarOutlined className="text-3xl text-orange-600" />
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="text-red-700 text-sm font-medium">
                      Expired
                    </Text>
                    <div className="text-2xl font-bold text-red-800">
                      {
                        salesData.data.filter((sale) => {
                          const warranty = getWarrantyStatus(
                            sale.sale_date,
                            sale.warranty_till
                          );
                          return warranty.status === "Expired";
                        }).length
                      }
                    </div>
                  </div>
                  <CloseCircleOutlined className="text-3xl text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <Search
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onSearch={(value) => handleSearchChange(value)}
              className="w-full"
            />

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              placeholder="Filter by category"
              className="w-full"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">
                All Categories ({Object.keys(groupedProducts).length})
              </Option>
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category} ({groupedProducts[category]?.length || 0})
                </Option>
              ))}
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={handleSortChange}
              placeholder="Sort by"
              className="w-full"
            >
              <Option value="recent">Most Recent</Option>
              <Option value="name">Product Name</Option>
              <Option value="warranty">Warranty Period</Option>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <Spin size="large" />
            </div>
          )}

          {Object.keys(filteredCategories).length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <Empty
                description="No products found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => handleSearchChange("")}>
                  Clear Filters
                </Button>
              </Empty>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(filteredCategories).map(
                ([categoryName, products]) => (
                  <div
                    key={categoryName}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Title level={3} className="!mb-0 text-gray-900">
                          {categoryName}
                        </Title>
                        <Tag color="blue" className="text-sm">
                          {products.length}{" "}
                          {products.length === 1 ? "product" : "products"}
                        </Tag>
                      </div>
                    </div>

                    <Row gutter={[16, 16]}>
                      {products.map((sale) => (
                        <Col key={sale.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                          {renderProductCard(sale)}
                        </Col>
                      ))}
                    </Row>
                  </div>
                )
              )}
            </div>
          )}
          <div className="mt-4"></div>
          {/* Pagination */}
          {salesData && salesData.total > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing {pagination.skip + 1} to{" "}
                  {Math.min(pagination.skip + pageSize, salesData.total)} of{" "}
                  {salesData.total} products
                </div>

                <Pagination
                  current={currentPage}
                  total={salesData.total}
                  pageSize={pageSize}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} products`
                  }
                  onChange={handlePageChange}
                  onShowSizeChange={handlePageChange}
                  pageSizeOptions={["10", "20", "50", "100"]}
                  className="text-center"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProductsPage;
