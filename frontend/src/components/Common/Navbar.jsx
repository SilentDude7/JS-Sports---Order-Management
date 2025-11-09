import React from 'react'
import { Link } from 'react-router-dom'; // 
import {HiOutlineUser,HiOutlineShoppingCart,HiBars3BottomRight} from "react-icons/hi2"
import SearchBar from './SearchBar';
import CartDrawer from '../Layout/CartDrawer';
import { useState } from 'react';



const Navbar = () => {

const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
    <nav className='container mx-auto flex items-center justify-between py-4 px-6'>
      {/* Left - Logo */}
      <div>
        <Link to="/" className="text-2xl font-medium">
          JS SPORTS
        </Link>
      </div>
        {/*Center -Navigation Links */}
      <div className='hidden md:flex space-x-6'>
        <Link to="#" className='text-gray-700 hover:text-black text-sm' font-medium uppercase>
        Men
        </Link>

        <Link to="#" className='text-gray-700 hover:text-black text-sm' font-medium uppercase>
        Women
        </Link>

        <Link to="#" className='text-gray-700 hover:text-black text-sm' font-medium uppercase>
        Football Gears
        </Link>

        <Link to="#" className='text-gray-700 hover:text-black text-sm' font-medium uppercase>
        MMA Gears
        </Link>

        <Link to="/view-product" className='text-gray-700 hover:text-black text-sm font-lower uppercase'>
        To Ship
        </Link>

        <Link to="/deliver-ui" className='text-gray-700 hover:text-black text-sm font-lower uppercase'>
            Delivery UI
          </Link>

        <Link to="/admin-order" className='text-gray-700 hover:text-black text-sm font-lower uppercase'>
            Admin Order
          </Link>

      </div>
       {/*Right -Icons  */}
       <div className='flex items-center space-x-4'>

        <Link to="/profile" className='hover:text-black'>
        <HiOutlineUser className='h-6 w-6 text-gray-700'/>

        </Link>
        <button onClick={toggleCartDrawer} className='relative hover:text-black'>
            <HiOutlineShoppingCart className='h-6 w-6 text-gray-700'/>
            <span className='absolute -top-1 bg-rabbit-red text-white text-xs rounded-full px-2 py-0.5'>4</span>
        </button>
        {/*Search */}
        <SearchBar/>

        <button  className='md:hidden'>
            <HiBars3BottomRight className='h-6 w-6 text-gray-700' /></button>
       </div>
    </nav>
    <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer}/>

    {/*Mobile Navigation */}
    </>
  )
}

export default Navbar
