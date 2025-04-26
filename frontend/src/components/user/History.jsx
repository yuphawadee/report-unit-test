import { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { FaXmark } from "react-icons/fa6";
import { CiZoomIn } from "react-icons/ci";
import Pagination from "../Pagination"; // นำเข้า Pagination
import FilterBar from "../FilterBar";

const History = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // จำนวนรายการต่อหน้า
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userID, setUserID] = useState(null);
  const dialogRef = useRef(null);
  const [showImageDialog, setShowImageDialog] = useState(false);

  // ✅ ตรวจสอบ JWT และดึง userID
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("ไม่พบ JWT ใน localStorage");
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwt_decode(token);
      setUserID(decodedToken.userId);
    } catch (error) {
      setError("ไม่สามารถถอดรหัส JWT ได้");
      setLoading(false);
    }
  }, []);

  // ✅ ดึงข้อมูล report ตาม userID
  useEffect(() => {
    if (userID) {
      const fetchReportByID = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:5000/reports/user/${userID}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });

          if (Array.isArray(response.data) && response.data.length > 0) {
            setHistory(response.data);
          } else {
            setHistory([]); // ถ้าไม่มีรายงาน
          }
        } catch (err) {
          setError("ไม่สามารถโหลดข้อมูลได้");
        } finally {
          setLoading(false);
        }
      };
      fetchReportByID();
    }
  }, [userID]);


  const prevPageRef = useRef(1);
  // ✅ กรองข้อมูลตามการค้นหาและสถานะ
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

    setFilteredHistory(filtered);

    // ✅ ถ้าหน้าปัจจุบันไม่มีข้อมูลแล้ว ให้ย้อนกลับไปหน้าสุดท้ายที่มีข้อมูล
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1); // ถ้าไม่มีข้อมูลเลย ให้กลับไปหน้าแรก
    }
  }, [searchTerm, statusFilter, history, currentPage, itemsPerPage]);

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

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const openDialog = () => {
    setShowImageDialog(true);
  };

  const closeDialog = () => {
    setShowImageDialog(false);
  };

  const statusOptions = [
    { value: "pending", label: "รับคำร้องแล้ว" },
    { value: "in_progress", label: "กำลังดำเนินการ" },
    { value: "resolved", label: "ดำเนินการเสร็จสิ้น" },
  ];

  // ✅ ฟังก์ชันการเปลี่ยนหน้า
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold text-center mb-6">ประวัติการแจ้งปัญหา</h2>

      {loading ? (
        <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : history.length === 0 ? (
        <p className="text-center text-gray-500">ยังไม่มีรายงาน</p>
      ) : (
        <>
          {/* ✅ ฟิลเตอร์ค้นหา */}
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
            {/* ✅ แสดงข้อมูล */}
          <Pagination
            data={filteredHistory} // ส่งข้อมูลที่กรองแล้ว
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
                  <th className="p-3 text-left text-sm font-semibold text-center">ตัวเลือก</th>
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
                  <span className="text-blue-600 underline" onClick={() => handleViewDetails(item)}>
                    ดูรายละเอียด
                  </span>
                </td>
              </tr>
            )}
          />
          </div>
        </>
      )}

      {/* ✅ Modal สำหรับแสดงรายละเอียด */}
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
              <p><strong>หมายเลข:</strong> {selectedReport.tracking_id}</p>
              <p><strong>ชื่อเรื่อง:</strong> {selectedReport.title}</p>
              <p><strong>รายละเอียด:</strong> {selectedReport.details}</p>
              <p><strong>วันที่แจ้ง:</strong> {new Date(selectedReport.created_at).toLocaleDateString("th-TH")}</p>
              <p><strong>สถานะ:</strong> {getStatusInThai(selectedReport.status)}</p>
            </div>
            {selectedReport.image && (
              <div className="pt-2">
                <h4 className="font-semibold">รูปภาพที่แนบมา:</h4>
                <img
                  src={`http://localhost:5000/uploads/${selectedReport.image}`}
                  alt="Report"
                  className="w-full h-72 mt-2 rounded-md object-cover cursor-zoom-in"
                  onClick={openDialog}
                  onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                />
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

export default History;
