import React, { useEffect, useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { FaInfoCircle, FaSave, FaTrash } from "react-icons/fa";
import FilterBar from "../FilterBar";
import Pagination from "../Pagination";
import { FaXmark } from "react-icons/fa6";

const ReportAdmin = () => {
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
      // console.log(userID)
      // setFirstName(decodedToken.first_name); // ใช้ first_name จาก decodedToken
      // setLastName(decodedToken.last_name); // ใช้ last_name จาก decodedToken
    } catch (error) {
      // console.error("JWT Decode Error:", error);
      setError("ไม่สามารถถอดรหัส JWT ได้");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/reports?status=pending,in_progress");
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

  const handleUpdateStatus = async () => {
    if (!selectedReport || selectedReport.status === newStatus) return;
  
    try {
      const response = await axios.put(
        `http://localhost:5000/reports/${selectedReport.id}`,
        {
          status: newStatus,
          userId: userID
        }
      );
  
      if (response.status === 200) {
        // อัปเดตสถานะใน history โดยตรง
        setHistory((prevHistory) =>
          prevHistory.map((report) =>
            report.id === selectedReport.id ? { ...report, status: newStatus } : report
          )
        );
        setShowModal(false);
        setToast({
          type: 'success',
          message: 'อัพเดทสถานะสำเร็จ'
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };
  
  
  const handleDeleteReport = async (id) => {
    console.log("Attempting to delete report with ID:", id);
    if (window.confirm("คุณต้องการลบรายงานนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`http://localhost:5000/reports/${id}`);
        setReports((prevReports) => prevReports.filter((report) => report.id !== id));
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
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

  const statusOptions = [
    { value: "pending", label: "รับคำร้องแล้ว" },
    { value: "in_progress", label: "กำลังดำเนินการ" },
    // { value: "resolved", label: "ดำเนินการเสร็จสิ้น" },
  ];

  useEffect(() => {
    let filtered = history;

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setReports(filtered);

    // ✅ ถ้าหน้าปัจจุบันไม่มีข้อมูลแล้ว ให้ย้อนกลับไปหน้าสุดท้ายที่มีข้อมูล
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1); // ถ้าไม่มีข้อมูลเลย ให้กลับไปหน้าแรก
    }
  }, [searchTerm, statusFilter, history, currentPage, itemsPerPage]);

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

      <h2 className="text-2xl font-bold text-center mb-6">เรื่องร้องเรียน</h2>
      {loading ? (
        <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <>
          {/* <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statusOptions={statusOptions}
          /> */}
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
                    <th className="p-3 text-left text-sm font-semibold text-center">ลบ</th>
                  </tr>
                </thead>
              }
              colSpan={6}
              renderItem={(item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50 cursor-pointer">
                  <td className="p-3 text-center">{index + 1}</td>
                  <td className="p-3">{item.title}</td>
                  <td className="p-3 text-center" data-testid="report-date">{new Date(item.created_at).toLocaleDateString("th-TH")}</td>
                  <td className="p-3 text-center" data-testid="status">{getStatusInThai(item.status)}</td>
                  <td className="p-3 text-center">
                    <button className="text-blue-600 underline" onClick={() => handleViewDetails(item)} title="ดูรายละเอียด">
                      ดูรายละเอียด
                    </button>
                    {/* <button
                    onClick={() => handleViewDetails(item)}// เปิด Modal สำหรับดูรายละเอียด
                    className="text-blue-500 hover:text-blue-700"
                    title="ดูรายละเอียด"
                  >
                    <FaInfoCircle />
                  </button> */}
                    {/* <button className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-lg" onClick={() => handleViewDetails(item)} title="ดูรายละเอียด">
                    <FaInfoCircle className="" />
                  </button> */}
                  </td>
                  <td className="p-3 flex gap-2 justify-center">
                    {/* <button className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-lg" onClick={() => handleViewDetails(item)} title="ดูรายละเอียด">
                    <FaInfoCircle className="" />
                  </button> */}
                    {/* <button className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-lg" onClick={() => handleViewDetails(item)} title="บันทึก">
                      <FaSave className="" />
                    </button> */}
                    <button className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-lg" onClick={() => handleDeleteReport(item.id)} title="ลบ">
                      <FaTrash />
                    </button>
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
              {/* <button
                className="bg-red-500 hover:bg-red-600 text-white rounded-md p-1 transition-colors"
                onClick={handleCloseModal}>
                <FaXmark size={25} />
              </button> */}
            </div>
            <div className="flex flex-col gap-2">
              <p data-testid="report-tracking-id"><span className="font-semibold">หมายเลข:</span>{selectedReport.tracking_id}</p>
              <p data-testid="report-title"><span className="font-semibold">ชื่อเรื่อง:</span>{selectedReport.title}</p>
              <p data-testid="report-details"><span className="font-semibold">รายละเอียด:</span> {selectedReport.details}</p>
              <p data-testid="report-created-at"><span className="font-semibold">วันที่แจ้ง:</span> {new Date(selectedReport.created_at).toLocaleDateString("th-TH")}</p>
              <p data-testid="report-status"><span className="font-semibold">สถานะ:</span> {getStatusInThai(selectedReport.status)}</p>
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
                <div className="pt-3">
                  <label className="block font-semibold mb-2">เปลี่ยนสถานะ:</label>
                  <select
                  data-testid="status-select"
                    className="border p-3 rounded-lg w-full bg-gray-100 focus:ring-2 focus:ring-green-500"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="pending">รับคำร้องแล้ว</option>
                    <option value="in_progress">กำลังดำเนินการ</option>
                    <option value="resolved">ดำเนินการเสร็จสิ้น</option>
                  </select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-6">
              <button
              data-testid="save-status-button"
                className={`p-2 rounded-lg text-white 
                ${selectedReport?.status === newStatus
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'
                  }`}
                onClick={handleUpdateStatus}
                disabled={!selectedReport || selectedReport.status === newStatus}
              >
                บันทึก
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg" onClick={handleCloseModal}>
                ปิด
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ReportAdmin;
