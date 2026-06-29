import CategorySection from "../components/Category";
import HeroCarousel from "../components/HeroCarousel";
import Newsletter from "../components/NewsLetter";
import TrendingProducts from "../components/TrendingProducts";

const Home = () => {
  return (
    <div className="mt-4">
      <HeroCarousel />
      <CategorySection />
      <TrendingProducts />
      <Newsletter />
    </div>
  );
};

export default Home;
