"use client";

import React from "react";
import { Card, Typography, Tag, Button, Descriptions, Divider } from "antd";
import { useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { useRouter } from "next/navigation";

// Icons
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  BankOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Types
interface DealerStockDetail {
  id: number;
  batch_number: string;
  quantity: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  product: {
    id: number;
    name: string;
    price: number;
    warranty_time: number;
    status: "ACTIVE" | "INACTIVE";
    description: string;
    subcategory: {
      name: string;
      product_category: {
        name: string;
      };
    };
  };
  dealer: {
    id: number;
    name: string;
  };
  company: {
    id: number;
    name: string;
  };
}

// GraphQL query
const GET_DEALER_STOCK_BY_ID = `
  query GetDealerStockById($getDealerStockByIdId: Int!) {
    getDealerStockById(id: $getDealerStockByIdId) {
      batch_number
      createdAt
      id
      product {
        name
        price
        id
        warranty_time
        status
        description
        subcategory {
          name
          product_category {
            name
          }
        }
      }
      quantity
      status
      dealer {
        name
        id
      }
      company {
        name
        id
      }
    }
  }
`;

// API function
const fetchDealerStockById = async (
  stockId: number
): Promise<DealerStockDetail> => {
  const response = await ApiCall<{ getDealerStockById: DealerStockDetail }>({
    query: GET_DEALER_STOCK_BY_ID,
    variables: {
      getDealerStockByIdId: stockId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getDealerStockById;
};

interface DealerStockViewPageProps {
  params: Promise<{
    id: string;
    stockId: string;
  }>;
}

const DealerStockViewPage: React.FC<DealerStockViewPageProps> = ({
  params,
}) => {
  const router = useRouter();
  const unwrappedParams = React.use(params) as { id: string; stockId: string };
  const dealerId = parseInt(unwrappedParams.id);
  const stockId = parseInt(unwrappedParams.stockId);

  // Fetch stock details
  const {
    data: stockData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dealerStock", stockId],
    queryFn: () => fetchDealerStockById(stockId),
    enabled: !!stockId,
  });

  const handleBack = () => {
    router.push(`/admin/dealers/${dealerId}/stock`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stock details...</p>
        </div>
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-8">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <Title level={3} className="text-gray-900">
                Stock Not Found
              </Title>
              <p className="text-gray-600 mb-6">
                The stock item you're looking for doesn't exist or has been
                removed.
              </p>
              <Button
                type="primary"
                onClick={handleBack}
                className="bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700"
              >
                Back to Stock List
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
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
                Back to Stock
              </Button>
              <div>
                <Title level={3} className="!mb-0 text-gray-900">
                  Stock Details #{stockData.id}
                </Title>
                <p className="text-gray-500 mt-1">
                  Batch: {stockData.batch_number}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag
                color={stockData.status === "ACTIVE" ? "green" : "red"}
                className="text-sm px-3 py-1"
              >
                {stockData.status}
              </Tag>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stock Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stock Overview */}
            <Card title="Stock Overview" className="shadow-sm">
              <Descriptions column={2}>
                <Descriptions.Item
                  label={<span className="font-semibold">Stock ID</span>}
                >
                  <span className="font-mono text-gray-800">
                    #{stockData.id}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<span className="font-semibold">Batch Number</span>}
                >
                  <Tag color="blue" className="font-mono">
                    {stockData.batch_number}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<span className="font-semibold">Quantity</span>}
                >
                  <span className="text-2xl font-bold text-gray-900">
                    {stockData.quantity}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">units</span>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<span className="font-semibold">Status</span>}
                >
                  <Tag color={stockData.status === "ACTIVE" ? "green" : "red"}>
                    {stockData.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<span className="font-semibold">Created Date</span>}
                  span={2}
                >
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-gray-400" />
                    <span>
                      {new Date(stockData.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500">
                      at {new Date(stockData.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <div></div>

            {/* Product Information */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <ShoppingOutlined />
                  <span>Product Information</span>
                </div>
              }
              className="shadow-sm"
            >
              <div className="space-y-4">
                <div>
                  <Text strong className="text-lg text-gray-900">
                    {stockData.product.name}
                  </Text>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag color="orange">ID: {stockData.product.id}</Tag>
                    <Tag
                      color={
                        stockData.product.status === "ACTIVE" ? "green" : "red"
                      }
                    >
                      {stockData.product.status}
                    </Tag>
                  </div>
                </div>

                <Divider />

                <Descriptions column={2}>
                  <Descriptions.Item
                    label={<span className="font-semibold">Price</span>}
                  >
                    <span className="text-xl font-bold text-green-600">
                      ₹{stockData.product.price.toLocaleString()}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<span className="font-semibold">Warranty</span>}
                  >
                    <span className="font-semibold text-blue-600">
                      {stockData.product.warranty_time} days
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<span className="font-semibold">Category</span>}
                    span={2}
                  >
                    <div className="flex items-center gap-2">
                      <Tag color="purple">
                        {stockData.product.subcategory.product_category.name}
                      </Tag>
                      <span className="text-gray-400">→</span>
                      <Tag color="cyan">
                        {stockData.product.subcategory.name}
                      </Tag>
                    </div>
                  </Descriptions.Item>
                </Descriptions>

                {stockData.product.description && (
                  <>
                    <Divider />
                    <div>
                      <Text strong>Product Description:</Text>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <Text className="text-gray-700">
                          {stockData.product.description}
                        </Text>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Dealer Information */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <BankOutlined />
                  <span>Dealer Information</span>
                </div>
              }
              className="shadow-sm"
            >
              <div className="space-y-3">
                <div>
                  <Text type="secondary" className="text-sm">
                    Dealer Name
                  </Text>
                  <div className="font-semibold text-gray-900">
                    {stockData.dealer.name}
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">
                    Dealer ID
                  </Text>
                  <div className="font-mono text-gray-600">
                    #{stockData.dealer.id}
                  </div>
                </div>
                <Button
                  type="link"
                  className="p-0 h-auto"
                  onClick={() =>
                    router.push(`/admin/dealers/${stockData.dealer.id}`)
                  }
                >
                  View Dealer Profile →
                </Button>
              </div>
            </Card>
            <div></div>

            {/* Company Information */}
            <Card title="Company Information" className="shadow-sm">
              <div className="space-y-3">
                <div>
                  <Text type="secondary" className="text-sm">
                    Company Name
                  </Text>
                  <div className="font-semibold text-gray-900">
                    {stockData.company.name}
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">
                    Company ID
                  </Text>
                  <div className="font-mono text-gray-600">
                    #{stockData.company.id}
                  </div>
                </div>
                <Button
                  type="link"
                  className="p-0 h-auto"
                  onClick={() =>
                    router.push(`/admin/companies/${stockData.company.id}`)
                  }
                >
                  View Company Profile →
                </Button>
              </div>
            </Card>
            <div></div>

            {/* Quick Stats */}
            <Card title="Quick Stats" className="shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700 font-medium">Total Value</span>
                  <span className="text-blue-900 font-bold text-lg">
                    ₹
                    {(
                      stockData.quantity * stockData.product.price
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700 font-medium">Per Unit</span>
                  <span className="text-green-900 font-bold text-lg">
                    ₹{stockData.product.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-purple-700 font-medium">Stock Age</span>
                  <span className="text-purple-900 font-bold">
                    {Math.floor(
                      (Date.now() - new Date(stockData.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerStockViewPage;
