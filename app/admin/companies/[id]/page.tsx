"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { Button, Typography, Spin, Tag, Card, Descriptions } from "antd";

const { Title, Text } = Typography;

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
  createdAt: string;
  updatedAt: string;
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
      createdAt
      updatedAt
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

const CompanyDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);

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

  const handleBack = () => {
    router.push("/admin/companies");
  };

  const handleEdit = () => {
    router.push(`/admin/companies/${companyId}/edit`);
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
            <Button type="primary" onClick={handleBack}>
              Back to Companies
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isCompanyLoading) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              onClick={handleBack}
              className="hover:bg-gray-100 transition"
            >
              ← Back
            </Button>
            {companyData?.logo ? (
              <img
                src={companyData.logo}
                alt="Company Logo"
                className="h-14 w-14 rounded-full object-cover border border-blue-200 shadow-sm"
              />
            ) : (
              <div className="flex-shrink-0 h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">
                  {companyData?.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <Title level={3} className="!mb-0 text-gray-900">
                {companyData?.name}
              </Title>
              <p className="text-gray-600 text-sm">
                ID: {companyData?.id} • {companyData?.zone.city.name}, {companyData?.zone.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Tag
              color={companyData?.status === "ACTIVE" ? "green" : "red"}
              className="px-4 py-1 text-base font-semibold rounded-full shadow-sm"
            >
              {companyData?.status}
            </Tag>
            <Button
              type="primary"
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 transition"
            >
              Edit
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <Button type="default" className="!border-blue-200 !text-blue-700 hover:!bg-blue-50 transition" onClick={() => router.push(`/admin/companies/${companyId}/products`)}>
            Products
          </Button>
          <Button type="default" className="!border-green-200 !text-green-700 hover:!bg-green-50 transition" onClick={() => router.push(`/admin/companies/${companyId}/sale`)}>
            Sale
          </Button>
          <Button type="default" className="!border-orange-200 !text-orange-700 hover:!bg-orange-50 transition" onClick={() => router.push(`/admin/companies/${companyId}/claims`)}>
            Claims
          </Button>
          <Button type="default" className="!border-purple-200 !text-purple-700 hover:!bg-purple-50 transition" onClick={() => router.push(`/admin/companies/${companyId}/users`)}>
            Users
          </Button>
        </div>

        {/* Main Content: Two-column layout on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Company Info */}
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1"
                  />
                </svg>
                <span className="text-lg font-semibold text-blue-700">Company Info</span>
              </div>
            }
            className="shadow-sm border-blue-100"
          >
            <Descriptions column={1} className="mb-6">
              <Descriptions.Item label="Company Name">
                <Text strong className="text-gray-900">{companyData?.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                <Text className="text-gray-700">{companyData?.zone.city.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Zone">
                <Text className="text-gray-700">{companyData?.zone.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <Text className="text-gray-700">{companyData?.address}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Website">
                <a
                  href={companyData?.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {companyData?.website}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <a
                  href={`mailto:${companyData?.email}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {companyData?.email}
                </a>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Right: Contact & Legal Info grouped */}
          <Card
            title={
              <div className="flex items-center gap-2">
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
                <span className="font-semibold text-emerald-700">Contact & Legal</span>
              </div>
            }
            className="shadow-sm border-emerald-100"
          >
            <div className="space-y-4 mb-6">
              <div>
                <Text className="text-gray-500 text-sm block">Primary Mobile</Text>
                <a
                  href={`tel:${companyData?.contact1}`}
                  className="text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  📞 {companyData?.contact1}
                </a>
              </div>
              {companyData?.contact2 && (
                <div>
                  <Text className="text-gray-500 text-sm block">Alternate Mobile</Text>
                  <a
                    href={`tel:${companyData?.contact2}`}
                    className="text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    📞 {companyData?.contact2}
                  </a>
                </div>
              )}
              <div>
                <Text className="text-gray-500 text-sm block">Contact Person</Text>
                <Text strong className="text-gray-900">{companyData?.contact_person}</Text>
                <span className="ml-2 text-gray-700">({companyData?.designation})</span>
              </div>
              <div>
                <Text className="text-gray-500 text-sm block">Person Mobile</Text>
                <a
                  href={`tel:${companyData?.contact_person_number}`}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  📱 {companyData?.contact_person_number}
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <Text className="text-orange-600 text-sm font-medium block mb-1">PAN Number</Text>
                <Text strong className="text-orange-900 text-lg font-mono">{companyData?.pan}</Text>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Text className="text-green-600 text-sm font-medium block mb-1">GST Number</Text>
                <Text strong className="text-green-900 text-sm font-mono">{companyData?.gst}</Text>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Text className="text-blue-600 text-sm font-medium block mb-1">Created Date</Text>
                <Text strong className="text-blue-900">
                  {companyData?.createdAt ? new Date(companyData.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <Text className="text-purple-600 text-sm font-medium block mb-1">Last Updated</Text>
                <Text strong className="text-purple-900">
                  {companyData?.updatedAt ? new Date(companyData.updatedAt).toLocaleDateString() : 'N/A'}
                </Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsPage;