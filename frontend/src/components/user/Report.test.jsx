import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, fireEvent, waitFor, screen, getByRole } from "@testing-library/react"
import axios from "axios"
import Report from "./Report";

vi.mock("axios")

describe("test report component", () => {
    beforeAll(() => {
        global.window.alert = vi.fn()
        global.localStorage.setItem("userId", "12345")
    });

    it("renders the form", () => {
        const { getByLabelText, getByRole } = render(<Report />)
        expect(getByLabelText(/หัวข้อเรื่องร้องเรียน/i)).toBeInTheDocument()
        expect(getByLabelText(/รายละเอียด/i)).toBeInTheDocument()
        expect(getByLabelText(/อัปโหลดรูปภาพ/i)).toBeInTheDocument()

        expect(getByRole('button', { name: /ส่งเรื่องร้องเรียน/i })).toBeInTheDocument();
    })

    it("shows validation errors", () => {
        const { getByText } = render(<Report />);
        
        // กดปุ่มส่งเรื่องร้องเรียนโดยที่ยังไม่ได้กรอกข้อมูล
        fireEvent.click(screen.getByRole("button", { name: /ส่งเรื่องร้องเรียน/i }));
        
        // เช็คว่าข้อความแจ้งเตือนของแต่ละช่องแสดงขึ้นมาหรือไม่
        expect(getByText(/กรุณากรอกหัวข้อเรื่องร้องเรียน/i)).toBeInTheDocument();
        expect(getByText(/กรุณากรอกรายละเอียด/i)).toBeInTheDocument();
        expect(getByText(/กรุณาอัปโหลดรูปภาพ/i)).toBeInTheDocument();
    });

    it("validate file upload", async () => {
        const { getByLabelText, getByText } = render(<Report />);
        
        // สร้าง mock file ขึ้นมา
        const file = new File(["dummy content"], "test-image.png", { type: "image/png" });
    
        // ค้นหา input file แล้วทำการอัปโหลด mock file
        const fileInput = getByLabelText(/อัปโหลดรูปภาพ/i);
        fireEvent.change(fileInput, { target: { files: [file] } });
    
        // กดปุ่มส่ง
        fireEvent.click(screen.getByRole("button", { name: /ส่งเรื่องร้องเรียน/i }));
    
        // เช็คว่าไม่มี error เรื่องไฟล์
        await waitFor(() => {
            expect(getByText(/กรุณากรอกหัวข้อเรื่องร้องเรียน/i)).toBeInTheDocument();
            expect(getByText(/กรุณากรอกรายละเอียด/i)).toBeInTheDocument();
            expect(screen.queryByText(/กรุณาอัปโหลดรูปภาพ/i)).not.toBeInTheDocument(); // เช็คว่าข้อความ error ของไฟล์หายไป
        });
    });

    it("removes validation errors when input is provided", async () => {
        const { getByLabelText, getByRole, queryByText } = render(<Report />);
        
        // กดปุ่มส่งโดยที่ยังไม่ได้กรอกข้อมูล -> ควรมีข้อความแจ้งเตือน
        fireEvent.click(getByRole("button", { name: /ส่งเรื่องร้องเรียน/i }));
        expect(queryByText(/กรุณากรอกหัวข้อเรื่องร้องเรียน/i)).toBeInTheDocument();
        
        // กรอกหัวข้อเรื่องร้องเรียน
        fireEvent.change(getByLabelText(/หัวข้อเรื่องร้องเรียน/i), { target: { value: "เรื่องร้องเรียนทดสอบ" } });
    
        // ตรวจสอบว่าข้อความแจ้งเตือนของช่องนี้หายไป
        await waitFor(() => {
            expect(queryByText(/กรุณากรอกหัวข้อเรื่องร้องเรียน/i)).not.toBeInTheDocument();
        });
    });

    it("shows an error when uploading a non-image file", async () => {
        const { getByLabelText, getByText } = render(<Report />);
        
        // สร้าง mock file ที่เป็น PDF
        const file = new File(["dummy content"], "document.pdf", { type: "application/pdf" });
    
        // ค้นหา input file แล้วทำการอัปโหลด mock file
        const fileInput = getByLabelText(/อัปโหลดรูปภาพ/i);
        fireEvent.change(fileInput, { target: { files: [file] } });
    
        fireEvent.click(screen.getByRole("button", { name: /ส่งเรื่องร้องเรียน/i }));

        // ตรวจสอบว่า error message ถูกแสดง
        await waitFor(() => {
            expect(getByText(/กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น/i)).toBeInTheDocument();
        });
    });
    
    it("submits form successfully", async () => {
        const { getByLabelText, getByRole } = render(<Report />);
        
        // Mock response ของ axios
        const mockResponse = {
          data: {
            id: 1,
            trackingId: "123456",
            title: "test",
            details: "details",
            image: "test-image.png",
            userId: "12345"
          },
        };
        
        axios.post.mockResolvedValue(mockResponse);
    
        // กรอกข้อมูลในฟอร์ม
        fireEvent.change(getByLabelText(/หัวข้อเรื่องร้องเรียน/i), { target: { value: "test" } });
        fireEvent.change(getByLabelText(/รายละเอียด/i), { target: { value: "details" } });
    
        // Mock อัปโหลดรูปภาพ
        const file = new File(["dummy content"], "test-image.png", { type: "image/png" });
        const fileInput = getByLabelText(/อัปโหลดรูปภาพ/i);
        fireEvent.change(fileInput, { target: { files: [file] } });
    
        // กดปุ่มส่ง
        fireEvent.click(getByRole("button", { name: /ส่งเรื่องร้องเรียน/i }));
    
        // ตรวจสอบค่าที่ถูกส่งไปใน FormData
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
    
            // ดึง FormData ที่ถูกส่งไป
            const formData = axios.post.mock.calls[0][1];
    
            expect(formData).toBeInstanceOf(FormData);
            expect(formData.get("title")).toBe("test");
            expect(formData.get("details")).toBe("details");
            expect(formData.get("userId")).toBe("12345");
            
            // ตรวจสอบไฟล์
            const uploadedFile = formData.get("image");
            expect(uploadedFile).toBeInstanceOf(File);
            expect(uploadedFile.name).toBe("test-image.png");
        });
    });
    
});