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
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  DownloadOutlined,
  SmileOutlined,
  ShoppingOutlined,
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
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
} from "recharts";

const { Title, Text, Paragraph } = Typography;

const leastClaimedProducts = [
  {
    rank: 1,
    productId: "P010",
    productName: "Iron Box",
    category: "Small Appliances",
    totalSold: 1100,
    totalClaims: 15,
    claimRate: 1.36,
    qualityScore: 98.64,
    avgLifespan: "8.5 years",
    customerRating: 4.8,
    status: "Excellent",
  },
  {
    rank: 2,
    productId: "P009",
    productName: "Mixer Grinder",
    category: "Kitchen Appliances",
    totalSold: 1280,
    totalClaims: 22,
    claimRate: 1.72,
    qualityScore: 98.28,
    avgLifespan: "7.2 years",
    customerRating: 4.7,
    status: "Excellent",
  },
  {
    rank: 3,
    productId: "P007",
    productName: "Ceiling Fan",
    category: "Fans",
    totalSold: 1620,
    totalClaims: 28,
    claimRate: 1.73,
    qualityScore: 98.27,
    avgLifespan: "9.1 years",
    customerRating: 4.6,
    status: "Excellent",
  },
  {
    rank: 4,
    productId: "P006",
    productName: "LED TV 43\"",
    category: "Television",
    totalSold: 1750,
    totalClaims: 42,
    claimRate: 2.40,
    qualityScore: 97.60,
    avgLifespan: "6.5 years",
    customerRating: 4.5,
    status: "Very Good",
  },
  {
    rank: 5,
    productId: "P008",
    productName: "Water Purifier",
    category: "Water Solutions",
    totalSold: 1450,
    totalClaims: 35,
    claimRate: 2.41,
    qualityScore: 97.59,
    avgLifespan: "5.8 years",
    customerRating: 4.6,
    status: "Very Good",
  },
  {
    rank: 6,
    productId: "P001",
    productName: "Smart TV 55\"",
    category: "Television",
    totalSold: 3420,
    totalClaims: 87,
    claimRate: 2.54,
    qualityScore: 97.46,
    avgLifespan: "7.0 years",
    customerRating: 4.7,
    status: "Very Good",
  },
  {
    rank: 7,
    productId: "P005",
    productName: "Microwave Oven",
    category: "Kitchen Appliances",
    totalSold: 1980,
    totalClaims: 54,
    claimRate: 2.73,
    qualityScore: 97.27,
    avgLifespan: "6.3 years",
    customerRating: 4.4,
    status: "Good",
  },
  {
    rank: 8,
    productId: "P004",
    productName: "Air Conditioner 1.5T",
    category: "Home Appliances",
    totalSold: 2100,
    totalClaims: 76,
    claimRate: 3.62,
    qualityScore: 96.38,
    avgLifespan: "8.2 years",
    customerRating: 4.3,
    status: "Good",
  },
];

const categoryQuality = [
  { category: "Small Appliances", avgClaimRate: 1.36, qualityScore: 98.64 },
  { category: "Fans", avgClaimRate: 1.73, qualityScore: 98.27 },
  { category: "Kitchen Appliances", avgClaimRate: 2.23, qualityScore: 97.78 },
  { category: "Television", avgClaimRate: 2.47, qualityScore: 97.53 },
  { category: "Water Solutions", avgClaimRate: 2.41, qualityScore: 97.59 },
  { category: "Home Appliances", avgClaimRate: 3.90, qualityScore: 96.10 },
];

const monthlyQualityTrend = [
  { month: "Jan", claimRate: 2.8, satisfaction: 4.5 },
  { month: "Feb", claimRate: 2.6, satisfaction: 4.6 },
  { month: "Mar", claimRate: 2.4, satisfaction: 4.6 },
  { month: "Apr", claimRate: 2.5, satisfaction: 4.5 },
  { month: "May", claimRate: 2.3, satisfaction: 4.7 },
  { month: "Jun", claimRate: 2.2, satisfaction: 4.7 },
];

const COLORS = ["#52c41a", "#1890ff", "#13c2c2", "#722ed1", "#faad14", "#fa8c16"];

const LeastClaimedProductsPage: React.FC = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("last-6-months");

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      render: (rank: number) => (
        <div className="flex items-center gap-2">
          {rank <= 3 ? (
            <TrophyOutlined
              className="text-2xl"
              style={{
                color: rank === 1 ? "#faad14" : rank === 2 ? "#bfbfbf" : "#cd7f32",
              }}
            />
          ) : (
            <Text strong className="text-lg">
              #{rank}
            </Text>
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
      sorter: (a: any, b: any) => a.totalClaims - b.totalClaims,
      render: (claims: number) => (
        <Text strong className="text-lg" style={{ color: "#52c41a" }}>
          {claims}
        </Text>
      ),
    },
    {
      title: "Claim Rate",
      dataIndex: "claimRate",
      key: "claimRate",
      sorter: (a: any, b: any) => a.claimRate - b.claimRate,
      render: (rate: number) => (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          {rate}%
        </Tag>
      ),
    },
    {
      title: "Quality Score",
      dataIndex: "qualityScore",
      key: "qualityScore",
      render: (score: number) => (
        <div>
          <Text strong style={{ color: "#52c41a" }}>
            {score}%
          </Text>
        </div>
      ),
    },
    {
      title: "Avg Lifespan",
      dataIndex: "avgLifespan",
      key: "avgLifespan",
      render: (lifespan: string) => <Text className="text-sm">{lifespan}</Text>,
    },
    {
      title: "Rating",
      dataIndex: "customerRating",
      key: "customerRating",
      render: (rating: number) => (
        <Tag color="blue" icon={<SmileOutlined />}>
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
          status === "Excellent" ? "green" : status === "Very Good" ? "blue" : "cyan";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const avgQualityScore =
    leastClaimedProducts.reduce((sum, p) => sum + p.qualityScore, 0) / leastClaimedProducts.length;
  const avgClaimRate =
    leastClaimedProducts.reduce((sum, p) => sum + p.claimRate, 0) / leastClaimedProducts.length;
  const totalSold = leastClaimedProducts.reduce((sum, p) => sum + p.totalSold, 0);

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
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircleOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Most Reliable Products
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Products with lowest claim rates - quality indicators and best performers
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
                title="Avg Quality Score"
                value={avgQualityScore}
                precision={2}
                suffix="%"
                valueStyle={{ color: "#52c41a" }}
                prefix={<TrophyOutlined />}
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
                valueStyle={{ color: "#52c41a" }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Units Sold"
                value={totalSold}
                valueStyle={{ color: "#1890ff" }}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Best Performer"
                value="Iron Box"
                valueStyle={{ fontSize: "16px", color: "#faad14" }}
                prefix={<TrophyOutlined />}
              />
              <Text type="secondary" className="text-sm">
                1.36% claim rate
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={16}>
            <Card title="Quality Score Comparison">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={leastClaimedProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="productName" angle={-45} textAnchor="end" height={120} />
                  <YAxis domain={[95, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="qualityScore" fill="#52c41a" name="Quality Score %" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Category Quality">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryQuality}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.category}: ${entry.qualityScore.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="qualityScore"
                  >
                    {categoryQuality.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Quality Trend */}
        <Card title="Quality Trend - Claim Rate & Satisfaction" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyQualityTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" domain={[0, 5]} />
              <YAxis yAxisId="right" orientation="right" domain={[4, 5]} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="claimRate" fill="#52c41a" name="Claim Rate %" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="satisfaction"
                stroke="#1890ff"
                strokeWidth={2}
                name="Customer Satisfaction"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Analysis */}
        <Card title="Category-wise Quality Analysis" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryQuality}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-20} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="qualityScore" fill="#52c41a" name="Quality Score %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Table */}
        <Card title="Detailed Product Reliability Analysis">
          <Table
            columns={columns}
            dataSource={leastClaimedProducts}
            rowKey="productId"
            pagination={false}
            scroll={{ x: 1300 }}
          />
        </Card>

        {/* Success Insights */}
        <Card title="Quality Excellence Insights" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  🏆 Outstanding Quality
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  Top 3 products (Iron Box, Mixer Grinder, Ceiling Fan) have claim rates under 1.73% with
                  98%+ quality scores. These should be showcase products in marketing campaigns.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  📈 Quality Trend
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  Claim rates improved from 2.8% (Jan) to 2.2% (Jun) - a 21% reduction. Customer
                  satisfaction increased to 4.7/5, indicating consistent quality improvements.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-purple-900">
                  🔧 Best Practices
                </Title>
                <Paragraph className="text-purple-800 !mb-0">
                  Analyze supplier and manufacturing processes of top performers. Apply their quality
                  standards to underperforming products (Washing Machine, Refrigerator) to reduce claims.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  💡 Marketing Leverage
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  Promote "98% reliability" ratings in campaigns. Offer extended warranties on these
                  products at premium - low claim rates make it profitable while building trust.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default LeastClaimedProductsPage;
