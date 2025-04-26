import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import Login from "./Login";

vi.mock("axios");

describe("test Login component", () => {
    beforeAll(() => {
        global.window.alert = vi.fn();
        delete window.location;
        window.location = { assign: vi.fn() }; // ✅ ใช้ vi.fn() แทน jest.fn()
    });

    it("renders the form", () => {
        render(<Login />);
        expect(screen.getByLabelText(/อีเมล/i)).toBeInTheDocument();
        expect(screen.getByTestId("password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /เข้าสู่ระบบ/i })).toBeInTheDocument();
    });

    it("shows validation errors", () => {
        render(<Login />);
        fireEvent.click(screen.getByRole("button", { name: /เข้าสู่ระบบ/i }));
        expect(screen.getByText(/กรุณากรอกอีเมล/i)).toBeInTheDocument();
        expect(screen.getByText(/กรุณากรอกรหัสผ่าน/i)).toBeInTheDocument();
    });

    it("submits form successfully for admin", async () => {
        render(<Login />);

        const mockResponse = {
            data: {
                role: "admin", // ✅ เพิ่ม role
                userId: 1,    // ✅ เพิ่ม userId
                email: "johndoe@gmail.com",
            },
        };

        axios.post.mockResolvedValue(mockResponse);

        fireEvent.change(screen.getByLabelText(/อีเมล/i), {
            target: { value: "johndoe@gmail.com" },
        });
        fireEvent.change(screen.getByTestId("password"), {
            target: { value: "123456" },
        });
        fireEvent.click(screen.getByRole("button", { name: /เข้าสู่ระบบ/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("http://localhost:5000/login", {
                email: "johndoe@gmail.com",
                password: "123456",
            });

            expect(window.location.assign).toHaveBeenCalledWith("/dashboard_admin"); // ✅ ตรวจสอบการเปลี่ยนหน้า
        });
    });

    it("submits form successfully for member", async () => {
        render(<Login />);

        const mockResponse = {
            data: {
                role: "member", // ✅ เพิ่ม role
                userId: 1,    // ✅ เพิ่ม userId
                email: "johndoe@gmail.com",
            },
        };

        axios.post.mockResolvedValue(mockResponse);

        fireEvent.change(screen.getByLabelText(/อีเมล/i), {
            target: { value: "johndoe@gmail.com" },
        });
        fireEvent.change(screen.getByTestId("password"), {
            target: { value: "123456" },
        });
        fireEvent.click(screen.getByRole("button", { name: /เข้าสู่ระบบ/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("http://localhost:5000/login", {
                email: "johndoe@gmail.com",
                password: "123456",
            });

            expect(window.location.assign).toHaveBeenCalledWith("/dashboard"); // ✅ ตรวจสอบการเปลี่ยนหน้า
        });
    });

    it("shows error on unsuccessful login", async () => {
        render(<Login />);

        // mock response เมื่อ login ไม่สำเร็จ
        const mockResponse = {
            response: {
                data: {
                    message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
                },
            },
        };

        axios.post.mockRejectedValue(mockResponse); // mock ให้การเรียก axios ล้มเหลว

        fireEvent.change(screen.getByLabelText(/อีเมล/i), {
            target: { value: "wrongemail@gmail.com" },
        });
        fireEvent.change(screen.getByTestId("password"), {
            target: { value: "wrongpassword" },
        });
        fireEvent.click(screen.getByRole("button", { name: /เข้าสู่ระบบ/i }));

        await waitFor(() => {
            // ตรวจสอบว่าเมื่อ login ล้มเหลวจะมีข้อความผิดพลาดแสดงขึ้น
            expect(screen.getByText(/อีเมลหรือรหัสผ่านไม่ถูกต้อง/)).toBeInTheDocument();
        });
    });

});
