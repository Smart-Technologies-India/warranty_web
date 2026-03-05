"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Button,
  Typography,
  Spin,
  Card,
  Collapse,
  Steps,
  Form,
  Input,
  Select,
  Upload,
  Row,
  Col,
  Alert,
  Divider,
  Tag,
  Space,
  Descriptions,
} from "antd";
import {
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  ToolOutlined,
  FormOutlined,
  PhoneOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { getCookie } from "cookies-next";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// GraphQL Queries
const GET_SALE_BY_ID = `
  query GetSaleById($getSalesByIdId: Int!) {
    getSalesById(id: $getSalesByIdId) {
      id
      sale_date
      warranty_till
      company {
        name
        contact1
        contact2
        email
        address
      }
      product {
        name
        id
        image
        description
        subcategory {
          name
          product_category {
            name
          }
        }
      }
      customer {
        name
        contact1
        email
      }
    }
  }
`;

const CREATE_TICKET = `
  mutation CreateTicket($inputType: CreateTicketInput!) {
    createTicket(inputType: $inputType) {
      ticket_number
    }
  }
`;

// Interfaces
interface Company {
  name: string;
  contact1: string;
  contact2?: string;
  email?: string;
  address?: string;
}

interface Product {
  name: string;
  id: number;
  image?: string;
  description?: string;
  subcategory: {
    name: string;
    product_category: {
      name: string;
    };
  };
}

interface Customer {
  name: string;
  contact1: string;
  email?: string;
}

interface Sale {
  id: number;
  sale_date: string;
  warranty_till: number;
  company?: Company;
  product: Product;
  customer: Customer;
}

// FAQ Data
const faqData = [
  {
    key: "1",
    question: "What does my warranty cover?",
    answer:
      "Your warranty covers manufacturing defects, hardware failures, and component malfunctions that occur during normal use. It does not cover damage due to accidents, misuse, normal wear and tear, or modifications not authorized by the manufacturer.",
  },
  {
    key: "2",
    question: "How long does the warranty claim process take?",
    answer:
      "Typically, warranty claims are processed within 7-14 business days. Complex cases may take up to 21 days. You'll receive regular updates via email and SMS throughout the process.",
  },
  {
    key: "3",
    question: "What documents do I need for a warranty claim?",
    answer:
      "You'll need your purchase receipt, product serial number, photos/videos of the issue, and a detailed description of the problem. Additional documentation may be requested based on the nature of the claim.",
  },
  {
    key: "4",
    question: "Can I track my warranty claim status?",
    answer:
      "Yes, once your claim is submitted, you'll receive a claim number that you can use to track the status of your claim through our customer portal or by contacting customer service.",
  },
  {
    key: "5",
    question: "What if my product is beyond repair?",
    answer:
      "If the product cannot be repaired, you may be eligible for a replacement or refund based on the warranty terms and the age of the product. Our team will discuss available options with you.",
  },
];

// Troubleshooting Steps
const troubleshootingSteps = [
  {
    title: "Check Power Connection",
    description:
      "Ensure the device is properly plugged in and the power outlet is working.",
    icon: <ToolOutlined />,
  },
  {
    title: "Restart the Device",
    description: "Turn off the device, wait 30 seconds, then turn it back on.",
    icon: <ToolOutlined />,
  },
  {
    title: "Check All Connections",
    description:
      "Verify all cables and connections are secure and properly connected.",
    icon: <ToolOutlined />,
  },
  {
    title: "Update Software/Firmware",
    description:
      "Check for and install any available software or firmware updates.",
    icon: <ToolOutlined />,
  },
  {
    title: "Reset to Factory Settings",
    description:
      "If safe to do so, try resetting the device to factory default settings.",
    icon: <ToolOutlined />,
  },
];

// Fetch Functions
const fetchSaleById = async (saleId: number): Promise<Sale> => {
  const response = await ApiCall<{ getSalesById: Sale }>({
    query: GET_SALE_BY_ID,
    variables: {
      getSalesByIdId: saleId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getSalesById;
};

const WarrantyClaimPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();

  const saleId = parseInt(params.saleId as string);
  const userId: number = parseInt(getCookie("id") as string);

  // State Management
  const [currentStep, setCurrentStep] = useState(0);
  const [troubleshootingCompleted, setTroubleshootingCompleted] = useState<
    boolean[]
  >(new Array(troubleshootingSteps.length).fill(false));
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  // Fetch sale data
  const {
    data: saleData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["saleDetail", saleId],
    queryFn: () => fetchSaleById(saleId),
    enabled: !!saleId,
  });

  // Submit ticket mutation
  const ticketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      const response = await ApiCall<{ createTicket: any }>({
        query: CREATE_TICKET,
        variables: {
          inputType: ticketData,
        },
      });
      if (!response.status) {
        throw new Error(response.message);
      }
      return response.data.createTicket;
    },
    onSuccess: (data) => {
      toast.success(
        `Support ticket submitted successfully! Ticket Number: ${data.ticket_number}`
      );
      router.push(`/customer/claim`);
    },
    onError: (error: any) => {
      toast.error(`Failed to submit ticket: ${error.message}`);
    },
  });

  // Helper Functions
  const getWarrantyStatus = (saleDate: string, warrantyDays: number) => {
    const purchaseDate = new Date(saleDate);
    const warrantyEndDate = new Date(
      purchaseDate.getTime() + warrantyDays * 24 * 60 * 60 * 1000
    );
    const now = new Date();
    const daysLeft = Math.ceil(
      (warrantyEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      daysLeft,
      endDate: warrantyEndDate,
      isActive: daysLeft > 0,
      isExpiringSoon: daysLeft <= 30 && daysLeft > 0,
    };
  };

  const handleTroubleshootingCheck = (index: number, completed: boolean) => {
    const newCompleted = [...troubleshootingCompleted];
    newCompleted[index] = completed;
    setTroubleshootingCompleted(newCompleted);

    // Check if all troubleshooting steps are completed
    const allCompleted = newCompleted.every((step) => step);
    if (allCompleted) {
      setCurrentStep(2); // Move to claim form step
    }
  };

  // Generate ticket number
  const generateTicketNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TKT-${timestamp}-${random}`;
  };

  const onFinish = (values: any) => {
    if (!saleData) return;

    const ticketData = {
      ticket_number: generateTicketNumber(),
      customer_id: userId,
      createdById: userId, // Using customer ID as creator
      product_id: saleData.product.id,
      status: "OPEN",
      priority: "LOW", // Always send LOW priority
      preferred_contact_time: values.preferredContactTime,
      issue_category: values.issueCategory,
      issue_description: values.issueDescription,
      sale_id: saleData.id,
    };

    ticketMutation.mutate(ticketData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading warranty information...</p>
        </div>
      </div>
    );
  }

  if (error || !saleData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Text type="danger">
            {error ? `Error: ${error.message}` : "Product not found"}
          </Text>
          <br />
          <Button
            onClick={() => router.push(`/customer/products`)}
            className="mt-4"
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // Get company data - check if it's at root level or under product
  const companyData = saleData.company || (saleData.product as any)?.company;

  const warranty = getWarrantyStatus(
    saleData.sale_date,
    saleData.warranty_till
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/customer/products/${saleId}`)}
              className="hover:bg-gray-100"
            >
              Back to Product Details
            </Button>
            <div>
              <Title level={3} className="!mb-0 text-gray-900">
                Support Ticket - {saleData.product.name}
              </Title>
              <Text className="text-gray-600">
                Purchase ID: #{saleData.id} • Warranty Status:
                <Tag
                  color={
                    warranty.isActive
                      ? warranty.isExpiringSoon
                        ? "orange"
                        : "green"
                      : "red"
                  }
                  className="ml-2"
                >
                  {warranty.isActive
                    ? warranty.isExpiringSoon
                      ? "Expiring Soon"
                      : "Active"
                    : "Expired"}
                </Tag>
              </Text>
            </div>
          </div>
        </div>

        {/* Warranty Status Alert */}
        {!warranty.isActive && (
          <Alert
            message="Warranty Expired"
            description={`This product's warranty expired ${Math.abs(
              warranty.daysLeft
            )} days ago. You may still be eligible for paid repair services. Contact customer support for options.`}
            type="error"
            icon={<WarningOutlined />}
            showIcon
            closable
          />
        )}

        {/* Progress Steps */}
        <Card>
          <Steps
            current={currentStep}
            className="mb-6"
            items={[
              {
                title: "FAQ & Information",
                description: "Common questions and answers",
                icon: <QuestionCircleOutlined />,
              },
              {
                title: "Self Troubleshooting",
                description: "Try these solutions first",
                icon: <ToolOutlined />,
              },
              {
                title: "Submit Ticket",
                description: "Create your support ticket",
                icon: <FormOutlined />,
              },
              {
                title: "Contact Support",
                description: "Get direct assistance",
                icon: <PhoneOutlined />,
              },
            ]}
          />
        </Card>

        <div></div>
        {/* FAQ Section */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <QuestionCircleOutlined className="text-2xl text-blue-600" />
            <Title level={4} className="!mb-0">
              Frequently Asked Questions
            </Title>
          </div>

          <Collapse
            ghost
            items={faqData.map((item) => ({
              key: item.key,
              label: <Text strong>{item.question}</Text>,
              children: <Text className="text-gray-700">{item.answer}</Text>,
            }))}
          />

          <div className="mt-4 text-center">
            <Button
              type="primary"
              onClick={() => setCurrentStep(1)}
              className="px-8"
            >
              Continue to Troubleshooting
            </Button>
          </div>
        </Card>
        <div></div>

        {/* Self Troubleshooting Section */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <ToolOutlined className="text-2xl text-orange-600" />
            <Title level={4} className="!mb-0">
              Self Troubleshooting
            </Title>
          </div>

          <Alert
            message="Try These Steps First"
            description="Please attempt these troubleshooting steps before submitting a support ticket. This may resolve your issue quickly."
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
            className="mb-6"
          />

          <div className="space-y-4">
            {troubleshootingSteps.map((step, index) => (
              <div className="mt-2">
                <Card
                  key={index}
                  size="small"
                  className="border-l-4 border-l-blue-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 mt-1">{step.icon}</div>
                      <div>
                        <Text strong className="block">
                          {step.title}
                        </Text>
                        <Text className="text-gray-600">
                          {step.description}
                        </Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        type={
                          troubleshootingCompleted[index]
                            ? "primary"
                            : "default"
                        }
                        onClick={() =>
                          handleTroubleshootingCheck(
                            index,
                            !troubleshootingCompleted[index]
                          )
                        }
                        icon={
                          troubleshootingCompleted[index] ? (
                            <CheckCircleOutlined />
                          ) : null
                        }
                      >
                        {troubleshootingCompleted[index]
                          ? "Completed"
                          : "Mark Done"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Text className="text-blue-800">
              <InfoCircleOutlined className="mr-2" />
              Completed: {
                troubleshootingCompleted.filter(Boolean).length
              } of {troubleshootingSteps.length} steps
            </Text>
            {troubleshootingCompleted.every((step) => step) && (
              <div className="mt-3">
                <Text className="text-green-700 block mb-2">
                  <CheckCircleOutlined className="mr-2" />
                  All troubleshooting steps completed. You can now proceed with
                  your support ticket.
                </Text>
                <Button
                  type="primary"
                  onClick={() => {
                    setCurrentStep(2);
                    setShowClaimForm(true);
                  }}
                >
                  Proceed to Ticket Form
                </Button>
              </div>
            )}
          </div>
        </Card>
        <div></div>

        {/* Claim Form Section */}
        {showClaimForm && (
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <FormOutlined className="text-2xl text-green-600" />
              <Title level={4} className="!mb-0">
                Submit Support Ticket
              </Title>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="space-y-4"
            >
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="issueCategory"
                    label="Issue Category"
                    rules={[
                      {
                        required: true,
                        message: "Please select the issue category",
                      },
                    ]}
                  >
                    <Select placeholder="Select issue category">
                      <Option value="POWER ISSUE">Power Issue</Option>
                      <Option value="HARDWARE FAILURE">Hardware Failure</Option>
                      <Option value="SOFTWARE ISSUE">Software Issue</Option>
                      <Option value="PERFORMANCE PROBLEM">
                        Performance Problem
                      </Option>
                      <Option value="CONNECTIVITY ISSUE">
                        Connectivity Issue
                      </Option>
                      <Option value="DISPLAY PROBLEM">Display Problem</Option>
                      <Option value="AUDIO ISSUE">Audio Issue</Option>
                      <Option value="BATTERY PROBLEM">Battery Problem</Option>
                      <Option value="OTHER">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="preferredContactTime"
                    label="Preferred Contact Time"
                    rules={[
                      {
                        required: true,
                        message: "Please select your preferred contact time",
                      },
                    ]}
                  >
                    <Select placeholder="Select preferred contact time">
                      <Option value="09:00 AM To 12:00 PM">
                        09:00 AM To 12:00 PM
                      </Option>
                      <Option value="12:00 PM To 03:00 PM">
                        12:00 PM To 03:00 PM
                      </Option>
                      <Option value="03:00 PM To 06:00 PM">
                        03:00 PM To 06:00 PM
                      </Option>
                      <Option value="06:00 PM To 09:00 PM">
                        06:00 PM To 09:00 PM
                      </Option>
                      <Option value="09:00 AM To 06:00 PM">
                        09:00 AM To 06:00 PM (Business Hours)
                      </Option>
                      <Option value="Anytime">Anytime</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <div className="pt-8">
                    <Text className="text-sm text-gray-600">
                      <InfoCircleOutlined className="mr-1" />
                      We'll contact you during your preferred time for updates
                    </Text>
                  </div>
                </Col>
              </Row>

              <Form.Item
                name="issueDescription"
                label="Issue Description"
                rules={[
                  {
                    required: true,
                    message:
                      "Please provide a detailed description of the issue",
                  },
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Please describe the issue in detail, including when it started, what you were doing when it occurred, and any error messages you've seen..."
                />
              </Form.Item>

              <Form.Item name="attachments" label="Supporting Documents">
                <Upload
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                  multiple
                >
                  <Button icon={<UploadOutlined />}>
                    Upload Photos/Videos of the Issue
                  </Button>
                </Upload>
                <Text className="text-gray-500 text-sm block mt-2">
                  Supported formats: JPG, PNG, MP4, PDF. Max size: 10MB per
                  file.
                </Text>
              </Form.Item>

              <div className="flex justify-center pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={ticketMutation.isPending}
                  className="px-12"
                >
                  Submit Support Ticket
                </Button>
              </div>
            </Form>
          </Card>
        )}

        {/* Company Contact Details */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <PhoneOutlined className="text-2xl text-purple-600" />
            <Title level={4} className="!mb-0">
              Company Contact Details
            </Title>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card size="small" className="h-full">
                <Title level={5} className="!mb-4">
                  {companyData?.name || "Company Information"}
                </Title>

                <Descriptions column={1} size="small">
                  {companyData?.contact1 && (
                    <Descriptions.Item
                      label={
                        <>
                          <PhoneOutlined className="mr-2" />
                          Primary Contact
                        </>
                      }
                    >
                      <a href={`tel:${companyData.contact1}`}>
                        {companyData.contact1}
                      </a>
                    </Descriptions.Item>
                  )}

                  {companyData?.contact2 && (
                    <Descriptions.Item
                      label={
                        <>
                          <PhoneOutlined className="mr-2" />
                          Secondary Contact
                        </>
                      }
                    >
                      <a href={`tel:${companyData.contact2}`}>
                        {companyData.contact2}
                      </a>
                    </Descriptions.Item>
                  )}

                  {companyData?.email && (
                    <Descriptions.Item
                      label={
                        <>
                          <MailOutlined className="mr-2" />
                          Email
                        </>
                      }
                    >
                      <a href={`mailto:${companyData.email}`}>
                        {companyData.email}
                      </a>
                    </Descriptions.Item>
                  )}

                  {companyData?.address && (
                    <Descriptions.Item label="Address">
                      {companyData.address}
                    </Descriptions.Item>
                  )}

                  {!companyData && (
                    <Descriptions.Item label="Status">
                      <Text type="secondary">
                        Company information not available
                      </Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card size="small" className="h-full">
                <Title level={5} className="!mb-4">
                  <ClockCircleOutlined className="mr-2" />
                  Support Hours & Response Times
                </Title>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text>Customer Support Hours:</Text>
                    <Text strong>Mon-Fri: 9AM-6PM</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Weekend Support:</Text>
                    <Text strong>Sat: 10AM-4PM</Text>
                  </div>
                  <Divider className="my-3" />
                  <div className="flex justify-between">
                    <Text>Email Response:</Text>
                    <Text strong>Within 24 hours</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Phone Support:</Text>
                    <Text strong>Immediate</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Claim Processing:</Text>
                    <Text strong>7-14 business days</Text>
                  </div>
                </div>

                <Divider />

                <Space direction="vertical" className="w-full">
                  {companyData?.contact1 && (
                    <Button
                      type="primary"
                      block
                      {...(companyData.contact1 && {
                        href: `tel:${companyData.contact1}`,
                      })}
                      icon={<PhoneOutlined />}
                    >
                      Call Support Now
                    </Button>
                  )}
                  {companyData?.email && (
                    <Button
                      block
                      {...(companyData.email && {
                        href: `mailto:${companyData.email}?subject=Warranty Support - ${saleData.product.name}&body=Product: ${saleData.product.name}%0APurchase ID: ${saleData.id}%0ACustomer: ${saleData.customer.name}`,
                      })}
                      icon={<MailOutlined />}
                    >
                      Send Email
                    </Button>
                  )}
                  {!companyData && (
                    <Button block disabled>
                      Contact information not available
                    </Button>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default WarrantyClaimPage;
