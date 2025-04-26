import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReportAdmin from "./ReportAdmin";
import axios from "axios";

// 👇 mock jwt-decode และ axios
vi.mock("jwt-decode", () => ({
    default: () => ({ role: "admin" }), // ให้ decode สำเร็จ
}));
vi.mock("axios");

describe("ReportAdmin Component", () => {
    // const mockData = {
    //     id: 1,
    //     tracking_id: "RPT-123",
    //     title: "น้ำประปาไม่ไหล",
    //     details: "รายละเอียด",
    //     created_at: "2025-04-03T14:52:58.000Z",
    //     status: "in_progress",
    //     image: "test.jpg",
    // };

    beforeEach(() => {
        localStorage.setItem("token", "mocked-token");
        // axios.get.mockResolvedValue({ data: [mockData] });
        axios.get.mockResolvedValue({
            data: [
                {
                    id: 1,
                    tracking_id: "RPT-123",
                    title: "น้ำประปาไม่ไหล",
                    details: "รายละเอียด",
                    created_at: "2025-04-03T14:52:58.000Z",
                    status: "pending",
                    image: "test.jpg",
                },
            ],
        });

        axios.put.mockResolvedValue({
            status: 200,
        });
    });

    beforeAll(() => {
        window.alert = vi.fn();
    });

    it("renders loading state", () => {
        axios.get.mockImplementation(() => new Promise(() => { })); // pending promise เพื่อให้ loading ค้าง
        render(<ReportAdmin />);
        expect(screen.getByText("กำลังโหลดข้อมูล...")).toBeInTheDocument();
    });

    it('renders data when fetch is successful', async () => {
        render(<ReportAdmin />);

        await screen.findByText('น้ำประปาไม่ไหล');

        // คาดหวังว่า loading จะหายไป
        expect(screen.queryByText(/กำลังโหลดข้อมูล.../)).not.toBeInTheDocument();

        expect(screen.getByTestId('status')).toHaveTextContent('รับคำร้องแล้ว');
        expect(screen.getByTestId('report-date')).toHaveTextContent('3/4/2568');
        expect(screen.getByTitle('ดูรายละเอียด')).toBeInTheDocument();
        expect(screen.getByTitle('บันทึก')).toBeInTheDocument();
        expect(screen.getByTitle('ลบ')).toBeInTheDocument();
    });

    it('shows error message when fetch fails', async () => {
        axios.get.mockRejectedValue(new Error('Failed to fetch'));

        render(<ReportAdmin />);

        const errorMessage = await screen.findByText(/ไม่สามารถโหลดข้อมูลได้/i);
        expect(errorMessage).toBeInTheDocument();
    });

    it('should open modal and show all report details', async () => {
        render(<ReportAdmin />);

        // รอให้ข้อมูลถูกโหลด
        await screen.findByText('น้ำประปาไม่ไหล');

        // ใช้ getByRole เพื่อหาปุ่มที่มีข้อความ 'ดูรายละเอียด'
        const detailButton = screen.getByRole('button', { name: /ดูรายละเอียด/i });
        fireEvent.click(detailButton);

        // รอให้ modal โหลด
        await screen.findByText(/รายละเอียดการแจ้งปัญหา/i);

        // ตรวจสอบข้อมูลทั้งหมดใน modal
        expect(screen.getByTestId('report-tracking-id')).toHaveTextContent('RPT-123');
        expect(screen.getByTestId('report-title')).toHaveTextContent('น้ำประปาไม่ไหล');
        expect(screen.getByTestId('report-details')).toHaveTextContent('รายละเอียด');
        expect(screen.getByTestId('report-created-at')).toHaveTextContent('3/4/2568');
        expect(screen.getByTestId('report-status')).toHaveTextContent('รับคำร้องแล้ว');

    });

    it('should update status in the table', async () => {
        render(<ReportAdmin />);
      
        await screen.findByText('น้ำประปาไม่ไหล');
      
        // คลิกที่ปุ่ม 'ดูรายละเอียด'
        const detailButton = screen.getByRole('button', { name: /ดูรายละเอียด/i });
        fireEvent.click(detailButton);
      
        // รอให้ modal โหลด
        await screen.findByText(/รายละเอียดการแจ้งปัญหา/i);
      
        // เลือกสถานะใหม่
        const statusSelect = screen.getByTestId('status-select');
        fireEvent.change(statusSelect, { target: { value: 'กำลังดำเนินการ' } });
      
        // คลิกบันทึก
        const saveButton = screen.getByTestId('save-status-button');
        fireEvent.click(saveButton);
      
        // ตรวจสอบว่า status ในตารางถูกอัปเดตเป็น "กำลังดำเนินการ"
        await waitFor(() => {
          const statusEl = screen.getByText('กำลังดำเนินการ');  // ใช้ getByText แทน getByTestId
          expect(statusEl).toBeInTheDocument(); // เช็คว่า status ปรากฏในเอกสารหรือไม่
        });
      });
      
});
