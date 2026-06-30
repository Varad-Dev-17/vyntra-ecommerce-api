import { useCylinderGallery } from "../../animations/useCylinderGallery";
import StitchCard from "./stitchCard";

const BandTwo = ({ products, liked, toggleLike }) => {
  const { setItemRef } = useCylinderGallery(products.length, 0.6);

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: 360, marginTop: 32 }}
    >
      <div
        style={{
          transform: "translateX(160px)",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        {products.map((product, index) => (
          <StitchCard
            key={`band2-${product.id}`}
            ref={setItemRef(index)}
            product={product}
            liked={liked}
            toggleLike={toggleLike}
          />
        ))}
      </div>
    </div>
  );
};

export default BandTwo;
