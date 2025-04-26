import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
// import { useNavigate } from "react-router-dom";

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // const navigate = useNavigate();

    // เก็บค่าฟอร์ม
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    // เก็บข้อผิดพลาดของฟอร์ม
    const [errors, setErrors] = useState({});

    // ฟังก์ชันตรวจสอบค่าฟอร์ม
    const validate = (values) => {
        let errors = {};

        if (!values.first_name.trim()) {
            errors.first_name = "กรุณากรอกชื่อจริง";
        }
        if (!values.last_name.trim()) {
            errors.last_name = "กรุณากรอกนามสกุล";
        }
        if (!values.email.trim()) {
            errors.email = "กรุณากรอกอีเมล";
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
        }
        if (!values.phone.trim()) {
            errors.phone = "กรุณากรอกเบอร์โทร";
        } else if (!/^\d{10}$/.test(values.phone)) {
            errors.phone = "เบอร์โทรต้องเป็นตัวเลข 10 หลัก";
        }
        if (!values.password) {
            errors.password = "กรุณากรอกรหัสผ่าน";
        } else if (values.password.length < 6) {
            errors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัว";
        }
        if (!values.confirmPassword) {
            errors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
        } else if (values.password !== values.confirmPassword) {
            errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
        }

        return errors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return; // หยุดการทำงานหากมีข้อผิดพลาด
        }

        try {
            const response = await axios.post("http://localhost:5000/signup", {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });

            // console.log("Signup Success:", response.data);
            alert("สมัครสมาชิกสำเร็จ!");
            window.location.assign("/");          
        } catch (error) {
            // console.log("Signup Failed:", error);
            alert("สมัครสมาชิกไม่สำเร็จ!");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center gap-8 p-8 bg-blur">
            <div className="w-full min-h-screen bg-[rgb(17,17,17,0.25)] backdrop-blur-xl absolute inset-0 z-0"></div>
            <div className="w-[500px] px-12 py-10 bg-white flex flex-col justify-center rounded-xl z-40">
                <h2 className="text-[2.2rem] font-semibold">สมัครสมาชิก</h2>
                <p className="text-[#313131]">สมัครสมาชิกเพื่อเริ่มต้นใช้งานบัญชีของคุณ</p>

                <form className="flex flex-col gap-4 py-5" onSubmit={handleSubmit} noValidate>
                    <div className="flex gap-4">
                        <div className="w-1/2 flex flex-col gap-2">
                            <label htmlFor="first_name">ชื่อจริง</label>
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                placeholder="ชื่อจริง"
                                className="rounded w-full border-[#C9C9C9]"
                                onChange={handleChange}
                            />
                            {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
                        </div>
                        <div className="w-1/2 flex flex-col gap-2">
                            <label htmlFor="last_name">นามสกุล</label>
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                placeholder="นามสกุล"
                                className="rounded w-full border-[#C9C9C9]"
                                onChange={handleChange}
                            />
                            {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2 flex flex-col gap-2">
                            <label htmlFor="email">อีเมล</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="อีเมล"
                                className="rounded w-full border-[#C9C9C9]"
                                onChange={handleChange}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                        <div className="w-1/2 flex flex-col gap-2">
                            <label htmlFor="phone">เบอร์โทร</label>
                            <input
                                id="phone"
                                name="phone"
                                type="number"
                                placeholder="เบอร์โทร"
                                className="rounded w-full border-[#C9C9C9]"
                                onChange={handleChange}
                            />
                            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2 flex flex-col gap-2">
                            <label htmlFor="password">รหัสผ่าน</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="รหัสผ่าน"
                                    className="rounded w-full border-[#C9C9C9]"
                                    onChange={handleChange}
                                    data-testid="password-input"
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

                        <div className="w-1/2 flex flex-col gap-2">
                            <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="ยืนยันรหัสผ่าน"
                                    className="rounded w-full border-[#C9C9C9]"
                                    onChange={handleChange}
                                    data-testid="confirm-password-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-2/3 transform -translate-y-1/2"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                        </div>
                    </div>

                    <button type="submit" data-testid="submit" className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white py-3 my-5 rounded">สมัครสมาชิก</button>
                    <div className="flex cursor-pointer text-sm font-medium text-center justify-center">
                        <p>มีบัญชีแล้วใช่ไหม?</p>
                        <a href="/" className="text-red-600 hover:text-red-500 font-semibold">เข้าสู่ระบบ</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
