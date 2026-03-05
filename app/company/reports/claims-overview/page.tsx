"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Typography,
  Space,
  Select,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Tag,
  Progress,
} from "antd";
import {
  ArrowLeftOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts";

const { Title, Text, Paragraph } = Typography;

const monthlyClaimsData = [
  { month: "Jan", total: 145, resolved: 128, pending: 17, avgResolutionDays: 8.5 },
  { month: "Feb", total: 162, resolved: 145, pending: 17, avgResolutionDays: 7.8 },
  { month: "Mar", total: 178, resolved: 165, pending: 13, avgResolutionDays: 7.2 },
  { month: "Apr", total: 156, resolved: 142, pending: 14, avgResolutionDays: 7.5 },
  { month: "May", total: 189, resolved: 172, pending: 17, avgResolutionDays: 6.9 },
  { month: "Jun", total: 205, resolved: 183, pending: 22, avgResolutionDays: 7.1 },
];

const claimsByStatus = [
  { status: "Resolved", count: 935, percentage: 88.5, color: "#52c41a" },
  { status: "In Progress", count: 78, percentage: 7.4, color: "#1890ff" },
  { status: "Pending", count: 43, percentage: 4.1, color: "#faad14" },
];

const claimsByCategory = [
  { category: "Defective Product", count: 385, percentage: 36.4 },
  { category: "Installation Issue", count: 245, percentage: 23.2 },
  { category: "Performance Issue", count: 198, percentage: 18.7 },
  { category: "Parts Missing", count: 112, percentage: 10.6 },
  { category: "Documentation Error", count: 68, percentage: 6.4 },
  { category: "Other", count: 48, percentage: 4.5 },
];

const topClaimedProducts = [
  {
    product: "Washing Machine 7Kg",
    category: "Home Appliances",
    claims: 125,
    claimRate: 4.32,
    status: "High",
  },
  {
    product: "Refrigerator 350L",
    category: "Home Appliances",
    claims: 98,
    claimRate: 4.17,
    status: "High",
  },
  {
    product: "Smart TV 55\"",
    category: "Television",
    claims: 87,
    claimRate: 2.54,
    status: "Medium",
  },
  {
    product: "Air Conditioner 1.5T",
    category: "Home Appliances",
    claims: 76,
    claimRate: 3.62,
    status: "Medium",
  },
  {
    product: "Microwave Oven",
    category: "Kitchen Appliances",
    claims: 54,
    claimRate: 2.73,
    status: "Low",
  },
];

const resolutionTimeDistribution = [
  { range: "0-3 days", count: 425, percentage: 45.5 },
  { range: "4-7 days", count: 312, percentage: 33.4 },
  { range: "8-14 days", count: 148, percentage: 15.8 },
  { range: "15-30 days", count: 38, percentage: 4.1 },
  { range: "30+ days", count: 12, percentage: 1.3 },
];

const COLORS = ["#52c41a", "#1890ff", "#faad14", "#fa8c16", "#f5222d"];

const ClaimsOverviewPage: React.FC = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("last-6-months");

  const totalClaims = monthlyClaimsData.reduce((sum, item) => sum + item.total, 0);
  const totalResolved = monthlyClaimsData.reduce((sum, item) => sum + item.resolved, 0);
  const resolutionRate = ((totalResolved / totalClaims) * 100).toFixed(1);
  const avgResolutionTime =
    monthlyClaimsData.reduce((sum, item) => sum + item.avgResolutionDays, 0) /
    monthlyClaimsData.length;

  const productColumns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-sm">
            {record.category}
          </Text>
        </div>
      ),
    },
    {
      title: "Total Claims",
      dataIndex: "claims",
      key: "claims",
      sorter: (a: any, b: any) => b.claims - a.claims,
      render: (claims: number) => (
        <Text strong className="text-lg" style={{ color: "#f5222d" }}>
          {claims}
        </Text>
      ),
    },
    {
      title: "Claim Rate",
      dataIndex: "claimRate",
      key: "claimRate",
      render: (rate: number) => (
        <Tag color={rate > 4 ? "red" : rate > 3 ? "orange" : "green"}>{rate}%</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "High" ? "red" : status === "Medium" ? "orange" : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/company/reports")}
            className="mb-4"
          >
            Back to Reports
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <CustomerServiceOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Claims Overview Dashboard
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Comprehensive analysis of warranty claims, resolution rates, and performance metrics
                </Paragraph>
              </div>
            </div>
            <Space>
              <Select
                value={period}
                onChange={setPeriod}
                style={{ width: 180 }}
                options={[
                  { label: "Last Month", value: "last-month" },
                  { label: "Last 3 Months", value: "last-3-months" },
                  { label: "Last 6 Months", value: "last-6-months" },
                  { label: "Last Year", value: "last-year" },
                  { label: "All Time", value: "all-time" },
                ]}
              />
              <Button type="primary" icon={<DownloadOutlined />}>
                Export Report
              </Button>
            </Space>
          </div>
        </div>

        {/* Key Metrics */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Claims"
                value={totalClaims}
                valueStyle={{ color: "#1890ff" }}
                prefix={<CustomerServiceOutlined />}
              />
              <div className="mt-2">
                <Tag color="blue" icon={<RiseOutlined />}>
                  +12.3% vs last period
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Resolution Rate"
                value={resolutionRate}
                suffix="%"
                valueStyle={{ color: "#52c41a" }}
                prefix={<CheckCircleOutlined />}
              />
              <div className="mt-2">
                <Tag color="green" icon={<RiseOutlined />}>
                  +3.2% improvement
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Resolution Time"
                value={avgResolutionTime}
                precision={1}
                suffix="days"
                valueStyle={{ color: "#722ed1" }}
                prefix={<ClockCircleOutlined />}
              />
              <div className="mt-2">
                <Tag color="purple" icon={<FallOutlined />}>
                  -1.2 days improved
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Claims"
                value={claimsByStatus[2].count}
                valueStyle={{ color: "#faad14" }}
                prefix={<WarningOutlined />}
              />
              <div className="mt-2">
                <Tag color="orange">Requires attention</Tag>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={16}>
            <Card title="Monthly Claims Trend & Resolution">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={monthlyClaimsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="total"
                    fill="#1890ff"
                    stroke="#1890ff"
                    fillOpacity={0.6}
                    name="Total Claims"
                  />
                  <Bar yAxisId="left" dataKey="resolved" fill="#52c41a" name="Resolved" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgResolutionDays"
                    stroke="#722ed1"
                    strokeWidth={2}
                    name="Avg Resolution (days)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Claims by Status">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={claimsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload }) => `${payload?.status}: ${payload?.percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {claimsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Claims by Category */}
        <Card title="Claims by Issue Category" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={claimsByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-20} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#1890ff" name="Claims Count" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Resolution Time Distribution */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={14}>
            <Card title="Resolution Time Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resolutionTimeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#52c41a" name="Claims Count" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="Top Claimed Products">
              <Table
                columns={productColumns}
                dataSource={topClaimedProducts}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        {/* Performance Summary */}
        <Card title="Status Breakdown">
          <Row gutter={16}>
            {claimsByStatus.map((status, index) => (
              <Col xs={24} md={8} key={status.status}>
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: `${status.color}15`, border: `2px solid ${status.color}` }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <Text strong style={{ color: status.color, fontSize: "16px" }}>
                      {status.status}
                    </Text>
                    <Text strong style={{ color: status.color, fontSize: "24px" }}>
                      {status.count}
                    </Text>
                  </div>
                  <Progress
                    percent={status.percentage}
                    strokeColor={status.color}
                    showInfo={false}
                  />
                  <Text type="secondary" className="text-sm">
                    {status.percentage}% of total claims
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Insights */}
        <Card title="Key Insights & Recommendations" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  ✅ Excellent Resolution Rate
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  88.5% resolution rate is outstanding. 78.9% of claims resolved within 7 days,
                  demonstrating efficient customer service and strong warranty support processes.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  📊 Issue Pattern Analysis
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  Defective Product claims (36.4%) and Installation Issues (23.2%) are top categories.
                  Improve QC processes and provide better installation guides/training.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  ⚠️ Product Quality Focus
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  Washing Machines (4.32% claim rate) and Refrigerators (4.17%) need quality
                  improvements. Review supplier quality standards and manufacturing processes.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-purple-900">
                  🎯 Continuous Improvement
                </Title>
                <Paragraph className="text-purple-800 !mb-0">
                  Resolution time improved by 1.2 days. Target further reduction to under 6 days average
                  by implementing automated claim routing and pre-approved common fixes.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default ClaimsOverviewPage;
