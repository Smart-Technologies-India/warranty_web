"use client";

import React, { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { AddCompanyForm, AddCompanySchema } from "@/schema/addcomplany";
import { TextInput } from "@/components/form/inputfields/textinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { getCookie } from "cookies-next/client";
import { Button, Card, Typography, Spin } from "antd";

const { Title } = Typography;

// Types
interface Company {
  id: number;
  name: string;
  logo: string;
  contact1: string;
  contact2: string;
  address: string;
  email: string;
  website: string;
  pan: string;
  gst: string;
  contact_person: string;
  contact_person_number: string;
  designation: string;
  status: "ACTIVE" | "INACTIVE";
  zone: {
    id: number;
    name: string;
    city: {
      name: string;
    };
  };
}

interface ZoneDataResponse {
  id: number;
  name: string;
  status: string;
}

interface UpdateCompanyInput {
  name: string;
  logo: string;
  contact1: string;
  contact2: string;
  address: string;
  zone_id: number;
  email: string;
  website: string;
  pan: string;
  gst: string;
  contact_person: string;
  contact_person_number: string;
  designation: string;
  status: "ACTIVE" | "INACTIVE";
  updatedById: number;
}

// GraphQL queries
const GET_COMPANY_BY_ID = `
  query GetCompanyById($companyId: Int!) {
    getCompanyById(id: $companyId) {
      id
      name
      logo
      contact1
      contact2
      address
      email
      website
      pan
      gst
      contact_person
      contact_person_number
      designation
      status
      zone {
        id
        name
        city {
          name
        }
      }
    }
  }
`;

const UPDATE_COMPANY = `
  mutation UpdateCompany($updateCompanyId: Int!, $updateType: UpdateCompanyInput!) {
    updateCompany(id: $updateCompanyId, updateType: $updateType) {
      id
      name
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

// API functions
const fetchCompanyById = async (companyId: number): Promise<Company> => {
  const response = await ApiCall<{ getCompanyById: Company }>({
    query: GET_COMPANY_BY_ID,
    variables: {
      companyId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getCompanyById;
};

const updateCompanyApi = async (
  companyId: number,
  updateData: UpdateCompanyInput
): Promise<{ id: number; name: string }> => {
  const response = await ApiCall<{ updateCompany: { id: number; name: string } }>({
    query: UPDATE_COMPANY,
    variables: {
      updateCompanyId: companyId,
      updateType: updateData,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateCompany;
};

const fetchZones = async (): Promise<ZoneDataResponse[]> => {
  const response = await ApiCall<{ getAllZone: ZoneDataResponse[] }>({
    query: GET_ALL_ZONES,
    variables: {
      whereSearchInput: {
        status: "ACTIVE"
      }
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllZone;
};

const EditCompanyPage = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const userid = getCookie("id");
  const companyId = parseInt(params.id as string);

  const [isLoading, setIsLoading] = useState(true);

  const methods = useForm<AddCompanyForm>({
    resolver: valibotResolver(AddCompanySchema),
  });

  // Fetch company data
  const {
    data: companyData,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
    error: companyError,
  } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => fetchCompanyById(companyId),
    enabled: !!companyId,
  });

  // Fetch zones data
  const {
    data: zoneData,
    isLoading: isZoneLoading,
    isError: isZoneError,
    error: zoneError,
  } = useQuery({
    queryKey: ["zones"],
    queryFn: fetchZones,
  });

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: (data: AddCompanyForm) => {
      const updateData: UpdateCompanyInput = {
        name: data.name,
        logo: companyData?.logo || "test",
        contact1: data.contact1,
        contact2: data.contact2 || "",
        address: data.address,
        zone_id: parseInt(data.zone),
        email: data.email,
        website: data.website,
        pan: data.pan,
        gst: data.gst,
        contact_person: data.contact_person,
        contact_person_number: data.contact_person_number,
        designation: data.designation,
        status: companyData?.status || "ACTIVE",
        updatedById: userid ? parseInt(userid.toString()) : 1,
      };
      return updateCompanyApi(companyId, updateData);
    },
    onSuccess: (data) => {
      toast.success(`Company "${data.name}" updated successfully`);
      // Invalidate company queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
      router.push("/admin/companies");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update company: ${error.message}`);
    },
  });

  // Populate form when company data is loaded
  useEffect(() => {
    if (companyData) {
      methods.reset({
        name: companyData.name,
        contact1: companyData.contact1,
        contact2: companyData.contact2 || "",
        address: companyData.address,
        website: companyData.website,
        zone: companyData.zone.id.toString(),
        email: companyData.email,
        pan: companyData.pan,
        gst: companyData.gst,
        contact_person: companyData.contact_person,
        contact_person_number: companyData.contact_person_number,
        designation: companyData.designation,
      });
      setIsLoading(false);
    }
  }, [companyData, methods]);

  const onSubmit = async (data: AddCompanyForm) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    router.push("/admin/companies");
  };

  // Error states
  if (isCompanyError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Company Not Found</h3>
            <p className="text-gray-500 mb-4">
              {companyError instanceof Error ? companyError.message : "The requested company could not be found."}
            </p>
            <Button type="primary" onClick={handleCancel}>
              Back to Companies
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isZoneError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Zones</h3>
            <p className="text-gray-500 mb-4">
              {zoneError instanceof Error ? zoneError.message : "Could not load zone data."}
            </p>
            <Button type="primary" onClick={handleCancel}>
              Back to Companies
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isCompanyLoading || isZoneLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading company details...</p>
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
                ← Back to Companies
              </Button>
              <div>
                <Title level={3} className="!mb-0 text-gray-900">
                  Edit Company
                </Title>
                <p className="text-gray-600 text-sm">
                  Update company information and details
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                companyData?.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  companyData?.status === "ACTIVE" ? "bg-green-400" : "bg-red-400"
                }`}></div>
                {companyData?.status}
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
                      Company Information
                    </h2>
                    <p className="text-blue-700 text-sm mt-1">
                      Basic company details and location information
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextInput<AddCompanyForm>
                        title="Company Name"
                        required={true}
                        name="name"
                        placeholder="Enter company name"
                      />
                      <MultiSelect<AddCompanyForm>
                        title="Zone"
                        required={true}
                        name="zone"
                        options={
                          zoneData
                            ? zoneData.map((zone) => ({
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
                        placeholder="company@example.com"
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
                        Company phone numbers for communication
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
                      Primary contact information for this company
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
                                company-related communications and warranty claims.
                              </p>
                            </div>
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
                  className="px-8 bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                >
                  {updateMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      Updating Company...
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
                      Update Company
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

export default EditCompanyPage;