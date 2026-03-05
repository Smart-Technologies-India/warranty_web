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
} from "antd";
import {
  ArrowLeftOutlined,
  RiseOutlined,
  TrophyOutlined,
  ShoppingOutlined,
  DownloadOutlined,
  FireOutlined,
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
  LineChart,
  Line,
  ComposedChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const { Title, Text, Paragraph } = Typography;

const topSoldProducts = [
  {
    rank: 1,
    productId: "P001",
    productName: 'Smart TV 55"',
    category: "Television",
    unitsSold: 3420,
    revenue: 28500000,
    avgPrice: 8333,
    growth: "+45.2%",
    marketShare: 18.5,
    status: "Hot Selling",
  },
  {
    rank: 2,
    productId: "P002",
    productName: "Washing Machine 7Kg",
    category: "Home Appliances",
    unitsSold: 2890,
    revenue: 22300000,
    avgPrice: 7715,
    growth: "+38.7%",
    marketShare: 15.6,
    status: "Hot Selling",
  },
  {
    rank: 3,
    productId: "P003",
    productName: "Refrigerator 350L",
    category: "Home Appliances",
    unitsSold: 2350,
    revenue: 19800000,
    avgPrice: 8426,
    growth: "+32.4%",
    marketShare: 12.7,
    status: "Bestseller",
  },
  {
    rank: 4,
    productId: "P004",
    productName: "Air Conditioner 1.5T",
    category: "Home Appliances",
    unitsSold: 2100,
    revenue: 17600000,
    avgPrice: 8381,
    growth: "+28.9%",
    marketShare: 11.3,
    status: "Bestseller",
  },
  {
    rank: 5,
    productId: "P005",
    productName: "Microwave Oven",
    category: "Kitchen Appliances",
    unitsSold: 1980,
    revenue: 12400000,
    avgPrice: 6263,
    growth: "+25.6%",
    marketShare: 10.7,
    status: "Bestseller",
  },
  {
    rank: 6,
    productId: "P006",
    productName: 'LED TV 43"',
    category: "Television",
    unitsSold: 1750,
    revenue: 9200000,
    avgPrice: 5257,
    growth: "+22.1%",
    marketShare: 9.5,
    status: "Good",
  },
  {
    rank: 7,
    productId: "P007",
    productName: "Ceiling Fan",
    category: "Fans",
    unitsSold: 1620,
    revenue: 4200000,
    avgPrice: 2593,
    growth: "+18.3%",
    marketShare: 8.8,
    status: "Good",
  },
  {
    rank: 8,
    productId: "P008",
    productName: "Water Purifier",
    category: "Water Solutions",
    unitsSold: 1450,
    revenue: 6800000,
    avgPrice: 4690,
    growth: "+15.7%",
    marketShare: 7.8,
    status: "Good",
  },
  {
    rank: 9,
    productId: "P009",
    productName: "Mixer Grinder",
    category: "Kitchen Appliances",
    unitsSold: 1280,
    revenue: 2900000,
    avgPrice: 2266,
    growth: "+12.4%",
    marketShare: 6.9,
    status: "Average",
  },
  {
    rank: 10,
    productId: "P010",
    productName: "Iron Box",
    category: "Small Appliances",
    unitsSold: 1100,
    revenue: 1100000,
    avgPrice: 1000,
    growth: "+8.2%",
    marketShare: 5.9,
    status: "Average",
  },
];

const monthlyTrend = [
  { month: "Jan", topProduct: 450, total: 2800 },
  { month: "Feb", topProduct: 520, total: 3100 },
  { month: "Mar", topProduct: 580, total: 3450 },
  { month: "Apr", topProduct: 550, total: 3250 },
  { month: "May", topProduct: 640, total: 3820 },
  { month: "Jun", topProduct: 680, total: 4020 },
];

const categoryDistribution = [
  { name: "Home Appliances", value: 7340, percentage: 39.7 },
  { name: "Television", value: 5170, percentage: 27.9 },
  { name: "Kitchen Appliances", value: 3260, percentage: 17.6 },
  { name: "Fans", value: 1620, percentage: 8.8 },
  { name: "Water Solutions", value: 1450, percentage: 7.8 },
];

const COLORS = ["#1890ff", "#52c41a", "#faad14", "#722ed1", "#f5222d"];

const TopSoldProductsPage: React.FC = () => {
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
      width: 80,
      render: (rank: number) => (
        <div className="flex items-center gap-2">
          {rank <= 3 ? (
            <TrophyOutlined
              className="text-2xl"
              style={{
                color:
                  rank === 1 ? "#faad14" : rank === 2 ? "#bfbfbf" : "#cd7f32",
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
      title: "Units Sold",
      dataIndex: "unitsSold",
      key: "unitsSold",
      sorter: (a: any, b: any) => b.unitsSold - a.unitsSold,
      render: (units: number) => (
        <div>
          <Text strong className="text-lg" style={{ color: "#1890ff" }}>
            {units.toLocaleString()}
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            units
          </Text>
        </div>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      sorter: (a: any, b: any) => b.revenue - a.revenue,
      render: (value: number) => (
        <div>
          <Text strong style={{ color: "#52c41a" }}>
            {formatCurrency(value)}
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            {(value / 1000000).toFixed(2)}M
          </Text>
        </div>
      ),
    },
    {
      title: "Avg Price",
      dataIndex: "avgPrice",
      key: "avgPrice",
      render: (price: number) => <Text>{formatCurrency(price)}</Text>,
    },
    {
      title: "Market Share",
      dataIndex: "marketShare",
      key: "marketShare",
      render: (share: number) => (
        <div style={{ width: 120 }}>
          <Progress percent={share} size="small" />
        </div>
      ),
    },
    {
      title: "Growth",
      dataIndex: "growth",
      key: "growth",
      render: (growth: string) => (
        <Tag color="green" icon={<RiseOutlined />}>
          {growth}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Hot Selling"
            ? "red"
            : status === "Bestseller"
              ? "orange"
              : status === "Good"
                ? "green"
                : "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const totalUnitsSold = topSoldProducts.reduce(
    (sum, item) => sum + item.unitsSold,
    0,
  );
  const totalRevenue = topSoldProducts.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const avgGrowth =
    topSoldProducts.reduce(
      (sum, item) => sum + parseFloat(item.growth.replace(/[+%]/g, "")),
      0,
    ) / topSoldProducts.length;

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
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <RiseOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Top Sold Products
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Best-selling products with quantity and revenue metrics
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
                title="Total Units Sold"
                value={totalUnitsSold}
                valueStyle={{ color: "#1890ff" }}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={totalRevenue / 10000000}
                precision={2}
                suffix="Cr"
                prefix="₹"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Top Seller"
                value={topSoldProducts[0].unitsSold}
                suffix="units"
                valueStyle={{ color: "#faad14" }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Growth Rate"
                value={avgGrowth}
                precision={1}
                suffix="%"
                valueStyle={{ color: "#52c41a" }}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={16}>
            <Card title="Top 10 Products - Units Sold Comparison">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topSoldProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="productName"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="unitsSold" fill="#1890ff" name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Category Distribution">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload }) =>
                      `${payload?.name}: ${payload?.percentage}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Revenue vs Units Trend */}
        <Card title="6-Month Sales Trend" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                fill="#1890ff"
                stroke="#1890ff"
                fillOpacity={0.6}
                name="Total Products"
              />
              <Line
                type="monotone"
                dataKey="topProduct"
                stroke="#52c41a"
                strokeWidth={3}
                name="Top Product (Smart TV)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Table */}
        <Card title="Detailed Product Performance Analysis">
          <Table
            columns={columns}
            dataSource={topSoldProducts}
            rowKey="productId"
            pagination={false}
            scroll={{ x: 1300 }}
          />
        </Card>

        {/* Insights */}
        <Card title="Key Insights & Strategic Recommendations" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  🏆 Market Leaders
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  Smart TV 55" dominates with 3,420 units sold and 45.2% growth.
                  This product alone contributes 18.5% of total market share,
                  indicating strong brand preference.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  📊 Category Performance
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  Home Appliances lead with 39.7% share (7,340 units).
                  Television category follows with 27.9% share, showing balanced
                  portfolio across major categories.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-purple-900">
                  📈 Growth Trends
                </Title>
                <Paragraph className="text-purple-800 !mb-0">
                  All top 10 products show positive growth (8.2% to 45.2%) with
                  average of 24.8%. Focus inventory and marketing on these
                  proven winners for maximum ROI.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  💡 Action Items
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  Increase stock allocation for top 5 products by 30% based on
                  growth trajectory. Launch bundle offers combining hot-selling
                  items to boost average transaction value.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default TopSoldProductsPage;
