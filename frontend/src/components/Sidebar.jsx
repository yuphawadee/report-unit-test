import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi"; // ไอคอนเมนู
import LogoutButton from "./LogoutButton";

const Sidebar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const [role, setRole] = useState(null);
    const [first_name, setFirstName] = useState();
    const [last_name, setLastName] = useState()
    // const role = localStorage.getItem('role');
    // console.log("Role from localStorage:", role);

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
        // console.log("role",storedRole)
        const firstname = localStorage.getItem('first_name'); // ดึง first_name จาก localStorage
        setFirstName(firstname); // ตั้งค่า first_name ใน state
        // console.log(firstname)
        const lastname = localStorage.getItem('last_name'); // ดึง first_name จาก localStorage
        setLastName(lastname); // ตั้งค่า first_name ใน state
        // console.log(lastname)
    }, []);



    const menuMember = [
        { title: "หน้าหลัก", href: "/dashboard" },
        { title: "แจ้งปัญหา", href: "/dashboard/report" },
        { title: "ติดตามสถานะ", href: "/dashboard/status" },
        { title: "ประวัติการแจ้งปัญหา", href: "/dashboard/history" },
    ];

    const menuAdmin = [
        { title: "หน้าหลัก", href: "/dashboard_admin" },
        { title: "เรื่องร้องเรียน", href: "/dashboard_admin/report" },
        { title: "ประวัติเรื่องร้องเรียน", href: "/dashboard_admin/history" },
        { title: "ติดตามสถานะ", href: "/dashboard_admin/status" },
        // { title: "รายงาน & สถิติ", href: "/dashboard_admin/reports" },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="text-white relative">
            {/* ชื่อระบบ */}
            <h1 className="text-[1.5rem] text-center">ระบบแจ้งเรื่องร้องเรียน</h1>

            {/* Hamburger Menu Button */}
            <button
                className="lg:hidden p-2 absolute top-0 text-white focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <HiX size={30} /> : <HiMenu size={30} />}
            </button>

            {/* Sidebar (ใช้ ref) */}
            <div
                ref={menuRef}
                className={`lg:block absolute lg:relative bg-[#212529] lg:bg-transparent lg:top-5 top-10 left-0 w-64 lg:w-auto rounded-lg lg:rounded-none shadow-lg lg:shadow-none transition-all duration-500 ease-in-out z-40
                    ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 lg:pointer-events-auto pointer-events-none lg:opacity-100 lg:translate-x-0"}`}
            >
                {(role === "admin" ? menuAdmin : menuMember).map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.title}
                            to={item.href}
                            className={`flex items-center gap-x-2 px-5 py-3 rounded-lg lg:text-lg font-medium transition-all duration-300 ease-in-out 
                                ${isActive
                                    ? "bg-gray-700 text-white border-l-4 border-green-400 shadow-md"
                                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                } mb-1`}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.title}
                        </Link>
                    );
                })}
                <LogoutButton />
            </div>
        </div>
    );
};

export default Sidebar;
