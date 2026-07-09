import React from "react";
import { Outlet } from "react-router-dom";
import CatalogTabs from "../../../components/admin/CatalogTabs";

const CatalogLayout = () => {
  return (
    <div className="flex flex-col min-h-full">
      <CatalogTabs />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default CatalogLayout;
