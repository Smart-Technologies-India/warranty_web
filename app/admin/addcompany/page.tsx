"use client";

import AddCompanyPage from "@/components/form/addcompany";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const AddCompany = () => {
  return (
    <div className="w-full h-full">
      <AddCompanyPage />
    </div>
  );
};
export default AddCompany;
