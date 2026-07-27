import PageCard from "../../../components/admin/ui/PageCard";
import { Ticket } from "lucide-react";

const Coupons = () => {
  return (
    <PageCard>
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-gray-50/50">
        <Ticket size={48} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-[#1a1a2e] font-['Manrope'] mb-2">
          Coupons
        </h3>
        <p className="text-gray-500 max-w-md">
          Coupons and discount management is coming soon in a future update.
        </p>
      </div>
    </PageCard>
  );
};

export default Coupons;
