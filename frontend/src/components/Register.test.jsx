import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, fireEvent, waitFor, screen, getByRole } from "@testing-library/react"
import axios from "axios"
import Register from "./Register";

// Mock axios to avoid real API calls
vi.mock("axios")

describe("test Register component", () => {
    beforeAll(() => {
        // Mock window.alert
        global.window.alert = vi.fn()
    });

    it("renders the form", () => {
        const { getByLabelText, getByTestId, getByRole } = render(<Register />)
        expect(getByLabelText(/ชื่อจริง/i)).toBeInTheDocument()
        expect(getByLabelText(/นามสกุล/i)).toBeInTheDocument()
        expect(getByLabelText(/อีเมล/i)).toBeInTheDocument()
        expect(getByLabelText(/เบอร์โทร/i)).toBeInTheDocument()

        const passwordInput = screen.getByTestId('password-input');
        expect(passwordInput).toBeInTheDocument();

        const confirmPasswordInput = screen.getByTestId('confirm-password-input');
        expect(confirmPasswordInput).toBeInTheDocument();

        // ตรวจสอบปุ่ม "สมัครสมาชิก" โดยใช้ getByRole
        expect(getByRole('button', { name: /สมัครสมาชิก/i })).toBeInTheDocument();
    });

    it("shows validation errors", () => {
        const { getByText } = render(<Register />)

        fireEvent.click(screen.getByRole("button", { name: /สมัครสมาชิก/i }));

        // ตรวจสอบข้อผิดพลาดของฟอร์ม
        expect(getByText(/กรุณากรอกชื่อจริง/i)).toBeInTheDocument();
        expect(getByText(/กรุณากรอกนามสกุล/i)).toBeInTheDocument();
        // expect(getByText(/กรุณากรอกอีเมล/i)).toBeInTheDocument();
        // expect(getByText(/กรุณากรอกเบอร์โทร/i)).toBeInTheDocument();
        // expect(getByText(/กรุณากรอกรหัสผ่าน/i)).toBeInTheDocument();
        // expect(getByText(/กรุณายืนยันรหัสผ่าน/i)).toBeInTheDocument();
    });

    it("shows validation email format errors", () => {
        const { getByLabelText, getByText, getByTestId, getByRole } = render(<Register />)

        fireEvent.change(getByLabelText(/ชื่อจริง/i), { target: { value: "John Doe" } })
        fireEvent.change(getByLabelText(/นามสกุล/i), { target: { value: "John Doe" } })
        fireEvent.change(getByLabelText(/อีเมล/i), { target: { value: "johndoe@example" }, })
        fireEvent.change(getByLabelText(/เบอร์โทร/i), { target: { value: "1234567890" }, })
        fireEvent.change(getByTestId("password-input"), { target: { value: "123456" }, })
        fireEvent.change(getByTestId("confirm-password-input"), { target: { value: "123456" }, })
        fireEvent.click(getByRole('button', { name: /สมัครสมาชิก/i }))

        expect(getByText(/รูปแบบอีเมลไม่ถูกต้อง/i)).toBeInTheDocument()
    })

    it("shows validation phone number format errors", () => {
        const { getByLabelText, getByText, getByTestId, getByRole } = render(<Register />)

        fireEvent.change(getByLabelText(/ชื่อจริง/i), { target: { value: "John Doe" } })
        fireEvent.change(getByLabelText(/นามสกุล/i), { target: { value: "John Doe" } })
        fireEvent.change(getByLabelText(/อีเมล/i), { target: { value: "johndoe@gmail.com" }, })
        fireEvent.change(getByLabelText(/เบอร์โทร/i), { target: { value: "123456789" }, })
        fireEvent.change(getByTestId("password-input"), { target: { value: "123456" }, })
        fireEvent.change(getByTestId("confirm-password-input"), { target: { value: "123456" }, })
        fireEvent.click(getByRole('button', { name: /สมัครสมาชิก/i }))

        expect(getByText(/เบอร์โทรต้องเป็นตัวเลข 10 หลัก/i)).toBeInTheDocument()
    })

    it("shows validation password format errors", () => {
        const { getByLabelText, getByText, getByTestId, getByRole } = render(<Register />)

        fireEvent.change(getByLabelText(/ชื่อจริง/i), { target: { value: "John Doe" } })
        fireEvent.change(getByLabelText(/นามสกุล/i), { target: { value: "John Doe" } })
        fireEvent.change(getByLabelText(/อีเมล/i), { target: { value: "johndoe@gmail.com" }, })
        fireEvent.change(getByLabelText(/เบอร์โทร/i), { target: { value: "1234567890" }, })
        fireEvent.change(getByTestId("password-input"), { target: { value: "12345" }, })
        fireEvent.change(getByTestId("confirm-password-input"), { target: { value: "123456" }, })
        fireEvent.click(getByRole('button', { name: /สมัครสมาชิก/i }))

        expect(getByText(/รหัสผ่านต้องมีอย่างน้อย 6 ตัว/i)).toBeInTheDocument()
    })

    it("shows validation confirm-password format errors", () => {
        const { getByLabelText, getByText, getByTestId, getByRole } = render(<Register />)

        fireEvent.change(getByLabelText(/ชื่อจริง/i), { target: { value: "John Doe" } })
        fireEvent.change(getByLabelText(/นามสกุล/i), { target: { value: "John Doe" } })
        fireEvent.change(getByLabelText(/อีเมล/i), { target: { value: "johndoe@gmail.com" }, })
        fireEvent.change(getByLabelText(/เบอร์โทร/i), { target: { value: "1234567890" }, })
        fireEvent.change(getByTestId("password-input"), { target: { value: "123456" }, })
        fireEvent.change(getByTestId("confirm-password-input"), { target: { value: "abcdef" }, })
        fireEvent.click(getByRole('button', { name: /สมัครสมาชิก/i }))

        expect(getByText(/รหัสผ่านไม่ตรงกัน/i)).toBeInTheDocument()
    })

    it("submits form successfully", async () => {
        const { getByLabelText, getByTestId, getByRole } = render(<Register />)
        const mockResponse = {
          data: {
            id: 1,
            first_name: "John",
            last_name: "Doe",
            email: "johndoe@gmail.com",
            phone: "1234567890",
            password: "123456",
            // ยืนยันรหัสผ่าน: "123456",
          },
        }
        axios.post.mockResolvedValue(mockResponse)
        fireEvent.change(getByLabelText(/ชื่อจริง/i), { target: { value: "John" } })
        fireEvent.change(getByLabelText(/นามสกุล/i), { target: { value: "Doe" } })
        fireEvent.change(getByLabelText(/อีเมล/i), { target: { value: "johndoe@gmail.com" }, })
        fireEvent.change(getByLabelText(/เบอร์โทร/i), { target: { value: "1234567890" }, })
        fireEvent.change(getByTestId("password-input"), { target: { value: "123456" }, })
        fireEvent.change(getByTestId("confirm-password-input"), { target: { value: "123456" }, })
        fireEvent.click(getByRole('button', { name: /สมัครสมาชิก/i }))
    
        // fireEvent.click(getByText(/submit/i))
    
        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:5000/signup",
            {
                first_name: "John",
                last_name: "Doe",
                email: "johndoe@gmail.com",
                phone: "1234567890",
                password: "123456",
            }
          )
        })
      })
    
});