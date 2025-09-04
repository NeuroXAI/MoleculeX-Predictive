"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from "react-icons/fa";

const PredictedPropertiesTable = () => {
  const [predictedData, setPredictedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  const fetchPredictedData = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/predictions?page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch predictions");
      }
      const data = await response.json();
      setPredictedData(data.predictions);
      setTotalPages(data.pagination.total_pages);
    } catch (error) {
      console.error("Error fetching predicted data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictedData(page);
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-400">Loading predictions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-gray-300 border-b border-zinc-700">
              <tr>
                <th className="p-4 font-semibold text-sm uppercase tracking-wider">#</th>
                <th className="p-4 font-semibold text-sm uppercase tracking-wider">SMILES</th>
                <th className="p-4 font-semibold text-sm uppercase tracking-wider">pIC50</th>
                <th className="p-4 font-semibold text-sm uppercase tracking-wider">logP</th>
                <th className="p-4 font-semibold text-sm uppercase tracking-wider">Atoms</th>
              </tr>
            </thead>
            <AnimatePresence>
              <motion.tbody
                key={page}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {predictedData.map((item, index) => (
                  <motion.tr
                    key={item.SMILES}
                    className="border-b border-zinc-700/50 hover:bg-zinc-800/50 transition-colors duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <td className="p-4 text-gray-400 font-medium">
                      {index + 1 + (page - 1) * limit}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/pages/compound/${encodeURIComponent(item.SMILES)}`}
                        className="flex items-center text-blue-400 hover:text-blue-300 font-mono text-sm transition-colors duration-200"
                      >
                        <span className="truncate max-w-xs">{item.SMILES}</span>
                        <FaExternalLinkAlt className="ml-2 text-xs opacity-60" />
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/50">
                        {parseFloat(item.Predicted_pIC50).toFixed(3)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-700/50">
                        {parseFloat(item.Predicted_logP).toFixed(3)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-700/50">
                        {parseInt(item.Predicted_num_atoms)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        <AnimatePresence>
          {predictedData.map((item, index) => (
            <motion.div
              key={item.SMILES}
              className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-medium">
                  #{index + 1 + (page - 1) * limit}
                </span>
                <Link
                  href={`/pages/compound/${encodeURIComponent(item.SMILES)}`}
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
                >
                  View Details
                  <FaExternalLinkAlt className="ml-1" />
                </Link>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-gray-500 font-mono break-all">
                  {item.SMILES}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/50">
                    pIC50: {parseFloat(item.Predicted_pIC50).toFixed(3)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-700/50">
                    logP: {parseFloat(item.Predicted_logP).toFixed(3)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-700/50">
                    Atoms: {parseInt(item.Predicted_num_atoms)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-400 bg-zinc-800 rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <FaChevronLeft className="mr-1" />
              Previous
            </button>
          </div>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    page === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-400 bg-zinc-800 rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
              <FaChevronRight className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Page Info */}
      <div className="text-center mt-4 text-sm text-gray-500">
        Page {page} of {totalPages} • Showing {predictedData.length} of {totalPages * limit} results
      </div>
    </div>
  );
};

export default PredictedPropertiesTable;
