"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Table,
  Typography,
  Tag,
  Space,
  Select,
  Row,
  Col,
  Statistic,
  Button,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  HourglassOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Area,
} from "recharts";

const { Title, Text, Paragraph } = Typography;

const claimResolutionData = [
  {
    category: "Refrigerator",
    avgResolution: 4.8,
    under24h: 120,
    under3days: 85,
    under7days: 45,
    over7days: 28,
    totalClaims: 278,
    satisfaction: 4.2,
    status: "Good",
  },
  {
    category: "Washing Machine",
    avgResolution: 6.2,
    under24h: 58,
    under3days: 92,
    under7days: 68,
    over7days: 45,
    totalClaims: 263,
    satisfaction: 3.8,
    status: "Needs Improvement",
  },
  {
    category: "Air Conditioner",
    avgResolution: 5.5,
    under24h: 82,
    under3days: 105,
    under7days: 52,
    over7days: 38,
    totalClaims: 277,
    satisfaction: 4.0,
    status: "Average",
  },
  {
    category: "Microwave",
    avgResolution: 3.2,
    under24h: 145,
    under3days: 42,
    under7days: 18,
    over7days: 12,
    totalClaims: 217,
    satisfaction: 4.6,
    status: "Excellent",
  },
  {
    category: "Smart TV",
    avgResolution: 4.5,
    under24h: 128,
    under3days: 78,
    under7days: 32,
    over7days: 22,
    totalClaims: 260,
    satisfaction: 4.3,
    status: "Good",
  },
  {
    category: "Water Purifier",
    avgResolution: 7.8,
    under24h: 42,
    under3days: 68,
    under7days: 82,
    over7days: 58,
    totalClaims: 250,
    satisfaction: 3.5,
    status: "Critical",
  },
];

const monthlyResolutionTrend = [
  { month: "Jan", avgDays: 6.8, resolved: 285, pending: 42 },
  { month: "Feb", avgDays: 6.2, resolved: 310, pending: 38 },
  { month: "Mar", avgDays: 5.8, resolved: 342, pending: 35 },
  { month: "Apr", avgDays: 5.5, resolved: 368, pending: 32 },
  { month: "May", avgDays: 5.2, resolved: 385, pending: 28 },
  { month: "Jun", avgDays: 4.8, resolved: 412, pending: 25 },
];

const departmentPerformance = [
  { department: "Service Center North", avgResolution: 3.5, claims: 420, rating: 4.6 },
  { department: "Service Center South", avgResolution: 4.2, claims: 385, rating: 4.4 },
  { department: "Service Center East", avgResolution: 5.8, claims: 365, rating: 4.0 },
  { department: "Service Center West", avgResolution: 6.5, claims: 342, rating: 3.8 },
  { department: "Third-Party Vendors", avgResolution: 8.2, claims: 280, rating: 3.2 },
];

const ClaimResolutionTimePage: React.FC = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("last-6-months");

  const columns = [
    {
      title: "Product Category",
      dataIndex: "category",
      key: "category",
      render: (category: string) => <Text strong className="text-base">{category}</Text>,
    },
    {
      title: "Avg Resolution Time",
      dataIndex: "avgResolution",
      key: "avgResolution",
      sorter: (a: any, b: any) => a.avgResolution - b.avgResolution,
      render: (days: number) => (
        <Tag
          color={days < 4 ? "green" : days < 6 ? "blue" : days < 8 ? "orange" : "red"}
          icon={<ClockCircleOutlined />}
          className="text-base px-3 py-1"
        >
          {days} days
        </Tag>
      ),
    },
    {
      title: "Under 24h",
      dataIndex: "under24h",
      key: "under24h",
      render: (count: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {count}
        </Text>
      ),
    },
    {
      title: "1-3 Days",
      dataIndex: "under3days",
      key: "under3days",
      render: (count: number) => (
        <Text strong style={{ color: "#1890ff" }}>
          {count}
        </Text>
      ),
    },
    {
      title: "4-7 Days",
      dataIndex: "under7days",
      key: "under7days",
      render: (count: number) => (
        <Text strong style={{ color: "#faad14" }}>
          {count}
        </Text>
      ),
    },
    {
      title: "Over 7 Days",
      dataIndex: "over7days",
      key: "over7days",
      render: (count: number) => (
        <Text strong style={{ color: "#f5222d" }}>
          {count}
        </Text>
      ),
    },
    {
      title: "Total Claims",
      dataIndex: "totalClaims",
      key: "totalClaims",
      render: (total: number) => <Text>{total}</Text>,
    },
    {
      title: "Satisfaction",
      dataIndex: "satisfaction",
      key: "satisfaction",
      render: (rating: number) => (
        <Tag color={rating >= 4.5 ? "green" : rating >= 4 ? "blue" : rating >= 3.5 ? "orange" : "red"}>
          ⭐ {rating}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Excellent"
            ? "green"
            : status === "Good"
            ? "blue"
            : status === "Average"
            ? "cyan"
            : status === "Needs Improvement"
            ? "orange"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const totalClaims = claimResolutionData.reduce((sum, item) => sum + item.totalClaims, 0);
  const avgResolutionTime =
    claimResolutionData.reduce((sum, item) => sum + item.avgResolution * item.totalClaims, 0) / totalClaims;
  const under24hTotal = claimResolutionData.reduce((sum, item) => sum + item.under24h, 0);
  const over7daysTotal = claimResolutionData.reduce((sum, item) => sum + item.over7days, 0);

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
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ClockCircleOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Claim Resolution Time Analysis
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Average resolution time and bottleneck identification
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
                ]}
              />
              <Button type="primary" icon={<DownloadOutlined />}>
                Export Report
              </Button>
            </Space>
          </div>
        </div>

        {/* Alert Banner */}
        <Alert
          message="Critical Delay Detected"
          description="Water Purifier claims averaging 7.8 days resolution time (58 claims over 7 days). Customer satisfaction dropped to 3.5. Immediate action required."
          type="error"
          showIcon
          icon={<WarningOutlined />}
          closable
          className="mb-6"
        />

        {/* Key Metrics */}
        <Row gutter={16} className="mb-6">
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
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Resolved Under 24h"
                value={under24hTotal}
                valueStyle={{ color: "#52c41a" }}
                prefix={<ThunderboltOutlined />}
              />
              <Text type="secondary" className="text-sm">
                {((under24hTotal / totalClaims) * 100).toFixed(1)}% of total
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Delayed (Over 7 Days)"
                value={over7daysTotal}
                valueStyle={{ color: "#f5222d" }}
                prefix={<HourglassOutlined />}
              />
              <Text type="secondary" className="text-sm">
                {((over7daysTotal / totalClaims) * 100).toFixed(1)}% of total
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Claims Processed"
                value={totalClaims}
                valueStyle={{ color: "#1890ff" }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={12}>
            <Card title="Category-wise Resolution Time">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={claimResolutionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={130} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgResolution" fill="#722ed1" name="Avg Resolution (days)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Resolution Time Distribution">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={claimResolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-20} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="under24h" stackId="a" fill="#52c41a" name="Under 24h" />
                  <Bar dataKey="under3days" stackId="a" fill="#1890ff" name="1-3 Days" />
                  <Bar dataKey="under7days" stackId="a" fill="#faad14" name="4-7 Days" />
                  <Bar dataKey="over7days" stackId="a" fill="#f5222d" name="Over 7 Days" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Monthly Trend */}
        <Card title="Resolution Time Improvement Trend (Last 6 Months)" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyResolutionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="resolved"
                fill="#52c41a"
                stroke="#52c41a"
                fillOpacity={0.3}
                name="Resolved Claims"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgDays"
                stroke="#722ed1"
                strokeWidth={3}
                name="Avg Resolution Days"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="pending"
                stroke="#f5222d"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Pending Claims"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Department Performance */}
        <Card title="Service Center Performance Comparison" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-20} textAnchor="end" height={100} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="avgResolution" fill="#722ed1" name="Avg Resolution (days)" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rating"
                stroke="#faad14"
                strokeWidth={2}
                name="Customer Rating"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Table */}
        <Card title="Detailed Resolution Time Analysis">
          <Table
            columns={columns}
            dataSource={claimResolutionData}
            rowKey="category"
            pagination={false}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Action Plan */}
        <Card title="Resolution Time Optimization Strategy" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-red-900">
                  🚨 Critical: Water Purifier Delays
                </Title>
                <Paragraph className="text-red-800 !mb-0">
                  58 claims taking over 7 days (7.8 avg). Root cause: spare parts shortage + vendor delays.
                  Action: Partner with local suppliers, stock critical parts, switch from third-party to
                  in-house service for metro cities.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  ✅ Best Practice: Microwave Success
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  3.2 day avg resolution, 67% resolved under 24h. Key factors: modular design, readily
                  available parts, skilled technicians. Replicate this model for AC and TV categories.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  ⚡ Quick Wins
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  Service Center North resolves in 3.5 days (4.6 rating). Share their SOPs across all
                  centers. Reduce third-party dependency from 280 to 150 claims - they average 8.2 days.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  📊 Progress Tracking
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  29% improvement from Jan (6.8 days) to Jun (4.8 days). Set Q3 target: 4.0 day average,
                  70% under 24h, reduce delayed claims to under 10%. Monthly reviews with service heads.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default ClaimResolutionTimePage;
