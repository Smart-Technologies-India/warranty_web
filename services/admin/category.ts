import { ApiCall } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export type StatusType = "ACTIVE" | "INACTIVE";

export interface SearchPaginationInput {
	skip: number;
	take: number;
	search?: string;
}

export interface CategoryItem {
	id: number;
	name: string;
	priority: number;
	status: StatusType;
	createdAt: string;
	updatedAt: string;
}

export interface SubcategoryItem {
	id: number;
	name: string;
	priority: number;
	status: StatusType;
	product_category: {
		id: number;
		name: string;
	};
	createdAt: string;
	updatedAt: string;
}

interface PaginatedResponse<T> {
	skip: number;
	take: number;
	total: number;
	data: T[];
}

const GET_PAGINATED_CATEGORY = `
	query GetPaginatedProductCategory($searchPaginationInput: SearchPaginationInput!$whereSearchInput: WhereProductCategorySearchInput!) {
		getPaginatedProductCategory(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
			skip
			take
			total
			data {
				id
				name
				priority
				status
				createdAt
				updatedAt
			}
		}
	}
`;

const DELETE_CATEGORY = `
	mutation DeleteProductCategory($deleteCategoryId: Int!, $userid: Int!) {
		deleteProductCategory(id: $deleteCategoryId, userid: $userid) {
			id
		}
	}
`;

const UPDATE_CATEGORY_STATUS = `
	mutation UpdateProductCategory($updateCategoryId: Int!, $updateType: UpdateProductCategoryInput!) {
		updateProductCategory(id: $updateCategoryId, updateType: $updateType) {
			id
		}
	}
`;

const CREATE_PRODUCT_CATEGORY = `
	mutation Mutation($inputType: CreateProductCategoryInput!) {
		createProductCategory(inputType: $inputType) {
			id
		}
	}
`;

const GET_PAGINATED_SUBCATEGORY = `
	query GetPaginatedProductSubcategory($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: WhereProductSubcategorySearchInput!) {
		getPaginatedProductSubcategory(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
			skip
			take
			total
			data {
				id
				name
				priority
				status
				product_category {
					id
					name
				}
				createdAt
				updatedAt
			}
		}
	}
`;

const DELETE_SUBCATEGORY = `
	mutation DeleteProductSubcategory($deleteSubcategoryId: Int!, $userid: Int!) {
		deleteProductSubcategory(id: $deleteSubcategoryId, userid: $userid) {
			id
		}
	}
`;

const UPDATE_SUBCATEGORY_STATUS = `
	mutation UpdateProductSubcategory($updateSubcategoryId: Int!, $updateType: UpdateProductSubcategoryInput!) {
		updateProductSubcategory(id: $updateSubcategoryId, updateType: $updateType) {
			id
		}
	}
`;

const CREATE_PRODUCT_SUBCATEGORY = `
	mutation CreateProductSubcategory($inputType: CreateProductSubcategoryInput!) {
		createProductSubcategory(inputType: $inputType) {
			id
		}
	}
`;

const GET_ALL_PRODUCT_CATEGORY = `
	query GetAllProductCategory($whereSearchInput: WhereProductCategorySearchInput!) {
		getAllProductCategory(whereSearchInput: $whereSearchInput) {
			id
			name
		}
	}
`;

const fetchCategories = async (
	input: SearchPaginationInput
): Promise<PaginatedResponse<CategoryItem>> => {
	const response = await ApiCall<{
		getPaginatedProductCategory: PaginatedResponse<CategoryItem>;
	}>({
		query: GET_PAGINATED_CATEGORY,
		variables: {
			searchPaginationInput: input,
			whereSearchInput: {},
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.getPaginatedProductCategory;
};

const deleteCategoryApi = async (args: { categoryId: number; userId: number }) => {
	const response = await ApiCall<{ deleteProductCategory: { id: number } }>({
		query: DELETE_CATEGORY,
		variables: {
			deleteCategoryId: args.categoryId,
			userid: args.userId,
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.deleteProductCategory;
};

const updateCategoryStatusApi = async (args: {
	categoryId: number;
	status: StatusType;
	updatedById: number;
}) => {
	const response = await ApiCall<{ updateProductCategory: { id: number } }>({
		query: UPDATE_CATEGORY_STATUS,
		variables: {
			updateCategoryId: args.categoryId,
			updateType: {
				status: args.status,
				updatedById: args.updatedById,
			},
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.updateProductCategory;
};

const createCategoryApi = async (args: { name: string; createdById: number }) => {
	const response = await ApiCall<{ createProductCategory: { id: number } }>({
		query: CREATE_PRODUCT_CATEGORY,
		variables: {
			inputType: {
				name: args.name,
				createdById: args.createdById,
				priority: 1,
			},
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.createProductCategory;
};

const fetchSubcategories = async (
	input: SearchPaginationInput
): Promise<PaginatedResponse<SubcategoryItem>> => {
	const response = await ApiCall<{
		getPaginatedProductSubcategory: PaginatedResponse<SubcategoryItem>;
	}>({
		query: GET_PAGINATED_SUBCATEGORY,
		variables: {
			searchPaginationInput: input,
			whereSearchInput: {},
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.getPaginatedProductSubcategory;
};

const fetchActiveCategories = async (): Promise<{ id: number; name: string }[]> => {
	const response = await ApiCall<{
		getAllProductCategory: { id: number; name: string }[];
	}>({
		query: GET_ALL_PRODUCT_CATEGORY,
		variables: {
			whereSearchInput: {
				status: "ACTIVE",
			},
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.getAllProductCategory;
};

const deleteSubcategoryApi = async (args: {
	subcategoryId: number;
	userId: number;
}) => {
	const response = await ApiCall<{ deleteProductSubcategory: { id: number } }>({
		query: DELETE_SUBCATEGORY,
		variables: {
			deleteSubcategoryId: args.subcategoryId,
			userid: args.userId,
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.deleteProductSubcategory;
};

const updateSubcategoryStatusApi = async (args: {
	subcategoryId: number;
	status: StatusType;
	updatedById: number;
}) => {
	const response = await ApiCall<{ updateProductSubcategory: { id: number } }>({
		query: UPDATE_SUBCATEGORY_STATUS,
		variables: {
			updateSubcategoryId: args.subcategoryId,
			updateType: {
				status: args.status,
				updatedById: args.updatedById,
			},
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.updateProductSubcategory;
};

const createSubcategoryApi = async (args: {
	name: string;
	productCategoryId: number;
	createdById: number;
}) => {
	const response = await ApiCall<{ createProductSubcategory: { id: number } }>({
		query: CREATE_PRODUCT_SUBCATEGORY,
		variables: {
			inputType: {
				name: args.name,
				product_category_id: args.productCategoryId,
				createdById: args.createdById,
				priority: 1,
			},
		},
	});

	if (!response.status) {
		throw new Error(response.message);
	}

	return response.data.createProductSubcategory;
};

export const useAdminCategoriesQuery = (searchInput: SearchPaginationInput) =>
	useQuery({
		queryKey: ["categories", searchInput],
		queryFn: () => fetchCategories(searchInput),
		placeholderData: (previousData) => previousData,
	});

export const useAdminDeleteCategoryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteCategoryApi,
		onSuccess: () => {
			toast.success("Category deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
		onError: (error: Error) => {
			toast.error(`Failed to delete category: ${error.message}`);
		},
	});
};

export const useAdminUpdateCategoryStatusMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateCategoryStatusApi,
		onSuccess: (_data, variables) => {
			const statusText = variables.status.toLowerCase();
			toast.success(`Category status updated to ${statusText}`);
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
		onError: (error: Error) => {
			toast.error(`Failed to update category status: ${error.message}`);
		},
	});
};

export const useAdminCreateCategoryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createCategoryApi,
		onSuccess: (_data, variables) => {
			toast.success(`Category "${variables.name}" created successfully!`);
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
		onError: (error: Error) => {
			toast.error(`Failed to create category: ${error.message}`);
		},
	});
};

export const useAdminSubcategoriesQuery = (searchInput: SearchPaginationInput) =>
	useQuery({
		queryKey: ["subcategories", searchInput],
		queryFn: () => fetchSubcategories(searchInput),
		placeholderData: (previousData) => previousData,
	});

export const useAdminActiveCategoriesQuery = () =>
	useQuery({
		queryKey: ["categories"],
		queryFn: fetchActiveCategories,
	});

export const useAdminDeleteSubcategoryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteSubcategoryApi,
		onSuccess: () => {
			toast.success("Subcategory deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["subcategories"] });
		},
		onError: (error: Error) => {
			toast.error(`Failed to delete subcategory: ${error.message}`);
		},
	});
};

export const useAdminUpdateSubcategoryStatusMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateSubcategoryStatusApi,
		onSuccess: (_data, variables) => {
			const statusText = variables.status.toLowerCase();
			toast.success(`Subcategory status updated to ${statusText}`);
			queryClient.invalidateQueries({ queryKey: ["subcategories"] });
		},
		onError: (error: Error) => {
			toast.error(`Failed to update subcategory status: ${error.message}`);
		},
	});
};

export const useAdminCreateSubcategoryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createSubcategoryApi,
		onSuccess: (_data, variables) => {
			toast.success(`Subcategory "${variables.name}" created successfully!`);
			queryClient.invalidateQueries({ queryKey: ["subcategories"] });
		},
		onError: (error: Error) => {
			toast.error(`Failed to create subcategory: ${error.message}`);
		},
	});
};

