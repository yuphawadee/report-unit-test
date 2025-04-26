import React, { useEffect } from "react";
import { useHistory } from "react-router-dom"; // หรือใช้ next/router สำหรับ Next.js

function AutoLogout() {
    const history = useHistory(); // หรือใช้ useRouter() ถ้าเป็น Next.js

    useEffect(() => {
        let timeout;
        
        // ฟังก์ชันทำการ logout อัตโนมัติ
        const autoLogout = () => {
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            sessionStorage.removeItem("role");
            sessionStorage.removeItem("userId");
            alert("คุณถูกล็อกเอาท์อัตโนมัติเนื่องจากไม่มีการใช้งาน");
            history.push("/login"); // เปลี่ยนเส้นทางไปหน้า login
        };

        // ฟังก์ชันสำหรับรีเซ็ตเวลา timeout เมื่อมีการทำกิจกรรมจากผู้ใช้
        const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(autoLogout, 15 * 60 * 1000); // ตั้งเวลา timeout เป็น 15 นาที
        };

        // ติดตั้ง event listeners สำหรับการคลิก, พิมพ์, เคลื่อนที่เมาส์, หรือ scroll
        window.addEventListener("click", resetTimeout);
        window.addEventListener("keydown", resetTimeout);
        window.addEventListener("mousemove", resetTimeout);
        window.addEventListener("scroll", resetTimeout);

        // ตั้งค่า timeout ครั้งแรก
        timeout = setTimeout(autoLogout, 15 * 60 * 1000); // ตั้งเวลา timeout เป็น 15 นาที

        // ล้าง event listeners เมื่อคอมโพเนนต์ถูกทำลาย
        return () => {
            clearTimeout(timeout);
            window.removeEventListener("click", resetTimeout);
            window.removeEventListener("keydown", resetTimeout);
            window.removeEventListener("mousemove", resetTimeout);
            window.removeEventListener("scroll", resetTimeout);
        };
    }, [history]); // ใช้ history ถ้าใช้ React Router

    return null; // คอมโพเนนต์นี้ไม่ต้องแสดงอะไร
}

export default AutoLogout;
