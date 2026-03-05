"use client";

import React, { useState } from "react";
import { Card, Typography, Button, Spin, Modal, Descriptions, Tag, Input } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { object, string, number, pipe, minValue, minLength, maxLength, regex } from "valibot";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { onFormError } from "@/utils/methods";

import {
  ArrowLeftOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

// Form schema
const AddCustomerSaleSchema = object({
    product_id: pipe(string("Select product")),
    customer_contact: pipe(
        string("Enter customer contact"),
        minLength(10, "Contact number must be 10 digits"),
        maxLength(10, "Contact number must be 10 digits"),
        regex(/^[0-9]+$/, "Contact number must contain only digits")
    ),
    warranty_till: pipe(number("Enter warranty days"), minValue(1, "Warranty must be at least 1 day")),
});

type AddCustomerSaleForm = {
    product_id: string;
    customer_contact: string;
    warranty_till: number;
};

// Types
interface Product {
    id: number;
    name: string;
    model_no: string;
    company_id: number;
    warranty_till: number;
}

interface Customer {
    id: number;
    name: string;
    contact1: string;
    contact2?: string;
    address?: string;
    email?: string;
}

interface DealerStock {
    quantity: number;
    product: {
        id: number;
        name: string;
    };
}

interface CreateCustomerSaleInput {
    company_id: number;
    createdById: number;
    customer_id: number;
    product_id: number;
    dealer_id: number;
    warranty_till: number;
}

interface CreateUserInput {
    name: string;
    contact1: string;
    role: string;
    is_dealer: boolean;
    is_manufacturer: boolean;
    zone_id: number;
}

// GraphQL queries
const GET_DEALER_PRODUCTS = `
  query GetAllDealerStock($whereSearchInput: WhereDealerStockSearchInput!) {
    getAllDealerStock(whereSearchInput: $whereSearchInput) {
      quantity
      product {
        id
        name
      }
    }
  }
`;

const SEARCH_CUSTOMERS = `
  query GetAllUser($whereSearchInput: WhereUserSearchInput!) {
    getAllUser(whereSearchInput: $whereSearchInput) {
      id
      name
      contact1
      contact2
      address
      email
    }
  }
`;

const CREATE_CUSTOMER_SALE = `
  mutation CreateSales($inputType: CreateSalesInput!) {
    createSales(inputType: $inputType) {
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

const UPDATE_DEALER_STOCK_BY_PRODUCT = `
  mutation UpdateDealerStockByProduct($dealerId: Int!, $productId: Int!, $quantityChange: Int!) {
    updateDealerStockByProduct(dealerId: $dealerId, productId: $productId, quantityChange: $quantityChange) {
      id
      quantity
    }
  }
`;

const CREATE_USER = `
  mutation CreateUser($inputType: CreateUserInput!) {
    createUser(inputType: $inputType) {
      id
      name
      contact1
    }
  }
`;

// API functions
const fetchDealerProducts = async (dealerId: number): Promise<DealerStock[]> => {
    const response = await ApiCall<{ getAllDealerStock: DealerStock[] }>({
        query: GET_DEALER_PRODUCTS,
        variables: {
            whereSearchInput: {
                dealer_id: dealerId,
            },
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    // Filter products with quantity > 0
    return response.data.getAllDealerStock.filter(stock => stock.quantity > 0);
};

const searchCustomers = async (contact: string): Promise<Customer[]> => {
    const response = await ApiCall<{ getAllUser: Customer[] }>({
        query: SEARCH_CUSTOMERS,
        variables: {
            whereSearchInput: {
                contact1: contact,
                is_dealer: false,
                is_manufacturer: false,
            },
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.getAllUser;
};

const createCustomerSaleApi = async (data: CreateCustomerSaleInput): Promise<{ id: number }> => {

    const response = await ApiCall<{ createSales: { id: number } }>({
        query: CREATE_CUSTOMER_SALE,
        variables: {
            inputType: data,
        },
    });


    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.createSales;
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

const updateDealerStockByProductApi = async (
    dealerId: number,
    productId: number,
    quantityChange: number
): Promise<{ id: number; quantity: number }> => {
    
    const response = await ApiCall<{ updateDealerStockByProduct: { id: number; quantity: number } }>({
        query: UPDATE_DEALER_STOCK_BY_PRODUCT,
        variables: {
            dealerId,
            productId,
            quantityChange,
        },
    });


    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.updateDealerStockByProduct;
};

const createUserApi = async (data: CreateUserInput): Promise<Customer> => {

    const response = await ApiCall<{ createUser: Customer }>({
        query: CREATE_USER,
        variables: {
            inputType: data,
        },
    });


    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.createUser;
};

interface AddCustomerSalePageProps {
    params: Promise<{
        id: string;
    }>;
}

const AddCustomerSalePage: React.FC<AddCustomerSalePageProps> = ({ params }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const unwrappedParams = React.use(params) as { id: string };
    const dealerId = parseInt(unwrappedParams.id);

    // State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<AddCustomerSaleForm | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
    const [showCreateCustomer, setShowCreateCustomer] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");

    // Form setup
    const methods = useForm<AddCustomerSaleForm>({
        resolver: valibotResolver(AddCustomerSaleSchema),
        defaultValues: {
            product_id: "",
            customer_contact: "",
            warranty_till: 365,
        },
        mode: "onChange",
    });

    // Watch for contact changes to search customers
    const watchedContact = methods.watch("customer_contact");

    // Fetch dealer products (available stock)
    const {
        data: dealerProducts = [],
        isLoading: isProductsLoading,
    } = useQuery({
        queryKey: ["dealerProducts", dealerId],
        queryFn: () => fetchDealerProducts(dealerId),
        enabled: !!dealerId,
    });

    // Search customers when contact is entered
    React.useEffect(() => {
        const searchCustomersDebounced = setTimeout(async () => {
            if (watchedContact && watchedContact.length === 10) {
                setIsSearchingCustomers(true);
                setShowCreateCustomer(false);
                try {
                    const customers = await searchCustomers(watchedContact);
                    if (customers.length > 0) {
                        setSelectedCustomer(customers[0]);
                        setShowCreateCustomer(false);
                    } else {
                        setSelectedCustomer(null);
                        setShowCreateCustomer(true);
                    }
                } catch (error) {
                    console.error("Error searching customers:", error);
                    setSelectedCustomer(null);
                    setShowCreateCustomer(true);
                } finally {
                    setIsSearchingCustomers(false);
                }
            } else {
                setSelectedCustomer(null);
                setShowCreateCustomer(false);
            }
        }, 500);

        return () => clearTimeout(searchCustomersDebounced);
    }, [watchedContact]);

    // Create customer mutation
    const createCustomerMutation = useMutation({
        mutationFn: async () => {
            const userId = getCookie("id");
            if (!userId) {
                throw new Error("User not authenticated");
            }

            if (!newCustomerName.trim()) {
                throw new Error("Customer name is required");
            }

            const userData: CreateUserInput = {
                name: newCustomerName.trim(),
                contact1: watchedContact,
                role: "USER",
                is_dealer: false,
                is_manufacturer: false,
                zone_id: 1,
            };

            return await createUserApi(userData);
        },
        onSuccess: (newCustomer) => {
            toast.success(`Customer "${newCustomer.name}" created successfully!`);
            setSelectedCustomer(newCustomer);
            setShowCreateCustomer(false);
            setNewCustomerName("");
        },
        onError: (error: Error) => {
            console.error("Failed to create customer:", error);
            toast.error(`Failed to create customer: ${error.message}`);
        },
    });

    // Create sale mutation
    const createSaleMutation = useMutation({
        mutationFn: async (data: AddCustomerSaleForm) => {
            const userId = getCookie("id");
            if (!userId) {
                throw new Error("User not authenticated");
            }

            if (!selectedCustomer) {
                throw new Error("Customer not found. Please verify the contact number.");
            }

            // Find the selected product and its stock info
            const selectedStock = dealerProducts.find(
                stock => stock.product.id.toString() === data.product_id
            );

            if (!selectedStock) {
                throw new Error("Product not found in dealer stock");
            }

            if (selectedStock.quantity < 1) {
                throw new Error("Insufficient stock quantity");
            }

            // Create the customer sale (using dealer_id as company_id for now)
            const saleData: CreateCustomerSaleInput = {
                company_id: dealerId, // Using dealer_id as company_id since product.company_id is not available
                createdById: parseInt(userId.toString()),
                customer_id: selectedCustomer.id,
                product_id: parseInt(data.product_id),
                dealer_id: dealerId,
                warranty_till: data.warranty_till,
            };

            const saleResult = await createCustomerSaleApi(saleData);

            // Reduce stock quantity by 1 using product_id and dealer_id
            try {
                await updateDealerStockByProductApi(
                    dealerId,
                    parseInt(data.product_id),
                    -1 // Reduce by 1
                );
            } catch (stockError) {
                
                // Fallback: Try to update stock directly if we have stock information
                try {
                    // Refetch updated stock data after sale creation
                    const updatedStock = await fetchDealerProducts(dealerId);
                    const currentStock = updatedStock.find(
                        stock => stock.product.id.toString() === data.product_id
                    );
                    
                    if (currentStock && currentStock.quantity > 0) {
                        // Update stock with reduced quantity
                        toast.warning("Using fallback method for stock update...");
                    } else {
                        toast.warning("Sale created but automatic stock reduction failed. Please update stock manually.");
                    }
                } catch (fallbackError) {
                    console.error("Fallback stock update also failed:", fallbackError);
                    toast.warning("Sale created successfully, but stock reduction failed. Please check and update stock manually.");
                }
            }

            return saleResult;
        },
        onSuccess: (data) => {
            toast.success("Customer sale created successfully!");
            queryClient.invalidateQueries({ queryKey: ["dealerProducts", dealerId] });
            queryClient.invalidateQueries({ queryKey: ["customerSales", dealerId] });
            router.push(`/admin/dealers/${dealerId}`);
        },
        onError: (error: Error) => {
            console.error("Failed to create customer sale:", error);
            toast.error(`Failed to create sale: ${error.message}`);
        },
    });

    // Handle form submission - show confirmation modal
    const onSubmit = async (data: AddCustomerSaleForm) => {
        if (!selectedCustomer) {
            toast.error("Please enter a valid customer contact number");
            return;
        }

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

    // Handle create customer
    const handleCreateCustomer = () => {
        if (newCustomerName.trim()) {
            createCustomerMutation.mutate();
        } else {
            toast.error("Please enter customer name");
        }
    };

    // Handle back navigation
    const handleBack = () => {
        router.push(`/admin/dealers/${dealerId}`);
    };

    if (isProductsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600">Loading dealer products...</p>
                </div>
            </div>
        );
    }

    // Get selected product info for confirmation display
    const selectedProduct = dealerProducts.find(
        stock => stock.product.id.toString() === pendingFormData?.product_id
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Confirmation Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircleOutlined className="text-green-600 text-lg" />
                        </div>
                        <span className="text-lg font-semibold text-gray-900">Confirm Customer Sale</span>
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
                                    <p className="text-orange-800 font-medium text-sm">Stock Impact</p>
                                    <p className="text-orange-700 text-sm mt-1">
                                        This sale will reduce the dealer stock quantity by 1 unit.
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircleOutlined className="text-green-500" />
                                Customer Sale Details
                            </h3>

                            {pendingFormData && selectedCustomer && selectedProduct && (
                                <Descriptions column={1} size="middle" bordered>
                                    <Descriptions.Item label="Customer">
                                        <div className="font-medium text-gray-900">
                                            {selectedCustomer.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Contact: {selectedCustomer.contact1}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            ID: {selectedCustomer.id}
                                        </div>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Product">
                                        <div className="font-medium text-gray-900">
                                            {selectedProduct.product.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Product ID: {selectedProduct.product.id}
                                        </div>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Stock Impact">
                                        <div className="flex items-center gap-2">
                                            <Tag color="blue">Current: {selectedProduct.quantity} units</Tag>
                                            <span>→</span>
                                            <Tag color="orange">After Sale: {selectedProduct.quantity - 1} units</Tag>
                                        </div>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Warranty Period">
                                        <Tag color="green">{pendingFormData.warranty_till} days</Tag>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Dealer">
                                        <Tag color="purple">Dealer ID: {dealerId}</Tag>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Company">
                                        <Tag color="blue">Company ID: {dealerId}</Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            )}
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
                                Back to Dealer
                            </Button>
                            <div>
                                <Title level={3} className="!mb-0 text-gray-900">
                                    Add Customer Sale
                                </Title>
                                <p className="text-gray-500 mt-1">Create a sale to customer and reduce dealer stock</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* No Stock Warning */}
                {dealerProducts.length === 0 && (
                    <Card className="border-orange-300 bg-orange-50">
                        <div className="text-center py-8">
                            <div className="text-orange-500 text-6xl mb-4">📦</div>
                            <h3 className="text-lg font-medium text-orange-900 mb-2">No Stock Available</h3>
                            <p className="text-orange-700 mb-4">
                                This dealer has no products in stock. Please add stock before creating customer sales.
                            </p>
                            <Button
                                type="primary"
                                onClick={() => router.push(`/admin/dealers/${dealerId}/stock`)}
                                className="bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700"
                            >
                                Manage Stock
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Form */}
                {dealerProducts.length > 0 && (
                    <Card title="Customer Sale Information" className="shadow-sm">
                        <FormProvider {...methods}>
                            <form
                                onSubmit={methods.handleSubmit(onSubmit, onFormError)}
                                className="space-y-8"
                            >
                                {/* Main Form Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Product Selection */}
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
                                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                    />
                                                </svg>
                                                Product Selection
                                            </h2>
                                            <p className="text-blue-700 text-sm mt-1">
                                                Select product from available dealer stock
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <MultiSelect<AddCustomerSaleForm>
                                                title="Product"
                                                required={true}
                                                name="product_id"
                                                options={dealerProducts.map((stock) => ({
                                                    label: `${stock.product.name} - Stock: ${stock.quantity}`,
                                                    value: stock.product.id.toString(),
                                                }))}
                                                placeholder="Select product"
                                            />

                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-start gap-2">
                                                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-blue-800 font-medium text-sm">Available Stock</p>
                                                        <p className="text-blue-700 text-sm mt-1">
                                                            Only products with available stock (quantity &gt; 0) are shown.
                                                            Each sale will reduce stock by 1 unit.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer & Warranty */}
                                    <div className="space-y-6">
                                        {/* Customer Search */}
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
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>
                                                    Customer Selection
                                                </h2>
                                                <p className="text-green-700 text-sm mt-1">
                                                    Search customer by contact number
                                                </p>
                                            </div>
                                            <div className="p-6">
                                                <div className="space-y-4">
                                                    <div className="flex flex-col">
                                                        <label className="text-sm font-normal mb-2 block">
                                                            Customer Contact
                                                            <span className="text-rose-500">*</span>
                                                        </label>
                                                        <Controller
                                                            control={methods.control}
                                                            name="customer_contact"
                                                            render={({ field, fieldState: { error } }: any) => (
                                                                <div className="w-full">
                                                                    <Input
                                                                        {...field}
                                                                        status={error ? "error" : undefined}
                                                                        className="w-full"
                                                                        placeholder="Enter customer contact (10 digits)"
                                                                        maxLength={10}
                                                                        size="large"
                                                                        prefix={<SearchOutlined />}
                                                                        suffix={isSearchingCustomers ? <Spin size="small" /> : null}
                                                                        onChange={(e: any) => {
                                                                            const value = e.target.value.replace(/[^0-9]/g, "");
                                                                            field.onChange(value);
                                                                        }}
                                                                    />
                                                                    {error && (
                                                                        <p className="text-xs text-red-500 mt-1">{error.message?.toString()}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Customer Display */}
                                                    {selectedCustomer && (
                                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                                                    <span className="text-green-600 font-semibold text-sm">
                                                                        {selectedCustomer.name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-green-900">{selectedCustomer.name}</h4>
                                                                    <p className="text-sm text-green-700">
                                                                        {selectedCustomer.contact1}
                                                                    </p>
                                                                    {selectedCustomer.email && (
                                                                        <p className="text-xs text-green-600">{selectedCustomer.email}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {showCreateCustomer && watchedContact && watchedContact.length === 10 && !selectedCustomer && !isSearchingCustomers && (
                                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    <span className="text-blue-600 text-sm">+</span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-blue-800 font-medium text-sm mb-2">
                                                                        No customer found with contact {watchedContact}
                                                                    </p>
                                                                    <p className="text-blue-700 text-xs mb-3">
                                                                        Create a new customer with this contact number
                                                                    </p>
                                                                    <div className="space-y-3">
                                                                        <div>
                                                                            <Input
                                                                                placeholder="Enter customer name"
                                                                                value={newCustomerName}
                                                                                onChange={(e) => setNewCustomerName(e.target.value)}
                                                                                size="small"
                                                                                disabled={createCustomerMutation.isPending}
                                                                                onPressEnter={handleCreateCustomer}
                                                                            />
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                type="primary"
                                                                                size="small"
                                                                                loading={createCustomerMutation.isPending}
                                                                                onClick={handleCreateCustomer}
                                                                                disabled={!newCustomerName.trim()}
                                                                                className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                                                                            >
                                                                                {createCustomerMutation.isPending ? "Creating..." : "Create Customer"}
                                                                            </Button>
                                                                            <Button
                                                                                size="small"
                                                                                onClick={() => {
                                                                                    setShowCreateCustomer(false);
                                                                                    setNewCustomerName("");
                                                                                }}
                                                                                disabled={createCustomerMutation.isPending}
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
                                                                        <strong>Note:</strong> Customer will be created with role "USER" and quantity set to 1
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Warranty */}
                                        <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                                            <div className="bg-purple-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
                                                <h2 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
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
                                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                        />
                                                    </svg>
                                                    Warranty Information
                                                </h2>
                                                <p className="text-purple-700 text-sm mt-1">
                                                    Set warranty period for the customer
                                                </p>
                                            </div>
                                            <div className="p-6">
                                                <div className="flex flex-col">
                                                    <label className="text-sm font-normal mb-2 block">
                                                        Warranty Days
                                                        <span className="text-rose-500">*</span>
                                                    </label>
                                                    <Controller
                                                        control={methods.control}
                                                        name="warranty_till"
                                                        render={({ field, fieldState: { error } }: any) => (
                                                            <div className="w-full">
                                                                <Input
                                                                    {...field}
                                                                    status={error ? "error" : undefined}
                                                                    className="w-full"
                                                                    placeholder="Enter warranty period in days"
                                                                    size="large"
                                                                    onChange={(e: any) => {
                                                                        const value = e.target.value.replace(/[^0-9]/g, "");
                                                                        field.onChange(value === "" ? 0 : parseInt(value, 10));
                                                                    }}
                                                                />
                                                                {error && (
                                                                    <p className="text-xs text-red-500 mt-1">{error.message?.toString()}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Information Note */}
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                                    <div className="flex items-start gap-3">
                                        <svg
                                            className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                                            />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 mb-2">
                                                Important Information
                                            </p>
                                            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                                                <li>This will create a customer sale record with the specified warranty period</li>
                                                <li>Dealer stock quantity will be reduced by 1 unit automatically</li>
                                                <li>Customer must exist in the system with the provided contact number</li>
                                                <li>Company ID will be derived from the selected product</li>
                                                <li>This action cannot be undone once confirmed</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
                                    <Button
                                        type="default"
                                        size="large"
                                        onClick={handleBack}
                                        className="px-8"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        className="px-8 bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                                    >
                                        Preview & Create Sale
                                    </Button>
                                </div>
                            </form>
                        </FormProvider>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AddCustomerSalePage;