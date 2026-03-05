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
  Divider,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  FireOutlined,
  DollarOutlined,
  RiseOutlined,
  TrophyOutlined,
  DownloadOutlined,
  ShoppingOutlined,
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
  Area,
  AreaChart,
} from "recharts";

const { Title, Text, Paragraph } = Typography;

type DealerTier = "Platinum" | "Gold" | "Silver" | "Bronze";

interface DealerRevenueRecord {
  rank: number;
  dealerId: string;
  dealerName: string;
  zone: string;
  totalValue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueShare: number;
  growth: string;
  tier: DealerTier;
}

interface QuarterlyRevenueRecord {
  quarter: string;
  revenue: number;
}

interface ValueVsQuantityRecord {
  name: string;
  value: number;
  avgOrder: number;
}

const topDealersByValue: DealerRevenueRecord[] = [
  {
    rank: 1,
    dealerId: "D001",
    dealerName: "Tech Electronics Hub",
    zone: "North",
    totalValue: 45250000,
    totalOrders: 245,
    averageOrderValue: 184694,
    revenueShare: 18.2,
    growth: "+28.5%",
    tier: "Platinum",
  },
  {
    rank: 2,
    dealerId: "D045",
    dealerName: "Smart Gadgets Pro",
    zone: "South",
    totalValue: 41890000,
    totalOrders: 198,
    averageOrderValue: 211566,
    revenueShare: 16.8,
    growth: "+22.1%",
    tier: "Platinum",
  },
  {
    rank: 3,
    dealerId: "D023",
    dealerName: "Metro Electronics",
    zone: "East",
    totalValue: 38520000,
    totalOrders: 176,
    averageOrderValue: 218864,
    revenueShare: 15.5,
    growth: "+19.4%",
    tier: "Platinum",
  },
  {
    rank: 4,
    dealerId: "D089",
    dealerName: "Digital World Store",
    zone: "West",
    totalValue: 34750000,
    totalOrders: 165,
    averageOrderValue: 210606,
    revenueShare: 14.0,
    growth: "+17.2%",
    tier: "Gold",
  },
  {
    rank: 5,
    dealerId: "D012",
    dealerName: "Prime Electronics",
    zone: "North",
    totalValue: 31200000,
    totalOrders: 152,
    averageOrderValue: 205263,
    revenueShare: 12.5,
    growth: "+15.8%",
    tier: "Gold",
  },
  {
    rank: 6,
    dealerId: "D067",
    dealerName: "Future Tech Solutions",
    zone: "Central",
    totalValue: 28900000,
    totalOrders: 141,
    averageOrderValue: 204965,
    revenueShare: 11.6,
    growth: "+13.2%",
    tier: "Gold",
  },
  {
    rank: 7,
    dealerId: "D034",
    dealerName: "Galaxy Electronics",
    zone: "South",
    totalValue: 26500000,
    totalOrders: 138,
    averageOrderValue: 192029,
    revenueShare: 10.6,
    growth: "+11.5%",
    tier: "Silver",
  },
  {
    rank: 8,
    dealerId: "D056",
    dealerName: "Tech Paradise",
    zone: "East",
    totalValue: 24200000,
    totalOrders: 128,
    averageOrderValue: 189063,
    revenueShare: 9.7,
    growth: "+9.8%",
    tier: "Silver",
  },
  {
    rank: 9,
    dealerId: "D078",
    dealerName: "Electronics Mart",
    zone: "West",
    totalValue: 22100000,
    totalOrders: 119,
    averageOrderValue: 185714,
    revenueShare: 8.9,
    growth: "+7.2%",
    tier: "Silver",
  },
  {
    rank: 10,
    dealerId: "D091",
    dealerName: "Innovative Gadgets",
    zone: "North",
    totalValue: 19800000,
    totalOrders: 112,
    averageOrderValue: 176786,
    revenueShare: 7.9,
    growth: "+5.4%",
    tier: "Bronze",
  },
];

const quarterlyRevenue: QuarterlyRevenueRecord[] = [
  { quarter: "Q1 2024", revenue: 58000000 },
  { quarter: "Q2 2024", revenue: 62500000 },
  { quarter: "Q3 2024", revenue: 68200000 },
  { quarter: "Q4 2024", revenue: 72800000 },
  { quarter: "Q1 2025", revenue: 81500000 },
];

const valueVsQuantity: ValueVsQuantityRecord[] = topDealersByValue.map((dealer) => ({
  name: dealer.dealerName.split(" ")[0],
  value: dealer.totalValue / 1000000,
  avgOrder: dealer.averageOrderValue / 1000,
}));

const TopDealersByValuePage: React.FC = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("last-6-months");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const columns: ColumnsType<DealerRevenueRecord> = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      render: (rank: number) => (
        <div className="flex items-center gap-2">
          {rank <= 3 ? (
            <FireOutlined
              className="text-2xl"
              style={{
                color: rank === 1 ? "#f5222d" : rank === 2 ? "#fa8c16" : "#faad14",
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
      render: (_dealerName: string, record: DealerRevenueRecord) => (
        <div>
          <div className="flex items-center gap-2">
            <Text strong className="text-base">
              {record.dealerName}
            </Text>
            <Tag color={record.tier === "Platinum" ? "gold" : record.tier === "Gold" ? "orange" : record.tier === "Silver" ? "blue" : "default"}>
              {record.tier}
            </Tag>
          </div>
          <Text type="secondary" className="text-sm">
            ID: {record.dealerId} • {record.zone} Zone
          </Text>
        </div>
      ),
    },
    {
      title: "Total Revenue",
      dataIndex: "totalValue",
      key: "totalValue",
      sorter: (a: DealerRevenueRecord, b: DealerRevenueRecord) => b.totalValue - a.totalValue,
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
      title: "Orders",
      dataIndex: "totalOrders",
      key: "totalOrders",
      render: (orders: number) => <Text strong>{orders}</Text>,
    },
    {
      title: "Avg Order Value",
      dataIndex: "averageOrderValue",
      key: "averageOrderValue",
      render: (value: number) => (
        <Text className="text-blue-600 font-semibold">{formatCurrency(value)}</Text>
      ),
    },
    {
      title: "Revenue Share",
      dataIndex: "revenueShare",
      key: "revenueShare",
      render: (share: number) => (
        <div>
          <Progress percent={share} size="small" status="active" />
          <Text className="text-xs">{share}%</Text>
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
  ];

  const totalRevenue = topDealersByValue.reduce((sum, dealer) => sum + dealer.totalValue, 0);
  const avgRevenue = totalRevenue / topDealersByValue.length;
  const totalOrders = topDealersByValue.reduce((sum, dealer) => sum + dealer.totalOrders, 0);

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
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <FireOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  Top 10 Dealers by Revenue
                </Title>
                <Paragraph className="text-gray-600 !mb-0">
                  High-value dealers contributing maximum revenue
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
                  { label: "Last Quarter", value: "last-quarter" },
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
                title="Total Revenue (Top 10)"
                value={totalRevenue / 1000000}
                precision={2}
                suffix="M"
                prefix="₹"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Average Revenue"
                value={avgRevenue / 1000000}
                precision={2}
                suffix="M"
                prefix="₹"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={totalOrders}
                valueStyle={{ color: "#722ed1" }}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Top Contributor"
                value={topDealersByValue[0].revenueShare}
                suffix="%"
                valueStyle={{ color: "#f5222d" }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Revenue Comparison Chart */}
        <Card title="Revenue Comparison - Top 10 Dealers" className="mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={topDealersByValue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dealerName" angle={-45} textAnchor="end" height={120} />
              <YAxis
                yAxisId="left"
                label={{ value: "Revenue (₹ Crores)", angle: -90, position: "insideLeft" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "Avg Order (₹ Lakhs)", angle: 90, position: "insideRight" }}
              />
              <Tooltip
                formatter={(value?: number | string, name?: string) => {
                  const parsedValue =
                    typeof value === "number"
                      ? value
                      : Number.parseFloat(value ?? "0");
                  const numericValue = Number.isFinite(parsedValue) ? parsedValue : 0;
                  if (name === "Total Revenue") return formatCurrency(numericValue);
                  return formatCurrency(numericValue);
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="totalValue" fill="#52c41a" name="Total Revenue" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averageOrderValue"
                stroke="#ff7300"
                strokeWidth={2}
                name="Avg Order Value"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Quarterly Trend */}
        <Card title="Quarterly Revenue Trend (Top 10 Combined)" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={quarterlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip
                formatter={(value?: number | string) => {
                  const parsedValue =
                    typeof value === "number"
                      ? value
                      : Number.parseFloat(value ?? "0");
                  const numericValue = Number.isFinite(parsedValue) ? parsedValue : 0;
                  return formatCurrency(numericValue);
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1890ff"
                fill="#1890ff"
                fillOpacity={0.6}
                name="Total Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Table */}
        <Card title="Detailed Revenue Rankings">
          <Table
            columns={columns}
            dataSource={topDealersByValue}
            rowKey="dealerId"
            pagination={false}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Tier Analysis */}
        <Card title="Dealer Tier Distribution" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <TrophyOutlined className="text-4xl text-yellow-600 mb-2" />
                <Title level={4} className="!mb-1">
                  3
                </Title>
                <Text className="text-yellow-800">Platinum Dealers</Text>
                <Divider className="my-2" />
                <Text strong className="text-yellow-900">
                  50.5% Revenue
                </Text>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <TrophyOutlined className="text-4xl text-orange-600 mb-2" />
                <Title level={4} className="!mb-1">
                  3
                </Title>
                <Text className="text-orange-800">Gold Dealers</Text>
                <Divider className="my-2" />
                <Text strong className="text-orange-900">
                  38.1% Revenue
                </Text>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <TrophyOutlined className="text-4xl text-blue-600 mb-2" />
                <Title level={4} className="!mb-1">
                  3
                </Title>
                <Text className="text-blue-800">Silver Dealers</Text>
                <Divider className="my-2" />
                <Text strong className="text-blue-900">
                  29.2% Revenue
                </Text>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                <TrophyOutlined className="text-4xl text-gray-600 mb-2" />
                <Title level={4} className="!mb-1">
                  1
                </Title>
                <Text className="text-gray-800">Bronze Dealer</Text>
                <Divider className="my-2" />
                <Text strong className="text-gray-900">
                  7.9% Revenue
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Strategic Insights */}
        <Card title="Strategic Insights & Action Plan" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-green-900">
                  💰 Revenue Concentration
                </Title>
                <Paragraph className="text-green-800 !mb-0">
                  Top 3 dealers contribute 50.5% of total revenue. Implement VIP support programs and exclusive
                  benefits to retain these high-value partnerships.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-blue-900">
                  📊 Average Order Value Trends
                </Title>
                <Paragraph className="text-blue-800 !mb-0">
                  Metro Electronics has the highest AOV at ₹2.19L. Share best practices with other dealers to
                  increase their average order values.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-purple-900">
                  🎯 Growth Opportunities
                </Title>
                <Paragraph className="text-purple-800 !mb-0">
                  Dealers ranked 8-10 show lower growth rates. Provide targeted marketing support and volume
                  discounts to accelerate their performance.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <Title level={5} className="!mb-2 text-orange-900">
                  🚀 Recommended Actions
                </Title>
                <Paragraph className="text-orange-800 !mb-0">
                  Launch tiered loyalty program with exclusive benefits for Platinum dealers and growth
                  incentives for Silver/Bronze dealers to upgrade tiers.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default TopDealersByValuePage;
