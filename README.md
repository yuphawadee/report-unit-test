# ระบบแจ้งเรื่องร้องเรียน

เว็บแอปพลิเคชันสำหรับแจ้งและจัดการเรื่องร้องเรียน โดยประกอบด้วย 2 ส่วนคือ Frontend (React + Vite) และ Backend (Node.js + Express) พร้อมมีการเขียน Unit Test ด้วย Vitest

## 📁 โครงสร้างโปรเจกต์

- `frontend/` - React + Vite + Vitest (ส่วนแสดงผลให้ผู้ใช้งาน)
- `backend/` - Node.js + Express (จัดการ API และฐานข้อมูล)

## ⚙️ เทคโนโลยีที่ใช้

### Frontend
- React
- Vite
- Tailwind CSS
- Vitest *(เขียน Unit Test)*
- Axios *(เรียกใช้งาน API)*

### Backend
- Node.js
- Express
- MySQL

## 🚀 วิธีใช้งานเบื้องต้น

### 1. ติดตั้ง dependencies

```bash
# frontend
cd frontend
npm install

# backend
cd ../backend
npm install
```

### 2. การรัน Server

เริ่มต้น Backend (Node.js + Express)
หลังจากติดตั้ง dependencies ในโฟลเดอร์ backend แล้ว ให้รันคำสั่งนี้เพื่อเริ่ม server:

```bash
cd backend
npx nodemon server.js
```
Server จะเริ่มต้นที่ http://localhost:5000 (หรือพอร์ตที่คุณตั้งค่าไว้ในไฟล์ .env)

เริ่มต้น Frontend (React + Vite)
หลังจากติดตั้ง dependencies ในโฟลเดอร์ frontend แล้ว ให้รันคำสั่งนี้เพื่อเริ่มต้นการพัฒนา:

```bash
cd frontend
npm run dev
```
Frontend จะเริ่มต้นที่ http://localhost:5173/ โดยสามารถเข้าถึงได้ผ่านเบราว์เซอร์

### 3. การเขียน Unit Test ด้วย Vitest
คุณสามารถเขียน Unit Test สำหรับ Frontend (React) ด้วย Vitest โดยการสร้างไฟล์ใน frontend/ และใช้คำสั่ง:

```bash
npx vitest --ui
```
สำหรับ Backend คุณสามารถเขียน Unit Test โดยใช้ vitest

### 4. ทดสอบและใช้งาน
หลังจากรันทั้งสองส่วน Frontend และ Backend แล้ว คุณสามารถเข้าถึงระบบจากเบราว์เซอร์ โดยไปที่ http://localhost:5173/ เพื่อใช้งานระบบแจ้งเรื่องร้องเรียน

