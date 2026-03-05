"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCookie } from "cookies-next";
import {
  Button,
  Typography,
  Spin,
  Card,
  Descriptions,
  Tag,
  Input,
  Space,
  Empty,
  Modal,
} from "antd";
import {
  ProductFaqItem,
  ProductTroubleshootingItem,
  useCompanyProductDetailsQuery,
  useCreateProductFaqMutation,
  useCreateProductTroubleshootingMutation,
  useDeleteProductFaqMutation,
  useDeleteProductTroubleshootingMutation,
  useProductFaqsQuery,
  useProductTroubleshootingQuery,
  useUpdateProductFaqMutation,
  useUpdateProductTroubleshootingMutation,
} from "@/services/admin/product";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

const ProductDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);
  const productId = parseInt(params.productId as string);

  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newPriority, setNewPriority] = useState(1);
  const [isCreateFaqModalOpen, setIsCreateFaqModalOpen] = useState(false);
  const [isEditFaqModalOpen, setIsEditFaqModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<ProductFaqItem | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editPriority, setEditPriority] = useState(1);
  const [newIssue, setNewIssue] = useState("");
  const [newSolution, setNewSolution] = useState("");
  const [newTroubleshootPriority, setNewTroubleshootPriority] = useState(1);
  const [isCreateTroubleshootModalOpen, setIsCreateTroubleshootModalOpen] =
    useState(false);
  const [isEditTroubleshootModalOpen, setIsEditTroubleshootModalOpen] =
    useState(false);
  const [selectedTroubleshoot, setSelectedTroubleshoot] =
    useState<ProductTroubleshootingItem | null>(null);
  const [editIssue, setEditIssue] = useState("");
  const [editSolution, setEditSolution] = useState("");
  const [editTroubleshootPriority, setEditTroubleshootPriority] = useState(1);

  const {
    data: productData,
    isLoading,
    isError,
    error,
  } = useCompanyProductDetailsQuery(productId);

  const { data: faqData, isLoading: isFaqLoading } =
    useProductFaqsQuery(productId);
  const createFaqMutation = useCreateProductFaqMutation(productId);
  const updateFaqMutation = useUpdateProductFaqMutation(productId);
  const deleteFaqMutation = useDeleteProductFaqMutation(productId);
  const { data: troubleshootData, isLoading: isTroubleshootLoading } =
    useProductTroubleshootingQuery(productId);
  const createTroubleshootMutation =
    useCreateProductTroubleshootingMutation(productId);
  const updateTroubleshootMutation =
    useUpdateProductTroubleshootingMutation(productId);
  const deleteTroubleshootMutation =
    useDeleteProductTroubleshootingMutation(productId);

  const sortedFaqs = useMemo(
    () => [...(faqData || [])].sort((a, b) => a.priority - b.priority),
    [faqData],
  );

  const sortedTroubleshooting = useMemo(
    () => [...(troubleshootData || [])].sort((a, b) => a.priority - b.priority),
    [troubleshootData],
  );

  const handleBack = () => {
    router.push(`/company/${companyId}/products`);
  };

  const handleEdit = () => {
    router.push(`/company/${companyId}/products/${productId}/edit`);
  };

  const handleAddStock = () => {
    router.push(`/company/${companyId}/products/${productId}/stock`);
  };

  const handleCreateFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error("Question and answer are required.");
      return;
    }

    createFaqMutation.mutate(
      {
        product_id: productId,
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        priority: newPriority,
        status: "ACTIVE",
      },
      {
        onSuccess: () => {
          setNewQuestion("");
          setNewAnswer("");
          setNewPriority(1);
          setIsCreateFaqModalOpen(false);
        },
      },
    );
  };

  const handleOpenEditFaq = (faq: ProductFaqItem) => {
    setSelectedFaq(faq);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
    setEditPriority(faq.priority);
    setIsEditFaqModalOpen(true);
  };

  const handleUpdateFaq = () => {
    if (!selectedFaq) {
      return;
    }

    if (!editQuestion.trim() || !editAnswer.trim()) {
      toast.error("Question and answer are required.");
      return;
    }

    updateFaqMutation.mutate(
      {
        id: selectedFaq.id,
        updateType: {
          question: editQuestion.trim(),
          answer: editAnswer.trim(),
          priority: editPriority,
        },
      },
      {
        onSuccess: () => {
          setIsEditFaqModalOpen(false);
          setSelectedFaq(null);
        },
      },
    );
  };

  const handleDeleteFaq = (faq: ProductFaqItem) => {
    const userId = getCookie("id");

    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    Modal.confirm({
      title: "Delete FAQ",
      content: "Are you sure you want to delete this FAQ?",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () =>
        deleteFaqMutation.mutate({
          id: faq.id,
          userId: parseInt(userId.toString()),
        }),
    });
  };

  const handleCreateTroubleshoot = () => {
    if (!newIssue.trim() || !newSolution.trim()) {
      toast.error("Issue and solution are required.");
      return;
    }

    createTroubleshootMutation.mutate(
      {
        product_id: productId,
        issue: newIssue.trim(),
        solution: newSolution.trim(),
        priority: newTroubleshootPriority,
        status: "ACTIVE",
      },
      {
        onSuccess: () => {
          setNewIssue("");
          setNewSolution("");
          setNewTroubleshootPriority(1);
          setIsCreateTroubleshootModalOpen(false);
        },
      },
    );
  };

  const handleOpenEditTroubleshoot = (item: ProductTroubleshootingItem) => {
    setSelectedTroubleshoot(item);
    setEditIssue(item.issue);
    setEditSolution(item.solution);
    setEditTroubleshootPriority(item.priority);
    setIsEditTroubleshootModalOpen(true);
  };

  const handleUpdateTroubleshoot = () => {
    if (!selectedTroubleshoot) {
      return;
    }

    if (!editIssue.trim() || !editSolution.trim()) {
      toast.error("Issue and solution are required.");
      return;
    }

    updateTroubleshootMutation.mutate(
      {
        id: selectedTroubleshoot.id,
        updateType: {
          issue: editIssue.trim(),
          solution: editSolution.trim(),
          priority: editTroubleshootPriority,
        },
      },
      {
        onSuccess: () => {
          setIsEditTroubleshootModalOpen(false);
          setSelectedTroubleshoot(null);
        },
      },
    );
  };

  const handleDeleteTroubleshoot = (item: ProductTroubleshootingItem) => {
    const userId = getCookie("id");

    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    Modal.confirm({
      title: "Delete Troubleshoot",
      content: "Are you sure you want to delete this troubleshoot item?",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () =>
        deleteTroubleshootMutation.mutate({
          id: item.id,
          userId: parseInt(userId.toString()),
        }),
    });
  };

  const formatWarrantyTime = (days: number) => {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;

    let displayText = "";
    if (years > 0) displayText += `${years} year${years > 1 ? "s" : ""} `;
    if (months > 0) displayText += `${months} month${months > 1 ? "s" : ""} `;
    if (remainingDays > 0 || displayText === "")
      displayText += `${remainingDays} day${remainingDays > 1 ? "s" : ""}`;

    return displayText.trim();
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Product Not Found
            </h3>
            <p className="text-gray-500 mb-4">
              {error instanceof Error
                ? error.message
                : "The requested product could not be found."}
            </p>
            <Button type="primary" onClick={handleBack}>
              Back to Products
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              onClick={handleBack}
              className="hover:bg-gray-100 transition"
            >
              ← Back
            </Button>
            <div className="shrink-0 h-14 w-14 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold text-xl">
                {productData?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <Title level={3} className="mb-0! text-gray-900">
                {productData?.name}
              </Title>
              <p className="text-gray-600 text-sm">
                Product ID: {productData?.id} • {productData?.company.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleAddStock}
              className="border-amber-500 text-amber-600 hover:border-amber-600 hover:text-amber-700"
            >
              Stock
            </Button>
            <Button
              type="primary"
              onClick={handleEdit}
              className="bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700 transition"
            >
              Edit Product
            </Button>
          </div>
        </div>

        {/* Main Content: Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Product Details */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="text-lg font-semibold text-purple-700">
                  Product Information
                </span>
              </div>
            }
            className="shadow-sm border-purple-100"
          >
            <Descriptions column={1} className="mb-6">
              <Descriptions.Item label="Product Name">
                <Text strong className="text-purple-900 text-lg">
                  {productData?.name}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Price">
                <Tag color="green" className="text-base px-3 py-1">
                  ₹{productData?.price.toLocaleString()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Text className="text-gray-700">
                  {productData?.subcategory.product_category.name}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Subcategory">
                <Text className="text-gray-700">
                  {productData?.subcategory.name}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Warranty Period">
                <Tag color="blue" className="text-base px-3 py-1">
                  ⏱️ {formatWarrantyTime(productData?.warranty_time || 0)}
                </Tag>
                <div className="text-xs text-gray-500 mt-1">
                  ({productData?.warranty_time} days)
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                <Text className="text-gray-700">
                  {productData?.description}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Right: Company & Metadata */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1"
                  />
                </svg>
                <span className="font-semibold text-blue-700">
                  Company & Details
                </span>
              </div>
            }
            className="shadow-sm border-blue-100"
          >
            <div className="space-y-4 mb-6">
              <div>
                <Text className="text-gray-500 text-sm block">Company</Text>
                <Text strong className="text-gray-900 text-lg">
                  {productData?.company.name}
                </Text>
              </div>
              <div>
                <Text className="text-gray-500 text-sm block">Company ID</Text>
                <Text className="text-gray-700">{productData?.company_id}</Text>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Text className="text-blue-600 text-sm font-medium block mb-1">
                  Created Date
                </Text>
                <Text strong className="text-blue-900">
                  {productData?.createdAt
                    ? new Date(productData.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "N/A"}
                </Text>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <Text className="text-purple-600 text-sm font-medium block mb-1">
                  Last Updated
                </Text>
                <Text strong className="text-purple-900">
                  {productData?.updatedAt
                    ? new Date(productData.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "N/A"}
                </Text>
              </div>
            </div>
          </Card>
        </div>

        <Card
          title={
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span className="text-lg font-semibold text-indigo-700">
                Product FAQ
              </span>
              <div className="grow"></div>
              <Button
                type="primary"
                onClick={() => setIsCreateFaqModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700"
              >
                Add FAQ
              </Button>
            </div>
          }
          className="shadow-sm border-indigo-100"
        >
          <div className="space-y-4">
            <div>
              {isFaqLoading ? (
                <div className="py-8 text-center">
                  <Spin />
                </div>
              ) : sortedFaqs.length === 0 ? (
                <Empty description="No FAQs added yet" />
              ) : (
                <Space direction="vertical" size={12} className="w-full">
                  {sortedFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Tag color="blue">Priority {faq.priority}</Tag>
                            <Tag
                              color={faq.status === "ACTIVE" ? "green" : "red"}
                            >
                              {faq.status}
                            </Tag>
                          </div>
                          <Text strong className="text-gray-900 block">
                            {faq.question}
                          </Text>
                          <Text className="text-gray-700">{faq.answer}</Text>
                        </div>

                        <Space>
                          <Button onClick={() => handleOpenEditFaq(faq)}>
                            Edit
                          </Button>
                          <Button
                            danger
                            onClick={() => handleDeleteFaq(faq)}
                            loading={deleteFaqMutation.isPending}
                          >
                            Delete
                          </Button>
                        </Space>
                      </div>
                    </div>
                  ))}
                </Space>
              )}
            </div>
          </div>
        </Card>
        <div></div>
        <Card
          title={
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                />
              </svg>
              <span className="text-lg font-semibold text-amber-700">
                Product Troubleshoot
              </span>
              <div className="grow"></div>
              <Button
                type="primary"
                onClick={() => setIsCreateTroubleshootModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 border-amber-600 hover:border-amber-700"
              >
                Add Troubleshoot
              </Button>
            </div>
          }
          className="shadow-sm border-amber-100"
        >
          <div className="space-y-4">
            <div>
              {isTroubleshootLoading ? (
                <div className="py-8 text-center">
                  <Spin />
                </div>
              ) : sortedTroubleshooting.length === 0 ? (
                <Empty description="No troubleshoot items added yet" />
              ) : (
                <Space direction="vertical" size={12} className="w-full">
                  {sortedTroubleshooting.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Tag color="orange">Priority {item.priority}</Tag>
                            <Tag
                              color={item.status === "ACTIVE" ? "green" : "red"}
                            >
                              {item.status}
                            </Tag>
                          </div>
                          <Text strong className="text-gray-900 block">
                            Issue: {item.issue}
                          </Text>
                          <Text className="text-gray-700">
                            Solution: {item.solution}
                          </Text>
                        </div>

                        <Space>
                          <Button
                            onClick={() => handleOpenEditTroubleshoot(item)}
                          >
                            Edit
                          </Button>
                          <Button
                            danger
                            onClick={() => handleDeleteTroubleshoot(item)}
                            loading={deleteTroubleshootMutation.isPending}
                          >
                            Delete
                          </Button>
                        </Space>
                      </div>
                    </div>
                  ))}
                </Space>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Modal
        title="Create FAQ"
        open={isCreateFaqModalOpen}
        onCancel={() => {
          setIsCreateFaqModalOpen(false);
        }}
        onOk={handleCreateFaq}
        okText="Create"
        confirmLoading={createFaqMutation.isPending}
      >
        <div className="space-y-4 mt-4">
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Priority</Text>
            <Input
              type="number"
              min={1}
              value={newPriority}
              onChange={(e) => setNewPriority(Number(e.target.value || 1))}
              placeholder="Priority"
            />
          </div>
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Question</Text>
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter FAQ question"
            />
          </div>
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Answer</Text>
            <Input.TextArea
              rows={4}
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Enter FAQ answer"
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Edit FAQ"
        open={isEditFaqModalOpen}
        onCancel={() => {
          setIsEditFaqModalOpen(false);
          setSelectedFaq(null);
        }}
        onOk={handleUpdateFaq}
        okText="Update"
        confirmLoading={updateFaqMutation.isPending}
      >
        <div className="space-y-4 mt-4">
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Priority</Text>
            <Input
              type="number"
              min={1}
              value={editPriority}
              onChange={(e) => setEditPriority(Number(e.target.value || 1))}
            />
          </div>
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Question</Text>
            <Input
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
            />
          </div>
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Answer</Text>
            <Input.TextArea
              rows={4}
              value={editAnswer}
              onChange={(e) => setEditAnswer(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Create Troubleshoot"
        open={isCreateTroubleshootModalOpen}
        onCancel={() => {
          setIsCreateTroubleshootModalOpen(false);
        }}
        onOk={handleCreateTroubleshoot}
        okText="Create"
        confirmLoading={createTroubleshootMutation.isPending}
      >
        <div className="space-y-4 mt-4">
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Priority</Text>
            <Input
              type="number"
              min={1}
              value={newTroubleshootPriority}
              onChange={(e) =>
                setNewTroubleshootPriority(Number(e.target.value || 1))
              }
              placeholder="Priority"
            />
          </div>
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Issue</Text>
            <Input
              value={newIssue}
              onChange={(e) => setNewIssue(e.target.value)}
              placeholder="Enter issue"
            />
          </div>
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Solution</Text>
            <Input.TextArea
              rows={4}
              value={newSolution}
              onChange={(e) => setNewSolution(e.target.value)}
              placeholder="Enter solution"
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Edit Troubleshoot"
        open={isEditTroubleshootModalOpen}
        onCancel={() => {
          setIsEditTroubleshootModalOpen(false);
          setSelectedTroubleshoot(null);
        }}
        onOk={handleUpdateTroubleshoot}
        okText="Update"
        confirmLoading={updateTroubleshootMutation.isPending}
      >
        <div className="space-y-4 mt-4">
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Priority</Text>
            <Input
              type="number"
              min={1}
              value={editTroubleshootPriority}
              onChange={(e) =>
                setEditTroubleshootPriority(Number(e.target.value || 1))
              }
            />
          </div>
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Issue</Text>
            <Input
              value={editIssue}
              onChange={(e) => setEditIssue(e.target.value)}
            />
          </div>
          <div>
            <Text className="text-gray-500 text-sm block mb-2">Solution</Text>
            <Input.TextArea
              rows={4}
              value={editSolution}
              onChange={(e) => setEditSolution(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetailsPage;
