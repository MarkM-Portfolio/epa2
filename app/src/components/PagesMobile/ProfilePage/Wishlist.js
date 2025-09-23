import React from 'react'
import { AiOutlineGift } from 'react-icons/ai'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'
import { BsCart3 } from 'react-icons/bs'

const Wishlist = () => {
  return (
    <>
        <div className='font-montserrat lg:hidden'>
            <div className='flex justify-between items-center px-6 pt-10'>
                <NavLink to="/profile">
                    <FaArrowAltCircleLeft className='text-4xl' />
                </NavLink>
                <h1 className='text-lg font-semibold'>Wishlist</h1>
                <NavLink to='/cart'>
                    <BsCart3 className='text-xl' />
                </NavLink>
            </div>

            <div className='mt-20 px-6'>
                <div className='flex justify-center'>
                    <AiOutlineGift className='text-4xl' />
                </div>
                <h1 className='text-xl font-semibold text-center mt-4'>
                    My Wishlist is Empty!
                </h1>
                <h2 className='text-gray-400 text-center mt-2'>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                </h2>
                <div className='flex justify-center mt-4'>
                    <button className='px-6 py-2 bg-emerald-500 rounded-lg text-white'>Explore</button>
                </div>
            </div>
        </div>
    </>
  )
}

export default Wishlist