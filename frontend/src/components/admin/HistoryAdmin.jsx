import React, { useEffect, useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { FaInfoCircle, FaSave, FaTrash } from "react-icons/fa";
import FilterBar from "../FilterBar";
import Pagination from "../Pagination";
import { FaXmark } from "react-icons/fa6";

const HistoryAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [userID, setUserID] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // จำนวนรายการต่อหน้า
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [toast, setToast] = useState();
  const [yearFilter, setYearFilter] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    // console.log("Token in localStorage:", token);

    if (!token) {
      setError("ไม่พบ JWT ใน localStorage");
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwt_decode(token);
      // console.log("Decoded Token:", decodedToken);
      setUserID(decodedToken.userId); // ใช้ userId จาก decodedToken
    } catch (error) {
      // console.error("JWT Decode Error:", error);
      setError("ไม่สามารถถอดรหัส JWT ได้");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/reports?status=resolved");
        setHistory(response.data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const getStatusInThai = (status) => {
    switch (status) {
      case "pending":
        return "รับคำร้องแล้ว";
      case "in_progress":
        return "กำลังดำเนินการ";
      case "resolved":
        return "ดำเนินการเสร็จสิ้น";
      default:
        return status;
    }
  };

  const buddhistYears = Array.from(
    new Set(
      history.map((item) =>
        (new Date(item.created_at).getFullYear() + 543).toString()
      )
    )
  ).sort((a, b) => b - a); // เรียงจากมากไปน้อย

  const yearOptions = [{ value: "", label: "ทุกปี" }, ...buddhistYears.map((year) => ({
    value: year,
    label: `พ.ศ. ${year}`,
  }))];



  useEffect(() => {
    let filtered = history;

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (yearFilter) {
      filtered = filtered.filter((item) => {
        const createdYear = new Date(item.created_at).getFullYear() + 543;
        return createdYear.toString() === yearFilter;
      });
    }

    setReports(filtered);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [searchTerm, yearFilter, history, currentPage, itemsPerPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const openDialog = () => {
    setShowImageDialog(true);
  };

  const closeDialog = () => {
    setShowImageDialog(false);
  };

  return (
    <div className="">
      {toast && (
        <div
          className={`flex items-center w-full p-4 mb-4 text-gray-500  rounded-lg shadow-sm ${toast.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
            }`}
          role="alert"
        >
          <div className="inline-flex items-center justify-center shrink-0 w-7 h-7">
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d={toast.type === 'success'
                  ? "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
                  : "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"
                }
              />
            </svg>
            <span className="sr-only">{toast.type === 'success' ? 'Success icon' : 'Error icon'}</span>
          </div>
          <div className="ms-3 text-sm font-normal">{toast.message}</div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-center mb-6">ประวัติการแจ้งปัญหา</h2>
      {loading ? (
        <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <>

          <div className="flex flex-wrap justify-between gap-4">
            {/* ค้นหา */}
            <div className="w-full sm:w-1/4">
              <input
                type="text"
                placeholder="ค้นหาชื่อเรื่อง"
                className="border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Dropdown คัดกรองปี */}
            <div className="w-full sm:w-1/4">
              <select
                className="border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                {/* <option value="">ทุกปี</option> */}
                {yearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

         <div className="overflow-x-auto">
         <Pagination
            data={reports} // ส่งข้อมูลที่กรองแล้ว
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            tableHead={
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-center">ลำดับ</th>
                  <th className="p-3 text-left text-sm font-semibold text-center">ชื่อเรื่อง</th>
                  <th className="p-3 text-left text-sm font-semibold text-center">วันที่แจ้ง</th>
                  <th className="p-3 text-left text-sm font-semibold text-center">สถานะ</th>
                  <th className="p-3 text-left text-sm font-semibold text-center">รายละเอียด</th>
                  {/* <th className="p-3 text-left text-sm font-semibold text-center">ตัวเลือก</th> */}
                </tr>
              </thead>
            }
            colSpan={5}
            renderItem={(item, index) => (
              <tr key={item.id} className="border-b hover:bg-gray-50 cursor-pointer">
                <td className="p-3 text-center">{index + 1}</td>
                <td className="p-3">{item.title}</td>
                <td className="p-3 text-center">{new Date(item.created_at).toLocaleDateString("th-TH")}</td>
                <td className="p-3 text-center">{getStatusInThai(item.status)}</td>
                <td className="p-3 text-center">
                  <span className="text-blue-600 underline" onClick={() => handleViewDetails(item)} title="ดูรายละเอียด">
                    ดูรายละเอียด
                  </span>
                </td>
              </tr>
            )}
          />
         </div>
        </>
      )}

      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center pb-4">
              <h2 className="text-2xl font-semibold">รายละเอียดการแจ้งปัญหา</h2>
              <button
                className="bg-red-500 hover:bg-red-600 text-white rounded-md p-1 transition-colors"
                onClick={handleCloseModal}>
                <FaXmark size={25} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <p><span className="font-semibold">หมายเลข:</span> {selectedReport.tracking_id}</p>
              <p><span className="font-semibold">ชื่อเรื่อง:</span> {selectedReport.title}</p>
              <p><span className="font-semibold">รายละเอียด:</span> {selectedReport.details}</p>
              <p><span className="font-semibold">วันที่แจ้ง:</span> {new Date(selectedReport.created_at).toLocaleDateString("th-TH")}</p>
              <p><span className="font-semibold">สถานะ:</span> {getStatusInThai(selectedReport.status)}</p>
            </div>
            {selectedReport.image && (
              <div className="pt-2">
                <h4 className="font-semibold">รูปภาพที่แนบมา:</h4>
                <img
                  src={`http://localhost:5000/uploads/${selectedReport.image}`}
                  alt="Report"
                  className="h-24 mt-2 rounded-md object-cover cursor-zoom-in"
                  onClick={openDialog}
                  onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                />
                {/* <button className="text-blue-500 hover:text-blue-700 font-semibold" onClick={openDialog}>ดูรูปภาพ</button> */}
                {/* Dialog สำหรับแสดงภาพเต็มจอ */}
                {showImageDialog && (
                  <dialog open className="w-full h-full fixed inset-0 bg-black/80 flex items-center justify-center">
                    <img
                      src={`http://localhost:5000/uploads/${selectedReport.image}`}
                      alt="Report"
                      className="w-[800px] rounded-md"
                      onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                    />
                    <button className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-md p-1 transition-colors" onClick={closeDialog}>
                      <FaXmark size={25} />
                    </button>
                  </dialog>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default HistoryAdmin;
