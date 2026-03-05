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
  PieChartOutlined,
  RiseOutlined,
  FallOutlined,
  DownloadOutlined,
  TrophyOutlined,
  CalendarOutlined,
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

const quarterlyData = [
  {
    quarter: "Q1 2023",
    revenue: 32500000,
    orders: 685,
    units: 9850,
    qoqGrowth: "+8.5%",
    yoyGrowth: "+15.2%",
    profit: 5850000,
    profitMargin: 18.0,
  },
  {
    quarter: "Q2 2023",
    revenue: 35200000,
    orders: 742,
    units: 10680,
    qoqGrowth: "+8.3%",
    yoyGrowth: "+17.8%",
    profit: 6336000,
    profitMargin: 18.0,
  },
  {
    quarter: "Q3 2023",
    revenue: 38100000,
    orders: 798,
    units: 11520,
    qoqGrowth: "+8.2%",
    yoyGrowth: "+20.5%",
    profit: 7239000,
    profitMargin: 19.0,
  },
  {
    quarter: "Q4 2023",
    revenue: 42800000,
    orders: 890,
    units: 12850,
    qoqGrowth: "+12.3%",
    yoyGrowth: "+24.1%",
    profit: 8560000,
    profitMargin: 20.0,
  },
  {
    quarter: "Q1 2024",
    revenue: 41500000,
    orders: 811,
    units: 11560,
    qoqGrowth: "-3.0%",
    yoyGrowth: "+27.7%",
    profit: 7885000,
    profitMargin: 19.0,
  },
  {
    quarter: "Q2 2024",
    revenue: 48700000,
    orders: 949,
    units: 14050,
    qoqGrowth: "+17.3%",
    yoyGrowth: "+38.4%",
    profit: 9740000,
    profitMargin: 20.0,
  },
  {
    quarter: "Q3 2024",
    revenue: 57100000,
    orders: 1115,
    units: 15750,
    qoqGrowth: "+17.2%",
    yoyGrowth: "+49.9%",
    profit: 11991000,
    profitMargin: 21.0,
  },
  {
    quarter: "Q4 2024",
    revenue: 63700000,
    orders: 1242,
    units: 17520,
    qoqGrowth: "+11.6%",
    yoyGrowth: "+48.8%",
    profit: 13558000,
    profitMargin: 21.3,
  },
];

const categoryPerformance = [
  { category: "Home Appliances", q1: 15800000, q2: 18500000, q3: 21700000, q4: 24200000 },
  { category: "Television", q1: 11200000, q2: 13100000, q3: 15300000, q4: 17100000 },
  { category: "Kitchen Appliances", q1: 7800000, q2: 9200000, q3: 10800000, q4: 12000000 },
  { category: "Others", q1: 6700000, q2: 7900000, q3: 9300000, q4: 10400000 },
];

const yoyComparison = [
  { metric: "Revenue", "2023": 148600000, "2024": 211000000, growth: "+42.0%" },
  { metric: "Orders", "2023": 3115, "2024": 4117, growth: "+32.2%" },
  { metric: "Units Sold", "2023": 44900, "2024": 58880, growth: "+31.1%" },
  { metric: "Avg Order Value", "2023": 47696, "2024": 51256, growth: "+7.5%" },
  { metric: "Profit", "2023": 27985000, "2024": 43174000, growth: "+54.3%" },
];

const QuarterlyPerformancePage: React.FC = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("last-8-quarters");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    {
      title: "Quarter",
      dataIndex: "quarter",
      key: "quarter",
      render: (quarter: string) => <Text strong>{quarter}</Text>,
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
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
      render: (units: number) => <Text>{units.toLocaleString()}</Text>,
    },
    {
      title: "QoQ Growth",
      dataIndex: "qoqGrowth",
      key: "qoqGrowth",
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
    {
      title: "Profit",
      dataIndex: "profit",
      key: "profit",
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Profit Margin",
      dataIndex: "profitMargin",
      key: "profitMargin",
      render: (margin: number) => <Tag color="green">{margin}%</Tag>,
    },
  ];

  const comparisonColumns = [
    {
      title: "Metric",
      dataIndex: "metric",
      key: "metric",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "2023 Total",
      dataIndex: "2023",
      key: "2023",
      render: (value: number) => {
        return value > 100000 ? formatCurrency(value) : value.toLocaleString();
      },
    },
    {
      title: "2024 Total",
      dataIndex: "2024",
      key: "2024",
      render: (value: number) => {
        return value > 100000 ? formatCurrency(value) : value.toLocaleString();
      },
    },
    {
      title: "Growth",
      dataIndex: "growth",
      key: "growth",
      render: (growth: string) => (
        <Tag color="green" icon={<RiseOutlined />} className="text-lg px-3 py-1">
          {growth}
        </Tag>
      ),
    },
  ];

  const totalRevenue2024 = quarterlyData.slice(4).reduce((sum, q) => sum + q.revenue, 0);
  const bestQuarter = quarterlyData.reduce((max, q) => (q.revenue > max.revenue ? q : max));

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
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <PieChartOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Quarterly Performance
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Quarter-wise performance analysis and YoY comparison
                </Paragraph>
              </div>
            </div>
            <Space>
              <Select
                value={period}
                onChange={setPeriod}
                style={{ width: 180 }}
                options={[
                  { label: "Last 4 Quarters", value: "last-4-quarters" },
                  { label: "Last 8 Quarters", value: "last-8-quarters" },
                  { label: "Year 2024", value: "year-2024" },
                  { label: "Year 2023", value: "year-2023" },
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
                title="Total Revenue 2024"
                value={totalRevenue2024 / 10000000}
                precision={2}
                suffix="Cr"
                prefix="₹"
                valueStyle={{ color: "#52c41a" }}
              />
              <div className="mt-2">
                <Tag color="green" icon={<RiseOutlined />}>
                  +42.0% vs 2023
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Best Quarter"
                value={bestQuarter.quarter}
                valueStyle={{ fontSize: "18px", color: "#faad14" }}
                prefix={<TrophyOutlined />}
              />
              <Text type="secondary" className="text-sm">
                {formatCurrency(bestQuarter.revenue)}
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Quarterly Revenue"
                value={(totalRevenue2024 / 4) / 10000000}
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
                title="Avg Profit Margin"
                value="20.3"
                suffix="%"
                valueStyle={{ color: "#722ed1" }}
              />
              <Text type="secondary" className="text-sm">
                Q4 2024
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Quarterly Revenue Trend */}
        <Card title="Quarterly Revenue & Profit Trend" className="mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
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
              <Bar yAxisId="left" dataKey="profit" fill="#52c41a" name="Profit" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="profitMargin"
                stroke="#722ed1"
                strokeWidth={2}
                name="Profit Margin %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Orders & Units Trend */}
        <Card title="Quarterly Orders & Units Sold" className="mb-6">
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#fa8c16" name="Orders" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="units"
                stroke="#eb2f96"
                strokeWidth={2}
                name="Units Sold"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Performance */}
        <Card title="Category Performance by Quarter (2024)" className="mb-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="q1" fill="#1890ff" name="Q1 2024" />
              <Bar dataKey="q2" fill="#52c41a" name="Q2 2024" />
              <Bar dataKey="q3" fill="#faad14" name="Q3 2024" />
              <Bar dataKey="q4" fill="#722ed1" name="Q4 2024" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Year-over-Year Comparison */}
        <Card title="Year-over-Year Comparison (2023 vs 2024)" className="mb-6">
          <Table
            columns={comparisonColumns}
            dataSource={yoyComparison}
            rowKey="metric"
            pagination={false}
          />
        </Card>

        {/* Detailed Quarterly Table */}
        <Card title="Detailed Quarterly Performance">
          <Table
            columns={columns}
            dataSource={quarterlyData}
            rowKey="quarter"
            pagination={false}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Insights */}
        <Card title="Key Insights & Strategic Recommendations" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  🚀 Exceptional Growth
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  2024 revenue of ₹21.1Cr represents 42% growth over 2023 (₹14.86Cr). Q4 2024 alone
                  generated ₹6.37Cr, exceeding entire Q1 2023 performance.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  📊 Consistent Momentum
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  7 out of 8 quarters show positive QoQ growth. Only Q1 2024 dipped (-3%), typical for
                  post-holiday season. Recovery in Q2 was exceptional at +17.3%.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-purple-900">
                  💰 Improving Profitability
                </Title>
                <Paragraph className="text-purple-800 !mb-0">
                  Profit margins improved from 18% (Q1 2023) to 21.3% (Q4 2024). Strong operational
                  efficiency gains and better product mix contributing to margin expansion.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  🎯 2025 Outlook
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  Based on Q4 2024 momentum, targeting ₹30Cr+ revenue for 2025 (42% YoY growth). Focus
                  on maintaining 20%+ profit margins while scaling operations.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default QuarterlyPerformancePage;
