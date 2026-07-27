
const StatusBadge = ({ status }) => {
  const isActive = status === 'active' || status === 'Active';
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

export default StatusBadge;
