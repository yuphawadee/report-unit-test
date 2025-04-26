import { useState } from "react";
import axios from "axios";

const Status = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const validate = (values) => {
    let errors = {};
    if (!values.trackingNumber) {
      errors.trackingNumber = "กรุณากรอกหมายเลขติดตาม";
    }
    return errors;
  };

  const handleSearch = async () => {
    const validationErrors = validate({ trackingNumber });

    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors.trackingNumber); 
      return;
    } 

    try {
      const response = await axios.get(`http://localhost:5000/reports/tracking/${trackingNumber.trim()}`);

      if (response.data && response.data.tracking_id === trackingNumber.trim()) {
        setStatus(response.data);
        setError("");
      } else {
        setError("ไม่พบหมายเลขติดตาม");
        setStatus(null);
      }
    } catch (error) {
      setError("ไม่พบหมายเลขติดตาม");
      setStatus(null);
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold text-center mb-6">ติดตามสถานะคำร้อง</h2>

      {/* ช่องค้นหา */}
      <div className="flex mb-6">
        <input
          type="text"
          className="p-3 flex-1 rounded-l-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="กรอกหมายเลขติดตาม"
          value={trackingNumber}
          onChange={(e) => {
            setTrackingNumber(e.target.value);
            setError(""); 
          }}
          onKeyDown={handleKeyDown}
        />
        <button className="bg-blue-500 text-white px-6 py-3 rounded-r-lg shadow-md hover:bg-blue-600 transition-colors" onClick={handleSearch}>
          ค้นหา
        </button>
      </div>

      {/* แสดงข้อความ error ถ้ามีจากการ validate */}
      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

      {/* แสดงข้อมูลสถานะ */}
      {status && (
       <div className="border border-gray-200 bg-white p-6 shadow-lg rounded-lg transition-all duration-300 ease-in-out" data-testid="status-container">
       <h3 className="text-lg font-semibold text-gray-800 mb-2" data-testid="tracking-id">
         หมายเลขติดตาม: <span className="text-blue-600">#{status.tracking_id}</span>
       </h3>
       <p className="mb-2" data-testid="complaint-title"><span className="font-semibold text-gray-800 ">ชื่อเรื่องที่ร้องเรียน:</span> {status.title}</p>
       <p className="mb-4" data-testid="current-status"><span className="font-semibold text-gray-800">สถานะปัจจุบัน:</span> {getStatusInThai(status.status)}</p>
     
       {/* Timeline */}
       <ul className="mt-4" data-testid="status-timeline">
         <p className="font-semibold text-gray-800 mb-2">ขั้นตอนปัจจุบัน:</p>
         {["pending", "in_progress", "resolved"].map((step, index) => {
           const currentIndex = status.status_timeline.findIndex(e => e.status === status.status);
           const stepIndex = index;
     
           // เช็คว่าสถานะนี้เกิดขึ้นแล้วหรือยัง
           const isCompleted = stepIndex < currentIndex;
           const isCurrent = stepIndex === currentIndex;
     
           return (
             <li key={index} className={`py-2 flex items-center ${isCompleted || isCurrent ? "text-blue-600" : "text-gray-400"} hover:text-blue-600 transition-colors`} data-testid={`status-step-${step}`}>
               <span className="mr-2">
                 {isCompleted || isCurrent ? "✅" : "⏳"}
               </span>
               {step === "pending" && "รับคำร้องแล้ว"}
               {step === "in_progress" && "กำลังดำเนินการ"}
               {step === "resolved" && "ดำเนินการเสร็จสิ้น"}
     
               {/* แสดงวันที่ ถ้ามีข้อมูลของสถานะนี้ */}
               {status.status_timeline.find(e => e.status === step) && (
                 <span className="ml-2 text-sm text-gray-500">
                   ({new Date(status.status_timeline.find(e => e.status === step).changed_at).toLocaleString("th-TH")})
                 </span>
               )}
             </li>
           );
         })}
       </ul>
     </div>
     
      )}
    </div>
  );
};

export default Status;
