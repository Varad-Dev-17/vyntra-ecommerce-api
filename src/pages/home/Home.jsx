import HeroSlider from "../../components/home/HeroSlider";
import CuratedCollections from "../../components/home/CuratedCollections";
import HomeNewArrivalsSection from "../../components/home/HomeNewArrivalsSection";

const Home = () => {
  return (
    <div className="bg-[#FFFFFF]">
      <HeroSlider />
      <CuratedCollections />
      <HomeNewArrivalsSection
        title="New Arrivals"
        subtitle="Discover the latest additions to the Vyntra collection."
        endpoint="/products/new-arrivals?limit=5"
      />
    </div>
  );
};

export default Home;
