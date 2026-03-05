"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Typography, Button, Spin, Modal, Descriptions, Tag, Input } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import {
  object,
  string,
  number,
  pipe,
  minValue,
  minLength,
  maxLength,
  regex,
} from "valibot";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { TextInput } from "@/components/form/inputfields/textinput";
import { onFormError } from "@/utils/methods";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const AddD2CSaleSchema = object({
  product_id: pipe(string("Select product")),
  batch_number: pipe(string("Select batch number")),
  customer_contact: pipe(
    string("Enter customer contact"),
    minLength(10, "Contact number must be 10 digits"),
    maxLength(10, "Contact number must be 10 digits"),
    regex(/^[0-9]+$/, "Contact number must contain only digits")
  ),
  warranty_till: pipe(
    number("Enter warranty days"),
    minValue(1, "Warranty must be at least 1 day")
  ),
});

type AddD2CSaleForm = {
  product_id: string;
  batch_number: string;
  customer_contact: string;
  warranty_till: number;
};

interface Product {
  id: number;
  name: string;
}

interface Customer {
  id: number;
  name: string;
  contact1: string;
  contact2?: string;
  address?: string;
  email?: string;
}

interface ManfStock {
  id: number;
  product_id: number;
  quantity: number;
  batch_number: string;
  status: "ACTIVE" | "INACTIVE";
}

interface CreateSaleInput {
  company_id: number;
  createdById: number;
  customer_id: number;
  product_id: number;
  dealer_id: number;
  warranty_till: number;
}

const GET_COMPANY_PRODUCTS = `
  query GetAllProduct($whereSearchInput: WhereProductSearchInput!) {
    getAllProduct(whereSearchInput: $whereSearchInput) {
      id
      name
    }
  }
`;

const GET_ALL_MANF_STOCK = `
  query GetAllManfStock($whereSearchInput: WhereManfStockSearchInput!) {
    getAllManfStock(whereSearchInput: $whereSearchInput) {
      id
      product_id
      quantity
      batch_number
      status
    }
  }
`;

const SEARCH_MANF_STOCK = `
  query SearchManfStock($whereSearchInput: WhereManfStockSearchInput!) {
    searchManfStock(whereSearchInput: $whereSearchInput) {
      id
      quantity
      batch_number
      status
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

const CREATE_D2C_SALE = `
  mutation CreateSales($inputType: CreateSalesInput!) {
    createSales(inputType: $inputType) {
      id
    }
  }
`;

const UPDATE_MANF_STOCK = `
  mutation UpdateManfStock($updateManfStockId: Int!, $updateType: UpdateManfStockInput!) {
    updateManfStock(id: $updateManfStockId, updateType: $updateType) {
      id
    }
  }
`;

const fetchCompanyProducts = async (companyId: number): Promise<Product[]> => {
  const response = await ApiCall<{ getAllProduct: Product[] }>({
    query: GET_COMPANY_PRODUCTS,
    variables: {
      whereSearchInput: {
        company_id: companyId,
        status: "ACTIVE",
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllProduct;
};

const fetchManfStockByProduct = async (
  companyId: number,
  productId: number
): Promise<ManfStock[]> => {
  const response = await ApiCall<{ getAllManfStock: ManfStock[] }>({
    query: GET_ALL_MANF_STOCK,
    variables: {
      whereSearchInput: {
        company_id: companyId,
        product_id: productId,
        status: "ACTIVE",
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllManfStock;
};

const searchManfStockApi = async (
  company_id: number,
  product_id: number,
  batch_number: string
): Promise<ManfStock | null> => {
  const response = await ApiCall<{ searchManfStock: ManfStock | null }>({
    query: SEARCH_MANF_STOCK,
    variables: {
      whereSearchInput: {
        company_id,
        product_id,
        batch_number,
        status: "ACTIVE",
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.searchManfStock;
};

const searchCustomers = async (contact: string): Promise<Customer[]> => {
  const response = await ApiCall<{ getAllUser: Customer[] }>({
    query: SEARCH_CUSTOMERS,
    variables: {
      whereSearchInput: {
        contact1: contact,
        role: "USER",
        status: "ACTIVE",
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllUser;
};

const createD2CSaleApi = async (data: CreateSaleInput): Promise<{ id: number }> => {
  const response = await ApiCall<{ createSales: { id: number } }>({
    query: CREATE_D2C_SALE,
    variables: {
      inputType: data,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.createSales;
};

const updateManfStockApi = async (
  stockId: number,
  quantity: number,
  updatedById: number
): Promise<{ id: number }> => {
  const response = await ApiCall<{ updateManfStock: { id: number } }>({
    query: UPDATE_MANF_STOCK,
    variables: {
      updateManfStockId: stockId,
      updateType: {
        quantity,
        updatedById,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateManfStock;
};

const AddD2CSalePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const companyId = parseInt(params.id as string);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<AddD2CSaleForm | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

  const methods = useForm<AddD2CSaleForm>({
    resolver: valibotResolver(AddD2CSaleSchema),
    defaultValues: {
      product_id: "",
      batch_number: "",
      customer_contact: "",
      warranty_till: 365,
    },
  });

  const selectedProductId = methods.watch("product_id");
  const selectedBatchNumber = methods.watch("batch_number");
  const watchedContact = methods.watch("customer_contact");

  useEffect(() => {
    methods.setValue("batch_number", "");
  }, [selectedProductId, methods]);

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["companyProducts", companyId],
    queryFn: () => fetchCompanyProducts(companyId),
    enabled: !!companyId,
  });

  const { data: manfStocks = [], isLoading: isManfStockLoading } = useQuery({
    queryKey: ["manfStock", companyId, selectedProductId],
    queryFn: () => fetchManfStockByProduct(companyId, parseInt(selectedProductId)),
    enabled: !!companyId && !!selectedProductId,
  });

  const availableBatches = useMemo(
    () =>
      manfStocks.filter(
        (stock) => stock.status === "ACTIVE" && stock.quantity > 0
      ),
    [manfStocks]
  );

  const selectedBatchStock = useMemo(
    () =>
      availableBatches.find((stock) => stock.batch_number === selectedBatchNumber) ||
      null,
    [availableBatches, selectedBatchNumber]
  );

  useEffect(() => {
    const searchCustomersDebounced = setTimeout(async () => {
      if (watchedContact && watchedContact.length === 10) {
        setIsSearchingCustomers(true);
        try {
          const customers = await searchCustomers(watchedContact);
          setSelectedCustomer(customers.length > 0 ? customers[0] : null);
        } catch {
          setSelectedCustomer(null);
        } finally {
          setIsSearchingCustomers(false);
        }
      } else {
        setSelectedCustomer(null);
      }
    }, 400);

    return () => clearTimeout(searchCustomersDebounced);
  }, [watchedContact]);

  const createSaleMutation = useMutation({
    mutationFn: async (data: AddD2CSaleForm) => {
      const userId = getCookie("id");
      if (!userId) {
        throw new Error("User not authenticated");
      }

      if (!selectedCustomer) {
        throw new Error("Customer not found with role USER");
      }

      const productId = parseInt(data.product_id);
      const manfStock = await searchManfStockApi(
        companyId,
        productId,
        data.batch_number
      );

      if (!manfStock || manfStock.quantity <= 0) {
        throw new Error("Selected batch is out of stock");
      }

      const saleData: CreateSaleInput = {
        company_id: companyId,
        createdById: parseInt(userId.toString()),
        customer_id: selectedCustomer.id,
        product_id: productId,
        dealer_id: companyId,
        warranty_till: data.warranty_till,
      };

      const saleResult = await createD2CSaleApi(saleData);

      await updateManfStockApi(
        manfStock.id,
        manfStock.quantity - 1,
        parseInt(userId.toString())
      );

      return saleResult;
    },
    onSuccess: () => {
      toast.success("D2C sale created successfully!");
      queryClient.invalidateQueries({ queryKey: ["manfStock", companyId] });
      queryClient.invalidateQueries({ queryKey: ["customerSales", companyId] });
      router.push(`/company/${companyId}/sale`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create D2C sale: ${error.message}`);
    },
  });

  const onSubmit = (data: AddD2CSaleForm) => {
    if (!selectedCustomer) {
      toast.error("Enter valid customer mobile (role USER)");
      return;
    }

    if (!data.batch_number) {
      toast.error("Please select batch number");
      return;
    }

    if (!selectedBatchStock || selectedBatchStock.quantity <= 0) {
      toast.error("Selected batch is out of stock");
      return;
    }

    setPendingFormData(data);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (pendingFormData) {
      createSaleMutation.mutate(pendingFormData);
      setIsConfirmModalOpen(false);
      setPendingFormData(null);
    }
  };

  const handleBack = () => {
    router.push(`/company/${companyId}/sale`);
  };

  if (isProductsLoading || isManfStockLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const selectedProduct = products.find(
    (p) => p.id.toString() === pendingFormData?.product_id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleOutlined className="text-green-600 text-lg" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Confirm D2C Sale</span>
          </div>
        }
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        footer={null}
        width={600}
        centered
      >
        <div className="py-4">
          <div className="mb-6 bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
            <div className="flex items-start gap-2">
              <ExclamationCircleOutlined className="text-orange-500 text-lg mt-0.5" />
              <div>
                <p className="text-orange-800 font-medium text-sm">Stock Impact</p>
                <p className="text-orange-700 text-sm mt-1">
                  This sale will reduce company stock by 1 unit for selected product.
                </p>
              </div>
            </div>
          </div>

          {pendingFormData && selectedCustomer && selectedProduct && (
            <Descriptions column={1} size="middle" bordered>
              <Descriptions.Item label="Customer">
                <div className="font-medium text-gray-900">{selectedCustomer.name}</div>
                <div className="text-xs text-gray-500">Contact: {selectedCustomer.contact1}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Product">
                <div className="font-medium text-gray-900">{selectedProduct.name}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Batch Number">
                <Tag color="purple">{pendingFormData.batch_number}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Available in Batch">
                <Tag color="blue">{selectedBatchStock?.quantity || 0} units</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Warranty Period">
                <Tag color="green">{pendingFormData.warranty_till} days</Tag>
              </Descriptions.Item>
            </Descriptions>
          )}

          <div className="flex gap-3 justify-end mt-6">
            <Button onClick={() => setIsConfirmModalOpen(false)} disabled={createSaleMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="primary"
              loading={createSaleMutation.isPending}
              onClick={handleConfirmSubmit}
              className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
            >
              {createSaleMutation.isPending ? "Creating Sale..." : "Confirm & Create Sale"}
            </Button>
          </div>
        </div>
      </Modal>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button icon={<ArrowLeftOutlined />} onClick={handleBack} type="text" className="hover:bg-gray-50">
                Back to Sales
              </Button>
              <div>
                <Title level={3} className="mb-0! text-gray-900">Add D2C Sale</Title>
                <p className="text-gray-500 mt-1">Create direct-to-customer sale</p>
              </div>
            </div>
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

        <Card title="D2C Sale Information" className="shadow-sm">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit, onFormError)} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                  <div className="bg-blue-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
                    <h2 className="text-lg font-semibold text-blue-900">Product & Warranty</h2>
                    <p className="text-blue-700 text-sm mt-1">Select product from available stock</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <MultiSelect<AddD2CSaleForm>
                      title="Product"
                      required={true}
                      name="product_id"
                      options={products.map((product) => ({
                        label: `${product.name}`,
                        value: product.id.toString(),
                      }))}
                      placeholder="Select product"
                    />
                    <MultiSelect<AddD2CSaleForm>
                      title="Batch Number"
                      required={true}
                      name="batch_number"
                      options={availableBatches.map((stock) => ({
                        label: `${stock.batch_number} (${stock.quantity} units)`,
                        value: stock.batch_number,
                      }))}
                      placeholder={
                        !selectedProductId
                          ? "Select product first"
                          : isManfStockLoading
                            ? "Loading batches..."
                            : availableBatches.length === 0
                              ? "No stock available"
                              : "Select batch number"
                      }
                    />
                    {selectedBatchStock ? (
                      <p className="-mt-4 text-xs text-blue-600">
                        Available in selected batch: {selectedBatchStock.quantity} units
                      </p>
                    ) : null}
                    <TextInput<AddD2CSaleForm>
                      title="Warranty Days"
                      required={true}
                      name="warranty_till"
                      placeholder="Enter warranty period in days"
                      onlynumber={true}
                      asNumber={true}
                    />
                  </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                  <div className="bg-green-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
                    <h2 className="text-lg font-semibold text-green-900">Customer Details</h2>
                    <p className="text-green-700 text-sm mt-1">Find customer by mobile number (role USER)</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-normal mb-2 block">
                        Customer Mobile <span className="text-rose-500">*</span>
                      </label>
                      <Controller
                        control={methods.control}
                        name="customer_contact"
                        render={({ field, fieldState: { error } }) => (
                          <div className="w-full">
                            <Input
                              {...field}
                              status={error ? "error" : undefined}
                              placeholder="Enter customer mobile number"
                              maxLength={10}
                              size="large"
                              prefix={<SearchOutlined />}
                              suffix={isSearchingCustomers ? <Spin size="small" /> : null}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, "");
                                field.onChange(value);
                              }}
                            />
                            {error && <p className="text-xs text-red-500 mt-1">{error.message?.toString()}</p>}
                          </div>
                        )}
                      />
                    </div>

                    {selectedCustomer ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="font-semibold text-green-900">{selectedCustomer.name}</p>
                        <p className="text-sm text-green-700">{selectedCustomer.contact1}</p>
                        {selectedCustomer.email ? (
                          <p className="text-sm text-green-700">{selectedCustomer.email}</p>
                        ) : null}
                      </div>
                    ) : watchedContact?.length === 10 && !isSearchingCustomers ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                        No USER found with this mobile number.
                      </div>
                    ) : null}
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

export default AddD2CSalePage;
