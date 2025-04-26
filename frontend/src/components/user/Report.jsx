import React, { useState, useEffect } from "react";
import axios from "axios";

const Report = () => {
    const [fileName, setFileName] = useState("ยังไม่ได้เลือกไฟล์");
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        title: "",
        details: "",
        image: null, // เก็บไฟล์
        userId: "" // เพิ่ม userId
    });
    const [toast, setToast] = useState(); // สถานะของ Toast (success / danger)

    // ดึง userId จาก localStorage หรือจาก context หรือจากการล็อกอิน
    useEffect(() => {
        // สมมุติว่าเก็บ userId ใน localStorage หลังจากล็อกอิน
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setFormData(prevState => ({
                ...prevState,
                userId: storedUserId
            }));
        } else {
            // ถ้าไม่มี userId อาจจะต้องแจ้งให้ผู้ใช้ล็อกอิน
            console.log("กรุณาล็อกอินก่อนส่งเรื่องร้องเรียน");
        }
    }, []);

    const validate = (values) => {
        let errors = {};

        if (!values.title.trim()) {
            errors.title = "กรุณากรอกหัวข้อเรื่องร้องเรียน";
        }

        if (!values.details.trim()) {
            errors.details = "กรุณากรอกรายละเอียด";
        }

        if (!values.image) {
            errors.image = "กรุณาอัปโหลดรูปภาพ";
        } else {
            const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
            if (!allowedTypes.includes(values.image.type)) {
                errors.image = "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น";
            }

            // const maxSize = 2 * 1024 * 1024; // 2MB
            // if (values.image.size > maxSize) {
            //     errors.image = "ขนาดไฟล์ต้องไม่เกิน 2MB";
            // }
        }
        // console.log(errors);
        return errors;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileName(file ? file.name : "ยังไม่ได้เลือกไฟล์");
        setFormData({ ...formData, image: file });
    
        // ลบ error ของไฟล์ภาพ เมื่อผู้ใช้เลือกไฟล์
        if (file) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                image: "" // ลบข้อความข้อผิดพลาดออก
            }));
        }
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;

        // อัปเดตค่าฟอร์ม
        setFormData({ ...formData, [name]: value });

        // ลบ error ของช่องนั้น ๆ ทันทีเมื่อเริ่มพิมพ์
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: value.trim() ? "" : prevErrors[name]
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // ดึง userId จาก localStorage
        const storedUserId = localStorage.getItem("userId");
    
        // ถ้าไม่ได้ล็อกอิน (ไม่มี userId)
        if (!storedUserId) {
            setToast({
                type: 'danger',
                message: 'กรุณาล็อกอินก่อนส่งเรื่องร้องเรียน'
            });

            setTimeout(() => {
                window.location.assign("/");
            }, 2000);
    
            setTimeout(() => setToast(null), 3000);

            // setTimeout(() => setToast(null), 3000); // ให้ Toast หายหลัง 3 วินาที
            return; // หยุดการทำงานเมื่อไม่มี userId
        }
    
        // ถ้ามี userId ก็จะดำเนินการตามปกติ
        setFormData(prevState => ({
            ...prevState,
            userId: storedUserId
        }));
    
        // ตรวจสอบ validation
        const validationErrors = validate(formData);
        setErrors(validationErrors);
    
        if (Object.keys(validationErrors).length > 0) {
            return; // หยุดการทำงานหากมีข้อผิดพลาด
        }
    
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title);
        formDataToSend.append("details", formData.details);
        formDataToSend.append("userId", formData.userId); // ส่ง userId ด้วย
    
        // ตรวจสอบว่าได้เลือกไฟล์หรือไม่
        if (formData.image) {
            formDataToSend.append("image", formData.image);
        } else {
            console.log("No image selected");
            return;
        }
    
        // console.log("FormData to send:", formDataToSend);  // ตรวจสอบข้อมูลใน FormData ก่อนส่ง
    
        try {
            const response = await axios.post("http://localhost:5000/reports", formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            // ถ้าการบันทึกสำเร็จ
            setToast({
                type: 'success',
                message: 'ส่งเรื่องร้องเรียนสำเร็จ'
            });
    
            setTimeout(() => {
                window.location.assign("/dashboard/history");
            }, 2000);
    
            setTimeout(() => setToast(null), 3000);
    
        } catch (error) {
            console.log("Error during submission:", error);
            if (error.response) {
                setToast({
                    type: 'danger',
                    message: 'ส่งเรื่องร้องเรียนไม่สำเร็จ'
                });
                setTimeout(() => setToast(null), 3000);
            }
        }
    };
    

    return (
        <div className="pt-2">
            {toast && (
                <div
                    className={`flex items-center w-full p-4 mb-4 text-gray-500 rounded-lg shadow-sm ${toast.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
                        }`}
                    role="alert"
                >
                    <div className="inline-flex items-center justify-center shrink-0 w-7 h-7">
                        <svg
                            className="w-6 h-6"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                d={toast.type === 'success'
                                    ? "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
                                    : "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"
                                }
                            />
                        </svg>
                        <span className="sr-only">{toast.type === 'success' ? 'Success icon' : 'Error icon'}</span>
                    </div>
                    <div className="ms-3 text-sm font-normal">{toast.message}</div>
                </div>
            )}
            <h2 className="text-[1.5rem] font-semibold pb-8">แจ้งเรื่องร้องเรียน</h2>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                {/* หัวข้อเรื่องร้องเรียน */}
                <div>
                    <label htmlFor="title" className="block text-lg mb-3">หัวข้อเรื่องร้องเรียน <span className="text-red-400">*</span></label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-400 focus:border-green-400 outline-none"
                        placeholder="เช่น น้ำประปาไม่ไหล"
                        onChange={handleChange}
                    />
                    {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                </div>

                {/* รายละเอียดปัญหา */}
                <div>
                    <label htmlFor="details" className="block text-lg mb-3">รายละเอียด <span className="text-red-400">*</span></label>
                    <textarea
                        className="w-full px-4 py-3 h-32 rounded-lg border border-gray-400 focus:border-green-400 outline-none resize-none"
                        placeholder="ระบุรายละเอียดของปัญหา เช่น วันที่เกิดปัญหา, สถานที่, ผลกระทบที่เกิดขึ้น"
                        name="details"
                        id="details"
                        onChange={handleChange}
                    />
                    {errors.details && <p className="text-red-500 text-sm">{errors.details}</p>}
                </div>

                {/* อัปโหลดรูปภาพ */}
                <div className="w-full pb-3">
                    <label className="block mb-3 text-lg" htmlFor="image">
                        อัปโหลดรูปภาพ <span className="text-red-400">*</span>
                    </label>
                    <div className="relative w-full border border-gray-400 flex items-center rounded-lg bg-gray-50 overflow-hidden">
                        <label
                            htmlFor="image"
                            className="h-full px-4 py-3 bg-gray-900 text-white cursor-pointer hover:bg-gray-700"
                        >
                            เลือกไฟล์
                        </label>
                        <span className="h-full flex-1 text-sm text-gray-500 px-3 truncate">
                            {fileName}
                        </span>
                    </div>
                    <input
                        name="image"
                        type="file"
                        id="image"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                </div>

                {/* ปุ่มส่ง */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white hover:bg-blue-500 py-3 rounded-md transition-all"
                >
                    ส่งเรื่องร้องเรียน
                </button>
            </form>
        </div>
    );
};

export default Report;
