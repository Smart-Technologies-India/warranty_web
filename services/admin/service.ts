import { ApiCall } from "@/services/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface CreateCompanyInputData {
  name: string;
  contact1: string;
  contact2?: string | null;
  address: string;
  website: string;
  zone: string;
  email: string;
  pan: string;
  gst: string;
  contact_person: string;
  contact_person_number: string;
  designation: string;
}

export interface ZoneDataResponse {
  id: number;
  name: string;
  status: string;
}

interface CreateCompanyResponse {
  id: string;
}

interface CreateUserResponse {
  id: number;
  name: string;
}

export interface CompanyDetailsResponse {
  id: number;
  name: string;
  zone: {
    id: number;
    name: string;
    city: {
      name: string;
    };
  };
}

export interface CreateCompanyUserInput {
  name: string;
  contact1: string;
  role: string;
  is_manufacturer: boolean;
  is_dealer: boolean;
  zone_id: number;
  password: string;
}

const CREATE_COMPANY = `
  mutation CreateCompany($inputType: CreateCompanyInput!) {
    createCompany(inputType: $inputType) {
      id
    }
  }
`;

const CREATE_USER = `
  mutation CreateUser($inputType: CreateUserInput!) {
    createUser(inputType: $inputType) {
      id
      name
    }
  }
`;

const CREATE_USER_COMPANY = `
  mutation Mutation($inputType: CreateUserCompanyInput!) {
    createUserCompany(inputType: $inputType) {
      company_id
      user_id
    }
  }
`;

const GET_ALL_ZONE = `
  query GetAllZone($whereSearchInput: WhereZoneSearchInput!) {
    getAllZone(whereSearchInput: $whereSearchInput) {
      id
      name
      status
    }
  }
`;

const GET_COMPANY_BY_ID = `
  query GetCompanyById($companyId: Int!) {
    getCompanyById(id: $companyId) {
      id
      name
      zone {
        id
        name
        city {
          name
        }
      }
    }
  }
`;

export const fetchActiveZones = async (): Promise<ZoneDataResponse[]> => {
  const response = await ApiCall<{ getAllZone: ZoneDataResponse[] }>({
    query: GET_ALL_ZONE,
    variables: {
      whereSearchInput: {
        status: "ACTIVE",
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getAllZone;
};

export const fetchCompanyById = async (
  companyId: number,
): Promise<CompanyDetailsResponse> => {
  const response = await ApiCall<{ getCompanyById: CompanyDetailsResponse }>({
    query: GET_COMPANY_BY_ID,
    variables: {
      companyId,
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.getCompanyById;
};

const createCompanyApi = async (
  data: CreateCompanyInputData,
  createdById: number,
): Promise<CreateCompanyResponse> => {
  const response = await ApiCall<{ createCompany: CreateCompanyResponse }>({
    query: CREATE_COMPANY,
    variables: {
      inputType: {
        name: data.name,
        logo: "test",
        contact1: data.contact1,
        contact2: data.contact2,
        address: data.address,
        zone_id: Number(data.zone),
        email: data.email,
        website: data.website,
        pan: data.pan,
        gst: data.gst,
        is_dealer: false,
        contact_person: data.contact_person,
        contact_person_number: data.contact_person_number,
        designation: data.designation,
        createdById,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.createCompany;
};

const createManufacturerAdminUserApi = async (
  data: CreateCompanyInputData,
): Promise<CreateUserResponse> => {
  const response = await ApiCall<{ createUser: CreateUserResponse }>({
    query: CREATE_USER,
    variables: {
      inputType: {
        name: data.contact_person,
        contact1: data.contact_person_number,
        role: "MANUF_ADMIN",
        is_manufacturer: true,
        is_dealer: false,
        zone_id: Number(data.zone),
        password: `${data.contact_person.charAt(0).toUpperCase()}${data.contact_person.replaceAll(" ", "").slice(1, 4).toLowerCase()}@${data.contact_person_number.slice(-4)}`,
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data.createUser;
};

const createUserCompanyApi = async (args: {
  companyId: number;
  userId: number;
  createdById: number;
}): Promise<void> => {
  const response = await ApiCall<{ createUserCompany: unknown }>({
    query: CREATE_USER_COMPANY,
    variables: {
      inputType: {
        company_id: args.companyId,
        user_id: args.userId,
        createdById: args.createdById,
        status: "ACTIVE",
      },
    },
  });

  if (!response.status) {
    throw new Error(response.message);
  }
};

const createCompanyUserAndLink = async (args: {
  companyId: number;
  createdById: number;
  userInput: CreateCompanyUserInput;
}) => {
  const createUserResponse = await ApiCall<{ createUser: CreateUserResponse }>({
    query: CREATE_USER,
    variables: {
      inputType: args.userInput,
    },
  });

  if (!createUserResponse.status) {
    throw new Error(createUserResponse.message);
  }

  const createdUser = createUserResponse.data.createUser;

  await createUserCompanyApi({
    companyId: args.companyId,
    userId: createdUser.id,
    createdById: args.createdById,
  });

  return createdUser;
};

export const createCompanyWithManufacturerAdmin = async (args: {
  data: CreateCompanyInputData;
  createdById: number;
}): Promise<CreateCompanyResponse> => {
  const createdCompany = await createCompanyApi(args.data, args.createdById);
  const createdUser = await createManufacturerAdminUserApi(args.data);

  await createUserCompanyApi({
    companyId: Number(createdCompany.id),
    userId: createdUser.id,
    createdById: args.createdById,
  });

  return createdCompany;
};

export const useActiveZonesQuery = () =>
  useQuery({
    queryKey: ["zonedata"],
    queryFn: fetchActiveZones,
    refetchOnWindowFocus: false,
  });

export const useCreateCompanyWithManufacturerAdminMutation = () =>
  useMutation({
    mutationKey: ["createCompany"],
    mutationFn: createCompanyWithManufacturerAdmin,
  });

export const useCompanyByIdQuery = (companyId: number) =>
  useQuery({
    queryKey: ["company", companyId],
    queryFn: () => fetchCompanyById(companyId),
    enabled: !!companyId,
  });

export const useCreateCompanyUserMutation = (args: {
  companyId: number;
  createdById: number;
}) =>
  useMutation({
    mutationKey: ["createCompanyUser", args.companyId],
    mutationFn: (userInput: CreateCompanyUserInput) =>
      createCompanyUserAndLink({
        companyId: args.companyId,
        createdById: args.createdById,
        userInput,
      }),
  });
