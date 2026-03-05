"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, Row, Col, Typography, Space, Tag } from "antd";
import {
  BarChartOutlined,
  ShoppingOutlined,
  UserOutlined,
  InboxOutlined,
  CustomerServiceOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FundOutlined,
  StockOutlined,
  TeamOutlined,
  ShopOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  route: string;
  category: "sales" | "stock" | "claims" | "dealers" | "products" | "performance";
  tag?: string;
}

const CompanyReportsPage: React.FC = () => {
  const router = useRouter();

  const reportCategories: ReportCard[] = [
    // SALES & REVENUE REPORTS
    {
      id: "sales-overview",
      title: "Sales Overview Dashboard",
      description: "Comprehensive view of total sales, revenue trends, and period comparisons",
      icon: <BarChartOutlined className="text-2xl" />,
      color: "#1890ff",
      bgColor: "#e6f7ff",
      route: "/company/reports/sales-overview",
      category: "sales",
      tag: "Popular",
    },
    {
      id: "revenue-by-product",
      title: "Revenue by Product",
      description: "Product-wise revenue breakdown and contribution analysis",
      icon: <DollarOutlined className="text-2xl" />,
      color: "#52c41a",
      bgColor: "#f6ffed",
      route: "/company/reports/revenue-by-product",
      category: "sales",
    },
    {
      id: "revenue-by-dealer",
      title: "Revenue by Dealer",
      description: "Dealer-wise revenue contribution and performance metrics",
      icon: <ShopOutlined className="text-2xl" />,
      color: "#13c2c2",
      bgColor: "#e6fffb",
      route: "/company/reports/revenue-by-dealer",
      category: "sales",
    },
    {
      id: "monthly-sales-trend",
      title: "Monthly Sales Trends",
      description: "Month-over-month sales analysis with growth indicators",
      icon: <LineChartOutlined className="text-2xl" />,
      color: "#722ed1",
      bgColor: "#f9f0ff",
      route: "/company/reports/monthly-sales",
      category: "sales",
    },
    {
      id: "quarterly-performance",
      title: "Quarterly Performance",
      description: "Quarter-wise performance analysis and YoY comparison",
      icon: <PieChartOutlined className="text-2xl" />,
      color: "#eb2f96",
      bgColor: "#fff0f6",
      route: "/company/reports/quarterly-performance",
      category: "sales",
    },

    // DEALER PERFORMANCE REPORTS
    {
      id: "top-dealers-quantity",
      title: "Top 10 Dealers by Quantity",
      description: "Dealers with highest product purchase quantities",
      icon: <TrophyOutlined className="text-2xl" />,
      color: "#faad14",
      bgColor: "#fffbe6",
      route: "/company/reports/top-dealers-quantity",
      category: "dealers",
      tag: "Trending",
    },
    {
      id: "top-dealers-value",
      title: "Top 10 Dealers by Value",
      description: "Dealers with highest purchase value and revenue contribution",
      icon: <FireOutlined className="text-2xl" />,
      color: "#f5222d",
      bgColor: "#fff1f0",
      route: "/company/reports/top-dealers-value",
      category: "dealers",
      tag: "Trending",
    },
    {
      id: "dealer-performance-comparison",
      title: "Dealer Performance Comparison",
      description: "Compare multiple dealers across key performance metrics",
      icon: <FundOutlined className="text-2xl" />,
      color: "#1890ff",
      bgColor: "#e6f7ff",
      route: "/company/reports/dealer-comparison",
      category: "dealers",
    },
    {
      id: "inactive-dealers",
      title: "Inactive Dealers",
      description: "Dealers with no purchases in last 30/60/90 days",
      icon: <ClockCircleOutlined className="text-2xl" />,
      color: "#fa8c16",
      bgColor: "#fff7e6",
      route: "/company/reports/inactive-dealers",
      category: "dealers",
    },
    {
      id: "dealer-zone-analysis",
      title: "Dealer Zone-wise Analysis",
      description: "Geographic distribution and performance by zones",
      icon: <TeamOutlined className="text-2xl" />,
      color: "#2f54eb",
      bgColor: "#f0f5ff",
      route: "/company/reports/dealer-zone-analysis",
      category: "dealers",
    },

    // STOCK & INVENTORY REPORTS
    {
      id: "pending-stock-dealers",
      title: "Dealers with Pending Stock",
      description: "Dealers having highest unsold inventory and aging analysis",
      icon: <InboxOutlined className="text-2xl" />,
      color: "#fa541c",
      bgColor: "#fff2e8",
      route: "/company/reports/pending-stock",
      category: "stock",
      tag: "Important",
    },
    {
      id: "low-stock-dealers",
      title: "Low Stock Alert by Dealer",
      description: "Dealers running low on specific products - reorder recommendations",
      icon: <WarningOutlined className="text-2xl" />,
      color: "#faad14",
      bgColor: "#fffbe6",
      route: "/company/reports/low-stock-dealers",
      category: "stock",
      tag: "Alert",
    },
    {
      id: "top-sold-products",
      title: "Top Sold Products",
      description: "Best-selling products with quantity and revenue metrics",
      icon: <RiseOutlined className="text-2xl" />,
      color: "#52c41a",
      bgColor: "#f6ffed",
      route: "/company/reports/top-sold-products",
      category: "stock",
      tag: "Popular",
    },
    {
      id: "least-sold-products",
      title: "Slow-Moving Products",
      description: "Products with lowest sales - inventory optimization insights",
      icon: <FallOutlined className="text-2xl" />,
      color: "#f5222d",
      bgColor: "#fff1f0",
      route: "/company/reports/slow-moving-products",
      category: "stock",
    },
    {
      id: "stock-turnover-ratio",
      title: "Stock Turnover Analysis",
      description: "Inventory turnover ratios and efficiency metrics by product",
      icon: <StockOutlined className="text-2xl" />,
      color: "#13c2c2",
      bgColor: "#e6fffb",
      route: "/company/reports/stock-turnover",
      category: "stock",
    },
    {
      id: "product-aging-report",
      title: "Product Aging Report",
      description: "Stock aging analysis - products in inventory for 30/60/90+ days",
      icon: <ClockCircleOutlined className="text-2xl" />,
      color: "#722ed1",
      bgColor: "#f9f0ff",
      route: "/company/reports/product-aging",
      category: "stock",
    },

    // WARRANTY CLAIMS REPORTS
    {
      id: "claims-overview",
      title: "Claims Overview Dashboard",
      description: "Total claims, resolution rate, and pending claims analysis",
      icon: <CustomerServiceOutlined className="text-2xl" />,
      color: "#1890ff",
      bgColor: "#e6f7ff",
      route: "/company/reports/claims-overview",
      category: "claims",
      tag: "Popular",
    },
    {
      id: "most-claimed-products",
      title: "Products with Most Claims",
      description: "Products receiving highest number of warranty claims",
      icon: <WarningOutlined className="text-2xl" />,
      color: "#f5222d",
      bgColor: "#fff1f0",
      route: "/company/reports/most-claimed-products",
      category: "claims",
      tag: "Important",
    },
    {
      id: "least-claimed-products",
      title: "Most Reliable Products",
      description: "Products with lowest claim rates - quality indicators",
      icon: <CheckCircleOutlined className="text-2xl" />,
      color: "#52c41a",
      bgColor: "#f6ffed",
      route: "/company/reports/least-claimed-products",
      category: "claims",
    },
    {
      id: "claim-resolution-time",
      title: "Claim Resolution Time Analysis",
      description: "Average time to resolve claims and bottleneck identification",
      icon: <ClockCircleOutlined className="text-2xl" />,
      color: "#fa8c16",
      bgColor: "#fff7e6",
      route: "/company/reports/claim-resolution-time",
      category: "claims",
    },
    {
      id: "claim-status-breakdown",
      title: "Claim Status Breakdown",
      description: "Distribution of claims by status (Open, In Progress, Resolved)",
      icon: <PieChartOutlined className="text-2xl" />,
      color: "#13c2c2",
      bgColor: "#e6fffb",
      route: "/company/reports/claim-status",
      category: "claims",
    },
    {
      id: "claim-category-analysis",
      title: "Claims by Category",
      description: "Issue category breakdown and recurring problem identification",
      icon: <BarChartOutlined className="text-2xl" />,
      color: "#722ed1",
      bgColor: "#f9f0ff",
      route: "/company/reports/claim-categories",
      category: "claims",
    },
    {
      id: "claims-by-dealer",
      title: "Claims by Dealer",
      description: "Dealer-wise claim analysis and potential quality issues",
      icon: <ShopOutlined className="text-2xl" />,
      color: "#eb2f96",
      bgColor: "#fff0f6",
      route: "/company/reports/claims-by-dealer",
      category: "claims",
    },

    // PRODUCT PERFORMANCE REPORTS
    {
      id: "product-profitability",
      title: "Product Profitability Analysis",
      description: "Product-wise profit margins and ROI calculations",
      icon: <DollarOutlined className="text-2xl" />,
      color: "#52c41a",
      bgColor: "#f6ffed",
      route: "/company/reports/product-profitability",
      category: "products",
      tag: "Popular",
    },
    {
      id: "product-lifecycle",
      title: "Product Lifecycle Analysis",
      description: "Product performance across introduction, growth, maturity phases",
      icon: <LineChartOutlined className="text-2xl" />,
      color: "#1890ff",
      bgColor: "#e6f7ff",
      route: "/company/reports/product-lifecycle",
      category: "products",
    },
    {
      id: "product-category-performance",
      title: "Category Performance",
      description: "Performance comparison across product categories",
      icon: <PieChartOutlined className="text-2xl" />,
      color: "#722ed1",
      bgColor: "#f9f0ff",
      route: "/company/reports/category-performance",
      category: "products",
    },
    {
      id: "new-vs-existing-products",
      title: "New vs Existing Products",
      description: "Sales comparison between newly launched and existing products",
      icon: <ThunderboltOutlined className="text-2xl" />,
      color: "#fa8c16",
      bgColor: "#fff7e6",
      route: "/company/reports/new-vs-existing",
      category: "products",
    },
    {
      id: "product-warranty-cost",
      title: "Warranty Cost by Product",
      description: "Product-wise warranty claim costs and impact on profitability",
      icon: <DollarOutlined className="text-2xl" />,
      color: "#f5222d",
      bgColor: "#fff1f0",
      route: "/company/reports/warranty-cost",
      category: "products",
    },

    // OVERALL PERFORMANCE REPORTS
    {
      id: "executive-dashboard",
      title: "Executive Dashboard",
      description: "High-level KPIs and strategic metrics for decision making",
      icon: <FundOutlined className="text-2xl" />,
      color: "#1890ff",
      bgColor: "#e6f7ff",
      route: "/company/reports/executive-dashboard",
      category: "performance",
      tag: "VIP",
    },
    {
      id: "market-share-analysis",
      title: "Market Share Analysis",
      description: "Company's market position and competitive analysis",
      icon: <PieChartOutlined className="text-2xl" />,
      color: "#13c2c2",
      bgColor: "#e6fffb",
      route: "/company/reports/market-share",
      category: "performance",
    },
    {
      id: "customer-satisfaction",
      title: "Customer Satisfaction Metrics",
      description: "Customer feedback, ratings, and satisfaction scores",
      icon: <UserOutlined className="text-2xl" />,
      color: "#52c41a",
      bgColor: "#f6ffed",
      route: "/company/reports/customer-satisfaction",
      category: "performance",
    },
    {
      id: "roi-analysis",
      title: "Return on Investment (ROI)",
      description: "Investment analysis and return metrics across products",
      icon: <RiseOutlined className="text-2xl" />,
      color: "#faad14",
      bgColor: "#fffbe6",
      route: "/company/reports/roi-analysis",
      category: "performance",
    },
  ];

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "sales":
        return { title: "Sales & Revenue Reports", icon: <BarChartOutlined />, color: "#1890ff" };
      case "dealers":
        return { title: "Dealer Performance Reports", icon: <ShopOutlined />, color: "#52c41a" };
      case "stock":
        return { title: "Stock & Inventory Reports", icon: <InboxOutlined />, color: "#fa8c16" };
      case "claims":
        return { title: "Warranty Claims Reports", icon: <CustomerServiceOutlined />, color: "#f5222d" };
      case "products":
        return { title: "Product Performance Reports", icon: <ShoppingOutlined />, color: "#722ed1" };
      case "performance":
        return { title: "Overall Performance Reports", icon: <FundOutlined />, color: "#13c2c2" };
      default:
        return { title: "Reports", icon: <BarChartOutlined />, color: "#1890ff" };
    }
  };

  const handleReportClick = (route: string) => {
    router.push(route);
  };

  const categories = Array.from(new Set(reportCategories.map((r) => r.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <BarChartOutlined className="text-4xl text-blue-600" />
            <Title level={1} className="!mb-0">
              Company Reports & Analytics
            </Title>
          </div>
          <Paragraph className="text-gray-600 text-lg">
            Comprehensive business intelligence and performance insights across all aspects of your operations.
            Select a report category below to access detailed analytics.
          </Paragraph>
          <div className="flex gap-2 mt-4">
            <Tag color="blue">{reportCategories.length} Reports Available</Tag>
            <Tag color="green">Real-time Data</Tag>
            <Tag color="purple">Exportable</Tag>
          </div>
        </div>

        {/* Report Categories */}
        {categories.map((category) => {
          const categoryInfo = getCategoryInfo(category);
          const categoryReports = reportCategories.filter((r) => r.category === category);

          return (
            <div key={category} className="mb-10">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                >
                  {categoryInfo.icon}
                </div>
                <div>
                  <Title level={3} className="!mb-0">
                    {categoryInfo.title}
                  </Title>
                  <Text className="text-gray-500">{categoryReports.length} reports</Text>
                </div>
              </div>

              {/* Report Cards */}
              <Row gutter={[16, 16]}>
                {categoryReports.map((report) => (
                  <Col xs={24} sm={12} lg={8} key={report.id}>
                    <Card
                      hoverable
                      className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
                      onClick={() => handleReportClick(report.route)}
                      style={{ borderLeft: `4px solid ${report.color}` }}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: report.bgColor, color: report.color }}
                          >
                            {report.icon}
                          </div>
                          {report.tag && (
                            <Tag color={report.tag === "VIP" ? "gold" : report.tag === "Popular" ? "blue" : report.tag === "Trending" ? "orange" : report.tag === "Important" ? "red" : "green"}>
                              {report.tag}
                            </Tag>
                          )}
                        </div>
                        <Title level={5} className="!mb-2">
                          {report.title}
                        </Title>
                        <Paragraph className="text-gray-600 text-sm mb-0 flex-grow">
                          {report.description}
                        </Paragraph>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          );
        })}

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="text-blue-600 text-2xl">
              <BarChartOutlined />
            </div>
            <div>
              <Title level={5} className="!mb-2 text-blue-900">
                Need a Custom Report?
              </Title>
              <Paragraph className="text-blue-800 mb-3">
                Can't find what you're looking for? Our analytics team can create custom reports tailored to your
                specific business needs.
              </Paragraph>
              <Space>
                <Tag color="blue">Custom Dashboards</Tag>
                <Tag color="blue">Scheduled Reports</Tag>
                <Tag color="blue">Data Export</Tag>
                <Tag color="blue">API Access</Tag>
              </Space>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyReportsPage;
