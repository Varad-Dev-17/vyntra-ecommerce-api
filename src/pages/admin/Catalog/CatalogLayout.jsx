import { Outlet, useLocation, Link } from 'react-router-dom';
import { Layers, LayoutGrid, Tag, Sliders } from 'lucide-react';

const CatalogLayout = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Departments', path: '/admin/catalog/departments', icon: Layers },
    { name: 'Categories', path: '/admin/catalog/categories', icon: LayoutGrid },
    { name: 'Brands', path: '/admin/catalog/brands', icon: Tag },
    { name: 'Attributes', path: '/admin/catalog/attributes', icon: Sliders },
  ];

  const isFormPage = location.pathname.includes('/add') || location.pathname.includes('/edit');

  return (
    <div className="flex-1 overflow-x-hidden flex flex-col">
      {!isFormPage && (
        <div className="flex items-center gap-4 bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-[#4648d4] mr-4 border-r border-gray-200 pr-6">Catalog</h1>
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  to={tab.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    isActive
                      ? 'bg-[#4648d4] text-white border border-[#4648d4] shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-[#4648d4]/5 hover:border-[#4648d4]/30 hover:text-[#4648d4]'
                  }`}
                >
                  <Icon size={16} />
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default CatalogLayout;
