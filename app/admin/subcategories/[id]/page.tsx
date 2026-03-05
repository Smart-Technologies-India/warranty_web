"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { Button, Typography, Spin, Input, Select } from "antd";
import { toast } from "react-toastify";

const { Title } = Typography;

// Types
interface Subcategory {
  id: number;
  name: string;
  priority: number;
  status: "ACTIVE" | "INACTIVE";
  productCategory: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
}

interface UpdateSubcategoryInput {
  name: string;
  priority: number;
  product_category_id: number;
  status: "ACTIVE" | "INACTIVE";
  updatedById: number;
}

// GraphQL queries
const GET_SUBCATEGORY_BY_ID = `
  query GetProductSubcategoryById($subcategoryId: Int!) {
    getProductSubcategoryById(id: $subcategoryId) {
      id
      name
      priority
      status
      productCategory {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_ALL_CATEGORIES = `
  query GetAllProductCategory($whereSearchInput: WhereProductCategorySearchInput!) {
    getAllProductCategory(whereSearchInput: $whereSearchInput) {
      id
      name
    }
  }
`;

const UPDATE_SUBCATEGORY = `
  mutation UpdateProductSubcategory($updateSubcategoryId: Int!, $updateType: UpdateProductSubcategoryInput!) {
    updateProductSubcategory(id: $updateSubcategoryId, updateType: $updateType) {
      id
      name
    }
  }
`;

// API functions
const fetchSubcategoryById = async (subcategoryId: number): Promise<Subcategory> => {
  const response = await ApiCall<{ getProductSubcategoryById: Subcategory }>({
    query: GET_SUBCATEGORY_BY_ID,
    variables: {
      subcategoryId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getProductSubcategoryById;
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

const updateSubcategoryApi = async (
  subcategoryId: number,
  updateData: UpdateSubcategoryInput
): Promise<{ id: number; name: string }> => {
  const response = await ApiCall<{ updateProductSubcategory: { id: number; name: string } }>({
    query: UPDATE_SUBCATEGORY,
    variables: {
      updateSubcategoryId: subcategoryId,
      updateType: updateData,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateProductSubcategory;
};

const EditSubcategoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const userid = getCookie("id");
  const subcategoryId = parseInt(params.id as string);

  const [subcategoryName, setSubcategoryName] = useState("");
  const [priority, setPriority] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  // Fetch subcategory data
  const {
    data: subcategoryData,
    isLoading: isSubcategoryLoading,
    isError: isSubcategoryError,
    error: subcategoryError,
  } = useQuery({
    queryKey: ["subcategory", subcategoryId],
    queryFn: () => fetchSubcategoryById(subcategoryId),
    enabled: !!subcategoryId,
  });

  // Fetch categories data
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Update subcategory mutation
  const updateMutation = useMutation({
    mutationFn: (updateData: UpdateSubcategoryInput) => updateSubcategoryApi(subcategoryId, updateData),
    onSuccess: (data) => {
      toast.success(`Subcategory "${data.name}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      queryClient.invalidateQueries({ queryKey: ["subcategory", subcategoryId] });
      router.push("/admin/subcategories");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update subcategory: ${error.message}`);
    },
  });

  // Populate form when subcategory data is loaded
  useEffect(() => {
    if (subcategoryData) {
      setSubcategoryName(subcategoryData.name);
      setPriority(subcategoryData.priority);
      setSelectedCategoryId(subcategoryData.productCategory.id);
    }
  }, [subcategoryData]);

  const handleSubmit = () => {
    if (!userid) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    if (!subcategoryName.trim()) {
      toast.error("Please enter a subcategory name.");
      return;
    }

    if (priority < 1) {
      toast.error("Priority must be at least 1.");
      return;
    }

    if (!selectedCategoryId) {
      toast.error("Please select a parent category.");
      return;
    }

    const updateData: UpdateSubcategoryInput = {
      name: subcategoryName.trim(),
      priority,
      product_category_id: selectedCategoryId,
      status: subcategoryData?.status || "ACTIVE",
      updatedById: parseInt(userid.toString()),
    };

    updateMutation.mutate(updateData);
  };

  const handleCancel = () => {
    router.push("/admin/subcategories");
  };

  // Error states
  if (isSubcategoryError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Subcategory Not Found</h3>
            <p className="text-gray-500 mb-4">
              {subcategoryError instanceof Error ? subcategoryError.message : "The requested subcategory could not be found."}
            </p>
            <Button type="primary" onClick={handleCancel}>
              Back to Subcategories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isCategoriesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Categories</h3>
            <p className="text-gray-500 mb-4">
              {categoriesError instanceof Error ? categoriesError.message : "Could not load category data."}
            </p>
            <Button type="primary" onClick={handleCancel}>
              Back to Subcategories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isSubcategoryLoading || isCategoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading subcategory details...</p>
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
                type="text"
                onClick={handleCancel}
                className="hover:bg-gray-100"
              >
                ← Back to Subcategories
              </Button>
              <div>
                <Title level={3} className="!mb-0 text-gray-900">
                  Edit Subcategory
                </Title>
                <p className="text-gray-600 text-sm">
                  Update subcategory information and settings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                subcategoryData?.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  subcategoryData?.status === "ACTIVE" ? "bg-green-400" : "bg-red-400"
                }`}></div>
                {subcategoryData?.status}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="max-w-2xl">
            <div className="space-y-6">
              {/* Subcategory Information */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">📂</span>
                  </div>
                  <h2 className="text-lg font-semibold text-purple-900">
                    Subcategory Information
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-2">
                      Parent Category <span className="text-red-500">*</span>
                    </label>
                    <Select
                      size="large"
                      placeholder="Select parent category"
                      value={selectedCategoryId}
                      onChange={setSelectedCategoryId}
                      disabled={updateMutation.isPending}
                      className="w-full"
                      options={categoriesData?.map((category) => ({
                        value: category.id,
                        label: category.name,
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-2">
                      Subcategory Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      size="large"
                      placeholder="Enter subcategory name"
                      value={subcategoryName}
                      onChange={(e) => setSubcategoryName(e.target.value)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <Input
                      size="large"
                      type="number"
                      min={1}
                      placeholder="Enter priority number"
                      value={priority}
                      onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                      disabled={updateMutation.isPending}
                    />
                    <p className="text-purple-700 text-xs mt-1">
                      Lower numbers indicate higher priority (1 = highest priority)
                    </p>
                  </div>
                </div>
              </div>

              {/* Subcategory Details */}
              {subcategoryData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Subcategory Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Subcategory ID:</span>
                      <span className="ml-2 font-medium text-gray-900">{subcategoryData.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Status:</span>
                      <span className={`ml-2 font-medium ${
                        subcategoryData.status === "ACTIVE" ? "text-green-600" : "text-red-600"
                      }`}>
                        {subcategoryData.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Parent:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {subcategoryData.productCategory.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Priority:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        #{subcategoryData.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(subcategoryData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(subcategoryData.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 mt-6">
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
                size="large"
                loading={updateMutation.isPending}
                onClick={handleSubmit}
                className="px-8 bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700"
              >
                {updateMutation.isPending ? "Updating..." : "Update Subcategory"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSubcategoryPage;