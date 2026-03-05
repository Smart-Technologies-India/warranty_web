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
  ClockCircleOutlined,
  WarningOutlined,
  ShopOutlined,
  DownloadOutlined,
  PhoneOutlined,
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const { Title, Text, Paragraph } = Typography;

const inactiveDealersData = [
  {
    dealerId: "D078",
    dealerName: "Electronics Mart",
    zone: "West",
    lastOrderDate: "2024-06-15",
    daysSinceOrder: 145,
    lastOrderValue: 180000,
    totalLifetimeValue: 8900000,
    avgMonthlyOrders: 4.2,
    status: "Critical",
    contact: "+91-9876543210",
  },
  {
    dealerId: "D091",
    dealerName: "Innovative Gadgets",
    zone: "North",
    lastOrderDate: "2024-07-02",
    daysSinceOrder: 128,
    lastOrderValue: 150000,
    totalLifetimeValue: 6900000,
    avgMonthlyOrders: 3.8,
    status: "Critical",
    contact: "+91-9876543211",
  },
  {
    dealerId: "D034",
    dealerName: "Galaxy Electronics",
    zone: "South",
    lastOrderDate: "2024-07-20",
    daysSinceOrder: 110,
    lastOrderValue: 220000,
    totalLifetimeValue: 12100000,
    avgMonthlyOrders: 5.1,
    status: "High Risk",
    contact: "+91-9876543212",
  },
  {
    dealerId: "D056",
    dealerName: "Tech Paradise",
    zone: "East",
    lastOrderDate: "2024-08-05",
    daysSinceOrder: 94,
    lastOrderValue: 195000,
    totalLifetimeValue: 14200000,
    avgMonthlyOrders: 6.2,
    status: "High Risk",
    contact: "+91-9876543213",
  },
  {
    dealerId: "D012",
    dealerName: "Prime Electronics",
    zone: "North",
    lastOrderDate: "2024-08-22",
    daysSinceOrder: 77,
    lastOrderValue: 165000,
    totalLifetimeValue: 7800000,
    avgMonthlyOrders: 4.5,
    status: "Medium Risk",
    contact: "+91-9876543214",
  },
  {
    dealerId: "D067",
    dealerName: "Future Tech Solutions",
    zone: "Central",
    lastOrderDate: "2024-09-01",
    daysSinceOrder: 67,
    lastOrderValue: 175000,
    totalLifetimeValue: 9800000,
    avgMonthlyOrders: 4.8,
    status: "Medium Risk",
    contact: "+91-9876543215",
  },
  {
    dealerId: "D023",
    dealerName: "Metro Electronics",
    zone: "East",
    lastOrderDate: "2024-09-12",
    daysSinceOrder: 56,
    lastOrderValue: 240000,
    totalLifetimeValue: 18500000,
    avgMonthlyOrders: 7.5,
    status: "Watch List",
    contact: "+91-9876543216",
  },
  {
    dealerId: "D089",
    dealerName: "Digital World Store",
    zone: "West",
    lastOrderDate: "2024-09-18",
    daysSinceOrder: 50,
    lastOrderValue: 210000,
    totalLifetimeValue: 13800000,
    avgMonthlyOrders: 5.8,
    status: "Watch List",
    contact: "+91-9876543217",
  },
];

const inactivityPeriods = [
  { period: "90+ days", dealers: 4, lostRevenue: 850000, color: "#f5222d" },
  { period: "60-90 days", dealers: 2, lostRevenue: 520000, color: "#fa8c16" },
  { period: "30-60 days", dealers: 2, lostRevenue: 380000, color: "#faad14" },
];

const zoneDistribution = [
  { name: "East", count: 2, percentage: 25 },
  { name: "North", count: 2, percentage: 25 },
  { name: "West", count: 2, percentage: 25 },
  { name: "South", count: 1, percentage: 12.5 },
  { name: "Central", count: 1, percentage: 12.5 },
];

const reactivationTrend = [
  { month: "Jan", contacted: 12, reactivated: 8 },
  { month: "Feb", contacted: 10, reactivated: 6 },
  { month: "Mar", contacted: 15, reactivated: 9 },
  { month: "Apr", contacted: 11, reactivated: 7 },
  { month: "May", contacted: 13, reactivated: 8 },
  { month: "Jun", contacted: 14, reactivated: 10 },
];

const COLORS = ["#f5222d", "#fa8c16", "#faad14", "#52c41a", "#1890ff"];

const InactiveDealersPage: React.FC = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("30-days");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const color =
          status === "Critical"
            ? "red"
            : status === "High Risk"
              ? "orange"
              : status === "Medium Risk"
                ? "gold"
                : "blue";
        return (
          <Tag color={color} icon={<WarningOutlined />}>
            {status}
          </Tag>
        );
      },
      filters: [
        { text: "Critical", value: "Critical" },
        { text: "High Risk", value: "High Risk" },
        { text: "Medium Risk", value: "Medium Risk" },
        { text: "Watch List", value: "Watch List" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
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
      title: "Last Order",
      dataIndex: "lastOrderDate",
      key: "lastOrderDate",
      render: (date: string, record: any) => (
        <div>
          <Text>{date}</Text>
          <br />
          <Tag color="red" icon={<ClockCircleOutlined />}>
            {record.daysSinceOrder} days ago
          </Tag>
        </div>
      ),
      sorter: (a: any, b: any) => b.daysSinceOrder - a.daysSinceOrder,
    },
    {
      title: "Last Order Value",
      dataIndex: "lastOrderValue",
      key: "lastOrderValue",
      render: (value: number) => (
        <Text style={{ color: "#1890ff" }}>{formatCurrency(value)}</Text>
      ),
    },
    {
      title: "Lifetime Value",
      dataIndex: "totalLifetimeValue",
      key: "totalLifetimeValue",
      sorter: (a: any, b: any) => b.totalLifetimeValue - a.totalLifetimeValue,
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
      title: "Avg Monthly Orders",
      dataIndex: "avgMonthlyOrders",
      key: "avgMonthlyOrders",
      render: (orders: number) => <Text>{orders}</Text>,
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      render: (contact: string) => (
        <Button type="link" icon={<PhoneOutlined />} size="small">
          {contact}
        </Button>
      ),
    },
  ];

  const totalInactive = inactiveDealersData.length;
  const totalLostRevenue = inactivityPeriods.reduce(
    (sum, item) => sum + item.lostRevenue,
    0,
  );
  const criticalDealers = inactiveDealersData.filter(
    (d) => d.status === "Critical",
  ).length;
  const totalLifetimeValue = inactiveDealersData.reduce(
    (sum, d) => sum + d.totalLifetimeValue,
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
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <ClockCircleOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Inactive Dealers
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  Dealers with no purchases in last 30/60/90 days
                </Paragraph>
              </div>
            </div>
            <Space>
              <Select
                value={period}
                onChange={setPeriod}
                style={{ width: 180 }}
                options={[
                  { label: "30+ Days Inactive", value: "30-days" },
                  { label: "60+ Days Inactive", value: "60-days" },
                  { label: "90+ Days Inactive", value: "90-days" },
                  { label: "All Inactive", value: "all" },
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
          message="Urgent: High-Value Dealers at Risk"
          description={`${criticalDealers} critical dealers (90+ days inactive) with combined lifetime value of ₹${(totalLifetimeValue / 10000000).toFixed(2)}Cr. Immediate outreach recommended.`}
          type="error"
          icon={<WarningOutlined />}
          showIcon
          className="mb-6"
        />

        {/* Key Metrics */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Inactive Dealers"
                value={totalInactive}
                valueStyle={{ color: "#fa8c16" }}
                prefix={<ShopOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Potential Lost Revenue"
                value={totalLostRevenue / 100000}
                precision={2}
                suffix="L/month"
                prefix="₹"
                valueStyle={{ color: "#f5222d" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Critical Cases"
                value={criticalDealers}
                valueStyle={{ color: "#f5222d" }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Lifetime Value"
                value={totalLifetimeValue / 10000000}
                precision={2}
                suffix="Cr"
                prefix="₹"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={12}>
            <Card title="Inactivity Period Distribution">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={inactivityPeriods}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="dealers" fill="#fa8c16" name="Dealers Count" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {inactivityPeriods.map((period) => (
                  <div
                    key={period.period}
                    className="flex justify-between items-center"
                  >
                    <Text>{period.period}</Text>
                    <Space>
                      <Tag color="orange">{period.dealers} dealers</Tag>
                      <Text strong style={{ color: "#f5222d" }}>
                        {formatCurrency(period.lostRevenue)}/mo
                      </Text>
                    </Space>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Zone-wise Distribution">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={zoneDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload }) =>
                      `${payload?.status}: ${payload?.percentage}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
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
            </Card>
          </Col>
        </Row>

        {/* Reactivation Success */}
        <Card title="Reactivation Campaign Success Rate" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reactivationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="contacted"
                stroke="#1890ff"
                strokeWidth={2}
                name="Contacted"
              />
              <Line
                type="monotone"
                dataKey="reactivated"
                stroke="#52c41a"
                strokeWidth={2}
                name="Successfully Reactivated"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Table */}
        <Card title="Detailed Inactive Dealers List">
          <Table
            columns={columns}
            dataSource={inactiveDealersData}
            rowKey="dealerId"
            pagination={false}
            scroll={{ x: 1300 }}
          />
        </Card>

        {/* Action Plan */}
        <Card title="Reactivation Strategy & Action Plan" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-red-900">
                  🚨 Immediate Outreach (Critical)
                </Title>
                <Paragraph className="text-red-800 !mb-0">
                  Contact Electronics Mart and Innovative Gadgets immediately
                  (145+ days inactive). Offer exclusive 15% discount on next
                  order. Schedule personal visits to understand issues.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  📞 High Priority Follow-up
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  Galaxy Electronics and Tech Paradise (90+ days) - High
                  lifetime value dealers. Send personalized email with special
                  offers. Follow up with phone call within 48 hours.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  💡 Win-back Campaign
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  Launch automated email campaign for 30-60 day inactive
                  dealers. Include new product launches, seasonal offers, and
                  flexible payment terms to re-engage.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  📊 Success Metrics
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  Current reactivation rate: 64% (Jun). Target: 75%. Potential
                  revenue recovery: ₹17.5L/month if 50% of inactive dealers are
                  successfully reactivated.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default InactiveDealersPage;
