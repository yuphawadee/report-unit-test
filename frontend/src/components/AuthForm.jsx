import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    // เก็บค่าฟอร์ม
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: 'member',
    });

//     console.log("Email:", formData.email);
// console.log("Password:", formData.password);

    // อัปเดตค่า input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // const setSession = (role) => {
    //     localStorage.setItem('role', role);
    //     localStorage.setItem('id', id);
    // };

    // ฟังก์ชัน Login
    const handleLogin = async (e) => {
        e.preventDefault();
    
        // ตรวจสอบว่า email และ password ไม่เป็น undefined หรือ null
        if (!formData.email || !formData.password) {
            alert("กรุณากรอกอีเมลและรหัสผ่าน");
            return;
        }
    
        try {
            const response = await axios.post("http://localhost:5000/login", {
                email: formData.email,
                password: formData.password,
            });
    
            const { role, userId } = response.data;
            localStorage.setItem('role', role);
            localStorage.setItem('userId', userId);
    
            alert("เข้าสู่ระบบสำเร็จ!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Login Failed:", error.response?.data);
            alert("เข้าสู่ระบบไม่สำเร็จ!");
        }
    };
    
    // ฟังก์ชัน Signup
    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("รหัสผ่านไม่ตรงกัน!");
            return;
        }
    
        try {
            const response = await axios.post("http://localhost:5000/signup", {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });
    
            console.log("Signup Success:", response.data);
            alert("สมัครสมาชิกสำเร็จ!");
            setIsLogin(true);
        } catch (error) {
            // เพิ่มการตรวจสอบข้อผิดพลาดใน catch block
            console.log("Signup Failed:", error); // ดูรายละเอียดข้อผิดพลาดทั้งหมด
            if (error.response) {
                console.log("Response Status:", error.response.status);   // ดูสถานะของการตอบกลับ
                console.log("Response Data:", error.response.data);         // ดูข้อมูลจากการตอบกลับ
            } else if (error.request) {
                console.log("Request Error:", error.request); // ถ้าไม่สามารถส่ง request ได้
            } else {
                console.log("Error Message:", error.message); // ดูข้อความของข้อผิดพลาด
            }
            alert("สมัครสมาชิกไม่สำเร็จ!");
        }
    };
    

    return (
        <div className="h-screen flex items-center justify-center gap-8 p-8 bg-blur">
            <div className="w-full min-h-screen bg-[rgb(17,17,17,0.25)] backdrop-blur-xl absolute inset-0 z-0"></div>
            <div className="w-[500px] px-12 py-10 bg-white flex flex-col justify-center rounded-xl z-40">
                <h2 className="text-[2.2rem] font-semibold">
                    {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                </h2>
                <p className="text-[#313131]">
                    {isLogin
                        ? "เข้าสู่ระบบเพื่อใช้งานบัญชีของคุณ"
                        : "สมัครสมาชิกเพื่อเริ่มต้นใช้งานบัญชีของคุณ"}
                </p>

                <form className="flex flex-col gap-4 py-5" onSubmit={isLogin ? handleLogin : handleSignup}>
                    {!isLogin && (
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-2 w-1/2">
                                <label htmlFor="first_name">ชื่อจริง</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    placeholder="ชื่อจริง"
                                    required
                                    className="rounded w-full border-[#C9C9C9]"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-1/2">
                                <label htmlFor="last_name">นามสกุล</label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    placeholder="นามสกุล"
                                    required
                                    className="rounded w-full border-[#C9C9C9]"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className={`${isLogin ? "w-full" : "w-1/2"} flex flex-col gap-2`}>
                            <label htmlFor="email">อีเมล</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="อีเมล"
                                required
                                className="rounded w-full border-[#C9C9C9]"
                                onChange={handleChange}
                            />
                        </div>
                        {!isLogin && (
                            <div className="w-1/2 flex flex-col gap-2">
                                <label htmlFor="phone">เบอร์โทร</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    placeholder="เบอร์โทร"
                                    required
                                    className="rounded w-full border-[#C9C9C9]"
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <div className={`${isLogin ? "w-full" : "w-1/2"} flex flex-col gap-2`}>
                            <label htmlFor="password">รหัสผ่าน</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="รหัสผ่าน"
                                    required
                                    className="rounded w-full border-[#C9C9C9]"
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2/3 transform -translate-y-1/2"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="w-1/2 flex flex-col gap-2">
                                <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="ยืนยันรหัสผ่าน"
                                        required
                                        className="rounded w-full border-[#C9C9C9]"
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-2/3 transform -translate-y-1/2"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white py-3 my-5 rounded"
                    >
                        {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                    </button>
                </form>

                <p onClick={() => setIsLogin(!isLogin)} className="cursor-pointer text-sm font-medium text-center">
                    {isLogin ? "ยังไม่มีบัญชีใช่ไหม? " : "มีบัญชีอยู่แล้วใช่ไหม? "}
                    <span className="text-red-600 hover:text-red-500 font-semibold">
                        {isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default AuthForm;
