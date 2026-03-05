"use client";

import React, { useEffect } from "react";
import { Card, Typography, Button, Spin } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { AddCompanySchema, AddCompanyForm } from "@/schema/addcomplany";
import { TextInput } from "@/components/form/inputfields/textinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { onFormError } from "@/utils/methods";

import {
  ArrowLeftOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

// Types
interface DealerDetails {
  id: number;
  name: string;
  email: string;
  contact1: string;
  contact2?: string;
  address: string;
  gst_no?: string;
  pan_no?: string;
  status: "ACTIVE" | "INACTIVE";
  zone: {
    id: number;
    name: string;
    city: {
      id: number;
      name: string;
    };
  };
}

interface UpdateDealerInput {
  name: string;
  email: string;
  contact1: string;
  contact2?: string;
  address: string;
  gst_no?: string;
  pan_no?: string;
  status: "ACTIVE" | "INACTIVE";
  zone_id: number;
  updatedById: number;
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
      gst_no
      pan_no
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

const UPDATE_DEALER = `
  mutation UpdateCompany($updateCompanyId: Int!, $updateType: UpdateCompanyInput!) {
    updateCompany(id: $updateCompanyId, updateType: $updateType) {
      id
      name
      email
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

const updateDealerApi = async (id: number, data: UpdateDealerInput): Promise<unknown> => {
  const response = await ApiCall<{ updateCompany: unknown }>({
    query: UPDATE_DEALER,
    variables: {
      updateCompanyId: id,
      updateType: data,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateCompany;
};

interface EditDealerPageProps {
  params: {
    id: string;
  };
}

const EditDealerPage: React.FC<EditDealerPageProps> = ({ params }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dealerId = parseInt(params.id);

  // Form setup
  const methods = useForm<AddCompanyForm>({
    resolver: valibotResolver(AddCompanySchema),
    defaultValues: {
      name: "",
      email: "",
      contact1: "",
      contact2: "",
      address: "",
      website: "",
      zone: "",
      gst: "",
      pan: "",
      contact_person: "",
      contact_person_number: "",
      designation: "",
    },
  });

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

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateDealerInput) => updateDealerApi(dealerId, data),
    onSuccess: () => {
      toast.success("Dealer updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["dealer", dealerId] });
      queryClient.invalidateQueries({ queryKey: ["dealers"] });
      router.push(`/admin/dealers/${dealerId}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update dealer: ${error.message}`);
    },
  });

  // Zone data query
  const zonedata = useQuery({
    queryKey: ["zonedata"],
    queryFn: async () => {
      const response = await ApiCall({
        query: "query GetAllZone($whereSearchInput: WhereZoneSearchInput!) {getAllZone(whereSearchInput: $whereSearchInput) {id, name}}",
        variables: {
          whereSearchInput: {
            status: "ACTIVE"
          }
        },
      });

      if (!response.status) {
        throw new Error(response.message);
      }

      if (!(response.data as Record<string, unknown>)["getAllZone"]) {
        throw new Error("Value not found in response");
      }

      return (response.data as Record<string, unknown>)[
        "getAllZone"
      ] as { id: number; name: string }[];
    },
    refetchOnWindowFocus: false,
  });

  // Set form values when dealer data is loaded
  useEffect(() => {
    if (dealer) {
      methods.reset({
        name: dealer.name,
        email: dealer.email,
        contact1: dealer.contact1,
        contact2: dealer.contact2 || "",
        address: dealer.address,
        website: dealer.email, // Using email as placeholder since we don't have website field
        zone: dealer.zone.id.toString(),
        gst: dealer.gst_no || "",
        pan: dealer.pan_no || "",
        contact_person: dealer.name, // Using name as placeholder
        contact_person_number: dealer.contact1, // Using contact1 as placeholder
        designation: "Manager", // Default placeholder
      });
    }
  }, [dealer, methods]);

  // Handle form submission
  const onSubmit = async (data: AddCompanyForm) => {
    const userId = getCookie("id");
    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    const updateData: UpdateDealerInput = {
      name: data.name,
      email: data.email,
      contact1: data.contact1,
      contact2: data.contact2 || undefined,
      address: data.address,
      gst_no: data.gst || undefined,
      pan_no: data.pan || undefined,
      status: "ACTIVE", // Default status
      zone_id: parseInt(data.zone),
      updatedById: parseInt(userId.toString()),
    };

    updateMutation.mutate(updateData);
  };

  // Handle back navigation
  const handleBack = () => {
    router.push(`/admin/dealers/${dealerId}`);
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
                Error: {dealerError instanceof Error ? dealerError.message : "Unknown error"}
              </p>
              <Button onClick={handleBack} type="primary">
                Back to Dealer
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
      <div className="max-w-4xl mx-auto p-6 space-y-6">
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
                Back to Dealer
              </Button>
              <div>
                <Title level={3} className="!mb-0 text-gray-900">
                  Edit Dealer: {dealer.name}
                </Title>
                <p className="text-gray-500 mt-1">Update dealer information and settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={updateMutation.isPending}
                onClick={methods.handleSubmit(onSubmit, onFormError)}
                className="bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card title="Dealer Information" className="shadow-sm">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit, onFormError)}
              className="space-y-8"
            >
              {/* Main Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Company Information */}
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1"
                        />
                      </svg>
                      Dealer Information
                    </h2>
                    <p className="text-blue-700 text-sm mt-1">
                      Basic dealer details and location information
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextInput<AddCompanyForm>
                        title="Dealer Name"
                        required={true}
                        name="name"
                        placeholder="Enter dealer name"
                      />
                      <MultiSelect<AddCompanyForm>
                        title="Zone"
                        required={true}
                        name="zone"
                        options={
                          zonedata.data
                            ? zonedata.data.map((zone) => ({
                              label: zone.name,
                              value: zone.id.toString(),
                            }))
                            : []
                        }
                        placeholder="Select zone"
                      />
                      <div className="md:col-span-2">
                        <TextInput<AddCompanyForm>
                          title="Address"
                          required={true}
                          name="address"
                          placeholder="Enter complete address"
                        />
                      </div>
                      <TextInput<AddCompanyForm>
                        title="Website"
                        required={true}
                        name="website"
                        placeholder="https://example.com"
                      />
                      <TextInput<AddCompanyForm>
                        title="Email"
                        required={true}
                        name="email"
                        placeholder="dealer@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Legal Information */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                    <div className="bg-emerald-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
                      <h2 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        Contact Information
                      </h2>
                      <p className="text-emerald-700 text-sm mt-1">
                        Dealer phone numbers for communication
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-6">
                        <TextInput<AddCompanyForm>
                          title="Primary Mobile"
                          required={true}
                          name="contact1"
                          onlynumber={true}
                          maxlength={10}
                          placeholder="Enter 10-digit mobile number"
                        />
                        <TextInput<AddCompanyForm>
                          title="Alternate Mobile"
                          name="contact2"
                          onlynumber={true}
                          maxlength={10}
                          placeholder="Enter alternate mobile number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Legal Information */}
                  <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
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
                        Legal Information
                      </h2>
                      <p className="text-orange-700 text-sm mt-1">
                        Tax registration and legal identification numbers
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-6">
                        <TextInput<AddCompanyForm>
                          title="PAN Number"
                          required={true}
                          name="pan"
                          placeholder="Enter 10-character PAN number"
                        />
                        <TextInput<AddCompanyForm>
                          title="GST Number"
                          required={true}
                          name="gst"
                          placeholder="Enter 15-character GST number"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Person Details */}
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm lg:col-span-2 xl:col-span-3">
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
                      Contact Person Details
                    </h2>
                    <p className="text-blue-700 text-sm mt-1">
                      Primary contact information for this dealer
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <TextInput<AddCompanyForm>
                          title="Contact Person Name"
                          required={true}
                          name="contact_person"
                          placeholder="Enter full name"
                        />
                        <TextInput<AddCompanyForm>
                          title="Designation"
                          required={true}
                          name="designation"
                          placeholder="e.g., Manager, Director, CEO"
                        />
                      </div>
                      <div className="space-y-4">
                        <TextInput<AddCompanyForm>
                          title="Contact Person Mobile"
                          required={true}
                          name="contact_person_number"
                          onlynumber={true}
                          maxlength={10}
                          placeholder="Enter 10-digit mobile number"
                        />
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
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
                              <p className="text-sm font-medium text-gray-900">
                                Important Note
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                This person will be the primary contact for all
                                dealer-related communications and warranty claims.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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

export default EditDealerPage;