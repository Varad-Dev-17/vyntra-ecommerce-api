const PageCard = ({ children }) => {
  return (
    <div className="flex flex-col min-h-full w-full max-w-[1600px] mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden h-[calc(100vh-80px)]">
        {children}
      </div>
    </div>
  );
};

export default PageCard;
