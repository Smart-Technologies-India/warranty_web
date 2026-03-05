"use client";

import React, { useState } from "react";
import { Card, Typography, Button, Spin, Modal, Descriptions, Tag } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { object, string, number, pipe, minValue } from "valibot";
import { TextInput } from "@/components/form/inputfields/textinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { DateSelect } from "@/components/form/inputfields/dateselect";
import { onFormError } from "@/utils/methods";

import {
  ArrowLeftOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

// Form schema
const AddSaleSchema = object({
    dealer_id: pipe(string("Select dealer")),
    product_id: pipe(string("Select product")),
    quantity: pipe(number("Enter quantity"), minValue(1, "Quantity must be at least 1")),
    batch_number: pipe(string("Enter batch number")),
    warranty_till: pipe(number("Enter warranty days"), minValue(1, "Warranty must be at least 1 day")),
    sale_date: pipe(string("Select sale date")),
});

type AddSaleForm = {
    dealer_id: string;
    product_id: string;
    quantity: number;
    batch_number: string;
    warranty_till: number;
    sale_date: string;
};

// Types
interface Dealer {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    model_no: string;
}

interface DealerStock {
    id: number;
    quantity: number;
}

interface CreateSaleInput {
    batch_number: string;
    createdById: number;
    quantity: number;
    dealer_id: number;
    product_id: number;
    warranty_till: number;
    company_id: number;
}

interface CreateStockInput {
    batch_number: string;
    product_id: number;
    dealer_id: number;
    company_id: number;
    createdById: number;
    quantity: number;
    status: "ACTIVE";
}


// GraphQL queries
const GET_DEALERS = `
  query GetAllCompany($whereSearchInput: WhereCompanySearchInput!) {
    getAllCompany(whereSearchInput: $whereSearchInput) {
      id
      name
    }
  }
`;

const GET_COMPANY_PRODUCTS = `
  query GetAllProduct($whereSearchInput: WhereProductSearchInput!) {
    getAllProduct(whereSearchInput: $whereSearchInput) {
      id
      name
    }
  }
`;

const CREATE_DEALER_SALE = `
  mutation Mutation($inputType: CreateDealerSalesInput!) {
    createDealerSales(inputType: $inputType) {
     id  
    }
  }
`;

const SEARCH_DEALER_STOCK = `
  query SearchDealerStock($whereSearchInput: WhereDealerStockSearchInput!) {
    searchDealerStock(whereSearchInput: $whereSearchInput) {
      id
      quantity
    }
  }
`;

const CREATE_DEALER_STOCK = `
  mutation CreateDealerStock($inputType: CreateDealerStockInput!) {
    createDealerStock(inputType: $inputType) {
     id  
    }
  }
`;

const UPDATE_DEALER_STOCK = `
  mutation UpdateDealerStock($updateDealerStockId: Int!, $updateType: UpdateDealerStockInput!) {
    updateDealerStock(id: $updateDealerStockId, updateType: $updateType) {
     id  
    }
  }
`;

// API functions
const fetchDealers = async (): Promise<Dealer[]> => {
    const response = await ApiCall<{ getAllCompany: Dealer[] }>({
        query: GET_DEALERS,
        variables: {
            whereSearchInput: {
                is_dealer: true,
                status: "ACTIVE",
            },
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.getAllCompany;
};

const fetchCompanyProducts = async (companyId: number): Promise<Product[]> => {
    const response = await ApiCall<{ getAllProduct: Product[] }>({
        query: GET_COMPANY_PRODUCTS,
        variables: {
            whereSearchInput: {
                company_id: companyId,
            },
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.getAllProduct;
};

const createDealerSaleApi = async (data: CreateSaleInput): Promise<{ id: number }> => {
    const response = await ApiCall<{ createDealerSales: { id: number } }>({
        query: CREATE_DEALER_SALE,
        variables: {
            inputType: data,
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.createDealerSales;
};

const searchDealerStockApi = async (
    dealer_id: number,
    product_id: number,
    batch_number: string
): Promise<DealerStock | null> => {
    const response = await ApiCall<{ searchDealerStock: DealerStock | null }>({
        query: SEARCH_DEALER_STOCK,
        variables: {
            whereSearchInput: {
                batch_number,
                product_id,
                dealer_id,
            },
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.searchDealerStock;
};

const createDealerStockApi = async (data: CreateStockInput): Promise<{ id: number }> => {
    const response = await ApiCall<{ createDealerStock: { id: number } }>({
        query: CREATE_DEALER_STOCK,
        variables: {
            inputType: data,
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.createDealerStock;
};

const updateDealerStockApi = async (
    stockId: number,
    quantity: number
): Promise<{ id: number }> => {
    const response = await ApiCall<{ updateDealerStock: { id: number } }>({
        query: UPDATE_DEALER_STOCK,
        variables: {
            updateDealerStockId: stockId,
            updateType: {
                quantity,
            },
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.updateDealerStock;
};

interface AddSalePageProps {
    params: {
        id: string;
    };
}

const AddSalePage: React.FC<AddSalePageProps> = ({ params }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const companyId = parseInt(params.id);
    
    // Confirmation modal state
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<AddSaleForm | null>(null);

    // Form setup
    const methods = useForm<AddSaleForm>({
        resolver: valibotResolver(AddSaleSchema),
        defaultValues: {
            dealer_id: "",
            product_id: "",
            quantity: 1,
            batch_number: "",
            warranty_till: 365,
            sale_date: new Date().toISOString().split('T')[0],
        },
    });

    // Fetch dealers
    const {
        data: dealers = [],
        isLoading: isDealersLoading,
    } = useQuery({
        queryKey: ["dealers"],
        queryFn: fetchDealers,
    });

    // Fetch company products
    const {
        data: products = [],
        isLoading: isProductsLoading,
    } = useQuery({
        queryKey: ["companyProducts", companyId],
        queryFn: () => fetchCompanyProducts(companyId),
        enabled: !!companyId,
    });

    // Create sale mutation
    const createSaleMutation = useMutation({
        mutationFn: async (data: AddSaleForm) => {
            const userId = getCookie("id");
            if (!userId) {
                throw new Error("User not authenticated");
            }

            const saleData: CreateSaleInput = {
                batch_number: data.batch_number,
                createdById: parseInt(userId.toString()),
                quantity: data.quantity,
                dealer_id: parseInt(data.dealer_id),
                product_id: parseInt(data.product_id),
                warranty_till: data.warranty_till,
                company_id: companyId,
            };

            // Create the sale
            const saleResult = await createDealerSaleApi(saleData);

            // Check if stock exists for this dealer, product, and batch
            const existingStock = await searchDealerStockApi(
                parseInt(data.dealer_id),
                parseInt(data.product_id),
                data.batch_number
            );

            if (existingStock) {
                // Update existing stock
                const newQuantity = existingStock.quantity + data.quantity;
                await updateDealerStockApi(existingStock.id, newQuantity);
            } else {
                // Create new stock entry
                const stockData: CreateStockInput = {
                    batch_number: data.batch_number,
                    product_id: parseInt(data.product_id),
                    dealer_id: parseInt(data.dealer_id),
                    company_id: companyId,
                    createdById: parseInt(userId.toString()),
                    quantity: data.quantity,
                    status: "ACTIVE",
                };
                await createDealerStockApi(stockData);
            }

            return saleResult;
        },
        onSuccess: () => {
            toast.success("Dealer sale created successfully!");
            queryClient.invalidateQueries({ queryKey: ["dealerSales", companyId] });
            router.push(`/admin/companies/${companyId}/sale`);
        },
        onError: (error: Error) => {
            toast.error(`Failed to create sale: ${error.message}`);
        },
    });

    // Handle form submission - show confirmation modal
    const onSubmit = async (data: AddSaleForm) => {
        setPendingFormData(data);
        setIsConfirmModalOpen(true);
    };
    
    // Handle confirmed submission
    const handleConfirmSubmit = () => {
        if (pendingFormData) {
            createSaleMutation.mutate(pendingFormData);
            setIsConfirmModalOpen(false);
            setPendingFormData(null);
        }
    };
    
    // Handle cancel confirmation
    const handleCancelConfirm = () => {
        setIsConfirmModalOpen(false);
        setPendingFormData(null);
    };

    // Handle back navigation
    const handleBack = () => {
        router.push(`/admin/companies/${companyId}/sale`);
    };

    if (isDealersLoading || isProductsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    // Get dealer and product names for confirmation display
    const selectedDealer = dealers.find(d => d.id.toString() === pendingFormData?.dealer_id);
    const selectedProduct = products.find(p => p.id.toString() === pendingFormData?.product_id);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Confirmation Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <ExclamationCircleOutlined className="text-orange-600 text-lg" />
                        </div>
                        <span className="text-lg font-semibold text-gray-900">Confirm Sale Creation</span>
                    </div>
                }
                open={isConfirmModalOpen}
                onCancel={handleCancelConfirm}
                footer={null}
                width={600}
                centered
            >
                <div className="py-4">
                    <div className="mb-6">
                        <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400 mb-6">
                            <div className="flex items-start gap-2">
                                <ExclamationCircleOutlined className="text-orange-500 text-lg mt-0.5" />
                                <div>
                                    <p className="text-orange-800 font-medium text-sm">Important Notice</p>
                                    <p className="text-orange-700 text-sm mt-1">
                                        Once created, this sale record cannot be deleted or updated. 
                                        This action is permanent and cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircleOutlined className="text-green-500" />
                                Sale Details to be Created
                            </h3>
                            
                            {pendingFormData && (
                                <Descriptions column={1} size="middle" bordered>
                                    <Descriptions.Item label="Dealer">
                                        <div className="font-medium text-gray-900">
                                            {selectedDealer?.name || 'Unknown Dealer'}
                                        </div>
                                        <div className="text-xs text-gray-500">ID: {pendingFormData.dealer_id}</div>
                                    </Descriptions.Item>
                                    
                                    <Descriptions.Item label="Product">
                                        <div className="font-medium text-gray-900">
                                            {selectedProduct?.name || 'Unknown Product'}
                                        </div>
                                        <div className="text-xs text-gray-500">ID: {pendingFormData.product_id}</div>
                                    </Descriptions.Item>
                                    
                                    <Descriptions.Item label="Quantity">
                                        <Tag color="blue" className="font-medium">
                                            {pendingFormData.quantity} units
                                        </Tag>
                                    </Descriptions.Item>
                                    
                                    <Descriptions.Item label="Batch Number">
                                        <Tag color="purple">{pendingFormData.batch_number}</Tag>
                                    </Descriptions.Item>
                                    
                                    <Descriptions.Item label="Warranty Period">
                                        <Tag color="green">{pendingFormData.warranty_till} days</Tag>
                                    </Descriptions.Item>
                                    
                                    <Descriptions.Item label="Sale Date">
                                        <div className="font-medium text-gray-900">
                                            {new Date(pendingFormData.sale_date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </Descriptions.Item>
                                </Descriptions>
                            )}
                            
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-blue-800 font-medium text-sm">Stock Impact</p>
                                        <p className="text-blue-700 text-sm mt-1">
                                            This sale will automatically update dealer stock. If stock exists for this batch, 
                                            the quantity will be added. Otherwise, a new stock entry will be created.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button
                            size="large"
                            onClick={handleCancelConfirm}
                            disabled={createSaleMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            loading={createSaleMutation.isPending}
                            onClick={handleConfirmSubmit}
                            icon={createSaleMutation.isPending ? null : <CheckCircleOutlined />}
                            className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                        >
                            {createSaleMutation.isPending ? "Creating Sale..." : "Confirm & Create Sale"}
                        </Button>
                    </div>
                </div>
            </Modal>
            <div className="max-w-4xl mx-auto p-6 space-y-6">
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
                            <div>
                                <Title level={3} className="!mb-0 text-gray-900">
                                    Add Dealer Sale
                                </Title>
                                <p className="text-gray-500 mt-1">Create a new sale to dealer</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={methods.handleSubmit(onSubmit, onFormError)}
                                className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                            >
                                Preview & Create Sale
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card title="Sale Information" className="shadow-sm">
                    <FormProvider {...methods}>
                        <form
                            onSubmit={methods.handleSubmit(onSubmit, onFormError)}
                            className="space-y-8"
                        >
                            {/* Main Form Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Sale Details */}
                                <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                                    <div className="bg-green-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
                                        <h2 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                                            <svg
                                                className="w-5 h-5 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                                />
                                            </svg>
                                            Sale Details
                                        </h2>
                                        <p className="text-green-700 text-sm mt-1">
                                            Basic sale information and quantities
                                        </p>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-6">
                                            <MultiSelect<AddSaleForm>
                                                title="Dealer"
                                                required={true}
                                                name="dealer_id"
                                                options={dealers.map((dealer) => ({
                                                    label: dealer.name,
                                                    value: dealer.id.toString(),
                                                }))}
                                                placeholder="Select dealer"
                                            />
                                            <MultiSelect<AddSaleForm>
                                                title="Product"
                                                required={true}
                                                name="product_id"
                                                options={products.map((product) => ({
                                                    label: `${product.name}`,
                                                    value: product.id.toString(),
                                                }))}
                                                placeholder="Select product"
                                            />
                                            <TextInput<AddSaleForm>
                                                title="Quantity"
                                                required={true}
                                                name="quantity"
                                                placeholder="Enter quantity"
                                                onlynumber={true}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="space-y-6">
                                    {/* Batch & Warranty */}
                                    <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                                        <div className="bg-blue-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
                                            <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
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
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                Batch & Warranty
                                            </h2>
                                            <p className="text-blue-700 text-sm mt-1">
                                                Batch identification and warranty information
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-6">
                                                <TextInput<AddSaleForm>
                                                    title="Batch Number"
                                                    required={true}
                                                    name="batch_number"
                                                    placeholder="Enter batch number"
                                                />
                                                <TextInput<AddSaleForm>
                                                    title="Warranty Days"
                                                    required={true}
                                                    name="warranty_till"
                                                    placeholder="Enter warranty period in days"
                                                    onlynumber={true}
                                                />
                                                <DateSelect<AddSaleForm>
                                                    title="Sale Date"
                                                    required={true}
                                                    name="sale_date"
                                                    placeholder="Select sale date"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Information Note */}
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                                <div className="flex items-start gap-3">
                                    <svg
                                        className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 mb-2">
                                            Stock Management
                                        </p>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            Creating this sale will automatically manage dealer stock:
                                        </p>
                                        <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
                                            <li>If stock exists for this product and batch, quantity will be added</li>
                                            <li>If no stock exists, a new stock entry will be created</li>
                                            <li>Stock status will be set to ACTIVE</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </FormProvider>
                </Card>
            </div>
        </div>
    );
};

export default AddSalePage;