import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";


function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const validate = (values) => {
        let errors = {};
        if (!values.email.trim()) {
            errors.email = "กรุณากรอกอีเมล";
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
        }
        if (!values.password) {
            errors.password = "กรุณากรอกรหัสผ่าน";
        } 
        // else if (values.password.length < 6) {
        //     errors.password = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
        // }
        return errors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return; // หยุดการทำงานหากมีข้อผิดพลาด
        }

        try {
            const response = await axios.post("http://localhost:5000/login", {
                email: formData.email,
                password: formData.password,
            });
            // console.log(response.data);

            // ตรวจสอบการตอบกลับจาก API และเก็บข้อมูลที่จำเป็น
            const { token, role, userId, first_name, last_name } = response.data;

            // เก็บ JWT และข้อมูลที่เกี่ยวข้องใน localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            localStorage.setItem("firstname", first_name);
            localStorage.setItem("lastname", last_name);
            localStorage.setItem("role", role);
            // ตรวจสอบ role และนำไปที่หน้า dashboard ที่เหมาะสม
            if (role === "admin") {
                location.assign("/dashboard_admin"); // ไปหน้า admin
            } else {
                location.assign("/dashboard"); // ไปหน้า user
            }
        } catch (error) {
            // แสดงข้อความ error ที่ได้รับจาก API
            const message = error.response?.data?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
            setErrors({ ...errors, password: message });  // เก็บข้อความผิดพลาด
        }
    };


    return (
        <div className="h-screen flex items-center justify-center gap-8 p-8 bg-blur">
            <div className="w-full min-h-screen bg-[rgb(17,17,17,0.25)] backdrop-blur-xl absolute inset-0 z-0"></div>
            <div className="w-[500px] px-12 py-10 bg-white flex flex-col justify-center rounded-xl z-40">
                <h2 className="text-[2.2rem] font-semibold">เข้าสู่ระบบ</h2>
                <p className="text-[#313131]">เข้าสู่ระบบเพื่อใช้งานบัญชีของคุณ</p>

                <form className="flex flex-col gap-4 py-5" onSubmit={handleLogin} noValidate>
                    <div className="flex gap-4">
                        <div className="w-full flex flex-col gap-2">
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
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-full flex flex-col gap-2">
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
                                    data-testid="password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2/3 transform -translate-y-1/2"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white py-3 my-5 rounded"
                    >
                        เข้าสู่ระบบ
                    </button>

                    <div className="flex cursor-pointer text-sm font-medium text-center justify-center">
                        <p>ยังไม่มีบัญชีใช่ไหม?</p>
                        <a href="/register" className="text-red-600 hover:text-red-500 font-semibold">สมัครสมาชิก</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
