import { ApiCall } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export interface ProductDetails {
	id: number;
	name: string;
	price: number;
	description: string;
	company_id: number;
	warranty_time: number;
	subcategory: {
		id: number;
		name: string;
		product_category: {
			id: number;
			name: string;
		};
	};
	company: {
		id: number;
		name: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface ProductFaqItem {
	id: number;
	product_id: number;
	question: string;
	answer: string;
	priority: number;
	status: "ACTIVE" | "INACTIVE";
}

export interface ProductTroubleshootingItem {
	id: number;
	product_id: number;
	issue: string;
	solution: string;
	priority: number;
	status: "ACTIVE" | "INACTIVE";
}

export interface ProductManfStockItem {
	id: number;
	batch_number: string;
	quantity: number;
	status: "ACTIVE" | "INACTIVE";
	createdAt: string;
	updatedAt: string;
}

export interface ProductBatchSaleItem {
	id: number;
	quantity: number;
	sale_date: string;
	batch_number: string;
	dealer_purch: {
		id: number;
		name: string;
	};
}

interface CreateManfStockInput {
	company_id: number;
	product_id: number;
	quantity: number;
	batch_number: string;
	status?: 'ACTIVE' | 'INACTIVE';
	createdById: number;
}

interface CreateProductFaqInput {
	product_id: number;
	question: string;
	answer: string;
	priority: number;
	status?: "ACTIVE" | "INACTIVE";
}

interface UpdateProductFaqInput {
	question?: string;
	answer?: string;
	priority?: number;
	status?: "ACTIVE" | "INACTIVE";
}

interface CreateProductTroubleshootingInput {
	product_id: number;
	issue: string;
	solution: string;
	priority: number;
	status?: "ACTIVE" | "INACTIVE";
}

interface UpdateProductTroubleshootingInput {
	issue?: string;
	solution?: string;
	priority?: number;
	status?: "ACTIVE" | "INACTIVE";
}

const GET_PRODUCT_BY_ID = `
	query GetProductById($productId: Int!) {
		getProductById(id: $productId) {
			id
			name
			price
			description
			company_id
			warranty_time
			subcategory {
				id
				name
				product_category {
					id
					name
				}
			}
			company {
				id
				name
			}
			createdAt
			updatedAt
		}
	}
`;

const GET_ALL_PRODUCT_FAQ = `
	query GetAllProductFaq($whereSearchInput: WhereProductFaqSearchInput!) {
		getAllProductFaq(whereSearchInput: $whereSearchInput) {
			id
			product_id
			question
			answer
			priority
			status
		}
	}
`;

const CREATE_PRODUCT_FAQ = `
	mutation CreateProductFaq($inputType: CreateProductFaqInput!) {
		createProductFaq(inputType: $inputType) {
			id
		}
	}
`;

const UPDATE_PRODUCT_FAQ = `
	mutation UpdateProductFaq($updateProductFaqId: Int!, $updateType: UpdateProductFaqInput!) {
		updateProductFaq(id: $updateProductFaqId, updateType: $updateType) {
			id
		}
	}
`;

const DELETE_PRODUCT_FAQ = `
	mutation DeleteProductFaq($deleteProductFaqId: Int!, $userid: Int!) {
		deleteProductFaq(id: $deleteProductFaqId, userid: $userid) {
			id
		}
	}
`;

const GET_ALL_PRODUCT_TROUBLESHOOTING = `
	query GetAllProductTroubleshooting($whereSearchInput: WhereProductTroubleshootingSearchInput!) {
		getAllProductTroubleshooting(whereSearchInput: $whereSearchInput) {
			id
			product_id
			issue
			solution
			priority
			status
		}
	}
`;

const CREATE_PRODUCT_TROUBLESHOOTING = `
	mutation CreateProductTroubleshooting($inputType: CreateProductTroubleshootingInput!) {
		createProductTroubleshooting(inputType: $inputType) {
			id
		}
	}
`;

const UPDATE_PRODUCT_TROUBLESHOOTING = `
	mutation UpdateProductTroubleshooting($updateProductTroubleshootingId: Int!, $updateType: UpdateProductTroubleshootingInput!) {
		updateProductTroubleshooting(id: $updateProductTroubleshootingId, updateType: $updateType) {
			id
		}
	}
`;

const DELETE_PRODUCT_TROUBLESHOOTING = `
	mutation DeleteProductTroubleshooting($deleteProductTroubleshootingId: Int!, $userid: Int!) {
		deleteProductTroubleshooting(id: $deleteProductTroubleshootingId, userid: $userid) {
			id
		}
	}
`;

const GET_ALL_MANF_STOCK = `
	query GetAllManfStock($whereSearchInput: WhereManfStockSearchInput!) {
		getAllManfStock(whereSearchInput: $whereSearchInput) {
			id
			batch_number
			quantity
			status
			createdAt
			updatedAt
		}
	}
`;

const GET_ALL_DEALER_SALES_BY_BATCH = `
	query GetAllDealerSales($whereSearchInput: WhereDealerSalesSearchInput!) {
		getAllDealerSales(whereSearchInput: $whereSearchInput) {
			id
			quantity
			sale_date
			batch_number
			dealer_purch {
				id
				name
			}
		}
	}
`;

const CREATE_MANF_STOCK = `
	mutation CreateManfStock($inputType: CreateManfStockInput!) {
		createManfStock(inputType: $inputType) {
			id
		}
	}
`;

const fetchProductById = async (productId: number): Promise<ProductDetails> => {
	const response = await ApiCall<{ getProductById: ProductDetails }>({
		query: GET_PRODUCT_BY_ID,
		variables: {
			productId,
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.getProductById;
};

const fetchProductFaqs = async (productId: number): Promise<ProductFaqItem[]> => {
	const response = await ApiCall<{ getAllProductFaq: ProductFaqItem[] }>({
		query: GET_ALL_PRODUCT_FAQ,
		variables: {
			whereSearchInput: {
				product_id: productId,
			},
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.getAllProductFaq;
};

const createProductFaqApi = async (input: CreateProductFaqInput) => {
	const response = await ApiCall<{ createProductFaq: { id: number } }>({
		query: CREATE_PRODUCT_FAQ,
		variables: {
			inputType: input,
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.createProductFaq;
};

const updateProductFaqApi = async (args: {
	id: number;
	updateType: UpdateProductFaqInput;
}) => {
	const response = await ApiCall<{ updateProductFaq: { id: number } }>({
		query: UPDATE_PRODUCT_FAQ,
		variables: {
			updateProductFaqId: args.id,
			updateType: args.updateType,
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.updateProductFaq;
};

const deleteProductFaqApi = async (args: { id: number; userId: number }) => {
	const response = await ApiCall<{ deleteProductFaq: { id: number } }>({
		query: DELETE_PRODUCT_FAQ,
		variables: {
			deleteProductFaqId: args.id,
			userid: args.userId,
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.deleteProductFaq;
};

const fetchProductTroubleshooting = async (
	productId: number,
): Promise<ProductTroubleshootingItem[]> => {
	const response = await ApiCall<{
		getAllProductTroubleshooting: ProductTroubleshootingItem[];
	}>({
		query: GET_ALL_PRODUCT_TROUBLESHOOTING,
		variables: {
			whereSearchInput: {
				product_id: productId,
			},
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.getAllProductTroubleshooting;
};

const createProductTroubleshootingApi = async (
	input: CreateProductTroubleshootingInput,
) => {
	const response = await ApiCall<{
		createProductTroubleshooting: { id: number };
	}>({
		query: CREATE_PRODUCT_TROUBLESHOOTING,
		variables: {
			inputType: input,
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.createProductTroubleshooting;
};

const updateProductTroubleshootingApi = async (args: {
	id: number;
	updateType: UpdateProductTroubleshootingInput;
}) => {
	const response = await ApiCall<{
		updateProductTroubleshooting: { id: number };
	}>({
		query: UPDATE_PRODUCT_TROUBLESHOOTING,
		variables: {
			updateProductTroubleshootingId: args.id,
			updateType: args.updateType,
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.updateProductTroubleshooting;
};

const deleteProductTroubleshootingApi = async (args: {
	id: number;
	userId: number;
}) => {
	const response = await ApiCall<{
		deleteProductTroubleshooting: { id: number };
	}>({
		query: DELETE_PRODUCT_TROUBLESHOOTING,
		variables: {
			deleteProductTroubleshootingId: args.id,
			userid: args.userId,
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.deleteProductTroubleshooting;
};

const fetchProductManfStock = async (args: {
	companyId: number;
	productId: number;
}): Promise<ProductManfStockItem[]> => {
	const response = await ApiCall<{ getAllManfStock: ProductManfStockItem[] }>({
		query: GET_ALL_MANF_STOCK,
		variables: {
			whereSearchInput: {
				company_id: args.companyId,
				product_id: args.productId,
				status: 'ACTIVE',
			},
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.getAllManfStock;
};

const fetchBatchDealerSales = async (args: {
	companyId: number;
	productId: number;
	batchNumber: string;
}): Promise<ProductBatchSaleItem[]> => {
	const response = await ApiCall<{ getAllDealerSales: ProductBatchSaleItem[] }>({
		query: GET_ALL_DEALER_SALES_BY_BATCH,
		variables: {
			whereSearchInput: {
				company_id: args.companyId,
				product_id: args.productId,
				batch_number: args.batchNumber,
			},
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.getAllDealerSales;
};

const createManfStockApi = async (input: CreateManfStockInput) => {
	const response = await ApiCall<{ createManfStock: { id: number } }>({
		query: CREATE_MANF_STOCK,
		variables: {
			inputType: input,
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.createManfStock;
};

export const useCompanyProductDetailsQuery = (productId: number) =>
	useQuery({
		queryKey: ["product", productId],
		queryFn: () => fetchProductById(productId),
		enabled: !!productId,
	});

export const useProductFaqsQuery = (productId: number) =>
	useQuery({
		queryKey: ["productFaqs", productId],
		queryFn: () => fetchProductFaqs(productId),
		enabled: !!productId,
	});

export const useCreateProductFaqMutation = (productId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createProductFaqApi,
		onSuccess: () => {
			toast.success("FAQ created successfully");
			queryClient.invalidateQueries({ queryKey: ["productFaqs", productId] });
		},
		onError: (error: Error) => {
			toast.error(`Failed to create FAQ: ${error.message}`);
		},
	});
};

export const useUpdateProductFaqMutation = (productId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateProductFaqApi,
		onSuccess: () => {
			toast.success("FAQ updated successfully");
			queryClient.invalidateQueries({ queryKey: ["productFaqs", productId] });
		},
		onError: (error: Error) => {
			toast.error(`Failed to update FAQ: ${error.message}`);
		},
	});
};

export const useDeleteProductFaqMutation = (productId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteProductFaqApi,
		onSuccess: () => {
			toast.success("FAQ deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["productFaqs", productId] });
		},
		onError: (error: Error) => {
			toast.error(`Failed to delete FAQ: ${error.message}`);
		},
	});
};

export const useProductTroubleshootingQuery = (productId: number) =>
	useQuery({
		queryKey: ["productTroubleshooting", productId],
		queryFn: () => fetchProductTroubleshooting(productId),
		enabled: !!productId,
	});

export const useCreateProductTroubleshootingMutation = (productId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createProductTroubleshootingApi,
		onSuccess: () => {
			toast.success("Troubleshoot created successfully");
			queryClient.invalidateQueries({
				queryKey: ["productTroubleshooting", productId],
			});
		},
		onError: (error: Error) => {
			toast.error(`Failed to create troubleshoot: ${error.message}`);
		},
	});
};

export const useUpdateProductTroubleshootingMutation = (productId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateProductTroubleshootingApi,
		onSuccess: () => {
			toast.success("Troubleshoot updated successfully");
			queryClient.invalidateQueries({
				queryKey: ["productTroubleshooting", productId],
			});
		},
		onError: (error: Error) => {
			toast.error(`Failed to update troubleshoot: ${error.message}`);
		},
	});
};

export const useDeleteProductTroubleshootingMutation = (productId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteProductTroubleshootingApi,
		onSuccess: () => {
			toast.success("Troubleshoot deleted successfully");
			queryClient.invalidateQueries({
				queryKey: ["productTroubleshooting", productId],
			});
		},
		onError: (error: Error) => {
			toast.error(`Failed to delete troubleshoot: ${error.message}`);
		},
	});
};

export const useProductManfStockQuery = (args: {
	companyId: number;
	productId: number;
}) =>
	useQuery({
		queryKey: ['productManfStock', args.companyId, args.productId],
		queryFn: () => fetchProductManfStock(args),
		enabled: !!args.companyId && !!args.productId,
	});

export const useBatchDealerSalesQuery = (args: {
	companyId: number;
	productId: number;
	batchNumber: string;
	enabled: boolean;
}) =>
	useQuery({
		queryKey: [
			'batchDealerSales',
			args.companyId,
			args.productId,
			args.batchNumber,
		],
		queryFn: () =>
			fetchBatchDealerSales({
				companyId: args.companyId,
				productId: args.productId,
				batchNumber: args.batchNumber,
			}),
		enabled: args.enabled && !!args.batchNumber,
	});

export const useCreateManfStockMutation = (args: {
	companyId: number;
	productId: number;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createManfStockApi,
		onSuccess: () => {
			toast.success('Stock added successfully');
			queryClient.invalidateQueries({
				queryKey: ['productManfStock', args.companyId, args.productId],
			});
		},
		onError: (error: Error) => {
			toast.error(`Failed to add stock: ${error.message}`);
		},
	});
};

