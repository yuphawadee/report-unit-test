import { useState } from "react";

const Pagination = ({ data, itemsPerPage, renderItem, className, handlePageChange, currentPage, tableHead, colSpan  }) => {
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // ฟังก์ชันสร้าง pagination แบบ dynamic
  const generatePagination = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 4) {
        pages.push("...");
      }
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 3) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={className}>
      <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-md mt-5">
       {tableHead}
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => renderItem(item, index + indexOfFirstItem)) // คำนวณลำดับที่ถูกต้อง
          ) : (
            <tr>
              <td colSpan={colSpan} className="text-center p-4 text-gray-500">
                ไม่มีข้อมูลที่ตรงกับเงื่อนไข
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="flex gap-2 mt-4 justify-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        {generatePagination().map((page, index) => (
          <button
            key={index}
            onClick={() => page !== "..." && handlePageChange(page)}
            className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-500 text-white" : ""} ${page === "..." ? "cursor-default" : ""}`}
            disabled={page === "..." || currentPage === page}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
