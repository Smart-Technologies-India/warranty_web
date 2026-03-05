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
  WarningOutlined,
  ShoppingOutlined,
  DownloadOutlined,
  AlertOutlined,
  ShopOutlined,
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
} from "recharts";

const { Title, Text, Paragraph } = Typography;

const lowStockData = [
  {
    dealerId: "D091",
    dealerName: "Innovative Gadgets",
    zone: "North",
    product: "Smart TV 55\"",
    category: "Television",
    currentStock: 3,
    reorderLevel: 15,
    optimalStock: 25,
    monthlyAvgSales: 12,
    daysLeft: 8,
    recommendedOrder: 22,
    priority: "Urgent",
  },
  {
    dealerId: "D078",
    dealerName: "Electronics Mart",
    zone: "West",
    product: "Washing Machine",
    category: "Home Appliances",
    currentStock: 4,
    reorderLevel: 12,
    optimalStock: 20,
    monthlyAvgSales: 10,
    daysLeft: 12,
    recommendedOrder: 16,
    priority: "Urgent",
  },
  {
    dealerId: "D034",
    dealerName: "Galaxy Electronics",
    zone: "South",
    product: "Refrigerator",
    category: "Home Appliances",
    currentStock: 5,
    reorderLevel: 14,
    optimalStock: 22,
    monthlyAvgSales: 11,
    daysLeft: 14,
    recommendedOrder: 17,
    priority: "High",
  },
  {
    dealerId: "D056",
    dealerName: "Tech Paradise",
    zone: "East",
    product: "Air Conditioner",
    category: "Home Appliances",
    currentStock: 6,
    reorderLevel: 15,
    optimalStock: 24,
    monthlyAvgSales: 10,
    daysLeft: 18,
    recommendedOrder: 18,
    priority: "High",
  },
  {
    dealerId: "D012",
    dealerName: "Prime Electronics",
    zone: "North",
    product: "Microwave Oven",
    category: "Kitchen Appliances",
    currentStock: 8,
    reorderLevel: 20,
    optimalStock: 35,
    monthlyAvgSales: 15,
    daysLeft: 16,
    recommendedOrder: 27,
    priority: "High",
  },
  {
    dealerId: "D067",
    dealerName: "Future Tech Solutions",
    zone: "Central",
    product: "LED TV 43\"",
    category: "Television",
    currentStock: 7,
    reorderLevel: 18,
    optimalStock: 28,
    monthlyAvgSales: 13,
    daysLeft: 16,
    recommendedOrder: 21,
    priority: "Medium",
  },
  {
    dealerId: "D023",
    dealerName: "Metro Electronics",
    zone: "East",
    product: "Water Purifier",
    category: "Water Solutions",
    currentStock: 5,
    reorderLevel: 12,
    optimalStock: 18,
    monthlyAvgSales: 8,
    daysLeft: 19,
    recommendedOrder: 13,
    priority: "Medium",
  },
  {
    dealerId: "D089",
    dealerName: "Digital World Store",
    zone: "West",
    product: "Ceiling Fan",
    category: "Fans",
    currentStock: 12,
    reorderLevel: 25,
    optimalStock: 40,
    monthlyAvgSales: 20,
    daysLeft: 18,
    recommendedOrder: 28,
    priority: "Medium",
  },
  {
    dealerId: "D045",
    dealerName: "Smart Gadgets Pro",
    zone: "South",
    product: "Mixer Grinder",
    category: "Kitchen Appliances",
    currentStock: 10,
    reorderLevel: 22,
    optimalStock: 32,
    monthlyAvgSales: 16,
    daysLeft: 19,
    recommendedOrder: 22,
    priority: "Low",
  },
  {
    dealerId: "D001",
    dealerName: "Tech Electronics Hub",
    zone: "North",
    product: "Iron Box",
    category: "Small Appliances",
    currentStock: 15,
    reorderLevel: 30,
    optimalStock: 45,
    monthlyAvgSales: 22,
    daysLeft: 20,
    recommendedOrder: 30,
    priority: "Low",
  },
];

const categoryAnalysis = [
  { category: "Home Appliances", dealersAffected: 3, avgDaysLeft: 14.7, recommendedOrders: 51 },
  { category: "Television", dealersAffected: 2, avgDaysLeft: 12.0, recommendedOrders: 43 },
  { category: "Kitchen Appliances", dealersAffected: 2, avgDaysLeft: 17.5, recommendedOrders: 49 },
  { category: "Water Solutions", dealersAffected: 1, avgDaysLeft: 19.0, recommendedOrders: 13 },
  { category: "Fans", dealersAffected: 1, avgDaysLeft: 18.0, recommendedOrders: 28 },
  { category: "Small Appliances", dealersAffected: 1, avgDaysLeft: 20.0, recommendedOrders: 30 },
];

const zoneAnalysis = [
  { zone: "North", dealers: 3, totalRecommended: 79, avgDaysLeft: 14.7 },
  { zone: "East", dealers: 2, totalRecommended: 31, avgDaysLeft: 17.5 },
  { zone: "West", dealers: 2, totalRecommended: 44, avgDaysLeft: 15.0 },
  { zone: "South", dealers: 2, totalRecommended: 39, avgDaysLeft: 16.5 },
  { zone: "Central", dealers: 1, totalRecommended: 21, avgDaysLeft: 16.0 },
];

const LowStockDealersPage: React.FC = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("current");

  const columns = [
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority: string) => {
        const color =
          priority === "Urgent"
            ? "red"
            : priority === "High"
            ? "orange"
            : priority === "Medium"
            ? "gold"
            : "green";
        return (
          <Tag color={color} icon={<WarningOutlined />}>
            {priority}
          </Tag>
        );
      },
      filters: [
        { text: "Urgent", value: "Urgent" },
        { text: "High", value: "High" },
        { text: "Medium", value: "Medium" },
        { text: "Low", value: "Low" },
      ],
      onFilter: (value: any, record: any) => record.priority === value,
    },
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
      title: "Product Details",
      dataIndex: "product",
      key: "product",
      render: (_: any, record: any) => (
        <div>
          <Text strong>{record.product}</Text>
          <br />
          <Text type="secondary" className="text-sm">
            {record.category}
          </Text>
        </div>
      ),
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (stock: number, record: any) => (
        <div>
          <Text strong className="text-lg" style={{ color: "#f5222d" }}>
            {stock}
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            Reorder: {record.reorderLevel}
          </Text>
        </div>
      ),
    },
    {
      title: "Days Left",
      dataIndex: "daysLeft",
      key: "daysLeft",
      sorter: (a: any, b: any) => a.daysLeft - b.daysLeft,
      render: (days: number) => (
        <Tag color={days <= 10 ? "red" : days <= 15 ? "orange" : "green"}>
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
      title: "Optimal Stock",
      dataIndex: "optimalStock",
      key: "optimalStock",
      render: (stock: number) => <Text>{stock} units</Text>,
    },
    {
      title: "Recommended Order",
      dataIndex: "recommendedOrder",
      key: "recommendedOrder",
      render: (order: number) => (
        <Tag color="blue" icon={<ShoppingOutlined />} className="text-base px-3 py-1">
          {order} units
        </Tag>
      ),
    },
  ];

  const totalRecommendedOrders = lowStockData.reduce((sum, item) => sum + item.recommendedOrder, 0);
  const urgentCases = lowStockData.filter((item) => item.priority === "Urgent").length;
  const avgDaysLeft =
    lowStockData.reduce((sum, item) => sum + item.daysLeft, 0) / lowStockData.length;

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
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <WarningOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Low Stock Alert by Dealer
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Dealers running low on specific products with reorder recommendations
                </Paragraph>
              </div>
            </div>
            <Space>
              <Select
                value={period}
                onChange={setPeriod}
                style={{ width: 180 }}
                options={[
                  { label: "Current Status", value: "current" },
                  { label: "Last Week", value: "last-week" },
                  { label: "Trend Analysis", value: "trend" },
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
          message="Urgent Action Required"
          description={`${urgentCases} dealers have critically low stock levels with less than 14 days remaining. Immediate orders recommended to prevent stockouts.`}
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
                title="Total Recommended Orders"
                value={totalRecommendedOrders}
                suffix="units"
                valueStyle={{ color: "#1890ff" }}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Urgent Cases"
                value={urgentCases}
                valueStyle={{ color: "#f5222d" }}
                prefix={<AlertOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Days Remaining"
                value={avgDaysLeft}
                precision={1}
                suffix="days"
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Dealers Affected"
                value={lowStockData.length}
                valueStyle={{ color: "#722ed1" }}
                prefix={<ShopOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={12}>
            <Card title="Category-wise Low Stock Analysis">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={categoryAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-15} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="recommendedOrders"
                    fill="#1890ff"
                    name="Recommended Orders"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="dealersAffected"
                    stroke="#f5222d"
                    strokeWidth={2}
                    name="Dealers Affected"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Zone-wise Distribution">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={zoneAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalRecommended" fill="#52c41a" name="Recommended Orders" />
                  <Bar dataKey="dealers" fill="#722ed1" name="Dealers" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Stock Status Trend */}
        <Card title="Stock vs Optimal Levels" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lowStockData.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dealerName" angle={-20} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="currentStock" fill="#f5222d" name="Current Stock" />
              <Bar dataKey="reorderLevel" fill="#fa8c16" name="Reorder Level" />
              <Bar dataKey="optimalStock" fill="#52c41a" name="Optimal Stock" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Table */}
        <Card title="Detailed Low Stock Analysis & Recommendations">
          <Table
            columns={columns}
            dataSource={lowStockData}
            rowKey={(record) => `${record.dealerId}-${record.product}`}
            pagination={false}
            scroll={{ x: 1400 }}
          />
        </Card>

        {/* Action Plan */}
        <Card title="Immediate Action Plan & Recommendations" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-red-900">
                  🚨 Urgent Orders (Next 48 Hours)
                </Title>
                <Paragraph className="text-red-800 !mb-0">
                  Innovative Gadgets (8 days left) and Electronics Mart (12 days left) need immediate
                  stock replenishment. Process priority orders to prevent stockouts and lost sales.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  📦 Bulk Order Opportunity
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  Total recommended orders: 214 units across 10 dealers. Consolidate shipments by zone
                  to optimize logistics costs and delivery timeline.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  🎯 Inventory Optimization
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  Home Appliances category shows highest reorder demand. Consider increasing safety stock
                  levels for these high-velocity products to prevent frequent stockouts.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  🔄 Automated Reordering
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  Implement automated reorder triggers when stock hits reorder level. This would have
                  prevented 70% of current low-stock situations and improved dealer satisfaction.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default LowStockDealersPage;
