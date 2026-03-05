import { ApiCall } from "@/services/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface DealerOption {
  id: number;
  name: string;
  contact1?: string | null;
  pan?: string | null;
}

export interface DealerStockItem {
  id: number;
  batch_number: string;
  quantity: number;
  company_id: number;
  product: {
    id: number;
    name: string;
  };
}

export interface CreateDealerB2BSaleFormInput {
  dealer_purch_id: string;
  product_id: string;
  batch_number: string;
  quantity: number;
  warranty_till: number;
  sale_date: string;
}

interface CreateDealerSaleInput {
  batch_number: string;
  createdById: number;
  quantity: number;
  dealer_purch_id: number;
  dealer_seller_id: number;
  product_id: number;
  warranty_till: number;
  sale_date: string;
  company_id: number;
}

interface CreateDealerStockInput {
  batch_number: string;
  product_id: number;
  dealer_id: number;
  company_id: number;
  createdById: number;
  quantity: number;
  status: "ACTIVE";
}

interface DealerStockSearchResult {
  id: number;
  quantity: number;
  company_id: number;
}

interface DealerSalesSearchResult {
  id: number;
  batch_number: string;
  quantity: number;
  product_id: number;
  dealer_purch_id: number;
  dealer_seller_id: number;
  company_id: number;
}

const GET_DEALERS = `
  query GetAllCompany($whereSearchInput: WhereCompanySearchInput!) {
    getAllCompany(whereSearchInput: $whereSearchInput) {
      id
      name
      contact1
      pan
    }
  }
`;

const GET_SELLER_STOCK = `
  query GetAllDealerStock($whereSearchInput: WhereDealerStockSearchInput!) {
    getAllDealerStock(whereSearchInput: $whereSearchInput) {
      id
      batch_number
      quantity
      company_id
      product {
        id
        name
      }
    }
  }
`;

const SEARCH_DEALER_STOCK = `
  query SearchDealerStock($whereSearchInput: WhereDealerStockSearchInput!) {
    searchDealerStock(whereSearchInput: $whereSearchInput) {
      id
      quantity
      company_id
    }
  }
`;

const SEARCH_DEALER_SALES = `
  query SearchDealerSales($whereSearchInput: WhereDealerSalesSearchInput!) {
    searchDealerSales(whereSearchInput: $whereSearchInput) {
      id
      batch_number
      quantity
      product_id
      dealer_purch_id
      dealer_seller_id
      company_id
    }
  }
`;

const CREATE_DEALER_SALE = `
  mutation CreateDealerSales($inputType: CreateDealerSalesInput!) {
    createDealerSales(inputType: $inputType) {
      id
    }
  }
`;

const CREATE_DEALER_STOCK = `
  mutation CreateDealerStock($inputType: CreateDealerStockInput!) {
    createDealerStock(inputType: $inputType) {
      id
    }
  }
`;

const UPDATE_DEALER_STOCK = `
  mutation UpdateDealerStock($updateDealerStockId: Int!, $updateType: UpdateDealerStockInput!) {
    updateDealerStock(id: $updateDealerStockId, updateType: $updateType) {
      id
    }
  }
`;

const UPDATE_DEALER_SALE = `
  mutation UpdateDealerSales($updateDealerSalesId: Int!, $updateType: UpdateDealerSalesInput!) {
    updateDealerSales(id: $updateDealerSalesId, updateType: $updateType) {
      id
    }
  }
`;

export const fetchActiveBuyerDealers = async (
  sellerDealerId: number
): Promise<DealerOption[]> => {
  const response = await ApiCall<{ getAllCompany: DealerOption[] }>({
    query: GET_DEALERS,
    variables: {
      whereSearchInput: {
        is_dealer: true,
        status: "ACTIVE",
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  const filteredDealers = response.data.getAllCompany.filter(
    (dealer) => dealer.id !== sellerDealerId
  );

  return filteredDealers.length > 0
    ? filteredDealers
    : response.data.getAllCompany;
};

export const fetchSellerDealerStocks = async (
  dealerId: number
): Promise<DealerStockItem[]> => {
  const response = await ApiCall<{ getAllDealerStock: DealerStockItem[] }>({
    query: GET_SELLER_STOCK,
    variables: {
      whereSearchInput: {
        dealer_id: dealerId,
        status: "ACTIVE",
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllDealerStock.filter((stock) => stock.quantity > 0);
};

const searchDealerStockApi = async (
  dealerId: number,
  productId: number,
  batchNumber: string
): Promise<DealerStockSearchResult | null> => {
  const response = await ApiCall<{
    searchDealerStock: DealerStockSearchResult | null;
  }>({
    query: SEARCH_DEALER_STOCK,
    variables: {
      whereSearchInput: {
        dealer_id: dealerId,
        product_id: productId,
        batch_number: batchNumber,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.searchDealerStock;
};

const searchDealerSalesApi = async (
  args: {
    batchNumber: string;
    productId: number;
    dealerPurchId: number;
    dealerSellerId: number;
    companyId: number;
  }
): Promise<DealerSalesSearchResult | null> => {
  const response = await ApiCall<{
    searchDealerSales: DealerSalesSearchResult | null;
  }>({
    query: SEARCH_DEALER_SALES,
    variables: {
      whereSearchInput: {
        batch_number: args.batchNumber,
        product_id: args.productId,
        dealer_purch_id: args.dealerPurchId,
        dealer_seller_id: args.dealerSellerId,
        company_id: args.companyId,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.searchDealerSales;
};

const createDealerSaleApi = async (
  data: CreateDealerSaleInput
): Promise<{ id: number }> => {
  const response = await ApiCall<{ createDealerSales: { id: number } }>({
    query: CREATE_DEALER_SALE,
    variables: {
      inputType: data,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.createDealerSales;
};

const createDealerStockApi = async (
  data: CreateDealerStockInput
): Promise<{ id: number }> => {
  const response = await ApiCall<{ createDealerStock: { id: number } }>({
    query: CREATE_DEALER_STOCK,
    variables: {
      inputType: data,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.createDealerStock;
};

const updateDealerStockApi = async (
  stockId: number,
  quantity: number
): Promise<{ id: number }> => {
  const response = await ApiCall<{ updateDealerStock: { id: number } }>({
    query: UPDATE_DEALER_STOCK,
    variables: {
      updateDealerStockId: stockId,
      updateType: {
        quantity,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateDealerStock;
};

const updateDealerSaleApi = async (
  saleId: number,
  updateType: {
    quantity: number;
    sale_date: string;
    warranty_till: number;
    updatedById: number;
  }
): Promise<{ id: number }> => {
  const response = await ApiCall<{ updateDealerSales: { id: number } }>({
    query: UPDATE_DEALER_SALE,
    variables: {
      updateDealerSalesId: saleId,
      updateType,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.updateDealerSales;
};

export const createDealerB2BSaleWithStockSync = async (args: {
  dealerId: number;
  createdById: number;
  formData: CreateDealerB2BSaleFormInput;
}): Promise<{ id: number }> => {
  const productId = Number.parseInt(args.formData.product_id, 10);
  const buyerDealerId = Number.parseInt(args.formData.dealer_purch_id, 10);

  if (!productId || !buyerDealerId) {
    throw new Error("Invalid product or buyer dealer");
  }

  const sellerStock = await searchDealerStockApi(
    args.dealerId,
    productId,
    args.formData.batch_number
  );

  if (!sellerStock || sellerStock.quantity <= 0) {
    throw new Error("Selected batch is out of stock");
  }

  if (sellerStock.quantity < args.formData.quantity) {
    throw new Error(
      `Only ${sellerStock.quantity} units available in selected batch`
    );
  }

  const existingSale = await searchDealerSalesApi({
    batchNumber: args.formData.batch_number,
    productId,
    dealerPurchId: buyerDealerId,
    dealerSellerId: args.dealerId,
    companyId: sellerStock.company_id,
  });

  let saleResult: { id: number };

  if (existingSale) {
    saleResult = await updateDealerSaleApi(existingSale.id, {
      quantity: existingSale.quantity + args.formData.quantity,
      sale_date: args.formData.sale_date,
      warranty_till: args.formData.warranty_till,
      updatedById: args.createdById,
    });
  } else {
    saleResult = await createDealerSaleApi({
      batch_number: args.formData.batch_number,
      createdById: args.createdById,
      quantity: args.formData.quantity,
      dealer_purch_id: buyerDealerId,
      dealer_seller_id: args.dealerId,
      product_id: productId,
      warranty_till: args.formData.warranty_till,
      sale_date: args.formData.sale_date,
      company_id: sellerStock.company_id,
    });
  }

  const buyerStock = await searchDealerStockApi(
    buyerDealerId,
    productId,
    args.formData.batch_number
  );

  if (buyerStock) {
    await updateDealerStockApi(
      buyerStock.id,
      buyerStock.quantity + args.formData.quantity
    );
  } else {
    await createDealerStockApi({
      batch_number: args.formData.batch_number,
      product_id: productId,
      dealer_id: buyerDealerId,
      company_id: sellerStock.company_id,
      createdById: args.createdById,
      quantity: args.formData.quantity,
      status: "ACTIVE",
    });
  }

  await updateDealerStockApi(
    sellerStock.id,
    sellerStock.quantity - args.formData.quantity
  );

  return saleResult;
};

export const useActiveBuyerDealersQuery = (sellerDealerId: number) =>
  useQuery({
    queryKey: ["buyerDealers", sellerDealerId],
    queryFn: () => fetchActiveBuyerDealers(sellerDealerId),
    enabled: !!sellerDealerId,
  });

export const useSellerDealerStocksQuery = (dealerId: number) =>
  useQuery({
    queryKey: ["sellerDealerStocks", dealerId],
    queryFn: () => fetchSellerDealerStocks(dealerId),
    enabled: !!dealerId,
  });

export const useCreateDealerB2BSaleMutation = () =>
  useMutation({
    mutationKey: ["createDealerB2BSale"],
    mutationFn: createDealerB2BSaleWithStockSync,
  });
