import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { Route, Router, Routes } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/user/Dashboard";
import Account from "./components/user/Account";
import Report from "./components/user/Report";
import Status from "./components/user/Status";
import ReportHistory from "./components/user/History";
import ReportAdmin from "./components/admin/ReportAdmin";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard_Admin from "./components/admin/Dashboard_Admin";
import History from "./components/user/History";
import Home from "./components/user/Home";
import HomeAdmin from "./components/admin/HomeAdmin";
import HistoryAdmin from "./components/admin/HistoryAdmin";

const App = () => {

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} /> {/* หน้าแรกจะแสดงฟอร์ม */}
        <Route path="/login" element={<Login />} /> {/* หน้า login */}
        <Route path="/register" element={<Register />} /> {/* หน้า register */}

        {/* user */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Home />} />
          <Route path="report" element={<Report />} />
          <Route path="status" element={<Status />} />
          <Route path="account" element={<Account />} />
          <Route path="history" element={<History />} />
        </Route>

        {/* admin */}
        <Route path="/dashboard_admin" element={<Dashboard_Admin />}>
          <Route index element={<HomeAdmin />} />
          <Route path="report" element={<ReportAdmin />} />
          <Route path="status" element={<Status />} />
          <Route path="history" element={<HistoryAdmin />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
