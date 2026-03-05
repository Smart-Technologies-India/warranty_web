"use client";

import React, { useState } from "react";
import { Card, Typography, Button, Spin, Descriptions, Tag, Modal, Space } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TagOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;


interface SaleDetails {
    id: number;
    sale_date: string;
    warranty_till: number;
    product: {
        id: number;
        name: string;
    };
}

// GraphQL queries
const GET_SALE_BY_ID = `
  query GetPaginatedSales($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: WhereSalesSearchInput!) {
    getPaginatedSales(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
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
        }
      }
    }
  }
`;

const DELETE_SALE = `
  mutation DeleteSales($deleteSalesId: Int!) {
    deleteSales(id: $deleteSalesId) {
      id
    }
  }
`;

// API functions
const fetchSaleById = async (saleId: number, dealerId: number): Promise<SaleDetails | null> => {
    const response = await ApiCall<{ getPaginatedSales: { data: SaleDetails[] } }>({
        query: GET_SALE_BY_ID,
        variables: {
            searchPaginationInput: {
                take: 1,
                skip: 0
            },
            whereSearchInput: {
                id: saleId,
                dealer_id: dealerId,
                user: {
                    deletedAt: null
                }
            },
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.getPaginatedSales.data[0] || null;
};

const deleteSaleApi = async (saleId: number): Promise<{ id: number }> => {
    const response = await ApiCall<{ deleteSales: { id: number } }>({
        query: DELETE_SALE,
        variables: {
            deleteSalesId: saleId,
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.deleteSales;
};

interface SaleDetailsPageProps {
    params: Promise<{
        id: string;
        saleId: string;
    }>;
}

const SaleDetailsPage: React.FC<SaleDetailsPageProps> = ({ params }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const unwrappedParams = React.use(params) as { id: string; saleId: string };
    const dealerId = parseInt(unwrappedParams.id);
    const saleId = parseInt(unwrappedParams.saleId);

    // State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Fetch sale details
    const {
        data: sale,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["sale", saleId],
        queryFn: () => fetchSaleById(saleId, dealerId),
        enabled: !!saleId,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteSaleApi,
        onSuccess: () => {
            toast.success("Customer sale deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["customerSales", dealerId] });
            router.push(`/admin/dealers/${dealerId}/sale`);
        },
        onError: (error: Error) => {
            console.error("Failed to delete customer sale:", error);
            toast.error(`Failed to delete sale: ${error.message}`);
        },
    });

    // Handle back navigation
    const handleBack = () => {
        router.push(`/admin/dealers/${dealerId}/sale`);
    };

    // Handle delete
    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    // Handle confirm delete
    const handleConfirmDelete = () => {
        deleteMutation.mutate(saleId);
        setIsDeleteModalOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600">Loading sale details...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <div className="text-center py-8">
                            <div className="text-red-500 text-4xl mb-4">⚠️</div>
                            <Title level={4} className="text-red-600">Failed to Load Sale</Title>
                            <p className="text-gray-600 mb-4">
                                {error instanceof Error ? error.message : "An unexpected error occurred"}
                            </p>
                            <Space>
                                <Button onClick={() => window.location.reload()}>
                                    Try Again
                                </Button>
                                <Button type="primary" onClick={handleBack}>
                                    Back to Sales
                                </Button>
                            </Space>
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
                            <div className="text-gray-400 text-6xl mb-4">🛒</div>
                            <Title level={4} className="text-gray-600">Sale Not Found</Title>
                            <p className="text-gray-500 mb-4">
                                The requested sale could not be found.
                            </p>
                            <Button type="primary" onClick={handleBack}>
                                Back to Sales
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    const warrantyEndDate = new Date(sale.sale_date);
    warrantyEndDate.setDate(warrantyEndDate.getDate() + sale.warranty_till);
    const isWarrantyValid = warrantyEndDate > new Date();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Delete Confirmation Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <DeleteOutlined className="text-red-600 text-lg" />
                        </div>
                        <span className="text-lg font-semibold text-gray-900">Delete Customer Sale</span>
                    </div>
                }
                open={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                footer={null}
                width={500}
                centered
            >
                <div className="py-4">
                    <div className="mb-6">
                        <p className="text-gray-700 mb-4">
                            Are you sure you want to delete this customer sale?
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-400">
                            <div className="space-y-2">
                                <div><strong>Sale ID:</strong> #{sale.id}</div>

                                <div><strong>Product:</strong> {sale.product.name}</div>
                                <div><strong>Sale Date:</strong> {new Date(sale.sale_date).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-start gap-2">
                                <span className="text-red-500 text-lg">⚠️</span>
                                <div>
                                    <p className="text-red-800 font-medium text-sm">Warning</p>
                                    <p className="text-red-700 text-sm">
                                        This action cannot be undone. The sale record will be permanently deleted.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button
                            size="large"
                            onClick={() => setIsDeleteModalOpen(false)}
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
                            {deleteMutation.isPending ? "Deleting..." : "Delete Sale"}
                        </Button>
                    </div>
                </div>
            </Modal>

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
                                    <ShoppingCartOutlined className="text-green-600 text-xl" />
                                </div>
                                <div>
                                    <Title level={3} className="!mb-0 text-gray-900">
                                        Sale #{sale.id}
                                    </Title>
                                    <Text type="secondary">
                                        Sale Date: {new Date(sale.sale_date).toLocaleDateString()}
                                    </Text>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={handleDelete}
                                danger
                                loading={deleteMutation.isPending}
                            >
                                Delete Sale
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sale Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Product Information */}
                    <Card 
                        title={
                            <div className="flex items-center gap-2">
                                <TagOutlined className="text-purple-600" />
                                <span>Product Information</span>
                            </div>
                        } 
                        className="shadow-sm"
                    >
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Product Name">
                                <Text strong>{sale.product.name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Product ID">
                                <Tag color="purple">#{sale.product.id}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Dealer ID">
                                <Tag color="cyan">#{dealerId}</Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Warranty Information */}
                    <Card 
                        title={
                            <div className="flex items-center gap-2">
                                <CalendarOutlined className="text-green-600" />
                                <span>Warranty Information</span>
                            </div>
                        } 
                        className="shadow-sm"
                    >
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Warranty Period">
                                <Tag color="green" icon={<TagOutlined />}>
                                    {sale.warranty_till} days
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Sale Date">
                                <div className="flex items-center gap-2">
                                    <CalendarOutlined className="text-gray-400" />
                                    {new Date(sale.sale_date).toLocaleDateString()}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Warranty End Date">
                                <div className="flex items-center gap-2">
                                    <CalendarOutlined className="text-gray-400" />
                                    {warrantyEndDate.toLocaleDateString()}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Warranty Status">
                                <Tag color={isWarrantyValid ? "green" : "red"}>
                                    {isWarrantyValid ? "Valid" : "Expired"}
                                </Tag>
                            </Descriptions.Item>
                            {isWarrantyValid && (
                                <Descriptions.Item label="Days Remaining">
                                    <Text strong className="text-green-600">
                                        {Math.ceil((warrantyEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                                    </Text>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                </div>

                {/* Sale Details */}
                <Card title="Sale Details" className="shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Descriptions column={1} size="middle">
                            <Descriptions.Item label="Sale ID">
                                <Tag color="blue" className="text-base px-3 py-1">
                                    #{sale.id}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Sale Date">
                                <div className="flex items-center gap-2">
                                    <CalendarOutlined className="text-gray-400" />
                                    <div>
                                        <div>{new Date(sale.sale_date).toLocaleDateString()}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(sale.sale_date).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            </Descriptions.Item>
                        </Descriptions>

                        <Descriptions column={1} size="middle">
                            <Descriptions.Item label="Dealer ID">
                                <Tag color="cyan">#{dealerId}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Product ID">
                                <Tag color="purple">#{sale.product.id}</Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                </Card>

                {/* Warranty Timeline */}
                <Card title="Warranty Timeline" className="shadow-sm">
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-center">
                                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                                <div className="text-sm font-medium">Sale Date</div>
                                <div className="text-xs text-gray-500">
                                    {new Date(sale.sale_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex-1 h-px bg-gray-300 mx-4 relative">
                                {isWarrantyValid && (
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-green-500"
                                        style={{
                                            width: `${Math.max(10, Math.min(90, (Date.now() - new Date(sale.sale_date).getTime()) / (warrantyEndDate.getTime() - new Date(sale.sale_date).getTime()) * 100))}%`
                                        }}
                                    ></div>
                                )}
                            </div>
                            <div className="text-center">
                                <div className={`w-4 h-4 ${isWarrantyValid ? 'bg-yellow-500' : 'bg-red-500'} rounded-full mx-auto mb-2`}></div>
                                <div className="text-sm font-medium">Warranty End</div>
                                <div className="text-xs text-gray-500">
                                    {warrantyEndDate.toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                                isWarrantyValid 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {isWarrantyValid 
                                    ? `${Math.ceil((warrantyEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`
                                    : 'Warranty expired'
                                }
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SaleDetailsPage;