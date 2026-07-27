
const DataTable = ({
  columns,
  data,
  isLoading,
  emptyMessage = "No records found.",
  keyField = "_id",
  // Future API extensibility placeholders
  selectable = false,
  selectedRows = [],
  onSelectionChange = null,
  toolbarActions = null
}) => {
  return (
    <div className="overflow-x-auto overflow-y-auto max-h-full">
      <table className="w-full whitespace-nowrap border-collapse">
        <thead className="bg-gray-50 sticky top-0 z-10 border-b-2 border-gray-200">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`px-6 py-4 text-[17px] font-bold text-[#4648d4] border-r border-gray-100 last:border-r-0 align-middle ${col.align === 'left' ? 'text-left' : col.align === 'right' ? 'text-right' : 'text-center'
                  }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12">
                <div className="w-8 h-8 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-3 text-sm text-gray-500">Loading data...</p>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row[keyField] || rowIndex}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-5 text-[16] border-r border-gray-100 last:border-r-0 align-middle ${col.align === 'left' ? 'text-left' : col.align === 'right' ? 'text-right' : 'text-center'
                      }`}
                  >
                    {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
