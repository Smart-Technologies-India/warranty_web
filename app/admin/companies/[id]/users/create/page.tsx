"use client";

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
const AddUserSchema = object({
  name: pipe(string("Enter User Name")),
  contact1: pipe(string("Enter Contact Number")),
  role: pipe(string("Select Role")),
});

type AddUserForm = InferInput<typeof AddUserSchema>;

// Company interface
interface Company {
  id: number;
  name: string;
  zone: {
    id: number;
    name: string;
    city: {
      name: string;
    };
  };
}

// GraphQL queries
const GET_COMPANY_BY_ID = `
  query GetCompanyById($companyId: Int!) {
    getCompanyById(id: $companyId) {
      id
      name
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

// GraphQL mutations
const CREATE_USER = `
  mutation CreateUser($inputType: CreateUserInput!) {
    createUser(inputType: $inputType) {
      id,
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

// Role options
const ROLE_OPTIONS = [
  { label: "Admin", value: "MANUF_ADMIN" },
  { label: "Accounts", value: "MANUF_ACCOUNTS" },
  { label: "Manager", value: "MANUF_MANAGER" },
  { label: "Sales", value: "MANUF_SALES" },
  { label: "Technical", value: "MANUF_TECHNICAL" },
  { label: "Gen. Tech.", value: "MANUF_TECH_GEN" },
  { label: "Tech. Expert", value: "MANUF_TECH_EXPERT" },
  { label: "Tech. Manager", value: "MANUF_TECH_MANAGER" },
];

const createUserApi = async (input: any): Promise<any> => {
  const response = await ApiCall<{ createUser: any }>({
    query: CREATE_USER,
    variables: {
      inputType: input,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.createUser;
};

const createUserCompanyApi = async (input: any): Promise<any> => {
  const response = await ApiCall<{ createUserCompany: any }>({
    query: CREATE_USER_COMPANY,
    variables: {
      inputType: input,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.createUserCompany;
};

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

const CreateUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);
  const userId: number = parseInt(getCookie("id") as string);

  const methods = useForm<AddUserForm>({
    resolver: valibotResolver(AddUserSchema),
    defaultValues: {
      name: "",
      contact1: "",
      role: "",
    },
  });

  // Fetch company data to get zone_id
  const { data: companyData, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => fetchCompanyById(companyId),
    enabled: !!companyId,
  });

  // Create mutation - handles both user creation and company connection
  const createMutation = useMutation({
    mutationFn: async (userInput: any) => {
      // Step 1: Create the user
      const createdUser = await createUserApi(userInput);


      // Step 2: Connect user with company
      const userCompanyInput = {
        company_id: companyId,
        user_id: createdUser.id,
        createdById: userId,
        status: "ACTIVE"
      };


      const userCompanyConnection = await createUserCompanyApi(userCompanyInput);

      return { user: createdUser, connection: userCompanyConnection };
    },
    onSuccess: (data) => {
      toast.success(`User created and connected to company successfully!`);
      router.push(`/admin/companies/${companyId}/users`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  const onSubmit = (data: AddUserForm) => {
    const userId = getCookie("id");

    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    if (!companyData?.zone?.id) {
      toast.error("Company zone information not found. Please try again.");
      return;
    }

    const input = {
      name: data.name,
      contact1: data.contact1,
      role: data.role,
      is_manufacturer: true,
      is_dealer: false,
      zone_id: companyData.zone.id,
    };

    createMutation.mutate(input);
  };

  const handleCancel = () => {
    router.push(`/admin/companies/${companyId}/users`);
  };

  if (isCompanyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading company information...</p>
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
                  Add New User
                </Title>
                <p className="text-gray-600 text-sm">
                  Create a new manufacturer user for Company ID: {companyId}
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
                      <TextInput<AddUserForm>
                        title="Full Name"
                        required={true}
                        name="name"
                        placeholder="Enter user's full name"
                      />
                      <TextInput<AddUserForm>
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
                      Select user role and permissions
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <MultiSelect<AddUserForm>
                        title="Role"
                        required={true}
                        name="role"
                        options={ROLE_OPTIONS}
                        placeholder="Select user role"
                      />

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
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
                              Default Settings
                            </p>
                            <ul className="text-xs text-blue-600 mt-1 space-y-1">
                              <li>• is_manufacturer = true</li>
                              <li>• is_dealer = false</li>
                              <li>• status = ACTIVE</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Description Card */}
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
                    Role Descriptions
                  </h2>
                  <p className="text-orange-700 text-sm mt-1">
                    Understanding different user roles and their responsibilities
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-600 font-semibold">👑 Admin</span>
                      </div>
                      <p className="text-purple-700 text-sm">
                        Full system access, user management, and administrative privileges
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600 font-semibold">💰 Accounts</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        Financial operations, billing, and accounting management
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600 font-semibold">👥 Manager</span>
                      </div>
                      <p className="text-blue-700 text-sm">
                        Team management, operational oversight, and strategic planning
                      </p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-orange-600 font-semibold">📈 Sales</span>
                      </div>
                      <p className="text-orange-700 text-sm">
                        Customer relationships, sales operations, and revenue generation
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-600 font-semibold">🔧 Technical</span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Technical support, system maintenance, and product expertise
                      </p>
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
                  disabled={createMutation.isPending}
                  className="px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={createMutation.isPending}
                  className="px-8 bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                >
                  {createMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      Creating User...
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create User
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

export default CreateUserPage;