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
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
import {
  ArrowLeftOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  DownloadOutlined,
  CalendarOutlined,
  DollarOutlined,
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

const monthlySalesData = [
  {
    month: "Jan 2024",
    revenue: 12500000,
    orders: 245,
    units: 3420,
    avgOrderValue: 51020,
    momGrowth: "+5.2%",
    yoyGrowth: "+18.5%",
  },
  {
    month: "Feb 2024",
    revenue: 13800000,
    orders: 268,
    units: 3890,
    avgOrderValue: 51493,
    momGrowth: "+10.4%",
    yoyGrowth: "+21.3%",
  },
  {
    month: "Mar 2024",
    revenue: 15200000,
    orders: 298,
    units: 4250,
    avgOrderValue: 51007,
    momGrowth: "+10.1%",
    yoyGrowth: "+24.7%",
  },
  {
    month: "Apr 2024",
    revenue: 14500000,
    orders: 285,
    units: 4100,
    avgOrderValue: 50877,
    momGrowth: "-4.6%",
    yoyGrowth: "+19.2%",
  },
  {
    month: "May 2024",
    revenue: 16800000,
    orders: 325,
    units: 4680,
    avgOrderValue: 51692,
    momGrowth: "+15.9%",
    yoyGrowth: "+28.4%",
  },
  {
    month: "Jun 2024",
    revenue: 18200000,
    orders: 356,
    units: 5120,
    avgOrderValue: 51124,
    momGrowth: "+8.3%",
    yoyGrowth: "+32.1%",
  },
  {
    month: "Jul 2024",
    revenue: 17500000,
    orders: 342,
    units: 4850,
    avgOrderValue: 51170,
    momGrowth: "-3.8%",
    yoyGrowth: "+26.8%",
  },
  {
    month: "Aug 2024",
    revenue: 19100000,
    orders: 375,
    units: 5280,
    avgOrderValue: 50933,
    momGrowth: "+9.1%",
    yoyGrowth: "+30.5%",
  },
  {
    month: "Sep 2024",
    revenue: 20500000,
    orders: 398,
    units: 5620,
    avgOrderValue: 51508,
    momGrowth: "+7.3%",
    yoyGrowth: "+35.2%",
  },
  {
    month: "Oct 2024",
    revenue: 19800000,
    orders: 385,
    units: 5450,
    avgOrderValue: 51429,
    momGrowth: "-3.4%",
    yoyGrowth: "+31.8%",
  },
  {
    month: "Nov 2024",
    revenue: 21200000,
    orders: 412,
    units: 5820,
    avgOrderValue: 51456,
    momGrowth: "+7.1%",
    yoyGrowth: "+38.4%",
  },
  {
    month: "Dec 2024",
    revenue: 22800000,
    orders: 445,
    units: 6250,
    avgOrderValue: 51236,
    momGrowth: "+7.5%",
    yoyGrowth: "+42.1%",
  },
];

const categoryTrends = [
  { month: "Jan", homeAppliances: 4800000, television: 3500000, kitchen: 2200000, others: 2000000 },
  { month: "Feb", homeAppliances: 5200000, television: 3800000, kitchen: 2500000, others: 2300000 },
  { month: "Mar", homeAppliances: 5800000, television: 4200000, kitchen: 2800000, others: 2400000 },
  { month: "Apr", homeAppliances: 5500000, television: 4000000, kitchen: 2700000, others: 2300000 },
  { month: "May", homeAppliances: 6400000, television: 4600000, kitchen: 3100000, others: 2700000 },
  { month: "Jun", homeAppliances: 6900000, television: 5000000, kitchen: 3400000, others: 2900000 },
];

const MonthlySalesTrendsPage: React.FC = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("last-12-months");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      render: (month: string) => <Text strong>{month}</Text>,
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
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      render: (orders: number) => <Text>{orders}</Text>,
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
      render: (units: number) => <Text>{units.toLocaleString()}</Text>,
    },
    {
      title: "Avg Order Value",
      dataIndex: "avgOrderValue",
      key: "avgOrderValue",
      render: (value: number) => <Text>{formatCurrency(value)}</Text>,
    },
    {
      title: "MoM Growth",
      dataIndex: "momGrowth",
      key: "momGrowth",
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
      title: "YoY Growth",
      dataIndex: "yoyGrowth",
      key: "yoyGrowth",
      render: (growth: string) => (
        <Tag color="blue" icon={<RiseOutlined />}>
          {growth}
        </Tag>
      ),
    },
  ];

  const totalRevenue = monthlySalesData.reduce((sum, item) => sum + item.revenue, 0);
  const avgMonthlyRevenue = totalRevenue / monthlySalesData.length;
  const totalOrders = monthlySalesData.reduce((sum, item) => sum + item.orders, 0);
  const peakMonth = monthlySalesData.reduce((max, item) =>
    item.revenue > max.revenue ? item : max
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
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <LineChartOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Monthly Sales Trends
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Month-over-month sales analysis with growth indicators
                </Paragraph>
              </div>
            </div>
            <Space>
              <Select
                value={period}
                onChange={setPeriod}
                style={{ width: 180 }}
                options={[
                  { label: "Last 6 Months", value: "last-6-months" },
                  { label: "Last 12 Months", value: "last-12-months" },
                  { label: "Last 24 Months", value: "last-24-months" },
                  { label: "Year 2024", value: "year-2024" },
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
                title="Total Revenue (12M)"
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
                title="Avg Monthly Revenue"
                value={avgMonthlyRevenue / 10000000}
                precision={2}
                suffix="Cr"
                prefix="₹"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Peak Month"
                value={peakMonth.month}
                valueStyle={{ fontSize: "18px", color: "#faad14" }}
                prefix={<CalendarOutlined />}
              />
              <Text type="secondary" className="text-sm">
                {formatCurrency(peakMonth.revenue)}
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Orders (12M)"
                value={totalOrders}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Revenue Trend */}
        <Card title="Monthly Revenue Trend" className="mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1890ff"
                fill="#1890ff"
                fillOpacity={0.6}
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Orders & Units Trend */}
        <Card title="Orders & Units Sold Trend" className="mb-6">
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#52c41a" name="Orders" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="units"
                stroke="#722ed1"
                strokeWidth={2}
                name="Units Sold"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Category-wise Trends */}
        <Card title="Category-wise Sales Trend (Last 6 Months)" className="mb-6">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={categoryTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="homeAppliances"
                stroke="#1890ff"
                strokeWidth={2}
                name="Home Appliances"
              />
              <Line
                type="monotone"
                dataKey="television"
                stroke="#52c41a"
                strokeWidth={2}
                name="Television"
              />
              <Line
                type="monotone"
                dataKey="kitchen"
                stroke="#faad14"
                strokeWidth={2}
                name="Kitchen"
              />
              <Line
                type="monotone"
                dataKey="others"
                stroke="#722ed1"
                strokeWidth={2}
                name="Others"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Table */}
        <Card title="Detailed Monthly Performance">
          <Table
            columns={columns}
            dataSource={monthlySalesData}
            rowKey="month"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* Insights */}
        <Card title="Key Insights & Trends" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  📈 Strong Upward Trajectory
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  Revenue grew from ₹12.5Cr in Jan to ₹22.8Cr in Dec (82% increase). Average MoM
                  growth of 6.4% demonstrates consistent business expansion.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  🎯 Peak Performance
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  December achieved highest revenue (₹22.8Cr) with 445 orders. Q4 shows exceptional
                  performance, likely due to festive season and year-end promotions.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-purple-900">
                  📊 Seasonal Patterns
                </Title>
                <Paragraph className="text-purple-800 !mb-0">
                  Minor dips in Apr, Jul, and Oct (-3% to -5%) indicate seasonal slowdowns. Plan
                  targeted promotions during these months to maintain momentum.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  🚀 YoY Excellence
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  All months show 18%+ YoY growth, peaking at 42% in December. Sustained year-over-year
                  improvement indicates strong market position and brand growth.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default MonthlySalesTrendsPage;
