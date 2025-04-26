import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import jwt_decode from "jwt-decode";

const Home = () => {
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [reports, setReports] = useState([]); // รายงานของผู้ใช้
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userID, setUserID] = useState(null); // เก็บ userID จาก JWT

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
            // console.log(last_name)
        } catch (error) {
            // console.error("JWT Decode Error:", error);
            setError("ไม่สามารถถอดรหัส JWT ได้");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userID) {
            const fetchReportByID = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://localhost:5000/reports/user/${userID}`, {
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
        }
    }, [userID]);

    const total = reports.length || 0; // แสดง 0 ถ้าไม่มีรายงาน
    const pending = reports.filter((report) => report.status === "pending").length || 0;
    const in_progress = reports.filter((report) => report.status === "in_progress").length || 0;
    const resolved = reports.filter((report) => report.status === "resolved").length || 0;

    if (loading) return <div>กำลังโหลด...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="space-y-6">
            {/* ทักทายผู้ใช้ */}
            <div className="bg-gray-100 p-6 rounded-xl shadow">
                <h1 className="text-2xl font-bold text-gray-800">
                    สวัสดี, {first_name + " " + last_name}! 👋
                </h1>
                <p className="text-gray-600">ติดตามสถานะการแจ้งเรื่องของคุณได้ที่นี่</p>
            </div>

            {/* การ์ดสถิติ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-blue-500 text-white rounded-xl shadow flex flex-col justify-center text-center">
                    <h2 className="text-3xl font-bold">{total}</h2>
                    <p className="text-lg">แจ้งเรื่องทั้งหมด</p>
                </div>
                <div className="bg-yellow-500 text-white py-6 rounded-xl shadow flex flex-col justify-center text-center">
                    <h2 className="text-3xl font-bold">{pending}</h2>
                    <p className="text-lg">รอตรวจสอบ</p>
                </div>
                <div className="bg-orange-500 text-white py-6 rounded-xl shadow flex flex-col justify-center text-center">
                    <h2 className="text-3xl font-bold">{in_progress}</h2>
                    <p className="text-lg">กำลังดำเนินการ</p>
                </div>
                <div className="bg-green-500 text-white py-6 rounded-xl shadow flex flex-col justify-center text-center">
                    <h2 className="text-3xl font-bold">{resolved}</h2>
                    <p className="text-lg">ได้รับการแก้ไขแล้ว</p>
                </div>
            </div>

            {/* ปุ่มเมนูลัด */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-lg font-medium shadow">
                    <Link to="/dashboard/report">แจ้งเรื่องใหม่</Link>
                </button>
                <button className="flex-1 bg-gray-700 text-white py-3 rounded-lg text-lg font-medium shadow">
                    <Link to="/dashboard/status">ติดตามสถานะ</Link>
                </button>
            </div>
        </div>
    );
};

export default Home;
