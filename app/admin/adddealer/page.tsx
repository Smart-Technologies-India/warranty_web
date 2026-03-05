"use client";

import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { TextInput } from "@/components/form/inputfields/textinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { getCookie } from "cookies-next/client";
import React from "react";
import {
  check,
  InferInput,
  minLength,
  nullish,
  object,
  pipe,
  string,
} from "valibot";
import { isContainSpace } from "@/utils/methods";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const AddDealerSchema = object({
  name: pipe(string("Enter Dealer Name")),
  contact1: pipe(
    string(),
    minLength(10, "Mobile number should be 10 digits."),
    check(isContainSpace, "Mobile number cannot contain space.")
  ),
  contact2: nullish(
    pipe(
      string(),
      minLength(10, "Mobile number should be 10 digits."),
      check(isContainSpace, "Mobile number cannot contain space.")
    )
  ),
  address: pipe(string("Enter Address")),
  website: nullish(pipe(string())),
  email: nullish(pipe(string())),
  zone: pipe(string("Select Zone")),
  gst: nullish(pipe(string())),
  pan: pipe(string("Enter PAN Number")),
  contact_person: pipe(string("Enter Contact Person Name")),
  contact_person_number: pipe(
    string(),
    minLength(10, "Mobile number should be 10 digits."),
    check(isContainSpace, "Mobile number cannot contain space.")
  ),
  designation: pipe(string("Enter Designation")),
});

type AddDealerForm = InferInput<typeof AddDealerSchema>;

const AddDealerPage = () => {
  const router = useRouter();
  const userid = getCookie("id");
  const methods = useForm<AddDealerForm>({
    resolver: valibotResolver(AddDealerSchema),
  });

  type AddDealerResponse = {
    id: number;
    name: string;
  };

  type CreateUserResponse = {
    id: number;
    name: string;
  };

  const CREATE_COMPANY =
    "mutation CreateCompany($inputType: CreateCompanyInput!) {createCompany(inputType: $inputType) {id name}}";

  const CREATE_USER = `
    mutation CreateUser($inputType: CreateUserInput!) {
      createUser(inputType: $inputType) {
        id
        name
      }
    }
  `;

  const CREATE_USER_COMPANY = `
    mutation Mutation($inputType: CreateUserCompanyInput!) {
      createUserCompany(inputType: $inputType) {
        company_id
        user_id
      }
    }
  `;

  const createDealer = useMutation({
    mutationKey: ["createDealer"],
    mutationFn: async (data: AddDealerForm) => {
      const response = await ApiCall<{ createCompany: AddDealerResponse }>({
        query: CREATE_COMPANY,
        variables: {
          inputType: {
            name: data.name,
            logo: "test",
            contact1: data.contact1,
            contact2: data.contact2,
            address: data.address,
            zone_id: parseInt(data.zone),
            email: data.email?.trim() ? data.email : undefined,
            website: data.website?.trim() ? data.website : undefined,
            pan: data.pan,
            gst: data.gst?.trim() ? data.gst : undefined,
            is_dealer: true, // This is the key difference - set to true for dealers
            contact_person: data.contact_person,
            contact_person_number: data.contact_person_number,
            designation: data.designation,
            createdById: userid ? parseInt(userid.toString()) : 1,
          },
        },
      });

      if (!response.status) {
        throw new Error(response.message);
      }

      const createdCompany = response.data.createCompany;
      if (!createdCompany?.id) {
        throw new Error("Dealer created but company ID not returned");
      }

      const userResponse = await ApiCall<{ createUser: CreateUserResponse }>({
        query: CREATE_USER,
        variables: {
          inputType: {
            name: data.contact_person,
            contact1: data.contact_person_number,
            role: "DEALER_ADMIN",
            is_manufacturer: false,
            is_dealer: true,
            zone_id: parseInt(data.zone),
          },
        },
      });

      if (!userResponse.status) {
        throw new Error(userResponse.message);
      }

      const createdUser = userResponse.data.createUser;
      if (!createdUser?.id) {
        throw new Error("Dealer admin user was not created");
      }

      const userCompanyResponse = await ApiCall({
        query: CREATE_USER_COMPANY,
        variables: {
          inputType: {
            company_id: createdCompany.id,
            user_id: createdUser.id,
            createdById: userid ? parseInt(userid.toString()) : 1,
            status: "ACTIVE",
          },
        },
      });

      if (!userCompanyResponse.status) {
        throw new Error(userCompanyResponse.message);
      }

      return createdCompany;
    },

    onSuccess: () => {
      toast.success("Dealer and Admin user created successfully!");
      router.push("/admin/dealers");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  interface ZoneDataResponse {
    id: number;
    name: string;
    status: string;
  }

  const zonedata = useQuery({
    queryKey: ["zonedata"],
    queryFn: async () => {
      const response = await ApiCall({
        query:
          "query GetAllZone($whereSearchInput: WhereZoneSearchInput!) {getAllZone(whereSearchInput: $whereSearchInput) {id, name}}",
        variables: {
          whereSearchInput: {
            status: "ACTIVE",
          },
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
      ] as ZoneDataResponse[];
    },

    refetchOnWindowFocus: false,
  });

  if (zonedata.isError) {
    return <div>Error loading zone data</div>;
  }

  if (zonedata.isLoading) {
    return <div>Loading...</div>;
  }

  const onSubmit = async (data: AddDealerForm) => {
    createDealer.mutate(data);
  };

  return (
    <div className="h-full bg-white p-4 pt-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Add New Dealer</h1>
        <p className="text-gray-600 text-sm">
          Fill in the details to register a new dealer
        </p>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit, onFormError)}
          className="space-y-8"
        >
          {/* Main Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Dealer Information */}
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1"
                    />
                  </svg>
                  Dealer Information
                </h2>
                <p className="text-orange-700 text-sm mt-1">
                  Basic dealer details and location information
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInput<AddDealerForm>
                    title="Dealer Name"
                    required={true}
                    name="name"
                    placeholder="Enter dealer name"
                  />
                  <MultiSelect<AddDealerForm>
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
                    <TextInput<AddDealerForm>
                      title="Address"
                      required={true}
                      name="address"
                      placeholder="Enter complete address"
                    />
                  </div>
                  <TextInput<AddDealerForm>
                    title="Website"
                    name="website"
                    placeholder="https://example.com"
                  />
                  <TextInput<AddDealerForm>
                    title="Email"
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
                    <TextInput<AddDealerForm>
                      title="Primary Mobile"
                      required={true}
                      name="contact1"
                      onlynumber={true}
                      maxlength={10}
                      placeholder="Enter 10-digit mobile number"
                    />
                    <TextInput<AddDealerForm>
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
                    Legal Information
                  </h2>
                  <p className="text-purple-700 text-sm mt-1">
                    Tax registration and legal identification numbers
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <TextInput<AddDealerForm>
                      title="PAN Number"
                      required={true}
                      name="pan"
                      placeholder="Enter 10-character PAN number"
                    />
                    <TextInput<AddDealerForm>
                      title="GST Number"
                      name="gst"
                      placeholder="Enter 15-character GST number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Person Details */}
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Contact Person Details
                </h2>
                <p className="text-orange-700 text-sm mt-1">
                  Primary contact information for this dealer
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <TextInput<AddDealerForm>
                      title="Contact Person Name"
                      required={true}
                      name="contact_person"
                      placeholder="Enter full name"
                    />
                    <TextInput<AddDealerForm>
                      title="Designation"
                      required={true}
                      name="designation"
                      placeholder="e.g., Manager, Director, CEO"
                    />
                  </div>
                  <div className="space-y-4">
                    <TextInput<AddDealerForm>
                      title="Contact Person Mobile"
                      required={true}
                      name="contact_person_number"
                      onlynumber={true}
                      maxlength={10}
                      placeholder="Enter 10-digit mobile number"
                    />
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={methods.formState.isSubmitting || createDealer.isPending}
            className="w-full max-w-md px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
          >
            {createDealer.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Registering Dealer...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Register Dealer
              </div>
            )}
          </button>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddDealerPage;
