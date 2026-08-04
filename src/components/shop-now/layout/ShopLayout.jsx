const ShopLayout = ({ sidebar, children }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFB] pt-[84px] pb-12">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-4">
        <div className="flex flex-col lg:flex-row gap-3.5 lg:gap-4 items-start">
          
          {/* Left Filter Sidebar Container */}
          <aside className="w-full lg:w-[230px] shrink-0 lg:sticky lg:top-[84px]">
            {sidebar}
          </aside>

          {/* Right Content Container */}
          <main className="flex-1 w-full min-w-0">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
};

export default ShopLayout;
