"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { Button, Typography, Spin, Input } from "antd";
import { toast } from "react-toastify";

const { Title } = Typography;

// Types
interface Category {
  id: number;
  name: string;
  priority: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

interface UpdateCategoryInput {
  name: string;
  priority: number;
  status: "ACTIVE" | "INACTIVE";
  updatedById: number;
}

// GraphQL queries
const GET_CATEGORY_BY_ID = `
  query GetProductCategoryById($categoryId: Int!) {
    getProductCategoryById(id: $categoryId) {
      id
      name
      priority
      status
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_CATEGORY = `
  mutation UpdateProductCategory($updateCategoryId: Int!, $updateType: UpdateProductCategoryInput!) {
    updateProductCategory(id: $updateCategoryId, updateType: $updateType) {
      id
      name
    }
  }
`;

// API functions
const fetchCategoryById = async (categoryId: number): Promise<Category> => {
  const response = await ApiCall<{ getProductCategoryById: Category }>({
    query: GET_CATEGORY_BY_ID,
    variables: {
      categoryId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getProductCategoryById;
};

const updateCategoryApi = async (
  categoryId: number,
  updateData: UpdateCategoryInput
): Promise<{ id: number; name: string }> => {
  const response = await ApiCall<{ updateProductCategory: { id: number; name: string } }>({
    query: UPDATE_CATEGORY,
    variables: {
      updateCategoryId: categoryId,
      updateType: updateData,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateProductCategory;
};

const EditCategoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const userid = getCookie("id");
  const categoryId = parseInt(params.id as string);

  const [categoryName, setCategoryName] = useState("");
  const [priority, setPriority] = useState(1);

  // Fetch category data
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    error: categoryError,
  } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => fetchCategoryById(categoryId),
    enabled: !!categoryId,
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: (updateData: UpdateCategoryInput) => updateCategoryApi(categoryId, updateData),
    onSuccess: (data) => {
      toast.success(`Category "${data.name}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", categoryId] });
      router.push("/admin/categories");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });

  // Populate form when category data is loaded
  useEffect(() => {
    if (categoryData) {
      setCategoryName(categoryData.name);
      setPriority(categoryData.priority);
    }
  }, [categoryData]);

  const handleSubmit = () => {
    if (!userid) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    if (!categoryName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }

    if (priority < 1) {
      toast.error("Priority must be at least 1.");
      return;
    }

    const updateData: UpdateCategoryInput = {
      name: categoryName.trim(),
      priority,
      status: categoryData?.status || "ACTIVE",
      updatedById: parseInt(userid.toString()),
    };

    updateMutation.mutate(updateData);
  };

  const handleCancel = () => {
    router.push("/admin/categories");
  };

  // Error states
  if (isCategoryError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Category Not Found</h3>
            <p className="text-gray-500 mb-4">
              {categoryError instanceof Error ? categoryError.message : "The requested category could not be found."}
            </p>
            <Button type="primary" onClick={handleCancel}>
              Back to Categories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isCategoryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading category details...</p>
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
                ← Back to Categories
              </Button>
              <div>
                <Title level={3} className="!mb-0 text-gray-900">
                  Edit Category
                </Title>
                <p className="text-gray-600 text-sm">
                  Update category information and settings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${categoryData?.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${categoryData?.status === "ACTIVE" ? "bg-green-400" : "bg-red-400"
                  }`}></div>
                {categoryData?.status}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="max-w-2xl">
            <div className="space-y-6">
              {/* Category Information */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-semibold text-sm">📁</span>
                  </div>
                  <h2 className="text-lg font-semibold text-emerald-900">
                    Category Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-800 mb-2">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      size="large"
                      placeholder="Enter category name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      disabled={updateMutation.isPending}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-800 mb-2">
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
                    <p className="text-emerald-700 text-xs mt-1">
                      Lower numbers indicate higher priority (1 = highest priority)
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Details */}
              {categoryData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Category Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category ID:</span>
                      <span className="ml-2 font-medium text-gray-900">{categoryData.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Status:</span>
                      <span className={`ml-2 font-medium ${categoryData.status === "ACTIVE" ? "text-green-600" : "text-red-600"
                        }`}>
                        {categoryData.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(categoryData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(categoryData.updatedAt).toLocaleDateString()}
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
                className="px-8 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700"
              >
                {updateMutation.isPending ? "Updating..." : "Update Category"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCategoryPage;