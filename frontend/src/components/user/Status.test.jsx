import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, fireEvent, waitFor, screen, getByRole } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import axios from "axios"
import Status from "./Status";

vi.mock("axios")

describe("test status component", () => {
    beforeAll(() => {
        global.window.alert = vi.fn()
        // global.localStorage.setItem("userId", "12345")
    });

    it("renders the form", () => {
        const { getByPlaceholderText, getByRole } = render(<Status />)
        expect(getByPlaceholderText(/กรอกหมายเลขติดตาม/i)).toBeInTheDocument()

        expect(getByRole('button', { name: /ค้นหา/i })).toBeInTheDocument();
    })

    it("shows validation errors when no tracking number is provided", () => {
        const { getByText } = render(<Status />);

        // กดปุ่มค้นหาโดยที่ยังไม่ได้กรอกข้อมูล
        fireEvent.click(screen.getByRole("button", { name: /ค้นหา/i }));

        // เช็คว่าข้อความแจ้งเตือนของแต่ละช่องแสดงขึ้นมาหรือไม่
        expect(getByText(/กรุณากรอกหมายเลขติดตาม/i)).toBeInTheDocument();
    });

    it("should show error if tracking number from API does not match input", async () => {
        // mock ค่าจาก API ที่ tracking_id ไม่ตรงกับที่กรอก
        axios.get.mockResolvedValue({
            data: {
                tracking_id: "RPT-00000000-9999", // <-- ไม่ตรงกับ input
                title: "ทดสอบ",
                status: "in_progress",
                status_timeline: [
                    { status: "pending", changed_at: "2025-04-03T14:52:58.000Z" },
                    { status: "in_progress", changed_at: "2025-04-04T15:11:22.000Z" },
                ],
            },
        });

        render(<Status />);

        // กรอก tracking number ที่เราจะเทียบกับ mock (ควรไม่ตรง)
        const input = screen.getByPlaceholderText(/กรอกหมายเลขติดตาม/i);
        const button = screen.getByRole('button', { name: /ค้นหา/i });

        await userEvent.type(input, 'RPT-25978792-3495');
        await userEvent.click(button);

        // รอให้ error ปรากฏ
        expect(await screen.findByText(/ไม่พบหมายเลขติดตาม/i)).toBeInTheDocument();

        // ตรวจสอบว่า status container ไม่ถูกแสดง
        expect(screen.queryByTestId("status-container")).not.toBeInTheDocument();
    });

    it("should clear error message when user starts typing again", async () => {
        render(<Status />);

        const input = screen.getByPlaceholderText(/กรอกหมายเลขติดตาม/i);
        const button = screen.getByRole('button', { name: /ค้นหา/i });

        // กดค้นหาแบบยังไม่กรอก
        await userEvent.click(button);
        expect(await screen.findByText(/กรุณากรอกหมายเลขติดตาม/i)).toBeInTheDocument();

        // เริ่มพิมพ์ใหม่
        await userEvent.type(input, "RPT-XXXX");

        // error ควรถูกล้างออก
        expect(screen.queryByText(/กรุณากรอกหมายเลขติดตาม/i)).not.toBeInTheDocument();
    });


    it("should display status information when tracking number is found", async () => {
        // Mock response from axios
        axios.get.mockResolvedValue({
            data: {
                tracking_id: "RPT-25978792-3495",
                title: "ทดสอบ",
                status: "in_progress",
                status_timeline: [
                    { status: "pending", changed_at: "2025-04-03T14:52:58.000Z" },
                    { status: "in_progress", changed_at: "2025-04-04T15:11:22.000Z" },
                    { status: "resolved", changed_at: "2025-04-04T15:19:33.000Z" }
                ]
            }
        });

        render(<Status />);

        // Simulate user input and click on search
        const input = screen.getByPlaceholderText(/กรอกหมายเลขติดตาม/i);
        const button = screen.getByRole('button', { name: /ค้นหา/i });
        await userEvent.type(input, 'RPT-25978792-3495');
        await userEvent.click(button);

        // Wait for the status information to be displayed
        await waitFor(() => {
            expect(screen.getByTestId("status-container")).toBeInTheDocument();
            expect(screen.getByTestId("tracking-id")).toHaveTextContent("RPT-25978792-3495");
            expect(screen.getByTestId("complaint-title")).toHaveTextContent("ทดสอบ");
            expect(screen.getByTestId("current-status")).toHaveTextContent("กำลังดำเนินการ");
        });

        // Check if timeline steps are displayed
        expect(screen.getByTestId("status-step-pending")).toBeInTheDocument();
        expect(screen.getByTestId("status-step-in_progress")).toBeInTheDocument();
        expect(screen.getByTestId("status-step-resolved")).toBeInTheDocument();
    });



});