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
  Progress,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  WarningOutlined,
  ShoppingOutlined,
  DownloadOutlined,
  AlertOutlined,
  FallOutlined,
  DollarOutlined,
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
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const { Title, Text, Paragraph } = Typography;

const mostClaimedProducts = [
  {
    rank: 1,
    productId: "P002",
    productName: "Washing Machine 7Kg",
    category: "Home Appliances",
    totalSold: 2890,
    totalClaims: 125,
    claimRate: 4.32,
    warrantyClaimCost: 875000,
    avgClaimValue: 7000,
    topIssue: "Motor Failure",
    status: "Critical",
  },
  {
    rank: 2,
    productId: "P003",
    productName: "Refrigerator 350L",
    category: "Home Appliances",
    totalSold: 2350,
    totalClaims: 98,
    claimRate: 4.17,
    warrantyClaimCost: 784000,
    avgClaimValue: 8000,
    topIssue: "Cooling Issue",
    status: "Critical",
  },
  {
    rank: 3,
    productId: "P001",
    productName: 'Smart TV 55"',
    category: "Television",
    totalSold: 3420,
    totalClaims: 87,
    claimRate: 2.54,
    warrantyClaimCost: 609000,
    avgClaimValue: 7000,
    topIssue: "Display Defect",
    status: "High",
  },
  {
    rank: 4,
    productId: "P004",
    productName: "Air Conditioner 1.5T",
    category: "Home Appliances",
    totalSold: 2100,
    totalClaims: 76,
    claimRate: 3.62,
    warrantyClaimCost: 684000,
    avgClaimValue: 9000,
    topIssue: "Gas Leakage",
    status: "High",
  },
  {
    rank: 5,
    productId: "P005",
    productName: "Microwave Oven",
    category: "Kitchen Appliances",
    totalSold: 1980,
    totalClaims: 54,
    claimRate: 2.73,
    warrantyClaimCost: 270000,
    avgClaimValue: 5000,
    topIssue: "Heating Element",
    status: "Medium",
  },
  {
    rank: 6,
    productId: "P006",
    productName: 'LED TV 43"',
    category: "Television",
    totalSold: 1750,
    totalClaims: 42,
    claimRate: 2.4,
    warrantyClaimCost: 252000,
    avgClaimValue: 6000,
    topIssue: "Power Issue",
    status: "Medium",
  },
  {
    rank: 7,
    productId: "P008",
    productName: "Water Purifier",
    category: "Water Solutions",
    totalSold: 1450,
    totalClaims: 35,
    claimRate: 2.41,
    warrantyClaimCost: 175000,
    avgClaimValue: 5000,
    topIssue: "Filter Problem",
    status: "Medium",
  },
  {
    rank: 8,
    productId: "P007",
    productName: "Ceiling Fan",
    category: "Fans",
    totalSold: 1620,
    totalClaims: 28,
    claimRate: 1.73,
    warrantyClaimCost: 84000,
    avgClaimValue: 3000,
    topIssue: "Noise Issue",
    status: "Low",
  },
  {
    rank: 9,
    productId: "P009",
    productName: "Mixer Grinder",
    category: "Kitchen Appliances",
    totalSold: 1280,
    totalClaims: 22,
    claimRate: 1.72,
    warrantyClaimCost: 66000,
    avgClaimValue: 3000,
    topIssue: "Blade Issue",
    status: "Low",
  },
  {
    rank: 10,
    productId: "P010",
    productName: "Iron Box",
    category: "Small Appliances",
    totalSold: 1100,
    totalClaims: 15,
    claimRate: 1.36,
    warrantyClaimCost: 30000,
    avgClaimValue: 2000,
    topIssue: "Temperature Control",
    status: "Low",
  },
];

const issueCategories = [
  { issue: "Motor/Compressor Failure", count: 185, percentage: 32.5 },
  { issue: "Display/Screen Defects", count: 129, percentage: 22.7 },
  { issue: "Cooling/Heating Issues", count: 112, percentage: 19.7 },
  { issue: "Power/Electrical", count: 78, percentage: 13.7 },
  { issue: "Mechanical Parts", count: 50, percentage: 8.8 },
  { issue: "Other", count: 15, percentage: 2.6 },
];

const monthlyClaimsTrend = [
  { month: "Jan", claims: 82, cost: 574000 },
  { month: "Feb", claims: 91, cost: 637000 },
  { month: "Mar", claims: 98, cost: 686000 },
  { month: "Apr", claims: 87, cost: 609000 },
  { month: "May", claims: 105, cost: 735000 },
  { month: "Jun", claims: 115, cost: 805000 },
];

const categoryAnalysis = [
  { category: "Home Appliances", claims: 299, claimRate: 4.04, cost: 2343000 },
  { category: "Television", claims: 129, claimRate: 2.49, cost: 861000 },
  { category: "Kitchen Appliances", claims: 76, claimRate: 2.33, cost: 336000 },
  { category: "Water Solutions", claims: 35, claimRate: 2.41, cost: 175000 },
  { category: "Fans", claims: 28, claimRate: 1.73, cost: 84000 },
  { category: "Small Appliances", claims: 15, claimRate: 1.36, cost: 30000 },
];

const COLORS = [
  "#f5222d",
  "#fa8c16",
  "#faad14",
  "#52c41a",
  "#1890ff",
  "#722ed1",
];

const MostClaimedProductsPage: React.FC = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("last-6-months");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 70,
      render: (rank: number) => (
        <div className="flex items-center gap-2">
          {rank <= 3 ? (
            <AlertOutlined
              className="text-2xl"
              style={{
                color:
                  rank === 1 ? "#f5222d" : rank === 2 ? "#fa8c16" : "#faad14",
              }}
            />
          ) : (
            <Text strong>#{rank}</Text>
          )}
        </div>
      ),
    },
    {
      title: "Product Details",
      dataIndex: "productName",
      key: "productName",
      render: (_: any, record: any) => (
        <div>
          <Text strong className="text-base">
            {record.productName}
          </Text>
          <br />
          <Text type="secondary" className="text-sm">
            {record.category} • ID: {record.productId}
          </Text>
        </div>
      ),
    },
    {
      title: "Total Sold",
      dataIndex: "totalSold",
      key: "totalSold",
      render: (sold: number) => <Text>{sold.toLocaleString()}</Text>,
    },
    {
      title: "Total Claims",
      dataIndex: "totalClaims",
      key: "totalClaims",
      sorter: (a: any, b: any) => b.totalClaims - a.totalClaims,
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
      sorter: (a: any, b: any) => b.claimRate - a.claimRate,
      render: (rate: number) => (
        <div>
          <Tag
            color={
              rate > 4
                ? "red"
                : rate > 3
                  ? "orange"
                  : rate > 2
                    ? "gold"
                    : "green"
            }
          >
            {rate}%
          </Tag>
          <Progress
            percent={rate}
            size="small"
            strokeColor={
              rate > 4 ? "#f5222d" : rate > 3 ? "#fa8c16" : "#52c41a"
            }
            showInfo={false}
            className="mt-1"
          />
        </div>
      ),
    },
    {
      title: "Warranty Cost",
      dataIndex: "warrantyClaimCost",
      key: "warrantyClaimCost",
      sorter: (a: any, b: any) => b.warrantyClaimCost - a.warrantyClaimCost,
      render: (cost: number) => (
        <div>
          <Text strong style={{ color: "#f5222d" }}>
            {formatCurrency(cost)}
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            {(cost / 100000).toFixed(2)}L
          </Text>
        </div>
      ),
    },
    {
      title: "Top Issue",
      dataIndex: "topIssue",
      key: "topIssue",
      render: (issue: string) => <Text className="text-sm">{issue}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Critical"
            ? "red"
            : status === "High"
              ? "orange"
              : status === "Medium"
                ? "gold"
                : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const totalClaims = mostClaimedProducts.reduce(
    (sum, item) => sum + item.totalClaims,
    0,
  );
  const totalWarrantyCost = mostClaimedProducts.reduce(
    (sum, item) => sum + item.warrantyClaimCost,
    0,
  );
  const avgClaimRate =
    mostClaimedProducts.reduce((sum, item) => sum + item.claimRate, 0) /
    mostClaimedProducts.length;

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
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <WarningOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Products with Most Claims
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Analysis of products receiving highest number of warranty
                  claims
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

        {/* Alert Banner */}
        <Alert
          message="Quality Alert: High Claim Rates Detected"
          description="Washing Machine and Refrigerator have claim rates above 4%. Immediate quality review and supplier evaluation recommended."
          type="error"
          icon={<AlertOutlined />}
          showIcon
          className="mb-6"
        />

        {/* Key Metrics */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Claims"
                value={totalClaims}
                valueStyle={{ color: "#f5222d" }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Warranty Cost"
                value={totalWarrantyCost / 100000}
                precision={2}
                suffix="L"
                prefix="₹"
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Claim Rate"
                value={avgClaimRate}
                precision={2}
                suffix="%"
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Critical Products"
                value={
                  mostClaimedProducts.filter((p) => p.status === "Critical")
                    .length
                }
                valueStyle={{ color: "#f5222d" }}
                prefix={<AlertOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={16}>
            <Card title="Top 10 Products - Claims Comparison">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={mostClaimedProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="productName"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="totalClaims"
                    fill="#f5222d"
                    name="Total Claims"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="claimRate"
                    stroke="#fa8c16"
                    strokeWidth={2}
                    name="Claim Rate %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Issue Categories">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={issueCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload }) =>
                      `${payload?.status}: ${payload?.percentage}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {issueCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {issueCategories.slice(0, 4).map((issue, index) => (
                  <div key={issue.issue} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <Text className="text-xs">{issue.issue}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Monthly Trend */}
        <Card title="6-Month Claims & Cost Trend" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyClaimsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: any) =>
                  typeof value === "number" && value > 1000
                    ? formatCurrency(Number(value))
                    : value
                }
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="claims"
                fill="#f5222d"
                name="Claims Count"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cost"
                stroke="#fa8c16"
                strokeWidth={2}
                name="Warranty Cost"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Analysis */}
        <Card title="Category-wise Claim Analysis" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                angle={-20}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="claims" fill="#f5222d" name="Total Claims" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Table */}
        <Card title="Detailed Product Claim Analysis">
          <Table
            columns={columns}
            dataSource={mostClaimedProducts}
            rowKey="productId"
            pagination={false}
            scroll={{ x: 1400 }}
          />
        </Card>

        {/* Action Plan */}
        <Card title="Quality Improvement Action Plan" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-red-900">
                  🚨 Immediate Quality Review
                </Title>
                <Paragraph className="text-red-800 !mb-0">
                  Washing Machine (4.32%) and Refrigerator (4.17%) require
                  urgent supplier quality audit. Implement enhanced QC checks
                  before shipment and consider supplier change if issues
                  persist.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  💰 Cost Reduction Strategy
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  Total warranty cost: ₹38.29L for top 10 products. Focus on
                  preventive measures for top 3 products which account for 61%
                  of total warranty cost.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  🔧 Issue Resolution
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  Motor/Compressor failures (32.5%) are the leading issue.
                  Negotiate better warranties with component suppliers and
                  provide preventive maintenance guides to customers.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  📊 Benchmark Best Performers
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  Iron Box (1.36%), Mixer Grinder (1.72%), and Ceiling Fan
                  (1.73%) show excellent quality. Apply their supplier quality
                  standards and manufacturing processes to other products.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default MostClaimedProductsPage;
