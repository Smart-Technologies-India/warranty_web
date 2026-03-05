"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, Typography, Spin } from "antd";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { TextInput } from "@/components/form/inputfields/textinput";
import { TaxtAreaInput } from "@/components/form/inputfields/textareainput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { onFormError } from "@/utils/methods";
import { object, string, pipe, InferInput } from "valibot";
import { toast } from "react-toastify";

const { Title } = Typography;

// Validation Schema
const AddProductSchema = object({
  name: pipe(string("Enter Product Name")),
  price: pipe(string("Enter Price")),
  description: pipe(string("Enter Description")),
  warranty_days: pipe(string("Enter Days")),
  warranty_months: pipe(string("Enter Months")),
  warranty_years: pipe(string("Enter Years")),
  category_id: pipe(string("Select Category")),
  subcategory_id: pipe(string("Select Subcategory")),
});

type AddProductForm = InferInput<typeof AddProductSchema>;

// GraphQL queries
const CREATE_PRODUCT = `
  mutation CreateProduct($inputType: CreateProductInput!) {
    createProduct(inputType: $inputType) {
      id
      name
    }
  }
`;

const GET_ALL_CATEGORIES = `
  query GetAllCategories($whereSearchInput: WhereProductCategorySearchInput!) {
    getAllProductCategory(whereSearchInput: $whereSearchInput) {
      id
      name
    }
  }
`;

const GET_SUBCATEGORIES = `
  query GetAllProductSubcategory($whereSearchInput: WhereProductSubcategorySearchInput!) {
    getAllProductSubcategory(whereSearchInput: $whereSearchInput) {
      id
      name
      product_category {
        id
        name
      }
    }
  }
`;

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  product_category: {
    id: number;
    name: string;
  };
}

const createProductApi = async (input: any): Promise<any> => {

  const response = await ApiCall<{ createProduct: any }>({
    query: CREATE_PRODUCT,
    variables: {
      inputType: input,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.createProduct;
};

const fetchCategories = async (): Promise<Category[]> => {
  const response = await ApiCall<{ getAllProductCategory: Category[] }>({
    query: GET_ALL_CATEGORIES,
    variables: {
      whereSearchInput: {
        status: "ACTIVE"
      }
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllProductCategory;
};

const fetchSubcategories = async (): Promise<Subcategory[]> => {
  const response = await ApiCall<{ getAllProductSubcategory: Subcategory[] }>({
    query: GET_SUBCATEGORIES,
    variables: {
      whereSearchInput: {
        status: "ACTIVE"
      }
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllProductSubcategory;
};

const CreateProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const methods = useForm<AddProductForm>({
    resolver: valibotResolver(AddProductSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      warranty_days: "0",
      warranty_months: "0",
      warranty_years: "0",
      category_id: "",
      subcategory_id: "",
    },
  });

  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Fetch all subcategories
  const { data: allSubcategories, isLoading: isSubcategoriesLoading } = useQuery({
    queryKey: ["subcategories"],
    queryFn: fetchSubcategories,
  });

  // Watch for category changes
  React.useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name === "category_id" && value.category_id && allSubcategories) {
        const categoryId = parseInt(value.category_id);
        setSelectedCategory(categoryId);
        const filteredSubcategories = allSubcategories.filter(
          (sub) => sub.product_category.id === categoryId
        );
        setSubcategories(filteredSubcategories);
        methods.setValue("subcategory_id", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, categories, allSubcategories]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createProductApi,
    onSuccess: (data) => {
      toast.success("Product created successfully!");
      router.push(`/company/${companyId}/products`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });

  const onSubmit = (data: AddProductForm) => {
    const userId = getCookie("id");

    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    // Calculate total warranty days from components
    const warrantyDays = parseInt(data.warranty_days) || 0;
    const warrantyMonths = parseInt(data.warranty_months) || 0;
    const warrantyYears = parseInt(data.warranty_years) || 0;
    const totalWarrantyDays = warrantyDays + (warrantyMonths * 30) + (warrantyYears * 365);

    const input = {
      name: data.name,
      price: parseFloat(data.price),
      description: data.description,
      warranty_time: totalWarrantyDays,
      subcategory_id: parseInt(data.subcategory_id),
      company_id: companyId,
      createdById: parseInt(userId.toString()),
    };

    createMutation.mutate(input);
  };

  const handleCancel = () => {
    router.push(`/company/${companyId}/products`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                type="text"
                onClick={handleCancel}
                className="hover:bg-gray-100"
              >
                ← Back to Products
              </Button>
              <div>
                <Title level={3} className="!mb-0 text-gray-900">
                  Add New Product
                </Title>
                <p className="text-gray-600 text-sm">
                  Create a new product for Company ID: {companyId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit, onFormError)} className="space-y-8">
              {/* Main Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Product Information */}
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm xl:col-span-2">
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
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      Product Information
                    </h2>
                    <p className="text-purple-700 text-sm mt-1">
                      Basic product details and category information
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextInput<AddProductForm>
                        title="Product Name"
                        required={true}
                        name="name"
                        placeholder="Enter product name"
                      />
                      <TextInput<AddProductForm>
                        title="Price (₹)"
                        required={true}
                        name="price"
                        placeholder="Enter price"
                        numdes={true}
                      />
                      {isCategoriesLoading || isSubcategoriesLoading ? (
                        <div className="flex items-center justify-center p-4 md:col-span-2">
                          <Spin />
                        </div>
                      ) : (
                        <>
                          <MultiSelect<AddProductForm>
                            title="Category"
                            required={true}
                            name="category_id"
                            options={
                              categories
                                ? categories.map((cat) => ({
                                  label: cat.name,
                                  value: cat.id.toString(),
                                }))
                                : []
                            }
                            placeholder="Select category"
                          />
                          <MultiSelect<AddProductForm>
                            title="Subcategory"
                            required={true}
                            name="subcategory_id"
                            options={
                              subcategories.map((sub) => ({
                                label: sub.name,
                                value: sub.id.toString(),
                              }))
                            }
                            placeholder="Select subcategory"
                            disable={!selectedCategory}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warranty Information */}
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Warranty Period
                    </h2>
                    <p className="text-green-700 text-sm mt-1">
                      Set warranty duration components
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <TextInput<AddProductForm>
                        title="Years"
                        required={false}
                        name="warranty_years"
                        placeholder="0"
                        onlynumber={true}
                      />
                      <TextInput<AddProductForm>
                        title="Months"
                        required={false}
                        name="warranty_months"
                        placeholder="0"
                        onlynumber={true}
                      />
                      <TextInput<AddProductForm>
                        title="Days"
                        required={false}
                        name="warranty_days"
                        placeholder="0"
                        onlynumber={true}
                      />
                      <div></div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
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
                            <p className="text-sm font-medium text-blue-900">
                              Warranty Calculation
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Total warranty = Days + (Months × 30) + (Years × 365)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Description */}
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm lg:col-span-2 xl:col-span-3">
                  <div className="bg-orange-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
                    <h2 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-orange-600"
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
                      Product Description
                    </h2>
                    <p className="text-orange-700 text-sm mt-1">
                      Detailed description and specifications
                    </p>
                  </div>
                  <div className="p-6">
                    <TaxtAreaInput<AddProductForm>
                      name="description"
                      title="Description"
                      placeholder="Enter detailed product description"
                      required={true}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
                <Button
                  type="default"
                  size="large"
                  onClick={handleCancel}
                  disabled={createMutation.isPending}
                  className="px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={createMutation.isPending}
                  className="px-8 bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700"
                >
                  {createMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      Creating Product...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create Product
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default CreateProductPage;
