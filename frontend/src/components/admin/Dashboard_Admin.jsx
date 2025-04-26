import React, { useEffect, useState } from 'react'
import LogoutButton from '../LogoutButton'
import Sidebar from "../Sidebar"
import { Outlet } from 'react-router-dom'

const Dashboard_Admin = () => {
 
  return (
    <div className='bg-blur relative'>
            <div className="w-full min-h-screen bg-[rgb(17,17,17,0.25)] backdrop-blur-xl absolute inset-0 z-0"></div>
            <div className='relative min-h-screen max-w-[1200px] m-auto lg:flex p-10 z-40'>
                <div className='lg:w-80 w-full bg-[#212529] lg:rounded-none lg:rounded-l-[30px] rounded-t-xl p-10'>
                    <Sidebar />
                </div>
                <div className='flex-1 bg-white rounded-b-2xl lg:rounded-none lg:rounded-r-2xl p-10'>
                  {/* {first_name} {last_name} */}
                    <Outlet />
                </div>
            </div>
        </div>
  )
}

export default Dashboard_Admin