"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Typography,
  Spin,
  Card,
  Table,
  Tag,
  Space,
  Input,
  Row,
  Col,
  Pagination,
  Empty,
  Breadcrumb,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  HomeOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ApiCall } from "@/services/api";
import { getCookie } from "cookies-next";

const { Title, Text } = Typography;
const { Search } = Input;

// GraphQL Query
const GET_PAGINATED_TICKET = `
  query GetPaginatedTicket(
    $searchPaginationInput: SearchPaginationInput!
    $whereSearchInput: WhereTicketSearchInput!
  ) {
    getPaginatedTicket(
      searchPaginationInput: $searchPaginationInput
      whereSearchInput: $whereSearchInput
    ) {
      skip
      take
      total
      data {
        id
        status
        ticket_number
        issue_category
        product {
          name
        }
      }
    }
  }
`;

// Interfaces
interface Product {
  name: string;
}

interface Ticket {
  id: number;
  status: string;
  ticket_number: string;
  issue_category: string;
  product: Product;
}

interface TicketResponse {
  skip: number;
  take: number;
  total: number;
  data: Ticket[];
}

// Fetch Function
const fetchTickets = async (
  customerId: number,
  take: number = 10,
  skip: number = 0
): Promise<TicketResponse> => {
  const response = await ApiCall<{ getPaginatedTicket: TicketResponse }>({
    query: GET_PAGINATED_TICKET,
    variables: {
      searchPaginationInput: {
        take,
        skip,
      },
      whereSearchInput: {
        customer_id: customerId,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getPaginatedTicket;
};

const CustomerClaimsPage: React.FC = () => {
  const router = useRouter();

  // For now, we'll use a hardcoded customer ID. In a real app, you'd get this from auth/context
  const customerId: number = parseInt(getCookie("id")?.toString() || "0"); // You can get this from authentication or route params

  // State Management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate skip value for pagination
  const skip = (currentPage - 1) * pageSize;

  // Fetch tickets data
  const {
    data: ticketsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customerTickets", customerId, skip, pageSize],
    queryFn: () => fetchTickets(customerId, pageSize, skip),
    enabled: !!customerId,
  });

  // Filter tickets based on search term
  const filteredTickets =
    ticketsData?.data?.filter(
      (ticket) =>
        ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.issue_category
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        ticket.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.status.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Get status color for tags
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "blue";
      case "IN_PROGRESS":
        return "orange";
      case "RESOLVED":
        return "green";
      case "CLOSED":
        return "default";
      default:
        return "default";
    }
  };

  // Format issue category for display
  const formatIssueCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Table columns
  const columns = [
    {
      title: "Ticket Number",
      dataIndex: "ticket_number",
      key: "ticket_number",
      width: 200,
      render: (text: string) => (
        <Text strong className="font-mono text-blue-600">
          {text}
        </Text>
      ),
    },
    {
      title: "Product",
      dataIndex: ["product", "name"],
      key: "product_name",
      width: 200,
    },
    {
      title: "Issue Category",
      dataIndex: "issue_category",
      key: "issue_category",
      width: 180,
      render: (category: string) => (
        <Tag color="blue">{formatIssueCategory(category)}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.replace("_", " ")}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (record: Ticket) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/customer/claim/${record.id}`)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  // Handle pagination change
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading your support tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Text type="danger">Error loading tickets: {error.message}</Text>
          <br />
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              {
                title: (
                  <>
                    <HomeOutlined />
                    <span>Home</span>
                  </>
                ),
              },
              {
                title: (
                  <>
                    <CustomerServiceOutlined />
                    <span>Support Tickets</span>
                  </>
                ),
              },
            ]}
          />
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="!mb-2 flex items-center gap-3">
                <CustomerServiceOutlined className="text-blue-600" />
                My Support Tickets
              </Title>
              <Text className="text-gray-600">
                Track and manage your support requests
              </Text>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <Row gutter={16} align="middle">
            <Col xs={24} md={12}>
              <Search
                placeholder="Search by ticket number, product, category, or status..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
                size="large"
              />
            </Col>
            <Col xs={24} md={12}>
              <div className="flex justify-end items-center gap-4 mt-4 md:mt-0">
                <Text className="text-gray-600">
                  Total: {ticketsData?.total || 0} tickets
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Tickets Table */}
        <Card>
          {filteredTickets.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  {searchTerm
                    ? `No tickets found matching "${searchTerm}"`
                    : "No support tickets found"}
                </span>
              }
            />
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={filteredTickets}
                rowKey="id"
                pagination={false}
                scroll={{ x: 800 }}
                className="mb-4"
              />

              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <Pagination
                  current={currentPage}
                  total={ticketsData?.total || 0}
                  pageSize={pageSize}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} tickets`
                  }
                  onChange={handlePageChange}
                  pageSizeOptions={["10", "20", "50", "100"]}
                />
              </div>
            </>
          )}
        </Card>

        {/* Quick Stats */}
        <Row gutter={16} className="mt-6">
          <Col xs={12} md={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {ticketsData?.data?.filter((t) => t.status === "OPEN").length ||
                  0}
              </div>
              <Text className="text-gray-600">Open</Text>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {ticketsData?.data?.filter((t) => t.status === "IN_PROGRESS")
                  .length || 0}
              </div>
              <Text className="text-gray-600">In Progress</Text>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {ticketsData?.data?.filter((t) => t.status === "RESOLVED")
                  .length || 0}
              </div>
              <Text className="text-gray-600">Resolved</Text>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {ticketsData?.total || 0}
              </div>
              <Text className="text-gray-600">Total</Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CustomerClaimsPage;
