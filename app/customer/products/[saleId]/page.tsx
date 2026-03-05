"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Typography,
  Spin,
  Card,
  Tag,
  Descriptions,
  Alert,
  Avatar,
} from "antd";
import { ApiCall } from "@/services/api";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { getCookie } from "cookies-next";

const { Title, Text } = Typography;

// GraphQL Query for single sale/product
const GET_SALE_BY_ID = `
  query GetSalesById($getSalesByIdId: Int!) {
    getSalesById(id: $getSalesByIdId) {
      id
      sale_date
      warranty_till
      product {
        name
        id
        image
        description
        subcategory {
          name
          product_category {
            name
          }
        }
      }
      customer {
        name
        contact1
        email
      }
    }
  }
`;

interface Product {
  name: string;
  id: number;
  image?: string;
  description?: string;
  subcategory: {
    name: string;
    product_category: {
      name: string;
    };
  };
}

interface Customer {
  name: string;
  contact1: string;
  email?: string;
}

interface Sale {
  id: number;
  sale_date: string;
  warranty_till: number;
  product: Product;
  customer: Customer;
}

const fetchSaleById = async (saleId: number): Promise<Sale> => {
  const response = await ApiCall<{ getSalesById: Sale }>({
    query: GET_SALE_BY_ID,
    variables: {
      getSalesByIdId: saleId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getSalesById;
};

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const userId: number = parseInt(getCookie("id") as string);
  const saleId = parseInt(params.saleId as string);

  const {
    data: saleData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["saleDetail", saleId],
    queryFn: () => fetchSaleById(saleId),
    enabled: !!saleId,
  });

  const getWarrantyStatus = (saleDate: string, warrantyDays: number) => {
    const purchaseDate = new Date(saleDate);
    const warrantyEndDate = new Date(
      purchaseDate.getTime() + warrantyDays * 24 * 60 * 60 * 1000
    );
    const now = new Date();
    const daysLeft = Math.ceil(
      (warrantyEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      daysLeft,
      endDate: warrantyEndDate,
      isActive: daysLeft > 0,
      isExpiringSoon: daysLeft <= 30 && daysLeft > 0,
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !saleData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Text type="danger">
            {error ? `Error: ${error.message}` : "Product not found"}
          </Text>
          <br />
          <Button
            onClick={() => router.push(`/customer/products`)}
            className="mt-4"
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const warranty = getWarrantyStatus(
    saleData.sale_date,
    saleData.warranty_till
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/customer/products`)}
              className="hover:bg-gray-100"
            >
              Back to Products
            </Button>
            <div>
              <Title level={3} className="!mb-0 text-gray-900">
                Product Details
              </Title>
              <Text className="text-gray-600">Purchase ID: #{saleData.id}</Text>
            </div>
          </div>
        </div>

        {/* Warranty Status Alert */}
        {warranty.isExpiringSoon && warranty.isActive ? (
          <Alert
            message="Warranty Expiring Soon"
            description={`Your warranty will expire in ${
              warranty.daysLeft
            } days on ${warranty.endDate.toLocaleDateString()}`}
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            closable
          />
        ) : warranty.isActive ? (
          <Alert
            message="Warranty Active"
            description={`Your warranty is valid for ${
              warranty.daysLeft
            } more days until ${warranty.endDate.toLocaleDateString()}`}
            type="success"
            icon={<CheckCircleOutlined />}
            showIcon
            closable
          />
        ) : (
          <Alert
            message="Warranty Expired"
            description={`Your warranty expired ${Math.abs(
              warranty.daysLeft
            )} days ago on ${warranty.endDate.toLocaleDateString()}`}
            type="error"
            icon={<WarningOutlined />}
            showIcon
            closable
          />
        )}
        <div></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Image */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {saleData.product.image ? (
                  <img
                    src={saleData.product.image}
                    alt={saleData.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <ShoppingOutlined style={{ fontSize: 64 }} />
                      <div className="mt-2">No Image Available</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Tag color="blue">
                    {saleData.product.subcategory.product_category.name}
                  </Tag>
                  <Tag color="green">{saleData.product.subcategory.name}</Tag>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarOutlined className="mr-2" />
                    <span>
                      Purchased:{" "}
                      {new Date(saleData.sale_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <Title level={4} className="!mb-4">
                {saleData.product.name}
              </Title>

              {saleData.product.description && (
                <div className="mb-6">
                  <Text className="text-gray-700">
                    {saleData.product.description}
                  </Text>
                </div>
              )}

              <Descriptions column={1} bordered>
                <Descriptions.Item label="Product ID">
                  {saleData.product.id}
                </Descriptions.Item>
                <Descriptions.Item label="Category">
                  {saleData.product.subcategory.product_category.name}
                </Descriptions.Item>
                <Descriptions.Item label="Subcategory">
                  {saleData.product.subcategory.name}
                </Descriptions.Item>
                <Descriptions.Item label="Purchase Date">
                  {new Date(saleData.sale_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Descriptions.Item>
                <Descriptions.Item label="Warranty Period">
                  {saleData.warranty_till} days
                </Descriptions.Item>
                <Descriptions.Item label="Warranty Expires">
                  {warranty.endDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Descriptions.Item>
                <Descriptions.Item label="Warranty Status">
                  <Tag
                    color={
                      warranty.isActive
                        ? warranty.isExpiringSoon
                          ? "orange"
                          : "green"
                        : "red"
                    }
                    className="text-sm"
                  >
                    {warranty.isActive
                      ? warranty.isExpiringSoon
                        ? "Expiring Soon"
                        : "Active"
                      : "Expired"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <div></div>
            {/* Customer Info */}
            <Card>
              <Title level={5} className="!mb-4">
                Customer Information
              </Title>

              <Descriptions column={1} bordered>
                <Descriptions.Item label="Customer Name">
                  {saleData.customer.name}
                </Descriptions.Item>
                <Descriptions.Item label="Contact Number">
                  {saleData.customer.contact1}
                </Descriptions.Item>
                {saleData.customer.email && (
                  <Descriptions.Item label="Email">
                    {saleData.customer.email}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
            <div></div>

            {/* Actions */}
            <Card>
              <Title level={5} className="!mb-4">
                Available Actions
              </Title>

              <div className="space-y-3">
                <Button
                  type="primary"
                  size="large"
                  className="w-full md:w-auto"
                  disabled={!warranty.isActive}
                  onClick={() =>
                    router.push(
                      `/customer/products/${saleId}/claim`
                    )
                  }
                >
                  {warranty.isActive ? "Claim Warranty" : "Warranty Expired"}
                </Button>

                <Button size="large" className="w-full md:w-auto ml-0 md:ml-3">
                  Download Warranty Certificate
                </Button>

                <Button size="large" className="w-full md:w-auto ml-0 md:ml-3">
                  Contact Support
                </Button>
              </div>

              {!warranty.isActive && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Text type="danger" className="text-sm">
                    <WarningOutlined className="mr-2" />
                    This product's warranty has expired. Contact support for
                    out-of-warranty service options.
                  </Text>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
