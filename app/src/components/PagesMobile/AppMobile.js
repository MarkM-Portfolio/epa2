import React from 'react'
import HomeMobile from '../MobileView/HomeMobile'
import { Routes, Route } from 'react-router-dom'
import Cart from './Cart'
import Order from './Order'
import StorePage from './StorePage'
import ProductPage from './ProductPage'
import ServicePage from './ServicePage'
import Chat from '../Chat/Chat'
import MyChat from '../Chat/MyChat'
import ValidationBeforeRegister from '../ValidationBeforeRegister'
// import Store from './Store'
import Profile from './Profile'
import VerifyAccount from './ProfilePage/VerifyAccount'
import Favorites from './Favorites'
import EpaWallet from './EpaWallet'
import EpaCash from './ProfilePage/EpaCash'
import EpaCredit from './ProfilePage/EpaCredit'
import EpaVault from './ProfilePage/EpaVault'
import Donation from './ProfilePage/Donation'
import Receipt from './ProfilePage/Receipt'
import EditProfile from './ProfilePage/EditProfile'
import ShippingAddress from './ProfilePage/ShippingAddress'
import MyStore from './ProfilePage/MyStore'
import MyProduct from './ProfilePage/MyProduct'
import MyService from './ProfilePage/MyService'
import MySales from './ProfilePage/MySales'
import EditStore from './EditStore'
import EditProduct from './EditProduct'
import EditService from './EditService'
import Wishlist from './ProfilePage/Wishlist'
import OrderHistory from './ProfilePage/OrderHistory'
import Notifications from './ProfilePage/Notifications'
import MyOrders from './ProfilePage/MyOrders'
import Package from './ProfilePage/Package'
import SubAccount from './ProfilePage/SubAccount'
import CreateAccount from './ProfilePage/CreateAccount'
import OrgChart from './ProfilePage/OrgChart'
import MyOrderReceipt from './ProfilePage/MyOrderReceipt'

const AppMobile = () => {

  return (
    <>
      <Routes>
         <Route path='/' element={ < HomeMobile /> } />
         <Route path='/cart' element={ < Cart /> } />
         <Route path='/order' element={ < Order /> } />
         <Route path='/store' element={ < StorePage /> } />
         <Route path='/product' element={ < ProductPage /> } />
         <Route path='/service' element={ < ServicePage /> } />
         <Route path='/chat' element={ < Chat /> } />
         <Route path='/chat-contacts' element={ < MyChat /> } />
         {/* <Route path='/store' element={ < Store /> } /> */}
         <Route path='/validation' element={ < ValidationBeforeRegister /> } />
         <Route path='/profile' element={ < Profile /> } />
         <Route path='/verifyaccount' element={ < VerifyAccount /> } />
         <Route path='/favorites' element={ < Favorites /> } />
         <Route path='/epawallet' element={ < EpaWallet /> } />
         <Route path='/epacash' element={ < EpaCash /> } />
         <Route path='/epacredit' element={ < EpaCredit /> } />
         <Route path='/epavault' element={ < EpaVault /> } />
         <Route path='/donation' element={ < Donation /> } />
         <Route path='/receipts' element={ < Receipt /> } />
         <Route path='/myorders' element={ < MyOrders /> } />
         <Route path='/display-orderReceipt' element={ < MyOrderReceipt /> } />
         {/* Profile Page */}
         <Route path='/edit-profile' element={ < EditProfile />} />
         <Route path='/shipping-address' element={ < ShippingAddress />} />
         <Route path='/mystore' element={ < MyStore />} />
         <Route path='/myproduct' element={ < MyProduct />} />
         <Route path='/myservice' element={ < MyService />} />
         <Route path='/mysales' element={ < MySales />} />
         <Route path='/editstore' element={ < EditStore />} />
         <Route path='/editproduct' element={ < EditProduct />} />
         <Route path='/editservice' element={ < EditService />} />
         <Route path='/wishlist' element={ < Wishlist />} />
         <Route path='/order-history' element={ < OrderHistory />} />
         <Route path='/notifications' element={ < Notifications />} />
         <Route path='/package' element={ < Package />} />
         <Route path='/orgchart' element={ < OrgChart />} />
         <Route path='/subaccount' element={ < SubAccount />} />
         <Route path='/createaccount' element={ < CreateAccount />} />
      </Routes>
    </>
  )
}

export default AppMobile
