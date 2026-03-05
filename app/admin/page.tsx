"use client";

import {
  FluentDocumentBulletList16Regular,
  FluentShieldAdd48Filled,
  IcBaselineAttractions,
  IcOutlineInsertChart,
  IcRoundTurnedInNot,
  MaterialSymbolsPersonRounded,
  SolarBellBold,
} from "@/components/icons";
import { Select, Modal, Input, Button } from "antd";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";

import { Chart as ChartJS, registerables } from "chart.js";
import Link from "next/link";
import { toast } from "react-toastify";

ChartJS.register(...registerables);

// GraphQL mutations and queries
const CREATE_PRODUCT_CATEGORY = `
  mutation Mutation($inputType: CreateProductCategoryInput!) {
    createProductCategory(inputType: $inputType) {
      id  
    }
  }
`;

const CREATE_PRODUCT_SUBCATEGORY = `
  mutation CreateProductSubcategory($inputType: CreateProductSubcategoryInput!) {
    createProductSubcategory(inputType: $inputType) {
      id  
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

// Types
interface Category {
  id: number;
  name: string;
}

// API functions
const createCategoryApi = async (
  name: string,
  createdById: number
): Promise<{ id: number }> => {
  const response = await ApiCall<{ createProductCategory: { id: number } }>({
    query: CREATE_PRODUCT_CATEGORY,
    variables: {
      inputType: {
        name,
        createdById,
        priority: 1,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.createProductCategory;
};

const createSubcategoryApi = async (
  name: string,
  productCategoryId: number,
  createdById: number
): Promise<{ id: number }> => {
  const response = await ApiCall<{ createProductSubcategory: { id: number } }>({
    query: CREATE_PRODUCT_SUBCATEGORY,
    variables: {
      inputType: {
        name,
        product_category_id: productCategoryId,
        createdById,
        priority: 1,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.createProductSubcategory;
};

const fetchCategoriesApi = async (): Promise<Category[]> => {
  const response = await ApiCall<{ getAllProductCategory: Category[] }>({
    query: GET_ALL_CATEGORIES,
    variables: {
      whereSearchInput: {
        status: "ACTIVE",
      },
    },
  });
  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllProductCategory;
};

const DashboardComponent = () => {
  // Prevent SSR issues
  const [year, setYear] = useState(new Date().getFullYear());
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);

  // Fetch categories for subcategory dropdown
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategoriesApi,
    enabled: typeof window !== "undefined", // Only run on client side
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: ({
      name,
      createdById,
    }: {
      name: string;
      createdById: number;
    }) => createCategoryApi(name, createdById),
    onSuccess: () => {
      toast.success(`Category "${categoryName}" created successfully!`);
      setIsCategoryModalOpen(false);
      setCategoryName("");
      // Refetch categories to update dropdown
      refetchCategories();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });

  // Create subcategory mutation
  const createSubcategoryMutation = useMutation({
    mutationFn: ({
      name,
      productCategoryId,
      createdById,
    }: {
      name: string;
      productCategoryId: number;
      createdById: number;
    }) => createSubcategoryApi(name, productCategoryId, createdById),
    onSuccess: () => {
      toast.success(`Subcategory "${subcategoryName}" created successfully!`);
      setIsSubcategoryModalOpen(false);
      setSubcategoryName("");
      setSelectedCategoryId(undefined);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create subcategory: ${error.message}`);
    },
  });

  // Handle category creation
  const handleCreateCategory = () => {
    try {
      const userId = getCookie("id");

      if (!userId) {
        toast.error("User not authenticated. Please login again.");
        return;
      }

      if (!categoryName.trim()) {
        toast.error("Please enter a category name.");
        return;
      }

      createCategoryMutation.mutate({
        name: categoryName.trim(),
        createdById: parseInt(userId.toString()),
      });
    } catch (error) {
      toast.error("Authentication error. Please login again.");
      console.error("Error accessing user ID:", error);
    }
  };

  // Handle cancel
  const handleCancelCategory = () => {
    setIsCategoryModalOpen(false);
    setCategoryName("");
  };

  // Handle Add Category button click
  const handleAddCategoryClick = () => {
    setIsCategoryModalOpen(true);
  };

  // Handle subcategory creation
  const handleCreateSubcategory = () => {
    try {
      const userId = getCookie("id");

      if (!userId) {
        toast.error("User not authenticated. Please login again.");
        return;
      }

      if (!subcategoryName.trim()) {
        toast.error("Please enter a subcategory name.");
        return;
      }

      if (!selectedCategoryId) {
        toast.error("Please select a parent category.");
        return;
      }

      createSubcategoryMutation.mutate({
        name: subcategoryName.trim(),
        productCategoryId: selectedCategoryId,
        createdById: parseInt(userId.toString()),
      });
    } catch (error) {
      toast.error("Authentication error. Please login again.");
      console.error("Error accessing user ID:", error);
    }
  };

  // Handle cancel subcategory
  const handleCancelSubcategory = () => {
    setIsSubcategoryModalOpen(false);
    setSubcategoryName("");
    setSelectedCategoryId(undefined);
  };

  // Handle Add Subcategory button click
  const handleAddSubcategoryClick = () => {
    setIsSubcategoryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">WS</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Warranty Smart
              </h1>
              <p className="text-gray-500 text-xs">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-amber-100 rounded-full">
            <SolarBellBold className="text-amber-600 text-lg" />
          </div>
          <div>
            <p className="font-semibold text-amber-900">12 Pending Claims</p>
            <p className="text-amber-700 text-xs">
              Action needed - Review claims
            </p>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Companies"
            value="234"
            icon={<MaterialSymbolsPersonRounded className="text-blue-600" />}
            href="/admin/companies"
            gradient="from-blue-50 to-blue-100"
            iconBg="bg-blue-100"
          />
          <StatCard
            title="Products"
            value="1,043"
            icon={<IcBaselineAttractions className="text-emerald-600" />}
            href="/admin/products"
            gradient="from-emerald-50 to-emerald-100"
            iconBg="bg-emerald-100"
          />
          <StatCard
            title="Claims"
            value="167"
            icon={
              <FluentDocumentBulletList16Regular className="text-orange-600" />
            }
            href="/admin/claims"
            gradient="from-orange-50 to-orange-100"
            iconBg="bg-orange-100"
          />
          <StatCard
            title="Sales"
            value="544"
            icon={<IcOutlineInsertChart className="text-purple-600" />}
            href="/admin/sales"
            gradient="from-purple-50 to-purple-100"
            iconBg="bg-purple-100"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FluentDocumentBulletList16Regular className="text-blue-600 text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Recent Activities
                  </h3>
                  <p className="text-gray-500 text-xs">
                    Latest updates and actions
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <ActivityCard
                  title="New Warranty Claim"
                  description="Product: iPhone 14 Pro"
                  status="Pending Review"
                  icon={<FluentShieldAdd48Filled className="text-blue-600" />}
                  time="2 hours ago"
                />
                <ActivityCard
                  title="Company Registration"
                  description="TechCorp Solutions registered"
                  status="Completed"
                  icon={
                    <MaterialSymbolsPersonRounded className="text-green-600" />
                  }
                  time="5 hours ago"
                />
                <ActivityCard
                  title="Product Added"
                  description="Samsung Galaxy S24 Ultra"
                  status="Active"
                  icon={<IcBaselineAttractions className="text-purple-600" />}
                  time="1 day ago"
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Analytics Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                    <IcOutlineInsertChart className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Claims Analytics
                    </h3>
                    <p className="text-gray-500 text-xs">Monthly overview</p>
                  </div>
                </div>
                <Select
                  size="small"
                  defaultValue={new Date().getFullYear().toString()}
                  value={year.toString()}
                  onChange={(value) => setYear(parseInt(value))}
                  options={Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return {
                      value: year.toString(),
                      label: year.toString(),
                    };
                  })}
                />
              </div>
              <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-blue-100">
                <p className="text-gray-500 text-sm">
                  Chart will be rendered here
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-lg">
                  <IcRoundTurnedInNot className="text-emerald-600 text-lg" />
                </div>
                <h3 className="font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  Quick Actions
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Link
                  href="/admin/addcompany"
                  className="w-full h-auto p-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg text-center transition-all duration-200 border border-blue-200 transform hover:scale-105"
                  type="text"
                >
                  <span className="text-blue-700 font-medium text-sm">
                    Add Company
                  </span>
                </Link>
                <Button
                  onClick={handleAddCategoryClick}
                  className="w-full h-auto p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-lg text-center transition-all duration-200 border border-emerald-200 transform hover:scale-105"
                  type="text"
                >
                  <span className="text-emerald-700 font-medium text-sm">
                    Add Category
                  </span>
                </Button>
                <Button
                  onClick={handleAddSubcategoryClick}
                  className="w-full h-auto p-3 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg text-center transition-all duration-200 border border-purple-200 transform hover:scale-105"
                  type="text"
                >
                  <span className="text-purple-700 font-medium text-sm">
                    Add Subcategory
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Category Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <IcBaselineAttractions className="text-emerald-600 text-lg" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Create New Category
              </span>
            </div>
          }
          open={isCategoryModalOpen}
          onCancel={handleCancelCategory}
          footer={null}
          width={500}
          centered
        >
          <div className="py-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Enter the name for the new product category:
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    size="large"
                    placeholder="Enter category name (e.g., Electronics, Appliances)"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    onPressEnter={handleCreateCategory}
                    disabled={createCategoryMutation.isPending}
                    autoFocus
                  />
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 text-lg">ℹ️</span>
                    <div>
                      <p className="text-emerald-800 font-medium text-sm">
                        Category Settings
                      </p>
                      <p className="text-emerald-700 text-sm mt-1">
                        This category will be created with{" "}
                        <strong>Priority 1</strong> and will be immediately
                        available for product assignment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                size="large"
                onClick={handleCancelCategory}
                disabled={createCategoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                loading={createCategoryMutation.isPending}
                onClick={handleCreateCategory}
                className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700"
                icon={createCategoryMutation.isPending ? null : "📁"}
              >
                {createCategoryMutation.isPending
                  ? "Creating..."
                  : "Create Category"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add Subcategory Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <IcBaselineAttractions className="text-purple-600 text-lg" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Create New Subcategory
              </span>
            </div>
          }
          open={isSubcategoryModalOpen}
          onCancel={handleCancelSubcategory}
          footer={null}
          width={500}
          centered
        >
          <div className="py-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Create a new subcategory under an existing category:
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    size="large"
                    placeholder="Select parent category"
                    value={selectedCategoryId}
                    onChange={setSelectedCategoryId}
                    disabled={
                      createSubcategoryMutation.isPending || isCategoriesLoading
                    }
                    loading={isCategoriesLoading}
                    className="w-full"
                    options={categories?.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                  />
                  {isCategoriesError && (
                    <p className="text-red-500 text-xs mt-1">
                      Failed to load categories. Please try again.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    size="large"
                    placeholder="Enter subcategory name (e.g., Smartphones, Laptops)"
                    value={subcategoryName}
                    onChange={(e) => setSubcategoryName(e.target.value)}
                    onPressEnter={handleCreateSubcategory}
                    disabled={createSubcategoryMutation.isPending}
                  />
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 text-lg">ℹ️</span>
                    <div>
                      <p className="text-purple-800 font-medium text-sm">
                        Subcategory Settings
                      </p>
                      <p className="text-purple-700 text-sm mt-1">
                        This subcategory will be created with{" "}
                        <strong>Priority 1</strong> under the selected parent
                        category and will be immediately available for product
                        assignment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                size="large"
                onClick={handleCancelSubcategory}
                disabled={createSubcategoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                loading={createSubcategoryMutation.isPending}
                onClick={handleCreateSubcategory}
                className="bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700"
                icon={createSubcategoryMutation.isPending ? null : "📂"}
              >
                {createSubcategoryMutation.isPending
                  ? "Creating..."
                  : "Create Subcategory"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Component for displaying statistics cards
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  iconBg: string;
}

const StatCard = ({
  title,
  value,
  icon,
  href,
  gradient,
  iconBg,
}: StatCardProps) => {
  return (
    <Link href={href} className="group">
      <div
        className={`bg-gradient-to-br ${gradient} rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 transform group-hover:scale-105`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-xs font-medium">{title}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-2 ${iconBg} rounded-lg`}>
            <div className="text-xl">{icon}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Component for displaying activity cards
interface ActivityCardProps {
  title: string;
  description: string;
  status: string;
  icon: React.ReactNode;
  time: string;
}

const ActivityCard = ({
  title,
  description,
  status,
  icon,
  time,
}: ActivityCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200";
      case "pending review":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200";
      case "active":
        return "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200";
    }
  };

  const getIconBg = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100";
      case "pending review":
        return "bg-yellow-100";
      case "active":
        return "bg-blue-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
      <div className={`p-2 ${getIconBg(status)} rounded-lg`}>
        <div className="text-lg">{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate text-sm">{title}</h4>
        <p className="text-gray-500 text-xs truncate">{description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
          <span className="text-gray-400 text-xs">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;
