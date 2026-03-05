"use client";

import React from "react";
import { Card, Typography, Button, Spin, Descriptions, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { useRouter } from "next/navigation";

// Icons
import {
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Types
interface DealerSaleDetails {
  id: number;
  quantity: number;
  batch_number: string;
  sale_date: string;
  warranty_till: number;
  dealer: {
    id: number;
    name: string;
    email: string;
    contact1: string;
    address: string;
    zone: {
      name: string;
      city: {
        name: string;
      };
    };
  };
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
  company: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// GraphQL query
const GET_DEALER_SALE_BY_ID = `
  query GetDealerSalesById($id: Int!) {
    getDealerSalesById(id: $id) {
      id
      quantity
      batch_number
      sale_date
      warranty_till
      dealer {
        id
        name
        email
        contact1
        address
        zone {
          name
          city {
            name
          }
        }
      }
      product {
        id
        name
        subcategory {
          name
          product_category {
            name
          }
        }
      }
      company {
        id
        name,
      }
      createdAt
      updatedAt
    }
  }
`;

// API function
const fetchDealerSaleById = async (id: number): Promise<DealerSaleDetails> => {
  const response = await ApiCall<{ getDealerSalesById: DealerSaleDetails }>({
    query: GET_DEALER_SALE_BY_ID,
    variables: {
      id: id,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getDealerSalesById;
};

interface ViewSalePageProps {
  params: {
    id: string;
    saleId: string;
  };
}

const ViewSalePage: React.FC<ViewSalePageProps> = ({ params }) => {
  const router = useRouter();
  const companyId = parseInt(params.id);
  const saleId = parseInt(params.saleId);

  // Fetch sale details
  const {
    data: sale,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dealerSale", saleId],
    queryFn: () => fetchDealerSaleById(saleId),
    enabled: !!saleId,
  });

  // Handle back navigation
  const handleBack = () => {
    router.push(`/admin/companies/${companyId}/sale`);
  };

  // Handle edit
  // const handleEdit = () => {
  //   router.push(`/admin/companies/${companyId}/sale/${saleId}/edit`);
  // };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">
                Error: {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <Button onClick={handleBack} type="primary">
                Back to Sales
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Sale record not found</p>
              <Button onClick={handleBack} type="primary">
                Back to Sales
              </Button>
            </div>
          </Card>
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
                Back to Sales
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl font-bold">💰</span>
                </div>
                <div>
                  <Title level={3} className="!mb-0 text-gray-900">
                    Sale #{sale.id}
                  </Title>
                  <Text type="secondary">Dealer Sale Details</Text>
                </div>
              </div>
            </div>
            {/* <div className="flex items-center gap-3">
              <Button
                icon={<EditOutlined />}
                onClick={handleEdit}
                type="primary"
                className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
              >
                Edit Sale
              </Button>
            </div> */}
          </div>
        </div>

        {/* Sale Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sale Details */}
          <Card title="Sale Information" className="shadow-sm">
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Sale ID">
                <Text strong>#{sale.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                <Tag color="blue" className="font-medium">
                  📦 {sale.quantity} units
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Batch Number">
                <Tag color="purple" className="font-medium">
                  🏷️ {sale.batch_number}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Sale Date">
                <div>
                  <div className="font-medium text-gray-900">
                    {new Date(sale.sale_date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(sale.sale_date).toLocaleTimeString()}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Warranty Period">
                <Tag color="green" className="font-medium">
                  ⏰ {sale.warranty_till} days
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(sale.createdAt).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {new Date(sale.updatedAt).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Product Details */}
          <Card title="Product Information" className="shadow-sm">
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Product Name">
                <Text strong className="text-gray-900">{sale.product.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color="orange">{sale.product.subcategory.product_category.name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Subcategory">
                <Tag color="cyan">{sale.product.subcategory.name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Product ID">
                <Text type="secondary">#{sale.product.id}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        {/* Company and Dealer Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Details */}
          <Card title="Company Information" className="shadow-sm">
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Company Name">
                <Text strong className="text-gray-900">{sale.company.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Company ID">
                <Text type="secondary">#{sale.company.id}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Dealer Details */}
          <Card title="Dealer Information" className="shadow-sm">
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Dealer Name">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-xs">
                      {sale.dealer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <Text strong className="text-gray-900">{sale.dealer.name}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Text className="text-gray-700">{sale.dealer.email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                <Text className="text-gray-700">{sale.dealer.contact1}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                <div>
                  <div className="font-medium text-gray-900">{sale.dealer.zone.city.name}</div>
                  <div className="text-sm text-gray-500">{sale.dealer.zone.name}</div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <Text className="text-gray-700">{sale.dealer.address}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Dealer ID">
                <Text type="secondary">#{sale.dealer.id}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        {/* Summary Card */}
        <Card title="Sale Summary" className="shadow-sm">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">{sale.quantity}</div>
                <div className="text-sm text-gray-600">Units Sold</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-lg font-bold text-blue-600">{sale.product.name}</div>
                <div className="text-sm text-gray-600">Product</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-lg font-bold text-orange-600">{sale.dealer.name}</div>
                <div className="text-sm text-gray-600">Dealer</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-lg font-bold text-purple-600">{sale.batch_number}</div>
                <div className="text-sm text-gray-600">Batch</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-lg font-bold text-indigo-600">{sale.warranty_till}</div>
                <div className="text-sm text-gray-600">Warranty Days</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ViewSalePage;