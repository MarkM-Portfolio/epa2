import React from 'react'
import { BiCoinStack } from 'react-icons/bi'
import { LiaShippingFastSolid } from 'react-icons/lia'
import { MdLocalMall } from 'react-icons/md'
import { BsFillTicketDetailedFill } from 'react-icons/bs'
import { GiLargeDress } from 'react-icons/gi'
import { BsCart4 } from 'react-icons/bs'
import { FaMobileAlt } from 'react-icons/fa'
import { RiArrowGoBackLine } from 'react-icons/ri'
import { PiBackpack } from 'react-icons/pi'

const NavigationIcons = () => {
  return (
    <div className='mt-16 hidden lg:flex px-6 xl:px-60 border-2'>
        <div className='w-full py-8'>
            <div>
                <ul className='flex gap-10 xl:gap-24 justify-center'>
                    <a href="https://www.google.com/" className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300'>
                        <li className='border p-2 rounded flex justify-center'>
                            <BiCoinStack size={40}/>
                        </li>
                        <p className='text-center text-sm'>Coin Rewards</p>
                    </a>
                                     
                    <a href="https://www.google.com/" className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300'>
                        <li className='border p-2 rounded flex justify-center'>
                            <LiaShippingFastSolid size={40}/>
                        </li>
                        <p className='text-center text-sm'>Free Shipping</p>
                    </a>

                    <a href="https://www.google.com/" className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300'>
                        <li className='border p-2 rounded flex justify-center'>
                            <MdLocalMall size={40}/>
                        </li>
                        <p className='text-center text-sm'>EPA Mall</p>
                    </a>

                    <a href="https://www.google.com/" className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300'>
                        <li className='border p-2 rounded flex justify-center'>
                            <BsFillTicketDetailedFill size={40}/>
                        </li>
                        <p className='text-center text-sm'>Vouchers</p>
                    </a>

                    <a href="https://www.google.com/" className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300'>
                        <li className='border p-2 rounded flex justify-center'>
                            <GiLargeDress size={40}/>
                        </li>
                        <p className='text-center text-sm'>EPA Styles</p>
                    </a>

                    <a href="https://www.google.com/" className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300'>
                        <li className='border p-2 rounded flex justify-center'>
                            <BsCart4 size={40}/>
                        </li>
                        <p className='text-center text-sm'>EPA Supermarket</p>
                    </a>

                    <a href="https://www.google.com/" className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300'>
                        <li className='border p-2 rounded flex justify-center'>
                            <FaMobileAlt size={40}/>
                        </li>
                        <p className='text-center text-sm'>Gadget Zone</p>
                    </a>

                    <a href="https://www.google.com/" className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300'>
                        <li className='border p-2 rounded flex justify-center'>
                            <RiArrowGoBackLine size={40}/>
                        </li>
                        <p className='text-center text-sm'>Change Request</p>
                    </a>

                    <a href="https://www.google.com/" className='transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300'>
                        <li className='border p-2 rounded flex justify-center'>
                            <PiBackpack size={40}/>
                        </li>
                        <p className='text-center text-sm'>Partner Promos</p>
                    </a>
                </ul>
            </div>
         
        </div>
    </div>
  )
}

export default NavigationIcons