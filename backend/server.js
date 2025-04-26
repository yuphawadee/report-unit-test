const express = require("express");
const cors = require("cors");
const db = require("./conn"); // ดึง db จาก conn.js
const bcrypt = require("bcryptjs");
const path = require("path");

require("dotenv").config();
const app = express();
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
    cors({
        origin: "http://localhost:5173",
    })
);

// ✅ ทดสอบเซิร์ฟเวอร์
app.get("/", (req, res) => {
    res.send("Express Server is running! 🚀");
});

// ✅ ทดสอบเชื่อมต่อฐานข้อมูล
app.get("/test-db", async (req, res) => {
    try {
        const [result] = await db.query("SELECT 1 + 1 AS result");
        res.send("✅ Database connected! Result: " + result[0].result);
    } catch (error) {
        res.status(500).json({ message: "Database Error", error: error.message });
    }
});

/* 
|--------------------------------------------------------------------------
| Users API
|--------------------------------------------------------------------------
*/

// ✅ GET Users (ได้ข้อมูลจากฐานข้อมูล)
app.get("/users", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM users");
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ POST Users (signup)
app.post("/signup", async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password, role } = req.body;
        const userRole = role || "member";
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            "INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)",
            [first_name, last_name, email, phone, hashedPassword, userRole]
        );

        res.json({ message: "User registered!", userId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ POST Login (เข้าสู่ระบบ)
const jwt = require("jsonwebtoken"); // นำเข้าไลบรารี jwt

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "อีเมลและรหัสผ่านต้องไม่เป็นค่าว่าง" });
        }

        const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
            email,
        ]);

        if (!user || user.length === 0) {
            return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }

        const isMatch = bcrypt.compareSync(password, user[0].password);

        if (!isMatch) {
            return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }

        // สร้าง JWT Token
        const token = jwt.sign(
            {
                userId: user[0].id,
                first_name: user[0].first_name,
                last_name: user[0].last_name,
            },
            process.env.JWT_SECRET_KEY, // ใช้ค่าจาก .env
            { expiresIn: "1h" } // กำหนดเวลาหมดอายุของ Token
        );

        // ส่ง JWT กลับไปพร้อมกับข้อมูล
        res.status(200).json({
            message: "Login successful",
            token, // ส่ง token ไปพร้อมกับข้อมูล
            role: user[0].role,
            userId: user[0].id, // ส่ง userId กลับไป
            firstname: user[0].first_name,
            lastname: user[0].last_name,
        });
    } catch (error) {
        console.error("Error in login:", error); // แสดงรายละเอียดข้อผิดพลาด
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/* 
|--------------------------------------------------------------------------
| Reports API
|--------------------------------------------------------------------------
*/

// ✅ GET Reports
// app.get("/reports", async (req, res) => {
//     try {
//         // ดึงข้อมูลจาก reports ทั้งหมด รวมถึงข้อมูลผู้ใช้ด้วย
//         const [reports] = await db.query(`
//             SELECT 
//                 reports.*, 
//                 users.first_name, 
//                 users.last_name, 
//                 users.phone AS user_phone
//             FROM reports
//             LEFT JOIN users ON reports.user_id = users.id
//         `);

//         if (reports.length === 0) {
//             return res.status(404).json({ message: "No reports found" });
//         }

//         res.status(200).json(reports);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// });
app.get("/reports", async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT 
                reports.*, 
                users.first_name, 
                users.last_name, 
                users.phone AS user_phone
            FROM reports
            LEFT JOIN users ON reports.user_id = users.id
        `;

        const values = [];

        if (status) {
            // แปลง status จาก string → array
            const statusArray = status.split(","); // เช่น ['pending', 'in_progress']
            const placeholders = statusArray.map(() => "?").join(", ");

            query += ` WHERE reports.status IN (${placeholders})`;
            values.push(...statusArray);
        }

        const [reports] = await db.query(query, values);

        if (reports.length === 0) {
            return res.status(404).json({ message: "No reports found" });
        }

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});


// ✅ GET Report by ID
app.get("/reports/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [report] = await db.query("SELECT * FROM reports WHERE id = ?", [id]);

        if (report.length === 0) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.status(200).json(report[0]);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ GET Reports by User ID
app.get("/reports/user/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        // ดึงข้อมูลรายงานจากฐานข้อมูลที่ตรงกับ userId
        const [reports] = await db.query(
            "SELECT * FROM reports WHERE user_id = ?",
            [userId]
        );

        // ส่งกลับข้อมูลรายงาน (หากไม่มีรายงานก็ส่งอาร์เรย์ว่าง)
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ POST Create Report
const multer = require("multer");
// const path = require("path");

// ตั้งค่าที่เก็บไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // เช็คว่าโฟลเดอร์ 'uploads' มีอยู่หรือไม่ ถ้าไม่มีก็สร้าง
        const fs = require("fs");
        const dir = "uploads";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir); // ตั้งค่าให้เก็บไฟล์ในโฟลเดอร์ uploads
    },
    filename: function (req, file, cb) {
        const date = new Date();
        const formattedDate =
            date.toISOString().slice(0, 10).replace(/-/g, "") +
            "-" +
            date.toTimeString().slice(0, 8).replace(/:/g, ""); // YYYYMMDD-HHmmss
        const randomString = Math.random().toString(36).substring(2, 8); // ตัวเลขสุ่ม 6 หลัก
        const ext = file.mimetype.split("/")[1]; // ดึงนามสกุลไฟล์ (jpeg, png, jpg)

        cb(null, `${formattedDate}-${randomString}.${ext}`);
    },
});

// ตรวจสอบประเภทไฟล์ที่อนุญาต
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]; // เพิ่มประเภทไฟล์ที่รองรับ
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("ไฟล์ที่อัปโหลดไม่รองรับ"), false);
    }
};

// ขนาดไฟล์สูงสุด 5MB
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // ขนาดไฟล์สูงสุด 5MB
    fileFilter: fileFilter,
});

// const generateTrackingId = () => {
//     return Math.floor(1000000000 + Math.random() * 9000000000).toString();
// };

const generateTrackingId = () => {
    const year = new Date().getFullYear().toString().slice(-2); // ปี 2 หลัก เช่น 24
    const timestamp = Date.now().toString().slice(-6); // 6 หลักสุดท้ายของ timestamp
    const random = Math.floor(1000 + Math.random() * 9000); // เลขสุ่ม 4 หลัก

    return `RPT-${year}${timestamp}-${random}`;
};


app.post("/reports", upload.single("image"), async (req, res) => {
    try {
        const { title, details, userId } = req.body;
        const image = req.file;

        if (!title || !details || !image || !userId) {
            return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
        }

        const trackingId = generateTrackingId();

        // Query สำหรับการเพิ่มรายงาน
        const [result] = await db.query(
            "INSERT INTO reports (tracking_id, title, details, image, user_id, status) VALUES (?, ?, ?, ?, ?, ?)",
            [trackingId, title, details, image.filename, userId, "pending"]
        );
        console.log(result);

        // Query สำหรับการเพิ่มสถานะใน status_timeline
        await db.query(
            "INSERT INTO status_timeline (report_id, status, changed_by) VALUES (?, ?, ?)",
            [result.insertId, "pending", userId]
        );

        res
            .status(201)
            .json({
                message: "Report created!",
                reportId: result.insertId,
                trackingId,
            });
    } catch (error) {
        console.error("Error during report creation: ", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// app.put("/reports/:userId", upload.single("image"), async (req, res) => {
//     try {
//         const { title, details, userId } = req.body;
//         const image = req.file;

//         if (!title || !details || !image || !userId) {
//             return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
//         }

//         const trackingId = generateTrackingId();

//         // Query สำหรับการเพิ่มรายงาน
//         const [result] = await db.query(
//             "INSERT INTO reports (tracking_id, title, details, image, user_id, status) VALUES (?, ?, ?, ?, ?, ?)",
//             [trackingId, title, details, image.filename, userId, 'pending']
//         );
//         console.log(result);

//         // Query สำหรับการเพิ่มสถานะใน status_timeline
//         await db.query(
//             "INSERT INTO status_timeline (report_id, status, changed_by) VALUES (?, ?, ?)",
//             [result.insertId, 'pending', userId]
//         );

//         res.status(201).json({ message: "Report created!", reportId: result.insertId, trackingId });
//     } catch (error) {
//         console.error("Error during report creation: ", error);
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// });

// const multer = require("multer");
// const upload = multer({ dest: "uploads/" }); // กำหนดที่เก็บไฟล์ที่อัปโหลด

// // ฟังก์ชันสร้าง Tracking ID (6 หลัก)
// const generateTrackingId = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// };

// app.post("/reports", upload.single("image"), async (req, res) => {
//     try {
//         const { title, details, userId } = req.body; // ดึงข้อมูลจาก body
//         const image = req.file; // ดึงไฟล์ที่อัปโหลด

//         if (!title || !details || !image || !userId) {
//             return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
//         }

//         const trackingId = generateTrackingId(); // สร้าง Tracking ID

//         // เก็บข้อมูลในฐานข้อมูล reports
//         const [result] = await db.query(
//             "INSERT INTO reports (tracking_id, title, details, image, user_id, status) VALUES (?, ?, ?, ?, ?, ?)",
//             [trackingId, title, details, image.filename, userId, 'pending'] // ตั้งสถานะเริ่มต้นเป็น 'pending'
//         );

//         // เก็บข้อมูลสถานะใน status_timeline
//         await db.query(
//             "INSERT INTO status_timeline (report_id, status, changed_by) VALUES (?, ?, ?)",
//             [result.insertId, 'pending', userId] // เก็บสถานะ 'pending' และผู้ที่สร้างรายงาน
//         );

//         res.status(201).json({ message: "Report created!", reportId: result.insertId, trackingId });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// });

app.get("/reports/tracking/:trackingId", async (req, res) => {
    const { trackingId } = req.params;
    try {
        const [report] = await db.query(
            "SELECT * FROM reports WHERE tracking_id = ?",
            [trackingId]
        );

        if (report.length === 0) {
            return res.status(404).json({ message: "Report not found" });
        }

        const [timeline] = await db.query(
            "SELECT * FROM status_timeline WHERE report_id = ?",
            [report[0].id]
        );

        // ตั้งค่า Content-Type เป็น application/json
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({
            ...report[0], // ส่งข้อมูล report
            status_timeline: timeline, // ส่งข้อมูล timeline
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ PUT Update Report
// app.put("/reports/:id", async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { title, details, image, status } = req.body;

//         // ดึง userId จาก token (เช่น ใช้ middleware สำหรับการตรวจสอบการ login และดึง userId)
//         const userId = req.user.id; // ต้องมีการใช้ middleware ในการดึง userId

//         console.log("Received data:", { title, details, image, status }); // ตรวจสอบข้อมูลที่ส่งมา

//         // ตรวจสอบว่า status มีการเปลี่ยนแปลงจริงหรือไม่
//         const [existingReport] = await db.query("SELECT status FROM reports WHERE id = ?", [id]);

//         if (existingReport.length === 0) {
//             return res.status(404).json({ message: "Report not found" });
//         }

//         // ถ้าสถานะใหม่แตกต่างจากสถานะเดิม
//         if (existingReport[0].status !== status) {
//             // เริ่มต้นทำการอัพเดตข้อมูลในตาราง reports
//             const [result] = await db.query(
//                 "UPDATE reports SET title = ?, details = ?, image = ?, status = ? WHERE id = ?",
//                 [title, details, image, status, id]
//             );

//             if (result.affectedRows === 0) {
//                 return res.status(404).json({ message: "Report not found" });
//             }

//             // เพิ่มข้อมูลลงใน status_timeline
//             const timestamp = new Date().toISOString();
//             await db.query(
//                 "INSERT INTO status_timeline (report_id, status, changed_by, changed_at) VALUES (?, ?, ?, ?)",
//                 [id, status, userId, timestamp]
//             );

//             return res.json({ message: "Report and status timeline updated!" });
//         } else {
//             return res.json({ message: "No status change, nothing to update." });
//         }
//     } catch (error) {
//         console.error("Error updating report:", error); // ตรวจสอบข้อผิดพลาด
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// });
app.put("/reports/:id", async (req, res) => {
    try {
        const { status, userId } = req.body; // รับค่า status และ userId จาก frontend
        const reportId = req.params.id;

        if (!status || !userId) {
            return res
                .status(400)
                .json({ message: "กรุณากรอกข้อมูลสถานะและผู้ใช้งาน" });
        }

        // อัปเดตสถานะในตาราง reports
        await db.query(
            "UPDATE reports SET status = ?, updated_at = NOW() WHERE id = ?",
            [status, reportId]
        );

        // บันทึกการเปลี่ยนแปลงสถานะใน status_timeline
        await db.query(
            "INSERT INTO status_timeline (report_id, status, changed_by, changed_at) VALUES (?, ?, ?, NOW())",
            [reportId, status, userId]
        );

        res.status(200).json({ message: "สถานะอัปเดตสำเร็จ" });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
    }
});

// ✅ DELETE Report
app.delete("/reports/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // ลบข้อมูลจากตาราง status_timeline ก่อน
        await db.query("DELETE FROM status_timeline WHERE report_id = ?", [id]);

        // ลบข้อมูลจากตาราง reports หลังจากลบจาก status_timeline
        const [result] = await db.query("DELETE FROM reports WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.json({ message: "Report deleted!" });
    } catch (error) {
        console.error("Error deleting report:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});



/* 
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
