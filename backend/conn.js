const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",     
    password: "",      
    database: "report_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// เช็คว่าเชื่อมต่อได้หรือไม่
// db.getConnection((err, connection) => {
//     if (err) {
//       console.error("Database connection failed:", err.message);
//       return;
//     }
//     console.log("Connected to MySQL Database!");
//     connection.release(); // คืน connection กลับไปที่ pool
//   });

module.exports = db;
