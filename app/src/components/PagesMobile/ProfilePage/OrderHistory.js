import React from 'react'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const OrderHistory = () => {
  return (
    <>
        <div className='font-montserrat lg:hidden'>
            <div className='pt-10 px-6'>
                <div className='flex justify-between items-center'>
                    <NavLink to="/profile">
                        <FaArrowAltCircleLeft className='text-4xl' />
                    </NavLink>
                    <h1 className='text-xl font-semibold'>Order</h1>
                    <h2 className='text-gray-400 text-xs'>Clear History</h2>
                </div>
            </div>

            <div className='px-6 pt-10'>
                <Tabs>
                    <TabList>
                        <Tab>Ongoing</Tab>
                        <Tab>History</Tab>
                        <Tab>Draft</Tab>
                    </TabList>

                    <TabPanel>
                        
                    </TabPanel>
                    <TabPanel>
                        
                    </TabPanel>
                    <TabPanel>

                    </TabPanel>
                </Tabs>
            </div>
        </div>
    </>
  )
}

export default OrderHistory