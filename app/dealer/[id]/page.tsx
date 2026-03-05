"use client";

import React, { useState } from "react";
import {
  Card,
  Typography,
  Tag,
  Button,
  Spin,
  Descriptions,
  Space,
  Modal,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ShopOutlined,
  UsergroupAddOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Types
interface DealerDetails {
  id: number;
  name: string;
  email: string;
  contact1: string;
  contact2?: string;
  address: string;
  gst?: string;
  pan?: string;
  status: "ACTIVE" | "INACTIVE";
  zone?: {
    id: number;
    name: string;
    city?: {
      id: number;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// GraphQL queries
const GET_DEALER_BY_ID = `
  query GetCompanyById($getCompanyByIdId: Int!) {
    getCompanyById(id: $getCompanyByIdId) {
      id
      name
      email
      contact1
      contact2
      address
      gst
      pan
      status
      zone {
        id
        name
        city {
          id
          name
        }
      }
      createdAt
      updatedAt
    }
  }
`;

const DELETE_DEALER = `
  mutation DeleteCompany($deleteCompanyId: Int!, $userid: Int!) {
    deleteCompany(id: $deleteCompanyId, userid: $userid) {
      id  
    }
  }
`;

// API functions
const fetchDealerById = async (id: number): Promise<DealerDetails> => {
  const response = await ApiCall<{ getCompanyById: DealerDetails }>({
    query: GET_DEALER_BY_ID,
    variables: {
      getCompanyByIdId: id,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getCompanyById;
};

const deleteDealerApi = async (
  dealerId: number,
  userId: number
): Promise<{ id: number }> => {
  const response = await ApiCall<{ deleteCompany: { id: number } }>({
    query: DELETE_DEALER,
    variables: {
      deleteCompanyId: dealerId,
      userid: userId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.deleteCompany;
};

interface DealerDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const DealerDetailsPage: React.FC<DealerDetailsPageProps> = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();

  const dealerId = parseInt(params.id as string);
  const companyId: number = parseInt(getCookie("company")?.toString() || "0");

  // State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch dealer details
  const {
    data: dealer,
    isLoading: isDealerLoading,
    isError: isDealerError,
    error: dealerError,
  } = useQuery({
    queryKey: ["dealer", dealerId],
    queryFn: () => fetchDealerById(dealerId),
    enabled: !!dealerId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({ dealerId, userId }: { dealerId: number; userId: number }) =>
      deleteDealerApi(dealerId, userId),
    onSuccess: () => {
      toast.success("Dealer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["dealers"] });
      router.push("/dealer");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete dealer: ${error.message}`);
    },
  });

  // Handle back navigation
  const handleBack = () => {
    router.push("/dealer");
  };

  // Handle edit
  const handleEdit = () => {
    router.push(`/dealer/${dealerId}/edit`);
  };

  // Handle delete
  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    const userId = getCookie("id");
    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    deleteMutation.mutate({
      dealerId,
      userId: parseInt(userId.toString()),
    });
  };

  if (isDealerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isDealerError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">
                Error:{" "}
                {dealerError instanceof Error
                  ? dealerError.message
                  : "Unknown error"}
              </p>
              <Button onClick={handleBack} type="primary">
                Back to Dealers
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Dealer not found</p>
              <Button onClick={handleBack} type="primary">
                Back to Dealers
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <DeleteOutlined className="text-red-600 text-lg" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Delete Dealer
            </span>
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
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete the dealer:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-400">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-semibold text-sm">
                    {dealer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{dealer.name}</h4>
                  <p className="text-sm text-gray-500">
                    ID: {dealer.id} • {dealer.zone?.city?.name || "N/A"},{" "}
                    {dealer.zone?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <span className="text-red-500 text-lg">⚠️</span>
                <div>
                  <p className="text-red-800 font-medium text-sm">Warning</p>
                  <p className="text-red-700 text-sm">
                    This action cannot be undone. All data associated with this
                    dealer will be permanently deleted.
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
              {deleteMutation.isPending ? "Deleting..." : "Delete Dealer"}
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
                Back to Dealers
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <ShopOutlined className="text-orange-600 text-xl" />
                </div>
                <div>
                  <Title level={3} className="!mb-0 text-gray-900">
                    {dealer.name}
                  </Title>
                  <Text type="secondary">Dealer ID: {dealer.id}</Text>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                icon={<EditOutlined />}
                onClick={handleEdit}
                type="primary"
                className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
              >
                Edit Dealer
              </Button>
              <Button
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                danger
                loading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <Button
            type="default"
            className="!border-orange-200 !text-orange-700 hover:!bg-orange-50 transition"
            onClick={() => router.push(`/dealer/${companyId}/stock`)}
            icon={<ShopOutlined />}
          >
            Stock Management
          </Button>
          <Button
            type="default"
            className="!border-purple-200 !text-purple-700 hover:!bg-purple-50 transition"
            onClick={() => router.push(`/dealer/${companyId}/users`)}
            icon={<UsergroupAddOutlined />}
          >
            User Management
          </Button>
          <Button
            type="default"
            className="!border-green-200 !text-green-700 hover:!bg-green-50 transition"
            onClick={() => router.push(`/dealer/${companyId}/sale`)}
            icon={<ShoppingCartOutlined />}
          >
            Customer Sales
          </Button>
        </div>

        {/* Dealer Details */}
        <Card title="Dealer Information" className="shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Name">{dealer.name}</Descriptions.Item>
              <Descriptions.Item label="Email">
                {dealer.email}
              </Descriptions.Item>
              <Descriptions.Item label="Primary Contact">
                {dealer.contact1}
              </Descriptions.Item>
              {dealer.contact2 && (
                <Descriptions.Item label="Secondary Contact">
                  {dealer.contact2}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Address">
                {dealer.address}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Location">
                {dealer.zone?.city?.name || "N/A"}, {dealer.zone?.name || "N/A"}
              </Descriptions.Item>
              {dealer.gst && (
                <Descriptions.Item label="GST Number">
                  {dealer.gst}
                </Descriptions.Item>
              )}
              {dealer.pan && (
                <Descriptions.Item label="PAN Number">
                  {dealer.pan}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Status">
                <Tag
                  color={dealer.status === "ACTIVE" ? "green" : "red"}
                  className="font-medium"
                >
                  {dealer.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(dealer.createdAt).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DealerDetailsPage;
