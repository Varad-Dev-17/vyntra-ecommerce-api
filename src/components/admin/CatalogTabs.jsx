import React from "react";
import { NavLink } from "react-router-dom";

const catalogTabs = [
  {
    label: "Categories",
    path: "/admin/catalog/categories",
  },
  {
    label: "Article Types",
    path: "/admin/catalog/article-types",
  },
  {
    label: "Brands",
    path: "/admin/catalog/brands",
  },
  {
    label: "Attributes",
    path: "/admin/catalog/attributes",
  },
];

const CatalogTabs = () => {
  return (
    <div className="bg-white border-b border-gray-100 px-6">
      <nav className="flex space-x-8">
        {catalogTabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? "border-[#4648d4] text-[#4648d4]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default CatalogTabs;
