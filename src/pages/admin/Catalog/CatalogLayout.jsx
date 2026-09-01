import { Outlet, useLocation, Link } from 'react-router-dom';
import { Layers, LayoutGrid, Tag, Sliders, ChevronRight, Bell } from 'lucide-react';

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
    <div className="flex-1 overflow-x-hidden flex flex-col bg-[#f8f9fc]">
      {!isFormPage && (
        <div className="px-8 pt-6 pb-6 w-full max-w-6xl">
          {/* Tabs row */}
          <div className="flex gap-3">
            {tabs.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  to={tab.path}
                  className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-[14px] transition-all duration-200 ${
                    isActive
                      ? 'bg-[#4648d4] text-white shadow-md shadow-[#4648d4]/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className={`flex-1 overflow-hidden flex flex-col ${!isFormPage ? 'px-8 pb-8' : 'p-8'}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default CatalogLayout;
