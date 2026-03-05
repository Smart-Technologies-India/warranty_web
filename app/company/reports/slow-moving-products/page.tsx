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
  FallOutlined,
  ShoppingOutlined,
  DownloadOutlined,
  WarningOutlined,
  DollarOutlined,
  InboxOutlined,
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

const slowMovingProducts = [
  {
    rank: 1,
    productId: "P010",
    productName: "Iron Box",
    category: "Small Appliances",
    totalStock: 1850,
    sold: 1100,
    pending: 750,
    monthlyAvgSales: 92,
    daysToSellOut: 245,
    inventoryCost: 1100000,
    recommendation: "Clearance Sale",
    status: "Critical",
  },
  {
    rank: 2,
    productId: "P009",
    productName: "Mixer Grinder",
    category: "Kitchen Appliances",
    totalStock: 1680,
    sold: 1280,
    pending: 400,
    monthlyAvgSales: 107,
    daysToSellOut: 112,
    inventoryCost: 920000,
    recommendation: "Bundle Offer",
    status: "High",
  },
  {
    rank: 3,
    productId: "P007",
    productName: "Ceiling Fan",
    category: "Fans",
    totalStock: 2150,
    sold: 1620,
    pending: 530,
    monthlyAvgSales: 135,
    daysToSellOut: 118,
    inventoryCost: 1325000,
    recommendation: "Seasonal Promotion",
    status: "High",
  },
  {
    rank: 4,
    productId: "P008",
    productName: "Water Purifier",
    category: "Water Solutions",
    totalStock: 1580,
    sold: 1450,
    pending: 130,
    monthlyAvgSales: 121,
    daysToSellOut: 32,
    inventoryCost: 650000,
    recommendation: "Maintain",
    status: "Medium",
  },
  {
    rank: 5,
    productId: "P006",
    productName: "LED TV 43\"",
    category: "Television",
    totalStock: 1920,
    sold: 1750,
    pending: 170,
    monthlyAvgSales: 146,
    daysToSellOut: 35,
    inventoryCost: 1020000,
    recommendation: "Maintain",
    status: "Medium",
  },
  {
    rank: 6,
    productId: "P005",
    productName: "Microwave Oven",
    category: "Kitchen Appliances",
    totalStock: 2180,
    sold: 1980,
    pending: 200,
    monthlyAvgSales: 165,
    daysToSellOut: 36,
    inventoryCost: 1000000,
    recommendation: "Normal",
    status: "Low",
  },
  {
    rank: 7,
    productId: "P004",
    productName: "Air Conditioner 1.5T",
    category: "Home Appliances",
    totalStock: 2250,
    sold: 2100,
    pending: 150,
    monthlyAvgSales: 175,
    daysToSellOut: 26,
    inventoryCost: 1275000,
    recommendation: "Normal",
    status: "Low",
  },
  {
    rank: 8,
    productId: "P003",
    productName: "Refrigerator 350L",
    category: "Home Appliances",
    totalStock: 2480,
    sold: 2350,
    pending: 130,
    monthlyAvgSales: 196,
    daysToSellOut: 20,
    inventoryCost: 1105000,
    recommendation: "Performing Well",
    status: "Good",
  },
];

const categoryAnalysis = [
  { category: "Small Appliances", avgDays: 245, pendingValue: 1100000, status: "Critical" },
  { category: "Kitchen Appliances", avgDays: 74, pendingValue: 1920000, status: "Medium" },
  { category: "Fans", avgDays: 118, pendingValue: 1325000, status: "High" },
  { category: "Water Solutions", avgDays: 32, pendingValue: 650000, status: "Good" },
  { category: "Television", avgDays: 35, pendingValue: 1020000, status: "Good" },
  { category: "Home Appliances", avgDays: 23, pendingValue: 2380000, status: "Excellent" },
];

const monthlyTrend = [
  { month: "Jan", slowMoving: 1250, total: 8500 },
  { month: "Feb", slowMoving: 1180, total: 9200 },
  { month: "Mar", slowMoving: 1320, total: 10100 },
  { month: "Apr", slowMoving: 1420, total: 9800 },
  { month: "May", slowMoving: 1350, total: 11200 },
  { month: "Jun", slowMoving: 1280, total: 10750 },
];

const COLORS = ["#f5222d", "#fa8c16", "#faad14", "#52c41a", "#1890ff", "#722ed1"];

const SlowMovingProductsPage: React.FC = () => {
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
      render: (rank: number) => <Text strong>#{rank}</Text>,
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
      title: "Stock Status",
      key: "stock",
      render: (_: any, record: any) => (
        <div>
          <Text>
            <Text type="secondary">Sold:</Text> <Text strong>{record.sold}</Text>
          </Text>
          <br />
          <Text>
            <Text type="secondary">Pending:</Text>{" "}
            <Text strong style={{ color: "#fa8c16" }}>
              {record.pending}
            </Text>
          </Text>
        </div>
      ),
    },
    {
      title: "Days to Sell Out",
      dataIndex: "daysToSellOut",
      key: "daysToSellOut",
      sorter: (a: any, b: any) => b.daysToSellOut - a.daysToSellOut,
      render: (days: number) => (
        <Tag color={days > 180 ? "red" : days > 90 ? "orange" : days > 60 ? "gold" : "green"}>
          {days} days
        </Tag>
      ),
    },
    {
      title: "Monthly Avg Sales",
      dataIndex: "monthlyAvgSales",
      key: "monthlyAvgSales",
      render: (sales: number) => <Text>{sales} units</Text>,
    },
    {
      title: "Inventory Cost",
      dataIndex: "inventoryCost",
      key: "inventoryCost",
      render: (cost: number) => (
        <Text strong style={{ color: "#f5222d" }}>
          {formatCurrency(cost)}
        </Text>
      ),
    },
    {
      title: "Recommendation",
      dataIndex: "recommendation",
      key: "recommendation",
      render: (rec: string) => <Text className="text-sm">{rec}</Text>,
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
            : status === "Low"
            ? "blue"
            : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const totalPendingStock = slowMovingProducts.reduce((sum, item) => sum + item.pending, 0);
  const totalInventoryCost = slowMovingProducts.reduce((sum, item) => sum + item.inventoryCost, 0);
  const criticalProducts = slowMovingProducts.filter((p) => p.status === "Critical" || p.status === "High").length;

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
                <FallOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Slow-Moving Products
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Products with lowest sales - inventory optimization insights
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

        {/* Key Metrics */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Pending Stock"
                value={totalPendingStock}
                valueStyle={{ color: "#fa8c16" }}
                prefix={<InboxOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Locked Inventory Value"
                value={totalInventoryCost / 100000}
                precision={2}
                suffix="L"
                prefix="₹"
                valueStyle={{ color: "#f5222d" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Critical Products"
                value={criticalProducts}
                valueStyle={{ color: "#f5222d" }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Products Analyzed"
                value={slowMovingProducts.length}
                valueStyle={{ color: "#1890ff" }}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={16}>
            <Card title="Days to Sell Out - Product Comparison">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={slowMovingProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="productName" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="daysToSellOut" fill="#fa8c16" name="Days to Sell Out" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Category Status">
              <div className="space-y-3">
                {categoryAnalysis.map((cat) => (
                  <div key={cat.category} className="border-b pb-3">
                    <div className="flex justify-between items-center mb-1">
                      <Text strong>{cat.category}</Text>
                      <Tag
                        color={
                          cat.status === "Critical"
                            ? "red"
                            : cat.status === "High"
                            ? "orange"
                            : cat.status === "Medium"
                            ? "gold"
                            : cat.status === "Good"
                            ? "blue"
                            : "green"
                        }
                      >
                        {cat.status}
                      </Tag>
                    </div>
                    <Text type="secondary" className="text-sm">
                      Avg: {cat.avgDays} days • Value: {formatCurrency(cat.pendingValue)}
                    </Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Monthly Trend */}
        <Card title="Slow-Moving Stock Trend (Last 6 Months)" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="slowMoving" fill="#fa8c16" name="Slow-Moving Stock" />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#1890ff"
                strokeWidth={2}
                name="Total Stock"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Table */}
        <Card title="Detailed Slow-Moving Product Analysis">
          <Table
            columns={columns}
            dataSource={slowMovingProducts}
            rowKey="productId"
            pagination={false}
            scroll={{ x: 1400 }}
          />
        </Card>

        {/* Action Plan */}
        <Card title="Inventory Optimization Strategy" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-red-900">
                  🚨 Immediate Clearance Required
                </Title>
                <Paragraph className="text-red-800 !mb-0">
                  Iron Box taking 245 days to sell (750 units pending, ₹11L locked). Launch 40% off
                  clearance sale immediately. Bundle with fast-moving products to accelerate clearance.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  📦 Bundle Promotions
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  Create combo offers: Mixer Grinder + Microwave, Ceiling Fan sets for homes. Offer 25%
                  discount on bundles to move 112-118 day inventory faster.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  📉 Reduce Future Orders
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  Stop ordering Iron Box and Mixer Grinder until stock clears to under 30 days. Focus
                  procurement on fast-movers like Refrigerator (20 days) and AC (26 days).
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  💰 Free up Capital
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  ₹90.7L locked in slow inventory. Clearing 50% would free ₹45L+ for investing in
                  high-demand products. Potential revenue increase: ₹1.5Cr if reallocated to bestsellers.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default SlowMovingProductsPage;
