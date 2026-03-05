"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Typography, Spin } from "antd";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { TextInput } from "@/components/form/inputfields/textinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { onFormError } from "@/utils/methods";
import { object, string, pipe, InferInput } from "valibot";
import { toast } from "react-toastify";

const { Title } = Typography;

// Validation Schema
const UpdateUserSchema = object({
  name: pipe(string("Enter User Name")),
  contact1: pipe(string("Enter Contact Number")),
  role: pipe(string("Select Role")),
});

type UpdateUserForm = InferInput<typeof UpdateUserSchema>;

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
}

// GraphQL queries
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
    }
  }
`;

const UPDATE_USER = `
  mutation UpdateUser($updateUserId: Int!, $updateUserInput: UpdateUserInput!) {
    updateUser(id: $updateUserId, updateUserInput: $updateUserInput) {
      id
      name
    }
  }
`;

// Role options
const ROLE_OPTIONS = [
  { label: "Admin", value: "MANUF_ADMIN" },
  { label: "Accounts", value: "MANUF_ACCOUNTS" },
  { label: "Manager", value: "MANUF_MANAGER" },
  { label: "Gen. Tech.", value: "MANUF_TECH_GEN" },
  { label: "Tech. Expert", value: "MANUF_TECH_EXPERT" },
  { label: "Tech. Manager", value: "MANUF_TECH_MANAGER" },
  { label: "Sales", value: "MANUF_SALES" },
  { label: "Technical", value: "MANUF_TECHNICAL" },
];

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

const updateUserApi = async (userId: number, input: any): Promise<any> => {
  const response = await ApiCall<{ updateUser: any }>({
    query: UPDATE_USER,
    variables: {
      updateUserId: userId,
      updateUserInput: input,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateUser;
};

const EditUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);
  const userId = parseInt(params.userId as string);

  const methods = useForm<UpdateUserForm>({
    resolver: valibotResolver(UpdateUserSchema),
    defaultValues: {
      name: "",
      contact1: "",
      role: "",
    },
  });

  // Fetch user data
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (input: any) => updateUserApi(userId, input),
    onSuccess: () => {
      toast.success("User updated successfully!");
      router.push(`/company/${companyId}/users`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  // Set form values when user data is loaded
  useEffect(() => {
    if (userData) {
      methods.reset({
        name: userData.name,
        contact1: userData.contact1,
        role: userData.role,
      });
    }
  }, [userData, methods]);

  const onSubmit = (data: UpdateUserForm) => {
    const currentUserId = getCookie("id");

    if (!currentUserId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    const input = {
      name: data.name,
      contact1: data.contact1,
      role: data.role,
      updatedById: parseInt(currentUserId.toString()),
    };

    updateMutation.mutate(input);
  };

  const handleCancel = () => {
    router.push(`/company/${companyId}/users`);
  };

  const getRoleDisplayName = (role: string) => {
    return role.replace("MANUF_", "");
  };

  if (isUserLoading) {
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
                ← Back to Users
              </Button>
              <div>
                <Title level={3} className="!mb-0 text-gray-900">
                  Edit User
                </Title>
                <p className="text-gray-600 text-sm">
                  Update user information for {userData?.name}
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
                {/* User Information */}
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm xl:col-span-2">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      User Information
                    </h2>
                    <p className="text-blue-700 text-sm mt-1">
                      Basic user details and contact information
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextInput<UpdateUserForm>
                        title="Full Name"
                        required={true}
                        name="name"
                        placeholder="Enter user's full name"
                      />
                      <TextInput<UpdateUserForm>
                        title="Primary Contact"
                        required={true}
                        name="contact1"
                        placeholder="Enter contact number"
                        onlynumber={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Role Information */}
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
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2"
                        />
                      </svg>
                      Role Assignment
                    </h2>
                    <p className="text-green-700 text-sm mt-1">
                      Update user role and permissions
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <MultiSelect<UpdateUserForm>
                        title="Role"
                        required={true}
                        name="role"
                        options={ROLE_OPTIONS}
                        placeholder="Select user role"
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
                              Current Settings
                            </p>
                            <ul className="text-xs text-blue-600 mt-1 space-y-1">
                              <li>• Current Role: {getRoleDisplayName(userData?.role || "")}</li>
                              <li>• is_manufacturer: {userData?.is_manufacturer ? "true" : "false"}</li>
                              <li>• is_dealer: {userData?.is_dealer ? "true" : "false"}</li>
                              <li>• Status: {userData?.status}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current User Details */}
              {userData && (
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Current User Details
                    </h2>
                    <p className="text-purple-700 text-sm mt-1">
                      Additional information about this user (read-only)
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-600 font-semibold text-sm">📞 Contact 2</span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {userData.contact2 || "Not provided"}
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-600 font-semibold text-sm">📧 Email</span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {userData.email || "Not provided"}
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-600 font-semibold text-sm">🏠 Address</span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {userData.address || "Not provided"}
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-600 font-semibold text-sm">📍 Location</span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {userData.zone ? `${userData.zone.city.name}, ${userData.zone.name}` : "Not assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                  className="px-8 bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                >
                  {updateMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      Updating User...
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
                      Update User
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

export default EditUserPage;