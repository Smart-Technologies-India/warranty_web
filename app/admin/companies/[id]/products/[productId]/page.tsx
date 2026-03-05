"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { Button, Typography, Spin, Card, Descriptions, Tag } from "antd";

const { Title, Text } = Typography;

// Types
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  company_id: number;
  warranty_time: number;
  subcategory: {
    id: number;
    name: string;
    product_category: {
      id: number;
      name: string;
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
const GET_PRODUCT_BY_ID = `
  query GetProductById($productId: Int!) {
    getProductById(id: $productId) {
      id
      name
      price
      description
      company_id
      warranty_time
      subcategory {
        id
        name
        product_category {
          id
          name
        }
      }
      company {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

const fetchProductById = async (productId: number): Promise<Product> => {
  const response = await ApiCall<{ getProductById: Product }>({
    query: GET_PRODUCT_BY_ID,
    variables: {
      productId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getProductById;
};

const ProductDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);
  const productId = parseInt(params.productId as string);

  const {
    data: productData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    enabled: !!productId,
  });

  const handleBack = () => {
    router.push(`/admin/companies/${companyId}/product`);
  };

  const handleEdit = () => {
    router.push(`/admin/companies/${companyId}/product/${productId}/edit`);
  };

  const formatWarrantyTime = (days: number) => {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;

    let displayText = "";
    if (years > 0) displayText += `${years} year${years > 1 ? "s" : ""} `;
    if (months > 0) displayText += `${months} month${months > 1 ? "s" : ""} `;
    if (remainingDays > 0 || displayText === "") displayText += `${remainingDays} day${remainingDays > 1 ? "s" : ""}`;

    return displayText.trim();
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
            <p className="text-gray-500 mb-4">
              {error instanceof Error ? error.message : "The requested product could not be found."}
            </p>
            <Button type="primary" onClick={handleBack}>
              Back to Products
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button type="text" onClick={handleBack} className="hover:bg-gray-100 transition">
              ← Back
            </Button>
            <div className="flex-shrink-0 h-14 w-14 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold text-xl">
                {productData?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <Title level={3} className="!mb-0 text-gray-900">
                {productData?.name}
              </Title>
              <p className="text-gray-600 text-sm">
                Product ID: {productData?.id} • {productData?.company.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="primary"
              onClick={handleEdit}
              className="bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700 transition"
            >
              Edit Product
            </Button>
          </div>
        </div>

        {/* Main Content: Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Product Details */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="text-lg font-semibold text-purple-700">Product Information</span>
              </div>
            }
            className="shadow-sm border-purple-100"
          >
            <Descriptions column={1} className="mb-6">
              <Descriptions.Item label="Product Name">
                <Text strong className="text-purple-900 text-lg">
                  {productData?.name}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Price">
                <Tag color="green" className="text-base px-3 py-1">
                  ₹{productData?.price.toLocaleString()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Text className="text-gray-700">{productData?.subcategory.product_category.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Subcategory">
                <Text className="text-gray-700">{productData?.subcategory.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Warranty Period">
                <Tag color="blue" className="text-base px-3 py-1">
                  ⏱️ {formatWarrantyTime(productData?.warranty_time || 0)}
                </Tag>
                <div className="text-xs text-gray-500 mt-1">
                  ({productData?.warranty_time} days)
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                <Text className="text-gray-700">{productData?.description}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Right: Company & Metadata */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1"
                  />
                </svg>
                <span className="font-semibold text-blue-700">Company & Details</span>
              </div>
            }
            className="shadow-sm border-blue-100"
          >
            <div className="space-y-4 mb-6">
              <div>
                <Text className="text-gray-500 text-sm block">Company</Text>
                <Text strong className="text-gray-900 text-lg">
                  {productData?.company.name}
                </Text>
              </div>
              <div>
                <Text className="text-gray-500 text-sm block">Company ID</Text>
                <Text className="text-gray-700">{productData?.company_id}</Text>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Text className="text-blue-600 text-sm font-medium block mb-1">Created Date</Text>
                <Text strong className="text-blue-900">
                  {productData?.createdAt
                    ? new Date(productData.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </Text>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <Text className="text-purple-600 text-sm font-medium block mb-1">Last Updated</Text>
                <Text strong className="text-purple-900">
                  {productData?.updatedAt
                    ? new Date(productData.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
