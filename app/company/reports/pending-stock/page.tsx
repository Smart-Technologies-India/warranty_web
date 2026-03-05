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
  InboxOutlined,
  WarningOutlined,
  ShopOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
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

const pendingStockData = [
  {
    dealerId: "D023",
    dealerName: "Metro Electronics",
    zone: "East",
    totalStock: 2450,
    pendingStock: 1280,
    pendingValue: 18500000,
    pendingPercent: 52.2,
    avgAge: 45,
    criticalItems: 15,
    status: "Critical",
  },
  {
    dealerId: "D056",
    dealerName: "Tech Paradise",
    zone: "East",
    totalStock: 1850,
    pendingStock: 1020,
    pendingValue: 14200000,
    pendingPercent: 55.1,
    avgAge: 52,
    criticalItems: 18,
    status: "Critical",
  },
  {
    dealerId: "D089",
    dealerName: "Digital World Store",
    zone: "West",
    totalStock: 2100,
    pendingStock: 980,
    pendingValue: 13800000,
    pendingPercent: 46.7,
    avgAge: 38,
    criticalItems: 12,
    status: "High",
  },
  {
    dealerId: "D034",
    dealerName: "Galaxy Electronics",
    zone: "South",
    totalStock: 1920,
    pendingStock: 890,
    pendingValue: 12100000,
    pendingPercent: 46.4,
    avgAge: 41,
    criticalItems: 14,
    status: "High",
  },
  {
    dealerId: "D067",
    dealerName: "Future Tech Solutions",
    zone: "Central",
    totalStock: 1680,
    pendingStock: 750,
    pendingValue: 9800000,
    pendingPercent: 44.6,
    avgAge: 35,
    criticalItems: 9,
    status: "Medium",
  },
  {
    dealerId: "D078",
    dealerName: "Electronics Mart",
    zone: "West",
    totalStock: 1520,
    pendingStock: 680,
    pendingValue: 8900000,
    pendingPercent: 44.7,
    avgAge: 33,
    criticalItems: 8,
    status: "Medium",
  },
  {
    dealerId: "D012",
    dealerName: "Prime Electronics",
    zone: "North",
    totalStock: 1450,
    pendingStock: 620,
    pendingValue: 7800000,
    pendingPercent: 42.8,
    avgAge: 29,
    criticalItems: 6,
    status: "Medium",
  },
  {
    dealerId: "D091",
    dealerName: "Innovative Gadgets",
    zone: "North",
    totalStock: 1380,
    pendingStock: 560,
    pendingValue: 6900000,
    pendingPercent: 40.6,
    avgAge: 28,
    criticalItems: 5,
    status: "Medium",
  },
  {
    dealerId: "D045",
    dealerName: "Smart Gadgets Pro",
    zone: "South",
    totalStock: 1250,
    pendingStock: 480,
    pendingValue: 5800000,
    pendingPercent: 38.4,
    avgAge: 24,
    criticalItems: 4,
    status: "Low",
  },
  {
    dealerId: "D001",
    dealerName: "Tech Electronics Hub",
    zone: "North",
    totalStock: 1180,
    pendingStock: 420,
    pendingValue: 4900000,
    pendingPercent: 35.6,
    avgAge: 21,
    criticalItems: 3,
    status: "Low",
  },
];

const agingAnalysis = [
  { category: "0-30 days", dealers: 2, stock: 900, value: 10700000 },
  { category: "31-60 days", dealers: 5, stock: 3480, value: 47200000 },
  { category: "61-90 days", dealers: 3, stock: 2380, value: 31400000 },
  { category: "90+ days", dealers: 0, stock: 0, value: 0 },
];

const zoneDistribution = [
  { name: "East", value: 32700000, percentage: 36.8 },
  { name: "West", value: 22700000, percentage: 25.5 },
  { name: "North", value: 19600000, percentage: 22.0 },
  { name: "South", value: 13900000, percentage: 15.6 },
  { name: "Central", value: 9800000, percentage: 11.0 },
];

const COLORS = ["#f5222d", "#fa8c16", "#faad14", "#52c41a", "#1890ff"];

const PendingStockPage: React.FC = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("current");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    {
      title: "Dealer Information",
      dataIndex: "dealerName",
      key: "dealerName",
      render: (_: any, record: any) => (
        <div>
          <Text strong className="text-base">
            {record.dealerName}
          </Text>
          <br />
          <Text type="secondary" className="text-sm">
            ID: {record.dealerId} • {record.zone} Zone
          </Text>
        </div>
      ),
    },
    {
      title: "Total Stock",
      dataIndex: "totalStock",
      key: "totalStock",
      render: (stock: number) => <Text strong>{stock.toLocaleString()}</Text>,
    },
    {
      title: "Pending Stock",
      dataIndex: "pendingStock",
      key: "pendingStock",
      sorter: (a: any, b: any) => b.pendingStock - a.pendingStock,
      render: (stock: number) => (
        <Text strong className="text-lg" style={{ color: "#fa8c16" }}>
          {stock.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Pending Value",
      dataIndex: "pendingValue",
      key: "pendingValue",
      sorter: (a: any, b: any) => b.pendingValue - a.pendingValue,
      render: (value: number) => (
        <div>
          <Text strong style={{ color: "#f5222d" }}>
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
      title: "Pending %",
      dataIndex: "pendingPercent",
      key: "pendingPercent",
      render: (percent: number) => (
        <div style={{ width: 120 }}>
          <Progress
            percent={percent}
            size="small"
            strokeColor={
              percent > 50 ? "#f5222d" : percent > 40 ? "#fa8c16" : "#52c41a"
            }
          />
        </div>
      ),
    },
    {
      title: "Avg Age (Days)",
      dataIndex: "avgAge",
      key: "avgAge",
      sorter: (a: any, b: any) => b.avgAge - a.avgAge,
      render: (age: number) => (
        <Tag
          color={age > 45 ? "red" : age > 30 ? "orange" : "green"}
          icon={<ClockCircleOutlined />}
        >
          {age} days
        </Tag>
      ),
    },
    {
      title: "Critical Items",
      dataIndex: "criticalItems",
      key: "criticalItems",
      render: (items: number) => (
        <Tag color="red" icon={<WarningOutlined />}>
          {items}
        </Tag>
      ),
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

  const totalPendingStock = pendingStockData.reduce(
    (sum, item) => sum + item.pendingStock,
    0,
  );
  const totalPendingValue = pendingStockData.reduce(
    (sum, item) => sum + item.pendingValue,
    0,
  );
  const avgPendingPercent =
    pendingStockData.reduce((sum, item) => sum + item.pendingPercent, 0) /
    pendingStockData.length;

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
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <InboxOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Dealers with Pending Stock
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Analysis of dealers with highest unsold inventory and aging
                  stock
                </Paragraph>
              </div>
            </div>
            <Space>
              <Select
                value={period}
                onChange={setPeriod}
                style={{ width: 180 }}
                options={[
                  { label: "Current Stock", value: "current" },
                  { label: "Last Month", value: "last-month" },
                  { label: "Last Quarter", value: "last-quarter" },
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
                suffix="units"
                prefix={<InboxOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Value"
                value={totalPendingValue / 10000000}
                precision={2}
                suffix="Cr"
                prefix="₹"
                valueStyle={{ color: "#f5222d" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Pending %"
                value={avgPendingPercent}
                precision={1}
                suffix="%"
                valueStyle={{ color: "#fa8c16" }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Dealers Affected"
                value={pendingStockData.length}
                valueStyle={{ color: "#1890ff" }}
                prefix={<ShopOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={16}>
            <Card title="Pending Stock by Dealer">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={pendingStockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dealerName"
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
                    dataKey="pendingStock"
                    fill="#fa8c16"
                    name="Pending Stock (Units)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgAge"
                    stroke="#f5222d"
                    strokeWidth={2}
                    name="Avg Age (Days)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Zone-wise Distribution">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={zoneDistribution}
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
                    {zoneDistribution.map((entry, index) => (
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

        {/* Aging Analysis */}
        <Card title="Stock Aging Analysis" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agingAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value: any) => value.toLocaleString()} />
              <Legend />
              <Bar dataKey="stock" fill="#1890ff" name="Stock Units" />
              <Bar dataKey="dealers" fill="#52c41a" name="Dealers Count" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Table */}
        <Card title="Detailed Pending Stock Analysis">
          <Table
            columns={columns}
            dataSource={pendingStockData}
            rowKey="dealerId"
            pagination={false}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Action Items */}
        <Card title="Recommended Actions & Strategies" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-red-900">
                  🚨 Critical Dealers
                </Title>
                <Paragraph className="text-red-800 !mb-0">
                  Metro Electronics and Tech Paradise have 50%+ pending stock
                  with high aging. Implement immediate clearance sales and
                  promotional campaigns to reduce inventory.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  📊 Inventory Optimization
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  East zone has 36.8% of total pending value. Review supply
                  patterns and adjust future shipments based on actual sales
                  velocity in this region.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  💡 Sales Support
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  Provide marketing collateral, demo units, and sales training
                  to dealers with high pending stock to accelerate movement of
                  aging inventory.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  🎯 Future Prevention
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  Implement just-in-time inventory system for slow-moving
                  dealers. Tech Electronics Hub maintains only 35.6% pending -
                  analyze their model for best practices.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default PendingStockPage;
