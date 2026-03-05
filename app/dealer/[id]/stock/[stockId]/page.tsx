"use client";

import React from "react";
import { Card, Typography, Tag, Button, Descriptions, Divider, Table } from "antd";
import { useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { useRouter } from "next/navigation";

// Icons
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  BankOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Types
interface DealerStockDetail {
  id: number;
  batch_number: string;
  quantity: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  product: {
    id: number;
    name: string;
    price: number;
    warranty_time: number;
    status: "ACTIVE" | "INACTIVE";
    description: string;
    subcategory: {
      name: string;
      product_category: {
        name: string;
      };
    };
  };
  dealer: {
    id: number;
    name: string;
    contact1: string;
    address?: string;
  };
  company: {
    id: number;
    name: string;
    contact1: string;
    address?: string;
  };
}

interface ProductPurchaseRow {
  id: number;
  sale_date: string;
  batch_number: string;
  quantity: number;
  dealer_seller: {
    name: string;
    contact1: string;
    address?: string;
  };
}

interface ProductB2BSaleRow {
  id: number;
  sale_date: string;
  batch_number: string;
  quantity: number;
  dealer_purch: {
    name: string;
    contact1: string;
    address?: string;
  };
}

interface ProductCustomerSaleRow {
  id: number;
  sale_date: string;
  warranty_till: number;
  customer: {
    name: string;
    contact1: string;
    address?: string;
  };
}

// GraphQL query
const GET_DEALER_STOCK_BY_ID = `
  query GetDealerStockById($getDealerStockByIdId: Int!) {
    getDealerStockById(id: $getDealerStockByIdId) {
      batch_number
      createdAt
      id
      product {
        name
        price
        id
        warranty_time
        status
        description
        subcategory {
          name
          product_category {
            name
          }
        }
      }
      quantity
      status
      dealer {
        name
        id
        contact1
        address
      }
      company {
        name
        id
        contact1
        address
      }
    }
  }
`;

const GET_PRODUCT_PURCHASES = `
  query GetAllDealerSales($whereSearchInput: WhereDealerSalesSearchInput!) {
    getAllDealerSales(whereSearchInput: $whereSearchInput) {
      id
      sale_date
      batch_number
      quantity
      dealer_seller {
        name
        contact1
        address
      }
    }
  }
`;

const GET_PRODUCT_B2B_SALES = `
  query GetAllDealerSales($whereSearchInput: WhereDealerSalesSearchInput!) {
    getAllDealerSales(whereSearchInput: $whereSearchInput) {
      id
      sale_date
      batch_number
      quantity
      dealer_purch {
        name
        contact1
        address
      }
    }
  }
`;

const GET_PRODUCT_CUSTOMER_SALES = `
  query GetAllSales($whereSearchInput: WhereSalesSearchInput!) {
    getAllSales(whereSearchInput: $whereSearchInput) {
      id
      sale_date
      warranty_till
      customer {
        name
        contact1
        address
      }
    }
  }
`;

// API function
const fetchDealerStockById = async (
  stockId: number
): Promise<DealerStockDetail> => {
  const response = await ApiCall<{ getDealerStockById: DealerStockDetail }>({
    query: GET_DEALER_STOCK_BY_ID,
    variables: {
      getDealerStockByIdId: stockId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getDealerStockById;
};

const fetchProductPurchases = async (
  dealerId: number,
  productId: number
): Promise<ProductPurchaseRow[]> => {
  const response = await ApiCall<{ getAllDealerSales: ProductPurchaseRow[] }>({
    query: GET_PRODUCT_PURCHASES,
    variables: {
      whereSearchInput: {
        dealer_purch_id: dealerId,
        product_id: productId,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllDealerSales;
};

const fetchProductB2BSales = async (
  dealerId: number,
  productId: number
): Promise<ProductB2BSaleRow[]> => {
  const response = await ApiCall<{ getAllDealerSales: ProductB2BSaleRow[] }>({
    query: GET_PRODUCT_B2B_SALES,
    variables: {
      whereSearchInput: {
        dealer_seller_id: dealerId,
        product_id: productId,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllDealerSales;
};

const fetchProductCustomerSales = async (
  dealerId: number,
  productId: number
): Promise<ProductCustomerSaleRow[]> => {
  const response = await ApiCall<{ getAllSales: ProductCustomerSaleRow[] }>({
    query: GET_PRODUCT_CUSTOMER_SALES,
    variables: {
      whereSearchInput: {
        dealer_id: dealerId,
        product_id: productId,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllSales;
};

interface DealerStockViewPageProps {
  params: Promise<{
    id: string;
    stockId: string;
  }>;
}

const DealerStockViewPage: React.FC<DealerStockViewPageProps> = ({
  params,
}) => {
  const router = useRouter();
  const unwrappedParams = React.use(params) as { id: string; stockId: string };
  const dealerId = parseInt(unwrappedParams.id);
  const stockId = parseInt(unwrappedParams.stockId);


  // Fetch stock details
  const {
    data: stockData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dealerStock", stockId],
    queryFn: () => fetchDealerStockById(stockId),
    enabled: !!stockId,
  });

  const { data: purchaseRows = [], isLoading: isLoadingPurchases } = useQuery({
    queryKey: ["dealerProductPurchases", dealerId, stockData?.product.id],
    queryFn: () => fetchProductPurchases(dealerId, stockData!.product.id),
    enabled: !!dealerId && !!stockData?.product.id,
  });

  const { data: b2bSaleRows = [], isLoading: isLoadingB2BSales } = useQuery({
    queryKey: ["dealerProductB2BSales", dealerId, stockData?.product.id],
    queryFn: () => fetchProductB2BSales(dealerId, stockData!.product.id),
    enabled: !!dealerId && !!stockData?.product.id,
  });

  const { data: customerSaleRows = [], isLoading: isLoadingCustomerSales } = useQuery({
    queryKey: ["dealerProductCustomerSales", dealerId, stockData?.product.id],
    queryFn: () => fetchProductCustomerSales(dealerId, stockData!.product.id),
    enabled: !!dealerId && !!stockData?.product.id,
  });

  const saleRows = React.useMemo(
    () => [
      ...b2bSaleRows.map((sale) => ({
        key: `b2b-${sale.id}`,
        type: "B2B",
        date: sale.sale_date,
        batch: sale.batch_number,
        quantity: sale.quantity,
        partyName: sale.dealer_purch.name,
        partyContact: sale.dealer_purch.contact1,
        partyAddress: sale.dealer_purch.address,
      })),
      ...customerSaleRows.map((sale) => ({
        key: `d2c-${sale.id}`,
        type: "Customer",
        date: sale.sale_date,
        batch: "-",
        quantity: 1,
        partyName: sale.customer.name,
        partyContact: sale.customer.contact1,
        partyAddress: sale.customer.address,
      })),
    ].sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    [b2bSaleRows, customerSaleRows]
  );

  const handleBack = () => {
    router.push(`/dealer/${dealerId}/stock`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stock details...</p>
        </div>
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-8">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <Title level={3} className="text-gray-900">
                Stock Not Found
              </Title>
              <p className="text-gray-600 mb-6">
                The stock item you're looking for doesn't exist or has been
                removed.
              </p>
              <Button
                type="primary"
                onClick={handleBack}
                className="bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700"
              >
                Back to Stock List
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                type="text"
                className="hover:bg-gray-50"
              >
                Back to Stock
              </Button>
              <div>
                <Title level={3} className="!mb-0 text-gray-900">
                  Stock Details #{stockData.id}
                </Title>
                <p className="text-gray-500 mt-1">
                  Batch: {stockData.batch_number}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag
                color={stockData.status === "ACTIVE" ? "green" : "red"}
                className="text-sm px-3 py-1"
              >
                {stockData.status}
              </Tag>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stock Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stock Overview */}
            <Card title="Stock Overview" className="shadow-sm">
              <Descriptions column={2}>
                <Descriptions.Item
                  label={<span className="font-semibold">Stock ID</span>}
                >
                  <span className="font-mono text-gray-800">
                    #{stockData.id}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<span className="font-semibold">Batch Number</span>}
                >
                  <Tag color="blue" className="font-mono">
                    {stockData.batch_number}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<span className="font-semibold">Quantity</span>}
                >
                  <span className="text-2xl font-bold text-gray-900">
                    {stockData.quantity}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">units</span>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<span className="font-semibold">Status</span>}
                >
                  <Tag color={stockData.status === "ACTIVE" ? "green" : "red"}>
                    {stockData.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<span className="font-semibold">Created Date</span>}
                  span={2}
                >
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-gray-400" />
                    <span>
                      {new Date(stockData.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500">
                      at {new Date(stockData.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <div></div>

            {/* Product Information */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <ShoppingOutlined />
                  <span>Product Information</span>
                </div>
              }
              className="shadow-sm"
            >
              <div className="space-y-4">
                <div>
                  <Text strong className="text-lg text-gray-900">
                    {stockData.product.name}
                  </Text>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag color="orange">ID: {stockData.product.id}</Tag>
                    <Tag
                      color={
                        stockData.product.status === "ACTIVE" ? "green" : "red"
                      }
                    >
                      {stockData.product.status}
                    </Tag>
                  </div>
                </div>

                <Divider />

                <Descriptions column={2}>
                  <Descriptions.Item
                    label={<span className="font-semibold">Price</span>}
                  >
                    <span className="text-xl font-bold text-green-600">
                      ₹{stockData.product.price.toLocaleString()}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<span className="font-semibold">Warranty</span>}
                  >
                    <span className="font-semibold text-blue-600">
                      {stockData.product.warranty_time} days
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<span className="font-semibold">Category</span>}
                    span={2}
                  >
                    <div className="flex items-center gap-2">
                      <Tag color="purple">
                        {stockData.product.subcategory.product_category.name}
                      </Tag>
                      <span className="text-gray-400">→</span>
                      <Tag color="cyan">
                        {stockData.product.subcategory.name}
                      </Tag>
                    </div>
                  </Descriptions.Item>
                </Descriptions>

                {stockData.product.description && (
                  <>
                    <Divider />
                    <div>
                      <Text strong>Product Description:</Text>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <Text className="text-gray-700">
                          {stockData.product.description}
                        </Text>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Dealer Information */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <BankOutlined />
                  <span>Dealer Information</span>
                </div>
              }
              className="shadow-sm"
            >
              <div className="space-y-3">
                <div>
                  <Text type="secondary" className="text-sm">
                    Dealer Name
                  </Text>
                  <div className="font-semibold text-gray-900">
                    {stockData.dealer.name}
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">
                    Contact Number
                  </Text>
                  <div className="text-gray-600">
                    {stockData.dealer.contact1}
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">
                    Address
                  </Text>
                  <div className="text-gray-600">
                    {stockData.dealer.address || "N/A"}
                  </div>
                </div>
              </div>
            </Card>
            <div></div>

            {/* Company Information */}
            <Card title="Company Information" className="shadow-sm">
              <div className="space-y-3">
                <div>
                  <Text type="secondary" className="text-sm">
                    Company Name
                  </Text>
                  <div className="font-semibold text-gray-900">
                    {stockData.company.name}
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">
                    Contact Number
                  </Text>
                  <div className="text-gray-600">
                    {stockData.company.contact1}
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">
                    Address
                  </Text>
                  <div className="text-gray-600">
                    {stockData.company.address || "N/A"}
                  </div>
                </div>
              </div>
            </Card>
            <div></div>

            {/* Quick Stats */}
            <Card title="Quick Stats" className="shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700 font-medium">Total Value</span>
                  <span className="text-blue-900 font-bold text-lg">
                    ₹
                    {(
                      stockData.quantity * stockData.product.price
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700 font-medium">Per Unit</span>
                  <span className="text-green-900 font-bold text-lg">
                    ₹{stockData.product.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-purple-700 font-medium">Stock Age</span>
                  <span className="text-purple-900 font-bold">
                    {Math.floor(
                      (Date.now() - new Date(stockData.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card title="Purchase History (This Product)" className="shadow-sm">
            <Table
              size="small"
              loading={isLoadingPurchases}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              dataSource={purchaseRows}
              columns={[
                {
                  title: "Date",
                  dataIndex: "sale_date",
                  key: "sale_date",
                  render: (value: string) =>
                    new Date(value).toLocaleDateString(),
                },
                {
                  title: "Batch",
                  dataIndex: "batch_number",
                  key: "batch_number",
                  render: (value: string) => <Tag color="purple">{value}</Tag>,
                },
                {
                  title: "Qty",
                  dataIndex: "quantity",
                  key: "quantity",
                },
                {
                  title: "Purchased From",
                  key: "seller",
                  render: (_: unknown, row: ProductPurchaseRow) => (
                    <div>
                      <div className="font-medium">{row.dealer_seller.name}</div>
                      <div className="text-xs text-gray-500">
                        {row.dealer_seller.contact1}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          <Card title="Sale History (This Product)" className="shadow-sm">
            <Table
              size="small"
              loading={isLoadingB2BSales || isLoadingCustomerSales}
              rowKey="key"
              pagination={{ pageSize: 5 }}
              dataSource={saleRows}
              columns={[
                {
                  title: "Type",
                  dataIndex: "type",
                  key: "type",
                  render: (value: string) => (
                    <Tag color={value === "B2B" ? "blue" : "green"}>{value}</Tag>
                  ),
                },
                {
                  title: "Date",
                  dataIndex: "date",
                  key: "date",
                  render: (value: string) =>
                    new Date(value).toLocaleDateString(),
                },
                {
                  title: "Batch",
                  dataIndex: "batch",
                  key: "batch",
                },
                {
                  title: "Qty",
                  dataIndex: "quantity",
                  key: "quantity",
                },
                {
                  title: "Sold To",
                  key: "party",
                  render: (_: unknown, row: { partyName: string; partyContact: string }) => (
                    <div>
                      <div className="font-medium">{row.partyName}</div>
                      <div className="text-xs text-gray-500">{row.partyContact}</div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DealerStockViewPage;
