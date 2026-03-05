"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { Button, Typography, Spin, Card, Descriptions, Tag } from "antd";

const { Title, Text } = Typography;

// Types
interface User {
  id: number;
  name: string;
  contact1: string;
  contact2?: string;
  address?: string;
  dob?: string;
  email?: string;
  is_dealer: boolean;
  role: string;
  is_manufacturer: boolean;
  status: "ACTIVE" | "INACTIVE";
  zone?: {
    id: number;
    name: string;
    city: {
      id: number;
      name: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

// GraphQL query
const GET_USER_BY_ID = `
  query GetUserById($getUserByIdId: Int!) {
    getUserById(id: $getUserByIdId) {
      id
      name
      contact1
      contact2
      address
      dob
      email
      is_dealer
      role
      is_manufacturer
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

const fetchUserById = async (userId: number): Promise<User> => {
  const response = await ApiCall<{ getUserById: User }>({
    query: GET_USER_BY_ID,
    variables: {
      getUserByIdId: userId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getUserById;
};

interface UserDetailsPageProps {
  params: Promise<{
    id: string;
    userId: string;
  }>;
}

const DealerUserDetailsPage: React.FC<UserDetailsPageProps> = ({ params }) => {
  const router = useRouter();
  const unwrappedParams = React.use(params) as { id: string; userId: string };
  const dealerId = parseInt(unwrappedParams.id);
  const userId = parseInt(unwrappedParams.userId);

  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
  });

  const handleBack = () => {
    router.push(`/admin/dealers/${dealerId}/users`);
  };

  const handleEdit = () => {
    router.push(`/admin/dealers/${dealerId}/users/${userId}/edit`);
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      "DEALER_ADMIN": "purple",
      "DEALER_ACCOUNTS": "green",
      "DEALER_MANAGER": "blue",
      "DEALER_SALES": "orange",
    };
    return roleColors[role as keyof typeof roleColors] || "gray";
  };

  const getRoleDisplayName = (role: string) => {
    return role.replace("DEALER_", "");
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">User Not Found</h3>
            <p className="text-gray-500 mb-4">
              {error instanceof Error ? error.message : "The requested user could not be found."}
            </p>
            <Button type="primary" onClick={handleBack}>
              Back to Users
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button type="text" onClick={handleBack} className="hover:bg-gray-100 transition">
              ← Back
            </Button>
            <div className="flex-shrink-0 h-14 w-14 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold text-xl">
                {userData?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <Title level={3} className="!mb-0 text-gray-900">
                {userData?.name}
              </Title>
              <p className="text-gray-600 text-sm">
                User ID: {userData?.id} • {getRoleDisplayName(userData?.role || "")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Tag
              color={userData?.status === "ACTIVE" ? "green" : "red"}
              className="text-base px-4 py-1"
            >
              {userData?.status}
            </Tag>
            <Button
              type="primary"
              onClick={handleEdit}
              className="bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700 transition"
            >
              Edit User
            </Button>
          </div>
        </div>

        {/* Main Content: Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: User Details */}
          <Card
            title={
              <div className="flex items-center gap-2">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-lg font-semibold text-orange-700">Personal Information</span>
              </div>
            }
            className="shadow-sm border-orange-100"
          >
            <Descriptions column={1} className="mb-6">
              <Descriptions.Item label="Full Name">
                <Text strong className="text-orange-900 text-lg">
                  {userData?.name}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Primary Contact">
                <Text className="text-gray-700 font-medium">{userData?.contact1}</Text>
              </Descriptions.Item>
              {userData?.contact2 && (
                <Descriptions.Item label="Secondary Contact">
                  <Text className="text-gray-700">{userData?.contact2}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Email">
                <Text className="text-gray-700">
                  {userData?.email || <span className="text-gray-400">Not provided</span>}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                <Text className="text-gray-700">
                  {userData?.dob 
                    ? new Date(userData.dob).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : <span className="text-gray-400">Not provided</span>
                  }
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <Text className="text-gray-700">
                  {userData?.address || <span className="text-gray-400">Not provided</span>}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Right: Role & Location */}
          <Card
            title={
              <div className="flex items-center gap-2">
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
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2"
                  />
                </svg>
                <span className="font-semibold text-purple-700">Role & Location</span>
              </div>
            }
            className="shadow-sm border-purple-100"
          >
            <div className="space-y-6 mb-6">
              <div>
                <Text className="text-gray-500 text-sm block mb-2">Role</Text>
                <Tag
                  color={getRoleColor(userData?.role || "")}
                  className="text-base px-4 py-2 font-medium"
                >
                  {getRoleDisplayName(userData?.role || "")}
                </Tag>
              </div>
              
              <div>
                <Text className="text-gray-500 text-sm block mb-2">User Type</Text>
                <div className="flex gap-2">
                  <Tag color={userData?.is_manufacturer ? "blue" : "default"}>
                    {userData?.is_manufacturer ? "✓ Manufacturer" : "✗ Not Manufacturer"}
                  </Tag>
                  <Tag color={userData?.is_dealer ? "orange" : "default"}>
                    {userData?.is_dealer ? "✓ Dealer" : "✗ Not Dealer"}
                  </Tag>
                </div>
              </div>

              {userData?.zone && (
                <div>
                  <Text className="text-gray-500 text-sm block mb-2">Location</Text>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <Text strong className="text-purple-900">
                        {userData.zone.city.name}
                      </Text>
                    </div>
                    <Text className="text-purple-700 text-sm">
                      Zone: {userData.zone.name}
                    </Text>
                  </div>
                </div>
              )}
            </div>

            {(userData?.createdAt || userData?.updatedAt) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                {userData?.createdAt && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <Text className="text-orange-600 text-sm font-medium block mb-1">Created Date</Text>
                    <Text strong className="text-orange-900">
                      {new Date(userData.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </div>
                )}
                {userData?.updatedAt && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <Text className="text-purple-600 text-sm font-medium block mb-1">Last Updated</Text>
                    <Text strong className="text-purple-900">
                      {new Date(userData.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Additional Information Section */}
        <Card
          title={
            <div className="flex items-center gap-2">
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
              <span className="font-semibold text-blue-700">System Information</span>
            </div>
          }
          className="shadow-sm border-blue-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl text-orange-600 mb-2">🆔</div>
              <Text className="text-orange-600 text-sm font-medium block mb-1">User ID</Text>
              <Text strong className="text-orange-900 text-lg">{userData?.id}</Text>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl text-green-600 mb-2">
                {userData?.status === "ACTIVE" ? "✅" : "❌"}
              </div>
              <Text className="text-green-600 text-sm font-medium block mb-1">Account Status</Text>
              <Tag
                color={userData?.status === "ACTIVE" ? "green" : "red"}
                className="text-base px-3 py-1"
              >
                {userData?.status}
              </Tag>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl text-purple-600 mb-2">🏪</div>
              <Text className="text-purple-600 text-sm font-medium block mb-1">Dealer ID</Text>
              <Text strong className="text-purple-900 text-lg">{dealerId}</Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DealerUserDetailsPage;