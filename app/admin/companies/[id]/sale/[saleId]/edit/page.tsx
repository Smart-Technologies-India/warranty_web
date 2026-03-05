"use client";

import React, { useEffect } from "react";
import { Card, Typography, Button, Spin } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { object, string, number, pipe, minValue } from "valibot";
import { TextInput } from "@/components/form/inputfields/textinput";
import { DateSelect } from "@/components/form/inputfields/dateselect";
import { onFormError } from "@/utils/methods";

import {
  ArrowLeftOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

// Form schema
const EditSaleSchema = object({
    quantity: pipe(number("Enter quantity"), minValue(1, "Quantity must be at least 1")),
    batch_number: pipe(string("Enter batch number")),
    warranty_till: pipe(number("Enter warranty days"), minValue(1, "Warranty must be at least 1 day")),
    sale_date: pipe(string("Select sale date")),
});

type EditSaleForm = {
    quantity: number;
    batch_number: string;
    warranty_till: number;
    sale_date: string;
};

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
    };
    product: {
        id: number;
        name: string;
    };
    company: {
        id: number;
        name: string;
    };
}

interface UpdateSaleInput {
    quantity: number;
    batch_number: string;
    warranty_till: number;
    sale_date: string;
    updatedById: number;
}

// GraphQL queries
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
      }
      product {
        id
        name
      }
      company {
        id
        name
      }
    }
  }
`;

const UPDATE_DEALER_SALE = `
  mutation UpdateDealerSales($id: Int!, $updateType: UpdateDealerSalesInput!) {
    updateDealerSales(id: $id, updateType: $updateType) {
      id
      quantity
      batch_number
    }
  }
`;

// API functions
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

const updateDealerSaleApi = async (id: number, data: UpdateSaleInput): Promise<unknown> => {

    const response = await ApiCall<{ updateDealerSales: unknown }>({
        query: UPDATE_DEALER_SALE,
        variables: {
            id: id,
            updateType: data,
        },
    });

    if (!response.status) {
        throw new Error(response.message);
    }

    return response.data.updateDealerSales;
};

interface EditSalePageProps {
    params: Promise<{
        id: string;
        saleId: string;
    }>;
}

const EditSalePage: React.FC<EditSalePageProps> = ({ params }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const unwrappedParams = React.use(params) as { id: string; saleId: string };
    const companyId = parseInt(unwrappedParams.id);
    const saleId = parseInt(unwrappedParams.saleId);

    // Form setup
    const methods = useForm<EditSaleForm>({
        resolver: valibotResolver(EditSaleSchema),
        defaultValues: {
            quantity: 1,
            batch_number: "",
            warranty_till: 365,
            sale_date: "",
        },
    });

    // Fetch sale details
    const {
        data: sale,
        isLoading: isSaleLoading,
        isError: isSaleError,
        error: saleError,
    } = useQuery({
        queryKey: ["dealerSale", saleId],
        queryFn: () => fetchDealerSaleById(saleId),
        enabled: !!saleId,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: UpdateSaleInput) => updateDealerSaleApi(saleId, data),
        onSuccess: () => {
            toast.success("Sale updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["dealerSale", saleId] });
            queryClient.invalidateQueries({ queryKey: ["dealerSales", companyId] });
            router.push(`/admin/companies/${companyId}/sale/${saleId}`);
        },
        onError: (error: Error) => {
            toast.error(`Failed to update sale: ${error.message}`);
        },
    });

    // Set form values when sale data is loaded
    useEffect(() => {
        if (sale) {
            methods.reset({
                quantity: sale.quantity,
                batch_number: sale.batch_number,
                warranty_till: sale.warranty_till,
                sale_date: new Date(sale.sale_date).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
            });
        }
    }, [sale, methods]);

    // Handle form submission
    const onSubmit = async (data: EditSaleForm) => {
        const userId = getCookie("id");
        if (!userId) {
            toast.error("User not authenticated. Please login again.");
            return;
        }

        const updateData: UpdateSaleInput = {
            quantity: data.quantity,
            batch_number: data.batch_number,
            warranty_till: data.warranty_till,
            sale_date: new Date(data.sale_date).toISOString(),
            updatedById: parseInt(userId.toString()),
        };

        updateMutation.mutate(updateData);
    };

    // Handle back navigation
    const handleBack = () => {
        router.push(`/admin/companies/${companyId}/sale/${saleId}`);
    };

    if (isSaleLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (isSaleError) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <div className="text-center py-8">
                            <p className="text-red-500 mb-4">
                                Error: {saleError instanceof Error ? saleError.message : "Unknown error"}
                            </p>
                            <Button onClick={handleBack} type="primary">
                                Back to Sale
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
                                Back to Sale
                            </Button>
                            <div>
                                <Title level={3} className="!mb-0 text-gray-900">
                                    Edit Sale #{sale.id}
                                </Title>
                                <p className="text-gray-500 mt-1">Update sale information</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                loading={updateMutation.isPending}
                                onClick={methods.handleSubmit(onSubmit, onFormError)}
                                className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                            >
                                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sale Context */}
                <Card title="Sale Context" className="shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-sm text-blue-600 font-medium">Product</div>
                            <div className="text-lg font-semibold text-blue-900">{sale.product.name}</div>
                            <div className="text-xs text-blue-700">ID: {sale.product.id}</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                            <div className="text-sm text-orange-600 font-medium">Dealer</div>
                            <div className="text-lg font-semibold text-orange-900">{sale.dealer.name}</div>
                            <div className="text-xs text-orange-700">ID: {sale.dealer.id}</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-sm text-green-600 font-medium">Company</div>
                            <div className="text-lg font-semibold text-green-900">{sale.company.name}</div>
                            <div className="text-xs text-green-700">ID: {sale.company.id}</div>
                        </div>
                    </div>
                </Card>

                <div></div>

                {/* Form */}
                <Card title="Sale Information" className="shadow-sm">
                    <FormProvider {...methods}>
                        <form
                            onSubmit={methods.handleSubmit(onSubmit, onFormError)}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <TextInput<EditSaleForm>
                                        title="Quantity"
                                        required={true}
                                        name="quantity"
                                        placeholder="Enter quantity"
                                        onlynumber={true}
                                    />
                                    <TextInput<EditSaleForm>
                                        title="Batch Number"
                                        required={true}
                                        name="batch_number"
                                        placeholder="Enter batch number"
                                    />
                                </div>
                                <div className="space-y-6">
                                    <TextInput<EditSaleForm>
                                        title="Warranty Days"
                                        required={true}
                                        name="warranty_till"
                                        placeholder="Enter warranty period in days"
                                        onlynumber={true}
                                    />
                                    <DateSelect<EditSaleForm>
                                        title="Sale Date"
                                        required={true}
                                        name="sale_date"
                                        placeholder="Select sale date"
                                    />

                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 col-span-2">
                                    <div className="flex items-start gap-3">
                                        <svg
                                            className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
                                            <p className="text-sm font-medium text-gray-900">
                                                Important Note
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Updating sale information will affect warranty calculations
                                                and dealer inventory records. Please ensure all information
                                                is accurate.
                                            </p>
                                        </div>
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

export default EditSalePage;