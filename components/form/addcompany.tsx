"use client";

import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AddCompanyForm, AddCompanySchema } from "@/schema/addcomplany";
import { TextInput } from "./inputfields/textinput";
import { MultiSelect } from "./inputfields/multiselect";
import { getCookie } from "cookies-next/client";
import {
  useActiveZonesQuery,
  useCreateCompanyWithManufacturerAdminMutation,
} from "@/services/admin/service";

const AddCompanyPage = () => {
  const router = useRouter();
  const userid = getCookie("id"); // Assuming you have a function to get cookies
  const methods = useForm<AddCompanyForm>({
    resolver: valibotResolver(AddCompanySchema),
  });

  const createCompany = useCreateCompanyWithManufacturerAdminMutation();
  const zonedata = useActiveZonesQuery();

  if (zonedata.isError) {
    return <div>Error loading zone data</div>;
  }

  if (zonedata.isLoading) {
    return <div>Loading...</div>;
  }

  const onSubmit = async (data: AddCompanyForm) => {
    createCompany.mutate(
      {
        data: {
          name: data.name,
          contact1: data.contact1,
          contact2: data.contact2,
          address: data.address,
          website: data.website,
          zone: data.zone,
          email: data.email,
          pan: data.pan,
          gst: data.gst,
          contact_person: data.contact_person,
          contact_person_number: data.contact_person_number,
          designation: data.designation,
        },
        createdById: userid ? parseInt(userid.toString()) : 1,
      },
      {
        onSuccess: () => {
          router.push("/admin/companies");
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <div className="h-full bg-white p-4 pt-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Add New Company
        </h1>
        <p className="text-gray-600 text-sm">
          Fill in the details to register a new company
        </p>
      </div>

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
                          className="w-5 h-5 text-blue-500 mt-0.5 shrink-0"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={methods.formState.isSubmitting || createCompany.isPending}
            className="w-full max-w-md px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
          >
            {createCompany.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Registering Company...
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
                Register Company
              </div>
            )}
          </button>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddCompanyPage;
