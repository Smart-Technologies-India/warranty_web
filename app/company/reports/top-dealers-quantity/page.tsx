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
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  RiseOutlined,
  ShopOutlined,
  BarChartOutlined,
  DownloadOutlined,
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
  LineChart,
  Line,
} from "recharts";

const { Title, Text, Paragraph } = Typography;

// Sample data
const topDealersData = [
  {
    rank: 1,
    dealerId: "D001",
    dealerName: "Tech Electronics Hub",
    zone: "North",
    totalQuantity: 15420,
    totalProducts: 245,
    averageOrder: 63,
    growth: "+23.5%",
    status: "Excellent",
  },
  {
    rank: 2,
    dealerId: "D045",
    dealerName: "Smart Gadgets Pro",
    zone: "South",
    totalQuantity: 13890,
    totalProducts: 198,
    averageOrder: 70,
    growth: "+18.2%",
    status: "Excellent",
  },
  {
    rank: 3,
    dealerId: "D023",
    dealerName: "Metro Electronics",
    zone: "East",
    totalQuantity: 12350,
    totalProducts: 176,
    averageOrder: 70,
    growth: "+15.7%",
    status: "Very Good",
  },
  {
    rank: 4,
    dealerId: "D089",
    dealerName: "Digital World Store",
    zone: "West",
    totalQuantity: 11200,
    totalProducts: 165,
    averageOrder: 68,
    growth: "+12.4%",
    status: "Very Good",
  },
  {
    rank: 5,
    dealerId: "D012",
    dealerName: "Prime Electronics",
    zone: "North",
    totalQuantity: 10850,
    totalProducts: 152,
    averageOrder: 71,
    growth: "+10.8%",
    status: "Good",
  },
  {
    rank: 6,
    dealerId: "D067",
    dealerName: "Future Tech Solutions",
    zone: "Central",
    totalQuantity: 9980,
    totalProducts: 141,
    averageOrder: 71,
    growth: "+9.2%",
    status: "Good",
  },
  {
    rank: 7,
    dealerId: "D034",
    dealerName: "Galaxy Electronics",
    zone: "South",
    totalQuantity: 9420,
    totalProducts: 138,
    averageOrder: 68,
    growth: "+7.5%",
    status: "Good",
  },
  {
    rank: 8,
    dealerId: "D056",
    dealerName: "Tech Paradise",
    zone: "East",
    totalQuantity: 8750,
    totalProducts: 128,
    averageOrder: 68,
    growth: "+6.1%",
    status: "Average",
  },
  {
    rank: 9,
    dealerId: "D078",
    dealerName: "Electronics Mart",
    zone: "West",
    totalQuantity: 8290,
    totalProducts: 119,
    averageOrder: 70,
    growth: "+4.8%",
    status: "Average",
  },
  {
    rank: 10,
    dealerId: "D091",
    dealerName: "Innovative Gadgets",
    zone: "North",
    totalQuantity: 7850,
    totalProducts: 112,
    averageOrder: 70,
    growth: "+3.2%",
    status: "Average",
  },
];

const zoneDistribution = [
  { name: "North", value: 34070, percentage: 31.8 },
  { name: "South", value: 23310, percentage: 21.8 },
  { name: "East", value: 21100, percentage: 19.7 },
  { name: "West", value: 19490, percentage: 18.2 },
  { name: "Central", value: 9980, percentage: 9.3 },
];

const monthlyTrend = [
  { month: "Jan", quantity: 8500 },
  { month: "Feb", quantity: 9200 },
  { month: "Mar", quantity: 10100 },
  { month: "Apr", quantity: 9800 },
  { month: "May", quantity: 11200 },
  { month: "Jun", quantity: 10750 },
];

const COLORS = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1"];

const TopDealersByQuantityPage: React.FC = () => {
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
              className="text-xl"
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
      title: "Total Quantity",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      sorter: (a: any, b: any) => b.totalQuantity - a.totalQuantity,
      render: (quantity: number) => (
        <Statistic
          value={quantity}
          valueStyle={{ fontSize: "16px", fontWeight: "600", color: "#1890ff" }}
          suffix="units"
        />
      ),
    },
    {
      title: "Products",
      dataIndex: "totalProducts",
      key: "totalProducts",
      render: (products: number) => <Text strong>{products}</Text>,
    },
    {
      title: "Avg Order Size",
      dataIndex: "averageOrder",
      key: "averageOrder",
      render: (avg: number) => <Text>{avg} units</Text>,
    },
    {
      title: "Growth",
      dataIndex: "growth",
      key: "growth",
      render: (growth: string) => (
        <Tag
          color={growth.startsWith("+") ? "green" : "red"}
          icon={<RiseOutlined />}
        >
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
          status === "Excellent"
            ? "green"
            : status === "Very Good"
              ? "blue"
              : status === "Good"
                ? "cyan"
                : "orange";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const totalQuantity = topDealersData.reduce(
    (sum, dealer) => sum + dealer.totalQuantity,
    0,
  );
  const averageQuantity = Math.round(totalQuantity / topDealersData.length);

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
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <TrophyOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Top 10 Dealers by Quantity
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Analysis of dealers with highest product purchase quantities
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
                title="Total Quantity (Top 10)"
                value={totalQuantity}
                suffix="units"
                valueStyle={{ color: "#1890ff" }}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Average per Dealer"
                value={averageQuantity}
                suffix="units"
                valueStyle={{ color: "#52c41a" }}
                prefix={<ShopOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Top Performer"
                value={topDealersData[0].dealerName}
                valueStyle={{ fontSize: "14px", color: "#faad14" }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Average Growth Rate"
                value="+11.1"
                suffix="%"
                valueStyle={{ color: "#52c41a" }}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={14}>
            <Card
              title="Top 10 Dealers - Quantity Comparison"
              className="h-full"
            >
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topDealersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dealerName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="totalQuantity"
                    fill="#1890ff"
                    name="Total Quantity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="Zone-wise Distribution" className="h-full">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={zoneDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload }) =>
                      `${payload?.name}: ${payload?.percentage}%`
                    }
                    outerRadius={100}
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Divider />
              <div className="space-y-2">
                {zoneDistribution.map((zone, index) => (
                  <div
                    key={zone.name}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <Text>{zone.name}</Text>
                    </div>
                    <Text strong>
                      {zone.value.toLocaleString()} ({zone.percentage}%)
                    </Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Monthly Trend */}
        <Card title="6-Month Purchase Trend" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="quantity"
                stroke="#1890ff"
                strokeWidth={2}
                name="Total Quantity"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Table */}
        <Card title="Detailed Dealer Rankings">
          <Table
            columns={columns}
            dataSource={topDealersData}
            rowKey="dealerId"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* Insights */}
        <Card title="Key Insights & Recommendations" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  📊 Market Concentration
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  Top 3 dealers account for 38.5% of total quantity, indicating
                  healthy market distribution without over-dependence on single
                  dealers.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  📈 Growth Trends
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  All top 10 dealers show positive growth ranging from +3.2% to
                  +23.5%, demonstrating strong market momentum and dealer
                  confidence.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-purple-900">
                  🎯 Geographic Insights
                </Title>
                <Paragraph className="text-purple-800 !mb-0">
                  North zone leads with 31.8% share. Consider expanding presence
                  in Central zone (only 9.3%) to capture untapped market
                  potential.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  💡 Action Items
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  Implement reward programs for top performers and provide
                  additional support to dealers ranked 8-10 to help them
                  increase order volumes.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default TopDealersByQuantityPage;
