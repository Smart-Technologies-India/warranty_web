"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Modal,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { minValue, number, object, pipe, string } from "valibot";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { DateSelect } from "@/components/form/inputfields/dateselect";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { TextInput } from "@/components/form/inputfields/textinput";
import { onFormError } from "@/utils/methods";
import {
  CreateDealerB2BSaleFormInput,
  useActiveBuyerDealersQuery,
  useCreateDealerB2BSaleMutation,
  useSellerDealerStocksQuery,
} from "@/actions/dealer/service";

const { Title } = Typography;

const AddDealerB2BSaleSchema = object({
  dealer_purch_id: pipe(string("Select buyer dealer")),
  product_id: pipe(string("Select product")),
  batch_number: pipe(string("Select batch number")),
  quantity: pipe(number("Enter quantity"), minValue(1, "Quantity must be at least 1")),
  warranty_till: pipe(
    number("Enter warranty days"),
    minValue(1, "Warranty must be at least 1 day")
  ),
  sale_date: pipe(string("Select sale date")),
});

type AddDealerB2BSaleForm = CreateDealerB2BSaleFormInput;

const AddDealerB2BSalePage: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();

  const parsedDealerId = Number.parseInt(params.id as string, 10);
  const dealerId = Number.isNaN(parsedDealerId) ? 0 : parsedDealerId;

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] =
    useState<AddDealerB2BSaleForm | null>(null);

  const methods = useForm<AddDealerB2BSaleForm>({
    resolver: valibotResolver(AddDealerB2BSaleSchema),
    defaultValues: {
      dealer_purch_id: "",
      product_id: "",
      batch_number: "",
      quantity: 1,
      warranty_till: 365,
      sale_date: new Date().toISOString(),
    },
  });

  const selectedProductId = methods.watch("product_id");
  const selectedBatchNumber = methods.watch("batch_number");

  const { data: buyerDealers = [], isLoading: isDealersLoading } =
    useActiveBuyerDealersQuery(dealerId);
  const { data: sellerStocks = [], isLoading: isStocksLoading } =
    useSellerDealerStocksQuery(dealerId);

  const createB2BSaleMutation = useCreateDealerB2BSaleMutation();

  const productOptions = useMemo(() => {
    const uniqueProducts = new Map<number, string>();
    sellerStocks.forEach((stock) => {
      if (!uniqueProducts.has(stock.product.id)) {
        uniqueProducts.set(stock.product.id, stock.product.name);
      }
    });

    return Array.from(uniqueProducts.entries()).map(([id, name]) => ({
      value: id.toString(),
      label: name,
    }));
  }, [sellerStocks]);

  const batchOptions = useMemo(() => {
    if (!selectedProductId) return [];

    return sellerStocks
      .filter(
        (stock) =>
          stock.product.id === Number.parseInt(selectedProductId, 10) &&
          stock.quantity > 0
      )
      .map((stock) => ({
        value: stock.batch_number,
        label: `${stock.batch_number} (Available: ${stock.quantity})`,
      }));
  }, [sellerStocks, selectedProductId]);

  const selectedBatchStock = useMemo(() => {
    if (!selectedProductId || !selectedBatchNumber) return null;

    return (
      sellerStocks.find(
        (stock) =>
          stock.product.id === Number.parseInt(selectedProductId, 10) &&
          stock.batch_number === selectedBatchNumber
      ) ?? null
    );
  }, [sellerStocks, selectedProductId, selectedBatchNumber]);

  const onSubmit = (data: AddDealerB2BSaleForm) => {
    if (!selectedBatchStock) {
      toast.error("Please select a valid batch");
      return;
    }

    if (data.quantity > selectedBatchStock.quantity) {
      toast.error(
        `Quantity exceeds available stock. Available: ${selectedBatchStock.quantity}`
      );
      return;
    }

    setPendingFormData(data);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingFormData) return;

    const userId = getCookie("id");
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    createB2BSaleMutation.mutate(
      {
        dealerId,
        createdById: Number.parseInt(userId.toString(), 10),
        formData: pendingFormData,
      },
      {
        onSuccess: () => {
          toast.success("B2B sale created successfully!");
          queryClient.invalidateQueries({ queryKey: ["dealerB2BSales", dealerId] });
          queryClient.invalidateQueries({ queryKey: ["sellerDealerStocks", dealerId] });
          router.push(`/dealer/${dealerId}/b2b`);
        },
        onError: (error: Error) => {
          toast.error(`Failed to create B2B sale: ${error.message}`);
        },
      }
    );

    setIsConfirmModalOpen(false);
    setPendingFormData(null);
  };

  const handleBack = () => {
    router.push(`/dealer/${dealerId}/b2b`);
  };

  if (isDealersLoading || isStocksLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button icon={<ArrowLeftOutlined />} onClick={handleBack} type="text">
                Back to B2B Sales
              </Button>
              <div>
                <Title level={3} className="mb-0!">
                  Add B2B Sale
                </Title>
                <p className="text-gray-500">Create sale from this dealer to another dealer</p>
              </div>
            </div>
          </div>

          <FormProvider {...methods}>
            <form className="space-y-4" onSubmit={methods.handleSubmit(onSubmit, onFormError)}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <MultiSelect
                    name="dealer_purch_id"
                    title="Buyer Dealer"
                    placeholder="Search by name, contact or PAN"
                    required={true}
                    options={buyerDealers.map((dealer) => ({
                      value: dealer.id.toString(),
                      label:
                        [dealer.name, dealer.contact1, dealer.pan]
                          .filter(Boolean)
                          .join(" | ") || `Dealer ${dealer.id}`,
                    }))}
                  />
                </div>

                <div>
                  <MultiSelect
                    name="product_id"
                    title="Product"
                    placeholder="Select product"
                    required={true}
                    options={productOptions}
                  />
                </div>

                <div>
                  <MultiSelect
                    name="batch_number"
                    title="Batch Number"
                    placeholder="Select batch number"
                    required={true}
                    options={batchOptions}
                    disable={!selectedProductId}
                  />
                </div>

                <div>
                  <TextInput<AddDealerB2BSaleForm>
                    name="quantity"
                    title="Quantity"
                    placeholder="Enter quantity"
                    required={true}
                    onlynumber={true}
                    asNumber={true}
                  />
                  {selectedBatchStock && (
                    <p className="mt-1 text-xs text-gray-500">
                      Available stock: {selectedBatchStock.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <TextInput<AddDealerB2BSaleForm>
                    name="warranty_till"
                    title="Warranty Days"
                    placeholder="Enter warranty days"
                    required={true}
                    onlynumber={true}
                    asNumber={true}
                  />
                </div>

                <div>
                  <DateSelect<AddDealerB2BSaleForm>
                    name="sale_date"
                    title="Sale Date"
                    placeholder="Select sale date"
                    required={true}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button onClick={handleBack}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={createB2BSaleMutation.isPending}
                >
                  Create B2B Sale
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>

        <Modal
          title={
            <div className="flex items-center gap-2">
              <ExclamationCircleOutlined className="text-orange-500" />
              <span>Confirm B2B Sale</span>
            </div>
          }
          open={isConfirmModalOpen}
          onCancel={() => {
            setIsConfirmModalOpen(false);
            setPendingFormData(null);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsConfirmModalOpen(false);
                setPendingFormData(null);
              }}
            >
              Cancel
            </Button>,
            <Button
              key="confirm"
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={createB2BSaleMutation.isPending}
              onClick={handleConfirmSubmit}
            >
              Confirm Sale
            </Button>,
          ]}
        >
          {pendingFormData && (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Buyer Dealer">
                <Tag color="blue">
                  {buyerDealers.find((d) => d.id === Number.parseInt(pendingFormData.dealer_purch_id, 10))?.name}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Product">
                <Tag color="green">
                  {sellerStocks.find((stock) => stock.product.id === Number.parseInt(pendingFormData.product_id, 10))?.product.name}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Batch Number">
                <Tag color="purple">{pendingFormData.batch_number}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                <Tag color="orange">{pendingFormData.quantity}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Warranty Days">
                <Tag color="cyan">{pendingFormData.warranty_till} days</Tag>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AddDealerB2BSalePage;
