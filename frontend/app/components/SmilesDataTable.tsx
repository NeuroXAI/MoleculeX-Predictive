// components/SmilesDataTable.tsx
import { useState } from "react";
import {
  FaEllipsisV,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { motion } from "framer-motion";

interface SMILESDatum {
  name: string;
  smiles: string;
  molecularWeight?: string;
  meltingPoint?: string;
  dateAdded?: string;
  [key: string]: string | number | undefined;
}

interface SmilesDataTableProps {
  data: SMILESDatum[];
}

const SmilesDataTable: React.FC<SmilesDataTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;

  // Filter and sort data
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortColumn]?.toString() || "";
    const bValue = b[sortColumn]?.toString() || "";

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Calculate total pages
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Get table headers dynamically based on data keys
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev === 1 ? prev : prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev === totalPages ? prev : prev + 1));
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Table Header with Search and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">SMILES Dataset</h2>
          <p className="text-gray-400 text-sm">
            Showing {currentItems.length} of {sortedData.length} records
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <FaEllipsisV className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-700/50 border-b border-zinc-600">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-sm font-medium text-gray-300 cursor-pointer hover:bg-zinc-700/50 transition-colors"
                    onClick={() => handleSort(header)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>
                        {header.charAt(0).toUpperCase() + header.slice(1)}
                      </span>
                      {sortColumn === header && (
                        <FaFilter
                          className={`text-xs ${
                            sortDirection === "asc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {currentItems.map((compound, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-zinc-700/30 transition-colors"
                >
                  {headers.map((header) => (
                    <td
                      key={header}
                      className="px-6 py-4 text-sm text-gray-300"
                    >
                      <div
                        className="max-w-xs truncate"
                        title={compound[header]?.toString()}
                      >
                        {compound[header] || "-"}
                      </div>
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {currentItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              {searchTerm
                ? "No records found matching your search"
                : "No data available"}
            </div>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Upload a file to see data here"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-400">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, sortedData.length)} of{" "}
            {sortedData.length} records
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? "bg-zinc-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              aria-label="Previous Page"
            >
              <FaChevronLeft className="text-sm" />
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-700 text-gray-300 hover:bg-zinc-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? "bg-zinc-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              aria-label="Next Page"
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SmilesDataTable;
