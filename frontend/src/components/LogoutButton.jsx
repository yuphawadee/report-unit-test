import React from "react";
import { useNavigate } from "react-router-dom"; // ใช้ useNavigate แทน useHistory

function LogoutButton() {
    const navigate = useNavigate(); // ใช้ useNavigate แทน useHistory

    const handleLogout = () => {
        // ลบข้อมูลจาก localStorage และ sessionStorage
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("userId");

        // เปลี่ยนเส้นทางไปที่หน้า login
        // alert("คุณได้ออกจากระบบแล้ว");
        navigate("/login"); // ใช้ navigate แทน history.push
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full px-5 py-3 rounded-lg lg:text-lg font-medium transition-all duration-300 ease-in-out text-gray-300 hover:bg-red-700 hover:text-white text-left"
        >
            ออกจากระบบ
        </button>
    );
}

export default LogoutButton;
