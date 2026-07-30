import HeroSlider from "../../components/home/HeroSlider";
import CuratedCollections from "../../components/home/CuratedCollections";
import HomeNewArrivalsSection from "../../components/home/HomeNewArrivalsSection";
import PromoBanners from "../../components/home/PromoBanners";
import PopularCategories from "../../components/home/PopularCategories";
import OfficialBrandStores from "../../components/home/OfficialBrandStores";
import Newsletter from "../../components/common/Newsletter";

const Home = () => {
  return (
    <div className="bg-[#FFFFFF]">
      <HeroSlider />
      <PopularCategories />
      <CuratedCollections />
      <PromoBanners />
      <HomeNewArrivalsSection
        title="New Arrivals"
        subtitle="Discover the latest additions to the Vyntra collection."
        endpoint="/products/new-arrivals?limit=5"
      />
      <OfficialBrandStores />
      <Newsletter />
    </div>
  );
};

export default Home;
