import PageCard from "../../../components/admin/ui/PageCard";
import { Star } from "lucide-react";

const Reviews = () => {
  return (
    <PageCard>
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-gray-50/50">
        <Star size={48} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-[#1a1a2e]  mb-2">
          Customer Reviews
        </h3>
        <p className="text-gray-500 max-w-md">
          Product reviews.
        </p>
      </div>
    </PageCard>
  );
};

export default Reviews;
