import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="flex items-center text-sm font-medium text-gray-500 mb-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center">
            {isLast || !item.path ? (
              <span className="text-gray-900 font-semibold">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-[#4648d4] transition-colors"
              >
                {item.label}
              </Link>
            )}

            {!isLast && (
              <ChevronRight size={14} className="mx-2 text-gray-400" />
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
