import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import jwt_decode from "jwt-decode";
import axios from 'axios';

const HomeAdmin = () => {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [reports, setReports] = useState([]); // รายงานของผู้ใช้
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState(null); // เก็บ userID จาก JWT

  // ดึงข้อมูลจาก localStorage และถอดรหัส JWT
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
      setFirstName(decodedToken.first_name); // ใช้ first_name จาก decodedToken
      setLastName(decodedToken.last_name); // ใช้ last_name จาก decodedToken
    } catch (error) {
      // console.error("JWT Decode Error:", error);
      setError("ไม่สามารถถอดรหัส JWT ได้");
      setLoading(false);
    }
  }, []);

  // ดึงรายงานจาก API
  useEffect(() => {
    const fetchReportByID = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/reports', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data) {
          setReports(response.data);  // ถ้ามีรายงาน
        } else {
          setReports([]);  // ถ้าไม่มีรายงาน
        }
      } catch (err) {
        if (err.response && err.response.data) {
          setError(err.response.data.message || "ไม่สามารถโหลดข้อมูลได้");  // แสดงข้อความที่ได้จาก API
        } else {
          setError("ไม่สามารถโหลดข้อมูลได้");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReportByID();
  }, []); // จะถูกเรียกแค่ครั้งเดียวตอน component mount

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* ทักทายผู้ใช้ */}
      <div className="bg-gray-100 p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-gray-800">สวัสดี, {first_name + " " + last_name} 👋</h1>
        <p className="text-gray-600">การจัดการระบบทั้งหมดสามารถทำได้ที่นี่</p>
      </div>

      {/* การ์ดสถิติการจัดการ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-blue-500 text-white rounded-xl shadow flex flex-col justify-center text-center p-6">
          <h2 className="text-3xl font-bold">{reports.length}</h2>
          <p className="text-lg">รายงานทั้งหมด</p>
        </div>
        <div className="bg-yellow-500 text-white py-6 rounded-xl shadow flex flex-col justify-center text-center p-6">
          <h2 className="text-3xl font-bold">{reports.filter(report => report.status === 'pending').length}</h2>
          <p className="text-lg">รายงานที่รอการตรวจสอบ</p>
        </div>
        <div className="bg-orange-500 text-white py-6 rounded-xl shadow flex flex-col justify-center text-center p-6">
          <h2 className="text-3xl font-bold">{reports.filter(report => report.status === 'in_progress').length}</h2>
          <p className="text-lg">รายงานที่กำลังดำเนินการ</p>
        </div>
        <div className="bg-green-500 text-white py-6 rounded-xl shadow flex flex-col justify-center text-center p-6">
          <h2 className="text-3xl font-bold">{reports.filter(report => report.status === 'resolved').length}</h2>
          <p className="text-lg">รายงานที่ได้รับการแก้ไขแล้ว</p>
        </div>
      </div>

      {/* เมนูสำหรับการจัดการ */}
      {/* <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/dashboard_admin/report" className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-lg font-medium shadow text-center">
          จัดการเรื่องร้องเรียน
        </Link>
        <Link to="/admin/reports" className="flex-1 bg-green-600 text-white py-3 rounded-lg text-lg font-medium shadow text-center">
          จัดการรายงาน
        </Link>
      </div> */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-lg font-medium shadow">
          <Link to="/dashboard_admin/report">จัดการเรื่องร้องเรียน</Link>
        </button>
        <button className="flex-1 bg-gray-700 text-white py-3 rounded-lg text-lg font-medium shadow">
          <Link to="/dashboard/status">ติดตามสถานะ</Link>
        </button>
      </div>
    </div>
  );
};

export default HomeAdmin;
