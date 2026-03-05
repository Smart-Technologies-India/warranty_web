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
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  DownloadOutlined,
  TrophyOutlined,
  BarChartOutlined,
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

const productRevenueData = [
  {
    id: "P001",
    productName: 'Smart TV 55"',
    category: "Television",
    revenue: 28500000,
    units: 1250,
    avgPrice: 22800,
    margin: 18.5,
    growth: "+32.5%",
    contribution: 22.8,
    status: "Hot",
  },
  {
    id: "P002",
    productName: "Washing Machine 7Kg",
    category: "Home Appliances",
    revenue: 22300000,
    units: 980,
    avgPrice: 22755,
    margin: 16.2,
    growth: "+28.3%",
    contribution: 17.9,
    status: "Hot",
  },
  {
    id: "P003",
    productName: "Refrigerator 350L",
    category: "Home Appliances",
    revenue: 19800000,
    units: 856,
    avgPrice: 23131,
    margin: 19.8,
    growth: "+24.7%",
    contribution: 15.9,
    status: "Good",
  },
  {
    id: "P004",
    productName: "Air Conditioner 1.5T",
    category: "Home Appliances",
    revenue: 17600000,
    units: 742,
    avgPrice: 23721,
    margin: 21.3,
    growth: "+19.2%",
    contribution: 14.1,
    status: "Good",
  },
  {
    id: "P005",
    productName: "Microwave Oven",
    category: "Kitchen Appliances",
    revenue: 12400000,
    units: 1580,
    avgPrice: 7848,
    margin: 14.5,
    growth: "+15.8%",
    contribution: 9.9,
    status: "Good",
  },
  {
    id: "P006",
    productName: 'LED TV 43"',
    category: "Television",
    revenue: 9200000,
    units: 685,
    avgPrice: 13431,
    margin: 15.2,
    growth: "+12.4%",
    contribution: 7.4,
    status: "Average",
  },
  {
    id: "P007",
    productName: "Water Purifier",
    category: "Water Solutions",
    revenue: 6800000,
    units: 425,
    avgPrice: 16000,
    margin: 22.5,
    growth: "+8.5%",
    contribution: 5.4,
    status: "Average",
  },
  {
    id: "P008",
    productName: "Ceiling Fan",
    category: "Fans",
    revenue: 4200000,
    units: 1240,
    avgPrice: 3387,
    margin: 12.3,
    growth: "+5.2%",
    contribution: 3.4,
    status: "Average",
  },
  {
    id: "P009",
    productName: "Mixer Grinder",
    category: "Kitchen Appliances",
    revenue: 2900000,
    units: 890,
    avgPrice: 3258,
    margin: 13.8,
    growth: "+3.1%",
    contribution: 2.3,
    status: "Slow",
  },
  {
    id: "P010",
    productName: "Iron Box",
    category: "Small Appliances",
    revenue: 1100000,
    units: 620,
    avgPrice: 1774,
    margin: 11.2,
    growth: "-2.5%",
    contribution: 0.9,
    status: "Slow",
  },
];

const categoryData = [
  { name: "Television", value: 37700000, percentage: 30.2 },
  { name: "Home Appliances", value: 59700000, percentage: 47.8 },
  { name: "Kitchen Appliances", value: 15300000, percentage: 12.3 },
  { name: "Water Solutions", value: 6800000, percentage: 5.4 },
  { name: "Small Appliances", value: 5300000, percentage: 4.2 },
];

const monthlyTrend = [
  { month: "Jan", topProduct: 3800000, category: 8500000 },
  { month: "Feb", topProduct: 4200000, category: 9200000 },
  { month: "Mar", topProduct: 4600000, category: 10100000 },
  { month: "Apr", topProduct: 4400000, category: 9800000 },
  { month: "May", topProduct: 5100000, category: 11200000 },
  { month: "Jun", topProduct: 6400000, category: 12800000 },
];

const COLORS = ["#1890ff", "#52c41a", "#faad14", "#722ed1", "#f5222d"];

const RevenueByProductPage: React.FC = () => {
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
      key: "rank",
      width: 70,
      render: (_: any, __: any, index: number) => (
        <div className="flex items-center gap-2">
          {index < 3 ? (
            <TrophyOutlined
              className="text-xl"
              style={{
                color:
                  index === 0 ? "#faad14" : index === 1 ? "#bfbfbf" : "#cd7f32",
              }}
            />
          ) : (
            <Text strong>#{index + 1}</Text>
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
            {record.category} • ID: {record.id}
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
          <Text strong className="text-lg" style={{ color: "#52c41a" }}>
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
      title: "Units Sold",
      dataIndex: "units",
      key: "units",
      render: (units: number) => <Text strong>{units.toLocaleString()}</Text>,
    },
    {
      title: "Avg Price",
      dataIndex: "avgPrice",
      key: "avgPrice",
      render: (price: number) => <Text>{formatCurrency(price)}</Text>,
    },
    {
      title: "Margin",
      dataIndex: "margin",
      key: "margin",
      render: (margin: number) => (
        <Tag color={margin >= 20 ? "green" : margin >= 15 ? "blue" : "orange"}>
          {margin}%
        </Tag>
      ),
    },
    {
      title: "Growth",
      dataIndex: "growth",
      key: "growth",
      render: (growth: string) => (
        <Tag
          color={growth.startsWith("+") ? "green" : "red"}
          icon={growth.startsWith("+") ? <RiseOutlined /> : <FallOutlined />}
        >
          {growth}
        </Tag>
      ),
    },
    {
      title: "Contribution",
      dataIndex: "contribution",
      key: "contribution",
      render: (contribution: number) => (
        <div style={{ width: 120 }}>
          <Progress percent={contribution} size="small" />
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Hot"
            ? "red"
            : status === "Good"
              ? "green"
              : status === "Average"
                ? "blue"
                : "orange";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const totalRevenue = productRevenueData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const totalUnits = productRevenueData.reduce(
    (sum, item) => sum + item.units,
    0,
  );

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
                <ShoppingOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Revenue by Product
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Product-wise revenue breakdown and contribution analysis
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
                title="Total Units Sold"
                value={totalUnits}
                valueStyle={{ color: "#1890ff" }}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Top Product Revenue"
                value={productRevenueData[0].revenue / 10000000}
                precision={2}
                suffix="Cr"
                prefix="₹"
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Product Categories"
                value={categoryData.length}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={16}>
            <Card title="Top 10 Products - Revenue Comparison">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={productRevenueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="productName" type="category" width={150} />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#52c41a" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Category Distribution">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryData}
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
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Monthly Trend */}
        <Card title="6-Month Revenue Trend" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Legend />
              <Bar
                dataKey="topProduct"
                fill="#1890ff"
                name="Top Product (Smart TV)"
              />
              <Line
                type="monotone"
                dataKey="category"
                stroke="#52c41a"
                strokeWidth={2}
                name="Category Total"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Table */}
        <Card title="Detailed Product Revenue Analysis">
          <Table
            columns={columns}
            dataSource={productRevenueData}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1400 }}
          />
        </Card>

        {/* Insights */}
        <Card title="Key Insights & Recommendations" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  💰 Top Revenue Drivers
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  Top 3 products contribute 56.6% of total revenue. Smart TV 55"
                  leads with ₹2.85Cr and 32.5% growth, showing strong consumer
                  demand.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  📊 Category Analysis
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  Home Appliances dominate with 47.8% share. Opportunity to grow
                  Kitchen Appliances (12.3%) and Water Solutions (5.4%)
                  categories.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  📉 Underperformers
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  Iron Box shows -2.5% growth with only 0.9% contribution.
                  Consider discontinuing or bundling with other products to
                  improve performance.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-purple-900">
                  💡 Profit Optimization
                </Title>
                <Paragraph className="text-purple-800 !mb-0">
                  AC and Water Purifier have highest margins (21%+). Focus
                  promotional campaigns on these high-margin products to
                  maximize profitability.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default RevenueByProductPage;
