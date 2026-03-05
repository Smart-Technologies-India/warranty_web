"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { Button, Card, Empty, Input, Modal, Spin, Table, Tag, Typography } from "antd";
import {
  ProductManfStockItem,
  useBatchDealerSalesQuery,
  useCreateManfStockMutation,
  useProductManfStockQuery,
} from "@/services/admin/product";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

const ProductStockPage = () => {
  const router = useRouter();
  const params = useParams();

  const companyId = parseInt(params.id as string);
  const productId = parseInt(params.productId as string);

  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [selectedBatchNumber, setSelectedBatchNumber] = useState("");
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [batchNumber, setBatchNumber] = useState("");
  const [units, setUnits] = useState(1);

  const {
    data: stockData,
    isLoading: isStockLoading,
    isError: isStockError,
    error: stockError,
    refetch: refetchStock,
  } = useProductManfStockQuery({
    companyId,
    productId,
  });

  const {
    data: batchSalesData,
    isLoading: isBatchSalesLoading,
    isError: isBatchSalesError,
    error: batchSalesError,
  } = useBatchDealerSalesQuery({
    companyId,
    productId,
    batchNumber: selectedBatchNumber,
    enabled: isSalesModalOpen,
  });

  const createStockMutation = useCreateManfStockMutation({
    companyId,
    productId,
  });

  const sortedStockData = useMemo(
    () => [...(stockData || [])].sort((a, b) => a.id - b.id),
    [stockData],
  );

  const handleBack = () => {
    router.push(`/company/${companyId}/products/${productId}`);
  };

  const handleOpenSalesModal = (batchNumber: string) => {
    setSelectedBatchNumber(batchNumber);
    setIsSalesModalOpen(true);
  };

  const handleCreateStock = () => {
    const userId = getCookie("id");

    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    if (!batchNumber.trim()) {
      toast.error("Batch number is required.");
      return;
    }

    if (units <= 0) {
      toast.error("Units must be greater than 0.");
      return;
    }

    createStockMutation.mutate(
      {
        company_id: companyId,
        product_id: productId,
        batch_number: batchNumber.trim(),
        quantity: units,
        status: "ACTIVE",
        createdById: parseInt(userId.toString()),
      },
      {
        onSuccess: () => {
          setIsAddStockModalOpen(false);
          setBatchNumber("");
          setUnits(1);
        },
      },
    );
  };

  const stockColumns = [
    {
      title: "Batch Number",
      dataIndex: "batch_number",
      key: "batch_number",
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Stocked On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) =>
        new Date(value).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      title: "Last Sold/Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value: string) =>
        new Date(value).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      title: "Units Present",
      dataIndex: "quantity",
      key: "quantity",
      render: (value: number) => (
        <Text strong className="text-gray-900">
          {value}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: ProductManfStockItem["status"]) => (
        <Tag color={value === "ACTIVE" ? "green" : "red"}>{value}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: ProductManfStockItem) => (
        <Button onClick={() => handleOpenSalesModal(record.batch_number)}>
          View
        </Button>
      ),
    },
  ];

  const dealerSalesColumns = [
    {
      title: "Dealer",
      dataIndex: ["dealer_purch", "name"],
      key: "dealer",
    },
    {
      title: "Quantity Bought",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Date",
      dataIndex: "sale_date",
      key: "sale_date",
      render: (value: string) =>
        new Date(value).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  if (isStockLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading stock details...</p>
        </div>
      </div>
    );
  }

  if (isStockError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg text-center">
          <p className="text-red-600 mb-4">
            {stockError instanceof Error ? stockError.message : "Failed to load stock"}
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={handleBack}>Back</Button>
            <Button type="primary" onClick={() => refetchStock()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Card className="shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button type="text" onClick={handleBack}>
                ← Back
              </Button>
              <div>
                <Title level={4} className="mb-0! text-gray-900">
                  Product Stock (Batch Wise)
                </Title>
                <Text className="text-gray-500">Product ID: {productId}</Text>
              </div>
            </div>
            <Button
              type="primary"
              className="bg-amber-600 hover:bg-amber-700 border-amber-600 hover:border-amber-700"
              onClick={() => setIsAddStockModalOpen(true)}
            >
              Add Stock
            </Button>
          </div>
        </Card>

        <Card className="shadow-sm border border-gray-200">
          <Table
            rowKey="id"
            dataSource={sortedStockData}
            columns={stockColumns}
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: <Empty description="No stock batches available" />,
            }}
          />
        </Card>
      </div>

      <Modal
        title="Add Stock"
        open={isAddStockModalOpen}
        onCancel={() => setIsAddStockModalOpen(false)}
        onOk={handleCreateStock}
        okText="Add"
        confirmLoading={createStockMutation.isPending}
      >
        <div className="space-y-4 mt-4">
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Batch Number</Text>
            <Input
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="Enter batch number"
            />
          </div>
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Number of Units</Text>
            <Input
              type="number"
              min={1}
              value={units}
              onChange={(e) => setUnits(Number(e.target.value || 1))}
              placeholder="Enter units"
            />
          </div>
        </div>
      </Modal>

      <Modal
        title={`Dealer Sales for Batch: ${selectedBatchNumber}`}
        open={isSalesModalOpen}
        onCancel={() => setIsSalesModalOpen(false)}
        footer={null}
        width={800}
      >
        {isBatchSalesLoading ? (
          <div className="py-8 text-center">
            <Spin />
          </div>
        ) : isBatchSalesError ? (
          <div className="py-4 text-red-600">
            {batchSalesError instanceof Error
              ? batchSalesError.message
              : "Failed to load dealer sales for this batch."}
          </div>
        ) : (
          <Table
            rowKey="id"
            dataSource={batchSalesData || []}
            columns={dealerSalesColumns}
            pagination={{ pageSize: 8 }}
            locale={{
              emptyText: <Empty description="No dealer purchases found for this batch" />,
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProductStockPage;
