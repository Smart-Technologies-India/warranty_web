"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Typography, Spin } from "antd";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { TextInput } from "@/components/form/inputfields/textinput";
import { DateSelect } from "@/components/form/inputfields/dateselect";
import { onFormError } from "@/utils/methods";
import {
  object,
  string,
  pipe,
  InferInput,
  minLength,
  maxLength,
  regex,
  email,
  optional,
  union,
  literal,
} from "valibot";
import { toast } from "react-toastify";

const { Title } = Typography;

// Validation Schema
const UpdateUserSchema = object({
  name: pipe(
    string("Enter User Name"),
    minLength(2, "Name must be at least 2 characters")
  ),
  contact1: pipe(
    string("Enter Contact Number"),
    minLength(10, "Contact number must be 10 digits"),
    maxLength(10, "Contact number must be 10 digits"),
    regex(/^[0-9]+$/, "Contact number must contain only digits")
  ),
  contact2: optional(
    union([
      literal(""),
      pipe(
        string("Enter Secondary Contact"),
        minLength(10, "Contact number must be 10 digits"),
        maxLength(10, "Contact number must be 10 digits"),
        regex(/^[0-9]+$/, "Contact number must contain only digits")
      ),
    ])
  ),
  address: optional(
    union([
      literal(""),
      pipe(
        string("Enter Address"),
        minLength(5, "Address must be at least 5 characters")
      ),
    ])
  ),
  zone_id: pipe(string("Select Zone"), minLength(1, "Please select a zone")),
  email: optional(
    union([
      literal(""),
      pipe(string("Enter Email"), email("Please enter a valid email address")),
    ])
  ),
  dob: optional(string("Select Date of Birth")),
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

interface Zone {
  id: number;
  name: string;
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

const GET_ALL_ZONES = `
  query GetAllZone($whereSearchInput: WhereZoneSearchInput!) {
    getAllZone(whereSearchInput: $whereSearchInput) {
      id
      name
    }
  }
`;

const UPDATE_USER = `
  mutation UpdateUser($updateUserId: Int!, $updateType: UpdateUserInput!) {
    updateUser(id: $updateUserId, updateType: $updateType) {
      id
      name
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

const fetchAllZones = async (): Promise<Zone[]> => {
  const response = await ApiCall<{ getAllZone: Zone[] }>({
    query: GET_ALL_ZONES,
    variables: {
      whereSearchInput: {},
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  if (!response.data.getAllZone) {
    throw new Error("Value not found in response");
  }

  return response.data.getAllZone;
};

const updateUserApi = async (userId: number, input: any): Promise<any> => {
  const response = await ApiCall<{ updateUser: any }>({
    query: UPDATE_USER,
    variables: {
      updateUserId: userId,
      updateType: input,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateUser;
};

interface EditCustomerPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditCustomerPage: React.FC<EditCustomerPageProps> = () => {
  const router = useRouter();

  const userId: number = parseInt(getCookie("id") as string);

  const methods = useForm<UpdateUserForm>({
    resolver: valibotResolver(UpdateUserSchema),
    defaultValues: {
      name: "",
      contact1: "",
      contact2: "",
      address: "",
      zone_id: "",
      email: "",
      dob: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  // Fetch user data
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
  });

  // Log any errors
  useEffect(() => {
    if (userError) {
      console.error("Error fetching user data:", userError);
      toast.error(`Failed to load customer data: ${userError.message}`);
    }
  }, [userError]);

  // Fetch zones data
  const { data: zonesData, isLoading: isZonesLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: fetchAllZones,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (input: any) => updateUserApi(userId, input),
    onSuccess: () => {
      toast.success("Customer updated successfully!");
      router.push(`/customer`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update customer: ${error.message}`);
    },
  });

  // Set form values when user data is loaded
  useEffect(() => {
    if (userData) {
      methods.reset({
        name: userData.name,
        contact1: userData.contact1,
        contact2: userData.contact2 || "",
        address: userData.address || "",
        zone_id: userData.zone?.id?.toString() || "",
        email: userData.email || "",
        dob: userData.dob || "",
      });
    }
  }, [userData, methods]);

  const onSubmit = (data: UpdateUserForm) => {
    const currentUserId = getCookie("id");

    if (!currentUserId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    const input: any = {
      name: data.name.trim(),
      contact1: data.contact1.toString().trim(),
    };

    // Add optional fields only if they have values
    if (data.contact2?.trim()) {
      input.contact2 = data.contact2.trim();
    }

    if (data.address?.trim()) {
      input.address = data.address.trim();
    }

    if (data.zone_id) {
      input.zone_id = parseInt(data.zone_id);
    }

    if (data.email?.trim()) {
      input.email = data.email.trim();
    }

    if (data.dob?.trim()) {
      input.dob = data.dob;
    }

    updateMutation.mutate(input);
  };

  const handleCancel = () => {
    router.push(`/customer`);
  };

  if (isUserLoading || isZonesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading customer details...</p>
          <p className="text-sm text-gray-500 mt-2">
            Customer ID: {userId}, Loading user:{" "}
            {isUserLoading ? "Yes" : "No"}, Loading zones:{" "}
            {isZonesLoading ? "Yes" : "No"}
          </p>
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
                ← Back to Customer
              </Button>
              <div>
                <Title level={3} className="!mb-0 text-gray-900">
                  Edit Customer
                </Title>
                <p className="text-gray-600 text-sm">
                  Update customer information for{" "}
                  {userData?.name || "Loading..."}
                </p>
                {process.env.NODE_ENV === "development" && (
                  <p className="text-xs text-blue-600 mt-1">
                    Debug - Customer ID: {userId}, Data loaded:{" "}
                    {userData ? "Yes" : "No"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit, onFormError)}
              className="space-y-8"
            >
              {/* Main Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* User Information */}
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm xl:col-span-2">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Customer Information
                    </h2>
                    <p className="text-orange-700 text-sm mt-1">
                      Basic customer details and contact information
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Full Name Input */}
                      <div className="flex flex-col">
                        <TextInput<UpdateUserForm>
                          name="name"
                          title="Full Name"
                          placeholder="Enter user's full name"
                          required={true}
                        />
                      </div>

                      {/* Primary Contact Input */}
                      <div className="flex flex-col">
                        <TextInput<UpdateUserForm>
                          name="contact1"
                          title="Primary Contact"
                          placeholder="Enter contact number (10 digits)"
                          required={true}
                          onlynumber={true}
                          maxlength={10}
                        />
                      </div>

                      {/* Secondary Contact Input */}
                      <div className="flex flex-col">
                        <TextInput<UpdateUserForm>
                          name="contact2"
                          title="Secondary Contact"
                          placeholder="Enter secondary contact (10 digits)"
                          required={false}
                          onlynumber={true}
                          maxlength={10}
                        />
                      </div>

                      {/* Email Input */}
                      <div className="flex flex-col">
                        <TextInput<UpdateUserForm>
                          name="email"
                          title="Email Address"
                          placeholder="Enter email address"
                          required={false}
                        />
                      </div>

                      {/* Address Input */}
                      <div className="flex flex-col lg:col-span-2">
                        <TextInput<UpdateUserForm>
                          name="address"
                          title="Address"
                          placeholder="Enter full address"
                          required={false}
                        />
                      </div>

                      {/* Zone Dropdown */}
                      <div className="flex flex-col">
                        <MultiSelect<UpdateUserForm>
                          title="Zone"
                          required={true}
                          name="zone_id"
                          options={
                            zonesData?.map((zone) => ({
                              label: zone.name,
                              value: zone.id.toString(),
                            })) || []
                          }
                          placeholder="Select zone"
                        />
                      </div>

                      {/* Date of Birth Input */}
                      <div className="flex flex-col">
                        <DateSelect<UpdateUserForm>
                          name="dob"
                          title="Date of Birth"
                          placeholder="Select date of birth"
                          required={false}
                          format="DD/MM/YYYY"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Status Information */}
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Customer Status
                    </h2>
                    <p className="text-blue-700 text-sm mt-1">
                      Current customer account information
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
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
                              Account Information
                            </p>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1">
                              <li>
                                • Account Status: {userData?.status || "N/A"}
                              </li>
                              <li>
                                • Is Dealer:{" "}
                                {userData?.is_dealer ? "Yes" : "No"}
                              </li>
                              <li>
                                • Is Manufacturer:{" "}
                                {userData?.is_manufacturer ? "Yes" : "No"}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
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
                  className="px-8 bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700"
                >
                  {updateMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      Updating Customer...
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
                      Update Customer
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

export default EditCustomerPage;
