"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
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
  Modal,
  Select,
  Input,
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
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { UpdateTicketForm, UpdateTicketSchema } from "@/schema/updateticket";
import { onFormError } from "@/utils/methods";
import { TaxtAreaInput } from "@/components/form/inputfields/textareainput";
import { getCookie } from "cookies-next";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

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

// GraphQL Mutation for updating ticket
const UPDATE_TICKET = `
  mutation UpdateTicket($updateTicketId: Int!, $updateType: UpdateTicketInput!) {
    updateTicket(id: $updateTicketId, updateType: $updateType) {
      ticket_number  
    }
  }
`;

const GET_TICKET_LEVELS = `
  query GetAllTicketLevels($whereSearchInput: WhereTicketLevelsSearchInput!) {
    getAllTicketLevels(whereSearchInput: $whereSearchInput) {
      id
      level
      diagnostic_notes
      resolution_notes
      createdAt
      assigned_to {
        id
        name
      }
    }
  }
`;

const CREATE_TICKET_LEVEL = `
  mutation CreateTicketLevels($inputType: CreateTicketLevelsInput!) {
    createTicketLevels(inputType: $inputType) {
      id
      level
    }
  }
`;

const UPDATE_TICKET_LEVEL = `
  mutation UpdateTicketLevels($updateTicketLevelsId: Int!, $updateType: UpdateTicketLevelsInput!) {
    updateTicketLevels(id: $updateTicketLevelsId, updateType: $updateType) {
      id
    }
  }
`;

const GET_ASSIGNABLE_USERS = `
  query GetAllUser($whereSearchInput: WhereUserSearchInput!) {
    getAllUser(whereSearchInput: $whereSearchInput) {
      id
      name
      role
      status
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

interface TicketLevel {
  id: number;
  level: number;
  diagnostic_notes?: string;
  resolution_notes?: string;
  createdAt: string;
  assigned_to: {
    id: number;
    name: string;
  };
}

interface AssignableUser {
  id: number;
  name: string;
  role: string;
  status: string;
}

const ESCALATION_FLOW = [
  { level: 1, role: "MANUF_TECH_GEN" },
  { level: 2, role: "MANUF_TECHNICAL" },
  { level: 3, role: "MANUF_TECH_EXPERT" },
  { level: 4, role: "MANUF_TECH_MANAGER" },
] as const;

// GraphQL Input Types
interface UpdateTicketInput {
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  resolved_at: string | null;
  resolution_notes: string;
  diagnostic_notes: string;
  updatedById: number;
}

interface UpdateTicketVariables {
  updateTicketId: number;
  updateType: UpdateTicketInput;
}

interface UpdateTicketResponse {
  updateTicket: {
    ticket_number: string;
  };
}

interface CreateTicketLevelInput {
  ticket_id: number;
  level: number;
  assigned_to_id: number;
  diagnostic_notes?: string;
  resolution_notes?: string;
  approval_required?: boolean;
  approval_notes?: string;
  createdById: number;
}

interface UpdateTicketLevelInput {
  diagnostic_notes?: string;
  resolution_notes?: string;
  updatedById: number;
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

// Update Ticket Function
const updateTicket = async (
  ticketId: number,
  updateData: UpdateTicketInput,
) => {
  const response = await ApiCall<UpdateTicketResponse>({
    query: UPDATE_TICKET,
    variables: {
      updateTicketId: ticketId,
      updateType: updateData,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateTicket;
};

const fetchTicketLevels = async (ticketId: number): Promise<TicketLevel[]> => {
  const response = await ApiCall<{ getAllTicketLevels: TicketLevel[] }>({
    query: GET_TICKET_LEVELS,
    variables: {
      whereSearchInput: {
        ticket_id: ticketId,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllTicketLevels;
};

const createTicketLevel = async (inputType: CreateTicketLevelInput) => {
  const response = await ApiCall<{
    createTicketLevels: { id: number; level: number };
  }>({
    query: CREATE_TICKET_LEVEL,
    variables: {
      inputType,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.createTicketLevels;
};

const updateTicketLevel = async (
  ticketLevelId: number,
  updateType: UpdateTicketLevelInput,
) => {
  const response = await ApiCall<{ updateTicketLevels: { id: number } }>({
    query: UPDATE_TICKET_LEVEL,
    variables: {
      updateTicketLevelsId: ticketLevelId,
      updateType,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateTicketLevels;
};

const fetchAssignableUsers = async (): Promise<AssignableUser[]> => {
  const response = await ApiCall<{ getAllUser: AssignableUser[] }>({
    query: GET_ASSIGNABLE_USERS,
    variables: {
      whereSearchInput: {
        status: "ACTIVE",
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllUser;
};

const TicketDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const ticketId = parseInt(params.id as string);

  // State for update modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // React Hook Form setup with Valibot validation
  const methods = useForm<UpdateTicketForm>({
    resolver: valibotResolver(UpdateTicketSchema),
    defaultValues: {
      status: "OPEN",
      diagnostic_notes: "",
      resolution_notes: "",
      assigned_to_id: undefined,
      level: undefined,
      approval_required: false,
      approval_notes: "",
    },
  });

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

  const { data: ticketLevels = [] } = useQuery({
    queryKey: ["ticketLevels", ticketId],
    queryFn: () => fetchTicketLevels(ticketId),
    enabled: !!ticketId,
  });

  const { data: assignableUsers = [] } = useQuery({
    queryKey: ["assignableUsers"],
    queryFn: fetchAssignableUsers,
  });

  const nextEscalationStep = ESCALATION_FLOW[ticketLevels.length] ?? null;
  const assignableUsersForNextStep = nextEscalationStep
    ? assignableUsers.filter((user) => user.role === nextEscalationStep.role)
    : [];

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: UpdateTicketForm) => {
      const loggedInUserId = Number.parseInt(
        String(getCookie("id") ?? "0"),
        10,
      );
      const shouldEscalate = values.status !== "CLOSED";

      if (!loggedInUserId) {
        throw new Error("User not authenticated");
      }

      const currentUserLevelEntry = ticketLevels
        .slice()
        .sort((a, b) => b.level - a.level)
        .find((level) => level.assigned_to?.id === loggedInUserId);

      if (currentUserLevelEntry) {
        await updateTicketLevel(currentUserLevelEntry.id, {
          diagnostic_notes: values.diagnostic_notes || "",
          resolution_notes: values.resolution_notes || "",
          updatedById: loggedInUserId,
        });
      }

      if (shouldEscalate && nextEscalationStep) {
        if (!values.assigned_to_id) {
          throw new Error(
            `Please assign this step to ${nextEscalationStep.role}`,
          );
        }

        await createTicketLevel({
          ticket_id: ticketId,
          level: nextEscalationStep.level,
          assigned_to_id: values.assigned_to_id,
          diagnostic_notes: "",
          resolution_notes: "",
          approval_required: values.approval_required,
          approval_notes: values.approval_notes || "",
          createdById: loggedInUserId,
        });
      }

      if (values.status === "CLOSED") {
        const updateData: UpdateTicketInput = {
          status: "CLOSED",
          resolved_at: new Date().toISOString(),
          resolution_notes: values.resolution_notes || "",
          diagnostic_notes: values.diagnostic_notes || "",
          updatedById: loggedInUserId,
        };

        return updateTicket(ticketId, updateData);
      }

      return {
        ticket_number: ticketData?.ticket_number || String(ticketId),
      };
    },
    onSuccess: (data) => {
      toast.success(`Ticket #${data.ticket_number} updated successfully!`);
      setIsUpdateModalOpen(false);
      methods.reset();
      queryClient.invalidateQueries({ queryKey: ["ticketDetail", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["ticketLevels", ticketId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update ticket: ${error.message}`);
    },
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

    if (ticketLevels.length > 0) {
      ticketLevels
        .slice()
        .sort((a, b) => a.level - b.level)
        .forEach((level) => {
          items.push({
            dot: <ClockCircleOutlined className="text-purple-500" />,
            color: "purple",
            children: (
              <div>
                <Text strong>Escalation Level {level.level}</Text>
                <br />
                <Text className="text-gray-500">
                  Assigned to {level.assigned_to?.name || "Support Team"}
                  {level.createdAt
                    ? ` on ${new Date(level.createdAt).toLocaleDateString()}`
                    : ""}
                </Text>
              </div>
            ),
          });
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
                    ticketData.resolved_at,
                  ).toLocaleDateString()}`
                : "Resolution completed"}
            </Text>
          </div>
        ),
      });
    }

    return items;
  };

  // Handle update form submission
  const handleUpdateSubmit = (values: UpdateTicketForm) => {
    updateMutation.mutate(values);
  };

  const sortedTicketLevels = ticketLevels
    .slice()
    .sort((a, b) => a.level - b.level);

  // Open update modal with current values
  const openUpdateModal = () => {
    const normalizedStatus =
      ticketData?.status === "RESOLVED" ? "CLOSED" : ticketData?.status;

    methods.reset({
      status: (normalizedStatus as "OPEN" | "IN_PROGRESS" | "CLOSED") || "OPEN",
      resolution_notes: ticketData?.resolution_notes || "",
      diagnostic_notes: ticketData?.diagnostic_notes || "",
      assigned_to_id: undefined,
      level: nextEscalationStep?.level,
      approval_required: false,
      approval_notes: "",
    });
    setIsUpdateModalOpen(true);
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

            {/* Update Button - Only show if not resolved */}
            {ticketData.status !== "CLOSED" &&
              ticketData.status !== "RESOLVED" && (
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={openUpdateModal}
                  >
                    Update Ticket
                  </Button>
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

            <Card title="Escalation Levels" className="mb-6">
              {sortedTicketLevels.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No escalation levels yet"
                />
              ) : (
                <div className="space-y-4">
                  {sortedTicketLevels.map((level) => (
                    <Card
                      key={level.id}
                      size="small"
                      className="border border-purple-100"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Space>
                            <Tag color="purple">Level {level.level}</Tag>
                            <Text strong>
                              Assigned:{" "}
                              {level.assigned_to?.name || "Support Team"}
                            </Text>
                          </Space>
                          <div className="mt-2 text-xs text-gray-500">
                            Created:{" "}
                            {new Date(level.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {(level.diagnostic_notes || level.resolution_notes) && (
                        <div className="mt-3 space-y-2">
                          {level.diagnostic_notes && (
                            <Alert
                              type="info"
                              showIcon
                              message="Diagnostic Notes"
                              description={level.diagnostic_notes}
                            />
                          )}
                          <div className="h-4"></div>

                          {level.resolution_notes && (
                            <Alert
                              type="success"
                              showIcon
                              message="Resolution Notes"
                              description={level.resolution_notes}
                            />
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
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
                {ticketData.product.company.email && (
                  <Descriptions.Item
                    label={
                      <>
                        <MailOutlined className="mr-2" />
                        Email
                      </>
                    }
                  >
                    <a href={`mailto:${ticketData.product.company.email}`}>
                      {ticketData.product.company.email}
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
                {ticketData.product.company.email && (
                  <Button
                    type="primary"
                    block
                    icon={<MailOutlined />}
                    {...(ticketData.product.company.email && {
                      href: `mailto:${ticketData.product.company.email}?subject=Support Request - Ticket ${ticketData.ticket_number}&body=Ticket Number: ${ticketData.ticket_number}%0AProduct: ${ticketData.product.name}%0AIssue: ${ticketData.issue_category}`,
                    })}
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

        {/* Update Ticket Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <EditOutlined />
              Update Ticket #{ticketData?.ticket_number}
            </div>
          }
          open={isUpdateModalOpen}
          onCancel={() => {
            setIsUpdateModalOpen(false);
            methods.reset();
          }}
          width={600}
          footer={null}
        >
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(handleUpdateSubmit, onFormError)}
              className="mt-4 space-y-6"
            >
              {/* Status Field */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ticket Status <span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder="Select status"
                  size="large"
                  className="w-full"
                  value={methods.watch("status")}
                  onChange={(value) => methods.setValue("status", value)}
                  options={[
                    {
                      value: "OPEN",
                      label: (
                        <div className="flex items-center gap-2">
                          <ExclamationCircleOutlined className="text-blue-500" />
                          Open
                        </div>
                      ),
                    },
                    {
                      value: "IN_PROGRESS",
                      label: (
                        <div className="flex items-center gap-2">
                          <ClockCircleOutlined className="text-orange-500" />
                          In Progress
                        </div>
                      ),
                    },
                    {
                      value: "CLOSED",
                      label: (
                        <div className="flex items-center gap-2">
                          <CheckCircleOutlined className="text-green-500" />
                          Closed
                        </div>
                      ),
                    },
                  ]}
                />
                {methods.formState.errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {methods.formState.errors.status.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="assigned_to_id"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {nextEscalationStep
                      ? `Assign To (${nextEscalationStep.role})`
                      : "Assign To"}
                  </label>
                  <Select
                    placeholder={
                      nextEscalationStep
                        ? `Select ${nextEscalationStep.role} assignee`
                        : "Escalation flow is completed"
                    }
                    size="large"
                    className="w-full"
                    allowClear
                    disabled={
                      !nextEscalationStep ||
                      methods.watch("status") === "CLOSED"
                    }
                    value={methods.watch("assigned_to_id")}
                    onChange={(value) =>
                      methods.setValue("assigned_to_id", value)
                    }
                    options={assignableUsersForNextStep.map((user) => ({
                      value: user.id,
                      label: `${user.name} (${user.role})`,
                    }))}
                  />
                </div>

                <div>
                  <label
                    htmlFor="level"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Escalation Level
                  </label>
                  <Select
                    placeholder="Escalation level"
                    size="large"
                    className="w-full"
                    disabled
                    value={nextEscalationStep?.level}
                    options={
                      nextEscalationStep
                        ? [
                            {
                              value: nextEscalationStep.level,
                              label: `Level ${nextEscalationStep.level}`,
                            },
                          ]
                        : []
                    }
                  />
                </div>
              </div>

              {methods.watch("status") === "CLOSED" && (
                <Alert
                  type="success"
                  showIcon
                  message="Ticket will be closed"
                  description="Are you sure you want to close this ticket?"
                />
              )}

              {!nextEscalationStep && (
                <Alert
                  type="info"
                  showIcon
                  message="Escalation flow completed"
                  description="This ticket has already reached MANUF_TECH_MANAGER. You can finalize resolution now."
                />
              )}

              <div>
                <label
                  htmlFor="approval_required"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Approval Required
                </label>
                <Select
                  size="large"
                  className="w-full"
                  value={methods.watch("approval_required")}
                  onChange={(value) =>
                    methods.setValue("approval_required", value)
                  }
                  options={[
                    { value: false, label: "No" },
                    { value: true, label: "Yes" },
                  ]}
                />
              </div>

              {methods.watch("approval_required") && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Add notes for the approval request
                  </p>
                  <TaxtAreaInput<UpdateTicketForm>
                    name="approval_notes"
                    title="Approval Notes"
                    placeholder="Enter approval notes..."
                    required={false}
                    maxlength={500}
                  />
                </div>
              )}

              {/* Diagnostic Notes Field */}
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Add or update diagnostic information about the issue
                </p>
                <TaxtAreaInput<UpdateTicketForm>
                  name="diagnostic_notes"
                  title="Diagnostic Notes"
                  placeholder="Enter diagnostic notes..."
                  required={false}
                  maxlength={500}
                />
              </div>
              <div className="h-4"></div>

              {/* Resolution Notes Field */}
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Describe the solution or resolution steps taken
                </p>
                <TaxtAreaInput<UpdateTicketForm>
                  name="resolution_notes"
                  title="Resolution Notes"
                  placeholder="Enter resolution notes..."
                  required={false}
                  maxlength={1000}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    methods.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={updateMutation.isPending}
                >
                  Update Ticket
                </Button>
              </div>
            </form>
          </FormProvider>
        </Modal>
      </div>
    </div>
  );
};

export default TicketDetailPage;
