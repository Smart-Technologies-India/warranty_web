"use client";

import {
  FluentBuildingSkyscraper24Regular,
  FluentShieldAdd48Filled,
  MaterialSymbolsLogout,
  MaterialSymbolsPersonRounded,
  MaterialSymbolsSupportAgent,
  Fa6RegularBuilding,
  ClarityBlocksGroupLine,
  Fa6RegularRectangleList,
  IcOutlineInsertChart,
  IcOutlineReceiptLong,
  MdiStorefrontOutline,
  IcBaselineAccountCircle,
  FluentMdl2Home,
  IcRoundTurnedInNot,
} from "../icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next/client";
import { getCookie } from "cookies-next";

const ROLES = {
  SYSTEM: "SYSTEM",
  ADMIN: "ADMIN",
  MANUF_ADMIN: "MANUF_ADMIN",
  MANUF_ACCOUNTS: "MANUF_ACCOUNTS",
  MANUF_MANAGER: "MANUF_MANAGER",
  MANUF_SALES: "MANUF_SALES",
  MANUF_TECHNICAL: "MANUF_TECHNICAL",
  MANUF_TECH_GEN: "MANUF_TECH_GEN",
  MANUF_TECH_EXPERT: "MANUF_TECH_EXPERT",
  MANUF_TECH_MANAGER: "MANUF_TECH_MANAGER",
  DEALER_ADMIN: "DEALER_ADMIN",
  DEALER_ACCOUNTS: "DEALER_ACCOUNTS",
  DEALER_MANAGER: "DEALER_MANAGER",
  DEALER_SALES: "DEALER_SALES",
  USER: "USER",
  ACCOUNTS: "ACCOUNTS",
  SALES: "SALES",
  TECHNICAL: "TECHNICAL",
} as const;

type UserRole = (typeof ROLES)[keyof typeof ROLES];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (arg: boolean) => void;
  role: string;
}

const Sidebar = (props: SidebarProps) => {
  const path = usePathname();
  const router = useRouter();

  const companyId: number = parseInt(getCookie("company")?.toString() || "0");
  const userId: number = parseInt(getCookie("id")?.toString() || "0");

  const roleRoutes: Record<UserRole, string> = {
    SYSTEM: "/admin",
    ADMIN: "/admin",
    USER: "/customer",
    ACCOUNTS: "/accounts",
    SALES: "/sales",
    TECHNICAL: "/technical",
    MANUF_ADMIN: "/company",
    MANUF_ACCOUNTS: "/company",
    MANUF_MANAGER: "/company",
    MANUF_SALES: "/company",
    MANUF_TECHNICAL: "/company",
    MANUF_TECH_GEN: "/company",
    MANUF_TECH_EXPERT: "/company",
    MANUF_TECH_MANAGER: "/company",
    DEALER_ADMIN: "/dealer",
    DEALER_ACCOUNTS: "/dealer",
    DEALER_MANAGER: "/dealer",
    DEALER_SALES: "/dealer",
  };

  return (
    <>
      <div
        className={`w-60 h-screen top-0 left-0 fixed z-20 flex md:translate-x-0 bg-white shadow-lg border-r border-gray-200 ${
          props.isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col w-60 h-full">
          {/* Logo Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FluentShieldAdd48Filled className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  Warranty Smart
                </h2>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-2">
            {!["USER"].includes(props.role) && (
              <MenuTab
                name="Dashboard"
                path={path}
                pathcheck={roleRoutes[props.role as UserRole]}
                click={() => props.setIsOpen(false)}
                icon={<FluentMdl2Home className="w-5 h-5" />}
                iconColor="text-blue-600"
                gradientFrom="from-blue-500"
                gradientTo="to-blue-600"
              />
            )}

            {["SYSTEM", "ADMIN"].includes(props.role) && (
              <>
                <MenuTab
                  name="Companies"
                  path={path}
                  pathcheck="/admin/companies"
                  click={() => props.setIsOpen(false)}
                  icon={<Fa6RegularBuilding className="w-5 h-5" />}
                  iconColor="text-emerald-600"
                  gradientFrom="from-emerald-500"
                  gradientTo="to-emerald-600"
                />
                <MenuTab
                  name="Dealers"
                  path={path}
                  pathcheck="/admin/dealers"
                  click={() => props.setIsOpen(false)}
                  icon={<MdiStorefrontOutline className="w-5 h-5" />}
                  iconColor="text-orange-600"
                  gradientFrom="from-orange-500"
                  gradientTo="to-orange-600"
                />
                <MenuTab
                  name="Categories"
                  path={path}
                  pathcheck="/admin/categories"
                  click={() => props.setIsOpen(false)}
                  icon={<ClarityBlocksGroupLine className="w-5 h-5" />}
                  iconColor="text-purple-600"
                  gradientFrom="from-purple-500"
                  gradientTo="to-purple-600"
                />
                <MenuTab
                  name="Subcategories"
                  path={path}
                  pathcheck="/admin/subcategories"
                  click={() => props.setIsOpen(false)}
                  icon={<Fa6RegularRectangleList className="w-5 h-5" />}
                  iconColor="text-violet-600"
                  gradientFrom="from-violet-500"
                  gradientTo="to-violet-600"
                />
                <MenuTab
                  name="Products"
                  path={path}
                  pathcheck="/admin/products"
                  click={() => props.setIsOpen(false)}
                  icon={
                    <FluentBuildingSkyscraper24Regular className="w-5 h-5" />
                  }
                  iconColor="text-teal-600"
                  gradientFrom="from-teal-500"
                  gradientTo="to-teal-600"
                />
                <MenuTab
                  name="Claims"
                  path={path}
                  pathcheck="/admin/claims"
                  click={() => props.setIsOpen(false)}
                  icon={<IcOutlineReceiptLong className="w-5 h-5" />}
                  iconColor="text-rose-600"
                  gradientFrom="from-rose-500"
                  gradientTo="to-rose-600"
                />
                <MenuTab
                  name="Users"
                  path={path}
                  pathcheck="/admin/users"
                  click={() => props.setIsOpen(false)}
                  icon={<IcBaselineAccountCircle className="w-5 h-5" />}
                  iconColor="text-cyan-600"
                  gradientFrom="from-cyan-500"
                  gradientTo="to-cyan-600"
                />
                <MenuTab
                  name="Reports"
                  path={path}
                  pathcheck="/admin/reports"
                  click={() => props.setIsOpen(false)}
                  icon={<IcOutlineInsertChart className="w-5 h-5" />}
                  iconColor="text-indigo-600"
                  gradientFrom="from-indigo-500"
                  gradientTo="to-indigo-600"
                />
              </>
            )}

            {["MANUF_ADMIN", "MANUF_MANAGER"].includes(props.role) && (
              <>
                <MenuTab
                  name="My Profile"
                  path={path}
                  pathcheck={`/company/${companyId}`}
                  click={() => props.setIsOpen(false)}
                  icon={<IcBaselineAccountCircle className="w-5 h-5" />}
                  iconColor="text-slate-600"
                  gradientFrom="from-slate-500"
                  gradientTo="to-slate-600"
                />
                <MenuTab
                  name="Products"
                  path={path}
                  pathcheck={`/company/${companyId}/products`}
                  click={() => props.setIsOpen(false)}
                  icon={
                    <FluentBuildingSkyscraper24Regular className="w-5 h-5" />
                  }
                  iconColor="text-green-600"
                  gradientFrom="from-green-500"
                  gradientTo="to-green-600"
                />

                <MenuTab
                  name="Users"
                  path={path}
                  pathcheck={`/company/${companyId}/users`}
                  click={() => props.setIsOpen(false)}
                  icon={<MaterialSymbolsPersonRounded className="w-5 h-5" />}
                  iconColor="text-blue-600"
                  gradientFrom="from-blue-500"
                  gradientTo="to-blue-600"
                />
                <MenuTab
                  name="Reports"
                  path={path}
                  pathcheck={`/company/reports`}
                  click={() => props.setIsOpen(false)}
                  icon={<IcOutlineInsertChart className="w-5 h-5" />}
                  iconColor="text-indigo-600"
                  gradientFrom="from-indigo-500"
                  gradientTo="to-indigo-600"
                />
              </>
            )}
            {["MANUF_ADMIN", "MANUF_MANAGER", "MANUF_SALES"].includes(
              props.role,
            ) && (
              <>
                <MenuTab
                  name="Dealer Sales"
                  path={path}
                  pathcheck={`/company/${companyId}/sale`}
                  click={() => props.setIsOpen(false)}
                  icon={<IcOutlineInsertChart className="w-5 h-5" />}
                  iconColor="text-purple-600"
                  gradientFrom="from-purple-500"
                  gradientTo="to-purple-600"
                />
                <MenuTab
                  name="D2C Sale"
                  path={path}
                  pathcheck={`/company/${companyId}/d2c-sale`}
                  click={() => props.setIsOpen(false)}
                  icon={<IcOutlineReceiptLong className="w-5 h-5" />}
                  iconColor="text-blue-600"
                  gradientFrom="from-blue-500"
                  gradientTo="to-blue-600"
                />
              </>
            )}

            {[
              "MANUF_ADMIN",
              "MANUF_ACCOUNTS",
              "MANUF_MANAGER",
              "MANUF_SALES",
              "MANUF_TECHNICAL",
              "MANUF_TECH_GEN",
              "MANUF_TECH_EXPERT",
              "MANUF_TECH_MANAGER",
            ].includes(props.role) && (
              <>
                <MenuTab
                  name="Claims"
                  path={path}
                  pathcheck={`/company/claims`}
                  click={() => props.setIsOpen(false)}
                  icon={<IcOutlineReceiptLong className="w-5 h-5" />}
                  iconColor="text-amber-600"
                  gradientFrom="from-amber-500"
                  gradientTo="to-amber-600"
                />
              </>
            )}
            {[
              "DEALER_ADMIN",
              "DEALER_ACCOUNTS",
              "DEALER_MANAGER",
              "DEALER_SALES",
            ].includes(props.role) && (
              <>
                <MenuTab
                  name="My Profile"
                  path={path}
                  pathcheck={`/dealer/${companyId}`}
                  click={() => props.setIsOpen(false)}
                  icon={<IcBaselineAccountCircle className="w-5 h-5" />}
                  iconColor="text-slate-600"
                  gradientFrom="from-slate-500"
                  gradientTo="to-slate-600"
                />
                <MenuTab
                  name="Stock Management"
                  path={path}
                  pathcheck={`/dealer/${companyId}/stock`}
                  click={() => props.setIsOpen(false)}
                  icon={<IcRoundTurnedInNot className="w-5 h-5" />}
                  iconColor="text-emerald-600"
                  gradientFrom="from-emerald-500"
                  gradientTo="to-emerald-600"
                />
                <MenuTab
                  name="User Management"
                  path={path}
                  pathcheck={`/dealer/${companyId}/users`}
                  click={() => props.setIsOpen(false)}
                  icon={<MaterialSymbolsPersonRounded className="w-5 h-5" />}
                  iconColor="text-blue-600"
                  gradientFrom="from-blue-500"
                  gradientTo="to-blue-600"
                />
                <MenuTab
                  name="Customer Sales"
                  path={path}
                  pathcheck={`/dealer/${companyId}/sale`}
                  click={() => props.setIsOpen(false)}
                  icon={<IcOutlineInsertChart className="w-5 h-5" />}
                  iconColor="text-purple-600"
                  gradientFrom="from-purple-500"
                  gradientTo="to-purple-600"
                />
                <MenuTab
                  name="B2B Sale"
                  path={path}
                  pathcheck={`/dealer/${companyId}/b2b`}
                  click={() => props.setIsOpen(false)}
                  icon={<IcOutlineReceiptLong className="w-5 h-5" />}
                  iconColor="text-indigo-600"
                  gradientFrom="from-indigo-500"
                  gradientTo="to-indigo-600"
                />
              </>
            )}
            {["USER"].includes(props.role) && (
              <>
                <MenuTab
                  name="My Profile"
                  path={path}
                  pathcheck={`/customer`}
                  click={() => props.setIsOpen(false)}
                  icon={<Fa6RegularBuilding className="w-5 h-5" />}
                  iconColor="text-emerald-600"
                  gradientFrom="from-emerald-500"
                  gradientTo="to-emerald-600"
                />
                <MenuTab
                  name="Products"
                  path={path}
                  pathcheck={`/customer/products`}
                  click={() => props.setIsOpen(false)}
                  icon={
                    <FluentBuildingSkyscraper24Regular className="w-5 h-5" />
                  }
                  iconColor="text-teal-600"
                  gradientFrom="from-teal-500"
                  gradientTo="to-teal-600"
                />
                <MenuTab
                  name="Claims"
                  path={path}
                  pathcheck={`/customer/claim`}
                  click={() => props.setIsOpen(false)}
                  icon={<MaterialSymbolsSupportAgent className="w-5 h-5" />}
                  iconColor="text-indigo-600"
                  gradientFrom="from-indigo-500"
                  gradientTo="to-indigo-600"
                />
              </>
            )}
          </nav>

          {/* Logout Section */}
          <div className="p-2 border-t border-gray-200">
            <LogoutTab
              name="Logout"
              click={() => {
                props.setIsOpen(false);
                deleteCookie("id");
                deleteCookie("role");
                router.push("/adminlogin");
              }}
              icon={<MaterialSymbolsLogout className="w-5 h-5" />}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default Sidebar;

interface MenuTabProps {
  click: () => void;
  name: string;
  path: string;
  pathcheck: string;
  icon: React.ReactNode;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
}

const MenuTab = (props: MenuTabProps) => {
  const isActive = props.path === props.pathcheck;

  return (
    <Link
      onClick={props.click}
      href={props.pathcheck}
      className={`flex items-center gap-2 px-3 py-2 mx-1 my-1 rounded-lg transition-all duration-200 ${
        isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className={`${isActive ? "text-white" : props.iconColor}`}>
        {props.icon}
      </span>
      <span className={`font-medium text-sm ${isActive ? "text-white" : ""}`}>
        {props.name}
      </span>
    </Link>
  );
};

interface LogoutTabProps {
  click: () => void;
  name: string;
  icon: React.ReactNode;
}

const LogoutTab = (props: LogoutTabProps) => {
  return (
    <button
      onClick={props.click}
      className="flex items-center gap-2 px-3 py-2 mx-1 my-1 rounded-lg w-full text-red-600 hover:bg-red-50 transition-all duration-200"
    >
      <span className="text-red-600">{props.icon}</span>
      <span className="font-medium text-sm">{props.name}</span>
    </button>
  );
};
