"use client";

import React, { useState, useEffect } from "react";
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
const UpdateProductSchema = object({
  name: pipe(string("Enter Product Name")),
  price: pipe(string("Enter Price")),
  description: pipe(string("Enter Description")),
  warranty_days: pipe(string("Enter Days")),
  warranty_months: pipe(string("Enter Months")),
  warranty_years: pipe(string("Enter Years")),
  category_id: pipe(string("Select Category")),
  subcategory_id: pipe(string("Select Subcategory")),
});

type UpdateProductForm = InferInput<typeof UpdateProductSchema>;

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
}

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

// GraphQL queries
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
    }
  }
`;

const UPDATE_PRODUCT = `
 mutation UpdateProduct($updateProductId: Int!, $updateType: UpdateProductInput!) { updateProduct(id: $updateProductId, updateType: $updateType) {
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

const updateProductApi = async (productId: number, input: any): Promise<any> => {
  const response = await ApiCall<{ updateProduct: any }>({
    query: UPDATE_PRODUCT,
    variables: {
      updateProductId: productId,
      updateType: input,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateProduct;
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

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);
  const productId = parseInt(params.productId as string);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const methods = useForm<UpdateProductForm>({
    resolver: valibotResolver(UpdateProductSchema),
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

  // Fetch product data
  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    enabled: !!productId,
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

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (input: any) => updateProductApi(productId, input),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      router.push(`/company/${companyId}/products`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  // Set form values when product data is loaded
  useEffect(() => {
    if (productData && categories && allSubcategories) {
      // Calculate warranty components from total days
      const totalDays = productData.warranty_time;
      const years = Math.floor(totalDays / 365);
      const months = Math.floor((totalDays % 365) / 30);
      const days = totalDays % 30;

      methods.reset({
        name: productData.name,
        price: productData.price.toString(),
        description: productData.description,
        warranty_days: days.toString(),
        warranty_months: months.toString(),
        warranty_years: years.toString(),
        category_id: productData.subcategory.product_category.id.toString(),
        subcategory_id: productData.subcategory.id.toString(),
      });

      const categoryId = productData.subcategory.product_category.id;
      setSelectedCategory(categoryId);
      const filteredSubcategories = allSubcategories.filter(
        (sub) => sub.product_category.id === categoryId
      );
      setSubcategories(filteredSubcategories);
    }
  }, [productData, categories, allSubcategories, methods]);

  // Watch for category changes
  useEffect(() => {
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

  const onSubmit = (data: UpdateProductForm) => {
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
      updatedById: parseInt(userId.toString()),
    };

    updateMutation.mutate(input);
  };



  const handleCancel = () => {
    router.push(`/company/${companyId}/products`);
  };

  if (isProductLoading || isCategoriesLoading || isSubcategoriesLoading) {
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
                  Edit Product
                </Title>
                <p className="text-gray-600 text-sm">
                  Update product information for {productData?.name}
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
                      <TextInput<UpdateProductForm>
                        title="Product Name"
                        required={true}
                        name="name"
                        placeholder="Enter product name"
                      />
                      <TextInput<UpdateProductForm>
                        title="Price (₹)"
                        required={true}
                        name="price"
                        placeholder="Enter price"
                        numdes={true}
                      />
                      <MultiSelect<UpdateProductForm>
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
                      <MultiSelect<UpdateProductForm>
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
                      <TextInput<UpdateProductForm>
                        title="Years"
                        required={false}
                        name="warranty_years"
                        placeholder="0"
                        onlynumber={true}
                      />
                      <TextInput<UpdateProductForm>
                        title="Months"
                        required={false}
                        name="warranty_months"
                        placeholder="0"
                        onlynumber={true}
                      />
                      <TextInput<UpdateProductForm>
                        title="Days"
                        required={false}
                        name="warranty_days"
                        placeholder="0"
                        onlynumber={true}
                      />
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
                    <TaxtAreaInput<UpdateProductForm>
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
                  disabled={updateMutation.isPending}
                  className="px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={updateMutation.isPending}
                  className="px-8 bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700"
                >
                  {updateMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      Updating Product...
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Update Product
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

export default EditProductPage;
