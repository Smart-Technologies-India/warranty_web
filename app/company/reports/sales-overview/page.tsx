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
} from "antd";
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  DownloadOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

const { Title, Text, Paragraph } = Typography;

// Sample data
const monthlySalesData = [
  { month: "Jan", revenue: 12500000, orders: 245, units: 3420, target: 11000000 },
  { month: "Feb", revenue: 13800000, orders: 268, units: 3890, target: 12000000 },
  { month: "Mar", revenue: 15200000, orders: 298, units: 4250, target: 13000000 },
  { month: "Apr", revenue: 14500000, orders: 285, units: 4100, target: 13500000 },
  { month: "May", revenue: 16800000, orders: 325, units: 4680, target: 14000000 },
  { month: "Jun", revenue: 18200000, orders: 356, units: 5120, target: 15000000 },
];

const topProducts = [
  { product: "Smart TV 55\"", revenue: 28500000, units: 1250, growth: "+32%" },
  { product: "Washing Machine", revenue: 22300000, units: 980, growth: "+28%" },
  { product: "Refrigerator", revenue: 19800000, units: 856, growth: "+24%" },
  { product: "Air Conditioner", revenue: 17600000, units: 742, growth: "+19%" },
  { product: "Microwave Oven", revenue: 12400000, units: 1580, growth: "+15%" },
];

const salesByZone = [
  { zone: "North", revenue: 32500000, percentage: 31.2, orders: 625 },
  { zone: "South", revenue: 28900000, percentage: 27.8, orders: 558 },
  { zone: "East", revenue: 22100000, percentage: 21.3, orders: 425 },
  { zone: "West", revenue: 20500000, percentage: 19.7, orders: 392 },
];

const SalesOverviewPage: React.FC = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("last-6-months");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalRevenue = monthlySalesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = monthlySalesData.reduce((sum, item) => sum + item.orders, 0);
  const totalUnits = monthlySalesData.reduce((sum, item) => sum + item.units, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  const productColumns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (value: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: "Units Sold",
      dataIndex: "units",
      key: "units",
      render: (units: number) => <Text>{units.toLocaleString()}</Text>,
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
                <BarChartOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Sales Overview Dashboard
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Comprehensive view of sales, revenue trends, and performance metrics
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
              <div className="mt-2">
                <Tag color="green" icon={<RiseOutlined />}>
                  +21.5% vs last period
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={totalOrders}
                valueStyle={{ color: "#1890ff" }}
                prefix={<ShoppingOutlined />}
              />
              <div className="mt-2">
                <Tag color="blue" icon={<RiseOutlined />}>
                  +18.3% vs last period
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Units Sold"
                value={totalUnits}
                valueStyle={{ color: "#722ed1" }}
                prefix={<BarChartOutlined />}
              />
              <div className="mt-2">
                <Tag color="purple" icon={<RiseOutlined />}>
                  +19.7% vs last period
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Order Value"
                value={avgOrderValue / 1000}
                precision={0}
                suffix="K"
                prefix="₹"
                valueStyle={{ color: "#fa8c16" }}
              />
              <div className="mt-2">
                <Tag color="orange" icon={<RiseOutlined />}>
                  +2.7% vs last period
                </Tag>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Revenue Trend */}
        <Card title="Revenue & Orders Trend" className="mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                fill="#1890ff"
                stroke="#1890ff"
                fillOpacity={0.6}
                name="Revenue"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="target"
                stroke="#ff7300"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
              />
              <Bar yAxisId="right" dataKey="orders" fill="#52c41a" name="Orders" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Units Sold Trend */}
        <Card title="Units Sold Trend" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="units"
                stroke="#722ed1"
                strokeWidth={3}
                name="Units Sold"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Products & Zone Analysis */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={14}>
            <Card title="Top 5 Products by Revenue">
              <Table
                columns={productColumns}
                dataSource={topProducts}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="Sales by Zone">
              <div className="space-y-4">
                {salesByZone.map((zone) => (
                  <div key={zone.zone}>
                    <div className="flex justify-between mb-1">
                      <Text strong>{zone.zone}</Text>
                      <Text strong style={{ color: "#52c41a" }}>
                        {formatCurrency(zone.revenue)}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${zone.percentage}%` }}
                        />
                      </div>
                      <Text className="text-sm text-gray-600">{zone.percentage}%</Text>
                    </div>
                    <Text type="secondary" className="text-xs">
                      {zone.orders} orders
                    </Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Insights */}
        <Card title="Key Insights & Recommendations">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  📈 Strong Growth Trajectory
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  Revenue has grown consistently over 6 months with +21.5% increase. June achieved
                  121% of target, showing excellent momentum.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  🎯 Target Performance
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  All months exceeded targets since March. Consider setting more ambitious targets
                  for next quarter based on current trajectory.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-purple-900">
                  🏆 Top Performers
                </Title>
                <Paragraph className="text-purple-800 !mb-0">
                  Smart TVs lead with ₹2.85Cr revenue. Focus marketing efforts on high-margin
                  products like refrigerators and ACs.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  🌍 Geographic Focus
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  North zone dominates with 31.2% share. Opportunity to grow West zone (19.7%) with
                  targeted dealer incentives.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default SalesOverviewPage;
