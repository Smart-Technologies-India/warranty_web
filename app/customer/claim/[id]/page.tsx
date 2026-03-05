"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Typography,
  Spin,
  Card,
  Tag,
  Space,
  Descriptions,
  Row,
  Col,
  Alert,
  Breadcrumb,
  Divider,
  Timeline,
  Empty,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  ShopOutlined,
  DollarOutlined,
  FileTextOutlined,
  ToolOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { ApiCall } from "@/services/api";

const { Title, Text, Paragraph } = Typography;

// GraphQL Query
const GET_TICKET_BY_ID = `
  query GetTicketById($getTicketById: Int!) {
    getTicketById(id: $getTicketById) {
      id
      status
      ticket_number
      issue_category
      status
      priority
      preferred_contact_time
      diagnostic_notes
      issue_category
      issue_description
      resolution_notes
      resolved_at
      product {
        name
        image
        id
        price
        company {
          email
          address
          name
        }
      }
    }
  }
`;

// Interfaces
interface Company {
  email: string;
  address: string;
  name: string;
}

interface Product {
  name: string;
  image?: string;
  id: number;
  price: number;
  company: Company;
}

interface Ticket {
  id: number;
  status: string;
  ticket_number: string;
  issue_category: string;
  priority: string;
  preferred_contact_time: string;
  diagnostic_notes?: string;
  issue_description: string;
  resolution_notes?: string;
  resolved_at?: string;
  product: Product;
}

// Fetch Function
const fetchTicketById = async (ticketId: number): Promise<Ticket> => {
  const response = await ApiCall<{ getTicketById: Ticket }>({
    query: GET_TICKET_BY_ID,
    variables: {
      getTicketById: ticketId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getTicketById;
};

const TicketDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();

  const ticketId = parseInt(params.id as string);

  // Fetch ticket data
  const {
    data: ticketData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ticketDetail", ticketId],
    queryFn: () => fetchTicketById(ticketId),
    enabled: !!ticketId,
  });

  // Helper Functions
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

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return <ExclamationCircleOutlined />;
      case "IN_PROGRESS":
        return <ClockCircleOutlined />;
      case "RESOLVED":
        return <CheckCircleOutlined />;
      case "CLOSED":
        return <CheckOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "LOW":
        return "green";
      case "MEDIUM":
        return "orange";
      case "HIGH":
        return "red";
      case "CRITICAL":
        return "magenta";
      default:
        return "default";
    }
  };

  const formatIssueCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Timeline items based on ticket status
  const getTimelineItems = () => {
    const items = [
      {
        dot: <ExclamationCircleOutlined className="text-blue-500" />,
        color: "blue",
        children: (
          <div>
            <Text strong>Ticket Created</Text>
            <br />
            <Text className="text-gray-500">
              Ticket #{ticketData?.ticket_number} opened
            </Text>
          </div>
        ),
      },
    ];

    if (ticketData?.diagnostic_notes) {
      items.push({
        dot: <ToolOutlined className="text-orange-500" />,
        color: "orange",
        children: (
          <div>
            <Text strong>Diagnostic Completed</Text>
            <br />
            <Text className="text-gray-500">Initial diagnosis performed</Text>
          </div>
        ),
      });
    }

    if (ticketData?.status === "RESOLVED" || ticketData?.resolved_at) {
      items.push({
        dot: <CheckCircleOutlined className="text-green-500" />,
        color: "green",
        children: (
          <div>
            <Text strong>Issue Resolved</Text>
            <br />
            <Text className="text-gray-500">
              {ticketData?.resolved_at
                ? `Resolved on ${new Date(
                    ticketData.resolved_at
                  ).toLocaleDateString()}`
                : "Resolution completed"}
            </Text>
          </div>
        ),
      });
    }

    return items;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Text type="danger">
            {error ? `Error: ${error.message}` : "Ticket not found"}
          </Text>
          <br />
          <Space className="mt-4">
            <Button onClick={() => refetch()}>Try Again</Button>
            <Button
              type="primary"
              onClick={() => router.push("/customer/claim")}
            >
              Back to Tickets
            </Button>
          </Space>
        </div>
      </div>
    );
  }

  const supportEmail = ticketData.product.company.email?.trim();

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
                  <div
                    className="cursor-pointer"
                    onClick={() => router.push("/customer/claim")}
                  >
                    <CustomerServiceOutlined />
                    <span>Support Tickets</span>
                  </div>
                ),
              },
              {
                title: `Ticket #${ticketData.ticket_number}`,
              },
            ]}
          />
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push("/customer/claim")}
                className="hover:bg-gray-100"
              >
                Back to Tickets
              </Button>
              <div>
                <Title level={2} className="!mb-2 flex items-center gap-3">
                  <CustomerServiceOutlined className="text-blue-600" />
                  Ticket #{ticketData.ticket_number}
                </Title>
                <Space>
                  <Tag
                    color={getStatusColor(ticketData.status)}
                    icon={getStatusIcon(ticketData.status)}
                    className="px-3 py-1"
                  >
                    {ticketData.status.replace("_", " ")}
                  </Tag>
                  <Tag color={getPriorityColor(ticketData.priority)}>
                    {ticketData.priority} Priority
                  </Tag>
                  <Tag color="blue">
                    {formatIssueCategory(ticketData.issue_category)}
                  </Tag>
                </Space>
              </div>
            </div>

            {/* Customer Action Buttons - Only show if not resolved */}
            {ticketData.status !== "RESOLVED" && (
              <div className="flex gap-2">
                {supportEmail && (
                  <Button
                    type="default"
                    icon={<MessageOutlined />}
                    onClick={() => {
                      const subject = `Follow-up on Ticket ${ticketData.ticket_number}`;
                      const body = `Hi,\n\nI would like to follow up on my support ticket:\n\nTicket Number: ${ticketData.ticket_number}\nProduct: ${ticketData.product.name}\nIssue: ${ticketData.issue_category}\n\nCould you please provide an update on the progress?\n\nThank you.`;
                      window.open(`mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                    }}
                  >
                    Request Update
                  </Button>
                )}
                {supportEmail && (
                  <Button
                    type="primary"
                    icon={<PhoneOutlined />}
                    onClick={() => {
                      window.open(
                        `mailto:${supportEmail}?subject=${encodeURIComponent(
                          `Urgent Support Request - Ticket ${ticketData.ticket_number}`
                        )}&body=${encodeURIComponent(
                          `Ticket Number: ${ticketData.ticket_number}\nProduct: ${ticketData.product.name}\nIssue: ${ticketData.issue_category}\n\nThis is an urgent matter regarding my support ticket.`
                        )}`
                      );
                    }}
                  >
                    Contact Support
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            {/* Issue Details */}
            <Card title="Issue Details" className="mb-6">
              <Descriptions column={1} size="small">
                <Descriptions.Item
                  label={
                    <>
                      <FileTextOutlined className="mr-2" />
                      Issue Category
                    </>
                  }
                >
                  <Tag color="blue">
                    {formatIssueCategory(ticketData.issue_category)}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <>
                      <ExclamationCircleOutlined className="mr-2" />
                      Priority Level
                    </>
                  }
                >
                  <Tag color={getPriorityColor(ticketData.priority)}>
                    {ticketData.priority}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <>
                      <ClockCircleOutlined className="mr-2" />
                      Preferred Contact Time
                    </>
                  }
                >
                  {ticketData.preferred_contact_time}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <div>
                <Title level={5} className="mb-3">
                  <FileTextOutlined className="mr-2" />
                  Issue Description
                </Title>
                <Card size="small" className="bg-gray-50">
                  <Paragraph className="!mb-0">
                    {ticketData.issue_description}
                  </Paragraph>
                </Card>
              </div>

              {ticketData.diagnostic_notes && (
                <>
                  <Divider />
                  <div>
                    <Title level={5} className="mb-3">
                      <ToolOutlined className="mr-2" />
                      Diagnostic Notes
                    </Title>
                    <Alert
                      message="Diagnostic Information"
                      description={ticketData.diagnostic_notes}
                      type="info"
                      showIcon
                    />
                  </div>
                </>
              )}

              {ticketData.resolution_notes && (
                <>
                  <Divider />
                  <div>
                    <Title level={5} className="mb-3">
                      <CheckCircleOutlined className="mr-2" />
                      Resolution Notes
                    </Title>
                    <Alert
                      message="Resolution Details"
                      description={ticketData.resolution_notes}
                      type="success"
                      showIcon
                    />
                  </div>
                </>
              )}
            </Card>

            <div className="mt-4"></div>
            {/* Product Information */}
            <Card title="Product Information" className="mb-6">
              <Row gutter={16} align="middle">
                <Col xs={24} md={4}>
                  <div className="text-center">
                    {ticketData.product.image ? (
                      <img
                        src={ticketData.product.image}
                        alt={ticketData.product.name}
                        className="w-16 h-16 object-cover rounded-lg mx-auto"
                      />
                    ) : (
                      <Avatar
                        size={64}
                        icon={<ShopOutlined />}
                        className="bg-blue-100 text-blue-600 mx-auto"
                      />
                    )}
                  </div>
                </Col>
                <Col xs={24} md={20}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item
                      label={
                        <>
                          <ShopOutlined className="mr-2" />
                          Product Name
                        </>
                      }
                    >
                      <Text strong className="text-lg">
                        {ticketData.product.name}
                      </Text>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={
                        <>
                          <DollarOutlined className="mr-2" />
                          Price
                        </>
                      }
                    >
                      <Text strong className="text-green-600">
                        {formatPrice(ticketData.product.price)}
                      </Text>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={
                        <>
                          <InfoCircleOutlined className="mr-2" />
                          Product ID
                        </>
                      }
                    >
                      #{ticketData.product.id}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            {/* Timeline */}
            <Card title="Ticket Progress" className="mb-6">
              {getTimelineItems().length > 1 ? (
                <Timeline items={getTimelineItems()} />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No progress updates yet"
                />
              )}
            </Card>
            <div className="mt-4"></div>

            {/* Company Contact */}
            <Card title="Company Support" className="mb-6">
              <div className="text-center mb-4">
                <Title level={5} className="!mb-1">
                  {ticketData.product.company.name}
                </Title>
                <Text className="text-gray-600">Product Manufacturer</Text>
              </div>

              <Descriptions column={1} size="small" className="mb-4">
                {supportEmail && (
                  <Descriptions.Item
                    label={
                      <>
                        <MailOutlined className="mr-2" />
                        Email
                      </>
                    }
                  >
                    <a href={`mailto:${supportEmail}`}>
                      {supportEmail}
                    </a>
                  </Descriptions.Item>
                )}

                {ticketData.product.company.address && (
                  <Descriptions.Item label="Address">
                    {ticketData.product.company.address}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Space direction="vertical" className="w-full">
                {supportEmail && (
                  <Button
                    type="primary"
                    block
                    icon={<MailOutlined />}
                    onClick={() => {
                      window.open(
                        `mailto:${supportEmail}?subject=${encodeURIComponent(
                          `Support Request - Ticket ${ticketData.ticket_number}`
                        )}&body=${encodeURIComponent(
                          `Ticket Number: ${ticketData.ticket_number}\nProduct: ${ticketData.product.name}\nIssue: ${ticketData.issue_category}`
                        )}`
                      );
                    }}
                  >
                    Contact Support
                  </Button>
                )}
              </Space>
            </Card>
            <div className="mt-4"></div>

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <Space direction="vertical" className="w-full">
                <Button block onClick={() => refetch()}>
                  Refresh Details
                </Button>
                <Button block onClick={() => router.push("/customer/claim")}>
                  View All Tickets
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TicketDetailPage;
