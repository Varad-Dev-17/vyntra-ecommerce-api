const Loader = () => {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="w-full aspect-[4/5] rounded-[16px] bg-gray-200 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="flex items-center gap-2 mt-auto">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-3 bg-gray-200 rounded w-1/5" />
      </div>
    </div>
  );
};

export default Loader;
