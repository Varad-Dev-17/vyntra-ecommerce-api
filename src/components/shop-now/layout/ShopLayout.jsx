const ShopLayout = ({ sidebar, children }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFB] pt-24 pb-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Filter Sidebar Container */}
          <aside className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-24">
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
