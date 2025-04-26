import React from 'react'

const FilterBar = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  statusOptions = [], // ให้ค่าเริ่มต้นเป็นอาเรย์ว่าง
  yearFilter,
  setYearFilter,
  yearOptions = [] // ให้ค่าเริ่มต้นเป็นอาเรย์ว่าง
}) => {
  return (
    <div className="">
      {/* Input ค้นหาชื่อเรื่อง */}
      <div className="w-full sm:w-1/4">
        <input
          type="text"
          placeholder="ค้นหาชื่อเรื่อง"
          className="border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Dropdown คัดกรองสถานะ */}
      {/* <div className="w-full sm:w-1/4">
        <select
          className="border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">ทั้งหมด</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div> */}

      {/* Dropdown คัดกรองปี */}
      {/* <div className="w-full sm:w-1/4">
        <select
          className="border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">ทุกปี</option>
          {yearOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div> */}
    </div>
  );
};

export default FilterBar;
