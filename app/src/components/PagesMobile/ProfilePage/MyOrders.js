import * as React from 'react'
import NavbarMobile from '../../MobileView/NavbarMobile'
import axios from 'axios'
import Cookies from 'universal-cookie'
import EPAListEmpty from '../../../assets/epa_list_empty.png'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
// import { TbCurrencyPeso } from 'react-icons/tb'
import { useState, useEffect } from 'react'
import { Tabs, Tab, Box } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ToastContainer, toast } from 'react-toastify'
import epa_coin from '../../../assets/epa-coin.gif'
// import { Link } from 'react-router-dom'
import { FaReceipt } from 'react-icons/fa'

export default function ScrollableTabsButtonPrevent() {
  const navigate = useNavigate()
  const cookies = new Cookies()
  const [ user ] = useState(cookies.get('user'))
  const [ currentUser, setCurrentUser ] = useState([])
  const [ orders, setOrders ] = useState([])
  const [ stores, setStores ] = useState([])
  // const [ deliveryStatus, setDeliveryStatus ] = useState([])
  const [ value, setValue ] = React.useState(0)
  const [ highToken, setHighToken ] = useState('')
  const [ lowToken, setLowToken ] = useState('')

  useEffect(() => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    if (user && user.id) {
        axios.get(`/api/setting`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            setHighToken(res.data.settings.highToken)
            setLowToken(res.data.settings.lowToken)
        }).catch((err) => {
            if (axios.isCancel(err)) console.log('Successfully Aborted')
            else console.error(err)
        })
        return () => { source.cancel() }
    }
}, [ user ])

  useEffect(() => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    if (user && user.id) {
      axios.get(`/api/user/${ user.id }`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Key': process.env.API_KEY
        },
        data: { cancelToken: source.token }
    }).then(res => {
        console.log('Success OK: ', res.status)
        setCurrentUser(res.data.user)
    }).catch((err) => {
        if (axios.isCancel(err)) console.log('Successfully Aborted')
        else console.error(err)
    })
    return () => { source.cancel() }
    }
}, [ user ])

  useEffect(() => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()
    const userOrders = []

    if (currentUser && currentUser._id) {
      axios.get(`/api/order`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Key': process.env.API_KEY
        },
        data: { cancelToken: source.token }
    }).then(res => {
        console.log('Success OK: ', res.status)
        res.data.orders.forEach(item => {
          if (item.email.includes(currentUser.email)) {
            item.details.forEach(det => {
              det.orderId = item._id
              userOrders.push(det)
              // console.log('TEST >>>>>>> ', det)
            })
            // console.log('TEST >>>>>>> ', item.details)
          }
            
            // userOrders.push(item)
         })
        setOrders(userOrders)
    }).catch((err) => {
        if (axios.isCancel(err)) console.log('Successfully Aborted')
        else console.error(err)
    })

    return () => { source.cancel() }
    }
}, [ currentUser ])

useEffect(() => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    if (currentUser) {
        axios.get(`/api/store`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            setStores(res.data.stores)
        }).catch((err) => {
            if (axios.isCancel(err)) console.log('Successfully Aborted')
            else console.error(err)
        })
        return () => { source.cancel() }
    }
}, [ currentUser ])

// useEffect(() => {
//   const CancelToken = axios.CancelToken
//   const source = CancelToken.source()

//   if (orders && orders.length) {
//       axios.get('/api/borzo/borzo-my-orders', {
//           headers: {
//               'X-DV-Auth-Token': process.env.NODE_ENV === 'production' ? process.env.BORZO_AUTH_TOKEN : process.env.BORZO_MOCK_AUTH_TOKEN,
//               'Content-Type': 'application/json; charset=utf-8',
//               'Accept': 'application/json; charset=utf-8'
//           },
//           data: { cancelToken: source.token }
//       }).then(res => {
//           console.log('Success OK: ', res.status)
//           setDeliveryStatus(res.data.orders)
//           return res
//       }).catch((err) => {
//           if (axios.isCancel(err)) {
//               console.log('Successfully Aborted')
//               console.log(err.response.data.error)
//           } else if (err.response.status === 422) { // response >> validation errors
//               console.log('Validation Error: ', err.response.status)
//               console.log(err.response.data.meta.message)
//           } else if (err.response.status === 403) { // response >> headers forbidden
//               console.log('Forbidden: ', err.response.status)
//               console.log(err.response.data.meta.message)
//           } else { // response >> server/page not found 404,500
//               console.log('Server Error: ', err.response.status)
//               console.log(err.response.data.meta.message)
//           }
//           return err
//       })
//   }
// }, [ orders ])

// useEffect(() => {
//   const CancelToken = axios.CancelToken
//   const source = CancelToken.source()

//   if (deliveryStatus && orders && orders.length) {
//       axios.get(`/api/delivery/recepient/${ currentUser._id }`, {
//           headers: {
//               'Content-Type': 'application/json',
//               'Accept': 'application/json',
//               'X-Api-Key': process.env.API_KEY
//           },
//           data: { cancelToken: source.token }
//       }).then(res => {
//           console.log('Success OK: ', res.status)
//           res.data.delivery.forEach(item => {
//               deliveryStatus.forEach(bItem => {
//                   if (bItem.order_id === item.deliveryData.order.order_id && bItem.status !== item.deliveryData.order.status) {
//                       item.deliveryData.order = []
//                       item.deliveryData.order = bItem
//                       updateDelivery(item)
//                   }
//               })
//           })
//       }).catch((err) => {
//           if (axios.isCancel(err)) console.log('Successfully Aborted')
//           else console.error(err)
//       })
//       return () => { source.cancel() }
//   }
// }, [ deliveryStatus ])

  const customFont = {
    fontFamily: 'montserrat',
    fontWeight: 700,
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: user.class === 'Entrepreneur' ? '#84CC16' : user.class === 'Supervisor' ? '#06b6D4' : user.class === 'Manager' ? '#F59E0B' : user.class === 'CEO' ? '#C084FC' : user.class === 'Business Empire' ? '#EF4444' : user.class === 'Silver' ? '#C0C0C0' : user.class === 'Gold' ? '#FFD700' : '#50C8A0'
      },
    },
    typography: {
        fontFamily: 'montserrat', 
      },
      components: {
        MuiTab: {
          styleOverrides: {
            root: customFont,
          },
        },
      },
  });

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`scrollable-prevent-tabpanel-${index}`}
        aria-labelledby={`scrollable-prevent-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <div>{children}</div>
          </Box>
        )}
      </div>
    );
  }

  const goBack = () => {
    navigate(-1)
  }

  // const updateDelivery = async (data) => {

  //   const CancelToken = axios.CancelToken
  //   const source = CancelToken.source()

  //   await axios.put(`/api/delivery/updatedelivery`, data, {
  //       headers: {
  //           'Content-Type': 'application/json',
  //           'Accept': 'application/json',
  //           'X-Api-Key': process.env.API_KEY
  //       },
  //       data: { cancelToken: source.token }
  //   }).then(res => {
  //       console.log('Success OK: ', res.status)
  //       return res
  //   }).catch((err) => {
  //       if (axios.isCancel(err)) {
  //           console.log('Successfully Aborted')
  //           console.log(err.response.data.error)
  //       } else if (err.response.status === 422) { // response >> validation errors
  //           console.log('Validation Error: ', err.response.status)
  //           console.log(err.response.data.error)
  //       } else if (err.response.status === 403) { // response >> headers forbidden
  //           console.log('Forbidden: ', err.response.status)
  //           console.log(err.response.data.error)
  //       } else { // response >> server/page not found 404,500
  //           console.log('Server Error: ', err.response.status)
  //           console.log(err.response.data.error)
  //       }
  //       return err
  //   })
  // }

  const orderCancel = async (item) => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    await axios.put(`/api/order/cancelorder/${ item.orderId }`, { 'detailsId': item._id }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Key': process.env.API_KEY
        },
        data: { cancelToken: source.token }
    }).then(res => {
        console.log('Success OK: ', res.status)
        toast.success(res.data.message)
        setTimeout(() => {
            window.location.reload()
        }, 1000)
        return res
    }).catch((err) => {
        if (axios.isCancel(err)) {
            console.log('Successfully Aborted')
            toast.error(err.response.data.error)
        } else if (err.response.status === 422) { // response >> validation errors
            console.log('Validation Error: ', err.response.status)
            toast.error(err.response.data.error)
        } else if (err.response.status === 403) { // response >> headers forbidden
            console.log('Forbidden: ', err.response.status)
            toast.error(err.response.data.error)
        } else { // response >> server/page not found 404,500
            console.log('Server Error: ', err.response.status)
            toast.error(err.response.data.error)
        }
        return err
    })
  }

  const declineReceived = async (item) => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    await axios.put(`/api/order/declineorder/${ item.orderId }`, { 'detailsId': item._id }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Key': process.env.API_KEY
        },
        data: { cancelToken: source.token }
    }).then(res => {
        console.log('Success OK: ', res.status)
        toast.success(res.data.message)
        setTimeout(() => {
            window.location.reload()
        }, 1000)
        return res
    }).catch((err) => {
        if (axios.isCancel(err)) {
            console.log('Successfully Aborted')
            toast.error(err.response.data.error)
        } else if (err.response.status === 422) { // response >> validation errors
            console.log('Validation Error: ', err.response.status)
            toast.error(err.response.data.error)
        } else if (err.response.status === 403) { // response >> headers forbidden
            console.log('Forbidden: ', err.response.status)
            toast.error(err.response.data.error)
        } else { // response >> server/page not found 404,500
            console.log('Server Error: ', err.response.status)
            toast.error(err.response.data.error)
        }
        return err
    })
  }
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const displayListEmpty = (
    <div className='montserrat text-xl '>
        <div>
            <div className='flex justify-center'>
                <img src={ EPAListEmpty } alt='list empty image'/>
            </div>
            <div className='mt-4 mb-4'>
                <h1 className='text-center font-bold text-lg mb-2'>Your Order List is Empty</h1>
                <h2 className='text-center text-sm text-gray-400'>Start by exploring our products and great deals!</h2>
            </div>
            <div className='flex justify-center'>
                <NavLink to='/'>
                    <button className='px-4 py-2 rounded shadow-md text-white text-sm font-semibold bg-emerald-400'>Continue shopping</button>
                </NavLink>
            </div>
        </div>
    </div>
  )

  const displayAll = orders.map((item, idx) => (
    <div className='mt-6' key={ idx }>
      { stores.map(storeItem => (
          <div className="flex flex-cols font-semibold" key={ storeItem._id }>
              <NavLink to='/store' state={ storeItem }>
                  { storeItem.owner === item.owner ? 
                      <div className='flex gap-2 mb-2'>
                          { item.owner === process.env.EPA_ACCT_ID ? 
                              <div className="flex flex-cols gap-2">
                                  <img className='w-6 h-6' alt="EPA" src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                  <div className="text-lime-500 text-center text-xl font-bold">EPA.<span className='text-lg text-orange-500'>Mall</span></div>
                              </div>
                              : 
                              <div className="flex flex-cols gap-2">
                                  <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                  <div>{ storeItem.name }</div>
                              </div>
                          }
                      </div>
                      : 
                      ''
                  }
              </NavLink>
          </div>
      )) }
      <NavLink to={ item.stocks ? '/product' : '/service' } state={ item }>
        <div className="border h-full w-full rounded-xl">
          <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
            <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ item.stocks ? '/products/' : '/services/' }` + item.image } />
            <div className='flex flex-col pl-1 text-bold text-md justify-center'>
              <h1 className='font-semibold'>{ item.name.length > 19 ? item.name.substring(0, 19) + "..." : item.name }</h1>
              <h1 className='mt-1 text-sm'>{ item.description.length > 52 ? item.description.substring(0, 52) + "..." : item.description }</h1>
              <div className='grid grid-cols'>
                <div className='flex flex-cols-2 gap-1'>
                    <div className='text-sm'>Charge for Extra:</div>
                    <div className='text-blue-500 font-semibold text-sm'>{ item.extra.$numberDecimal }</div>
                </div>
                <div className='flex flex-cols-2 gap-1'>
                    <div className='text-sm'>Delivery Fees:</div>
                    <div className='text-blue-500 font-semibold text-sm'>{ item.fees.$numberDecimal }</div>
                </div>
              </div>
              <div className='flex flex-cols items-center text-lg text-red-500'>
                <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                <div className='text-black-800'>{ item.stocks ? ((item.price * (item.token === 'high' ? highToken : lowToken) + item.price) * item.quantity + parseFloat(item.extra.$numberDecimal) + parseFloat(item.fees.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (item.price * (item.token === 'high' ? highToken : lowToken) + item.price + parseFloat(item.extra.$numberDecimal) + parseFloat(item.fees.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                <div className='text-orange-500 text-sm font-semibold italic px-6'>{ item.stocks ? 'Qty: ' + item.quantity : '' }</div>
              </div>
            </div>
          </div>
        </div>
      </NavLink>
      <div className='flex justify-end rounded-lg gap-2 pt-3'>
        <NavLink to="/display-orderReceipt" state={ item }>
          <div className='flex items-center text-gray-400'>
            <FaReceipt color='#84CC16' />
            <p className='text-xs'>View Order Receipt</p>
          </div>
        </NavLink>
      </div>
        {/* { item.details.map(det => (
            <div className="mt-4 flex flex-cols gap-4" key={ det._id }>
              <div className="border h-full w-full rounded-xl">
                <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                  <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ det.stocks ? '/products/' : '/services/' }` + det.image } />
                  <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                    <h1 className='font-semibold'>{ det.name.length > 19 ? det.name.substring(0, 19) + "..." : det.name }</h1>
                    <h1 className='mt-1 text-sm'>{ det.description.length > 52 ? det.description.substring(0, 52) + "..." : det.description }</h1>
                    <div className='flex flex-cols items-center text-lg text-red-500'>
                        <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                        <div className='text-black-800'>{ det.stocks ? ((det.price * (det.token === 'high' ? highToken : lowToken) + det.price) * det.quantity).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (det.price * (det.token === 'high' ? highToken : lowToken) + det.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                        <div className='text-orange-500 text-sm font-semibold italic px-6'>{ det.stocks ? 'Qty: ' + det.quantity : '' }</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) } */}
    </div>
  )) 

  // const displayToPay = orders.map(item => (
  //   <div className='mt-6' key={ item._id }>
  //     {/* <div className='text-center font-semibold'>Order ID # : { item._id }</div> */}
  //     { !item.isPaid && item.details.map(det => (
  //         <div className="mt-4 flex flex-cols gap-4" key={ det._id }>
  //           <div className="border h-full w-full rounded-xl">
  //             <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
  //               <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ det.stocks ? '/products/' : '/services/' }` + det.image } />
  //               <div className='flex flex-col pl-1 text-bold text-md justify-center'>
  //                 <h1 className='font-semibold'>{ det.name.length > 19 ? det.name.substring(0, 19) + "..." : det.name }</h1>
  //                 <h1 className='mt-1 text-sm'>{ det.description.length > 52 ? det.description.substring(0, 52) + "..." : det.description }</h1>
  //                 <div className='flex flex-cols items-center text-lg text-red-500'>
  //                     <TbCurrencyPeso />
  //                     <div className='text-black-800'>{ det.stocks ? ((det.price * (det.token === 'high' ? highToken : lowToken) + det.price) * det.quantity).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (det.price * (det.token === 'high' ? highToken : lowToken) + det.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
  //                     <div className='text-orange-500 text-sm font-semibold italic px-6'>{ det.stocks ? 'Qty: ' + det.quantity : '' }</div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       )) }
  //   </div>
  // ))

  const displayToConfirm = orders.map(item => (
    <div className='mt-6' key={ item._id }>
      { !item.isConfirmed && !item.isCancelled && stores.map(storeItem => (
          <div className="flex flex-cols font-semibold" key={ storeItem._id }>
              <NavLink to='/store' state={ storeItem }>
                  { storeItem.owner === item.owner ? 
                      <div className='flex gap-2 mb-2'>
                          { item.owner === process.env.EPA_ACCT_ID ? 
                              <div className="flex flex-cols gap-2">
                                  <img className='w-6 h-6' alt="EPA" src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                  <div className="text-lime-500 text-center text-xl font-bold">EPA.<span className='text-lg text-orange-500'>Mall</span></div>
                              </div>
                              : 
                              <div className="flex flex-cols gap-2">
                                  <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                  <div>{ storeItem.name }</div>
                              </div>
                          }
                      </div>
                      : 
                      ''
                  }
              </NavLink>
          </div>
      )) }
      {/* <NavLink to={ item.stocks ? '/product' : '/service' } state={ item }> */}
        { !item.isConfirmed && !item.isCancelled &&
          <div className="border h-full w-full rounded-xl">
            <div className='relative flex flex-cols gap-2 overflow-hidden rounded-lg shadow-2xl'>
              <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ item.stocks ? '/products/' : '/services/' }` + item.image } />
              <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                <h1 className='font-semibold'>{ item.name.length > 19 ? item.name.substring(0, 19) + "..." : item.name }</h1>
                <h1 className='mt-1 text-sm'>{ item.description.length > 52 ? item.description.substring(0, 52) + "..." : item.description }</h1>
                <div className='grid grid-cols'>
                  <div className='flex flex-cols-2 gap-1'>
                    <div className='text-sm'>Charge for Extra:</div>
                    <div className='text-blue-500 font-semibold text-sm'>{ item.extra.$numberDecimal }</div>
                  </div>
                <div className='flex flex-cols-2 gap-1'>
                    <div className='text-sm'>Delivery Fees:</div>
                    <div className='text-blue-500 font-semibold text-sm'>{ item.fees.$numberDecimal }</div>
                </div>
              </div>
                <div className='flex flex-cols items-center text-lg text-red-500'>
                  <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                  <div className='text-black-800'>{ item.stocks ? ((item.price * (item.token === 'high' ? highToken : lowToken) + item.price) * item.quantity + parseFloat(item.extra.$numberDecimal) + parseFloat(item.fees.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (item.price * (item.token === 'high' ? highToken : lowToken) + item.price + parseFloat(item.extra.$numberDecimal) + parseFloat(item.fees.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                  <div className='text-orange-500 text-sm font-semibold italic px-6'>{ item.stocks ? 'Qty: ' + item.quantity : '' }</div>
                </div>
                <button hidden={ item.category === 'food' } 
                  onClick={ () => orderCancel(item) }
                  className='absolute right-0 bg-red-600 text-white text-xs text-center font-semibold p-2 rounded-l shadow-md'>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        }
      {/* </NavLink> */}
      {/* { item.details.map(det => (
          <div className="flex flex-cols gap-4" key={ det._id }>
            { !det.isConfirmed ? 
            <div className="mt-4 border h-full w-full rounded-xl">
              <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ det.stocks ? '/products/' : '/services/' }` + det.image } />
                <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                  <h1 className='font-semibold'>{ det.name.length > 19 ? det.name.substring(0, 19) + "..." : det.name }</h1>
                  <h1 className='mt-1 text-sm'>{ det.description.length > 52 ? det.description.substring(0, 52) + "..." : det.description }</h1>
                  <div className='flex flex-cols items-center text-lg text-red-500'>
                      <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                      <div className='text-black-800'>{ det.stocks ? ((det.price * (det.token === 'high' ? highToken : lowToken) + det.price) * det.quantity).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (det.price * (det.token === 'high' ? highToken : lowToken) + det.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                      <div className='text-orange-500 text-sm font-semibold italic px-6'>{ det.stocks ? 'Qty: ' + det.quantity : '' }</div>
                  </div>
                </div>
              </div>
            </div>
              : 
              '' 
            }
          </div>
        )) } */}
        { !item.isConfirmed && !item.isCancelled && (
          <div className='flex justify-end rounded-lg gap-2 pt-3'>
            <NavLink to="/display-orderReceipt" state={ item }>
              <div className='flex items-center text-gray-400'>
                <FaReceipt color='#84CC16' />
                <p className='text-xs'>View Order Receipt</p>
              </div>
            </NavLink>
          </div>
        ) }
    </div>
  ))

  const displayToShip = orders.map(item => (
    <div className='mt-6' key={ item._id }>
      { item.isConfirmed && !item.isShipped && !item.isCancelled && stores.map(storeItem => (
          <div className="flex flex-cols font-semibold" key={ storeItem._id }>
              <NavLink to='/store' state={ storeItem }>
                  { storeItem.owner === item.owner ? 
                      <div className='flex gap-2 mb-2'>
                          { item.owner === process.env.EPA_ACCT_ID ? 
                              <div className="flex flex-cols gap-2">
                                  <img className='w-6 h-6' alt="EPA" src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                  <div className="text-lime-500 text-center text-xl font-bold">EPA.<span className='text-lg text-orange-500'>Mall</span></div>
                              </div>
                              : 
                              <div className="flex flex-cols gap-2">
                                  <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                  <div>{ storeItem.name }</div>
                              </div>
                          }
                      </div>
                      : 
                      ''
                  }
              </NavLink>
          </div>
      )) }
      {/* <NavLink to={ item.stocks ? '/product' : '/service' } state={ item }> */}
        { item.isConfirmed && !item.isShipped && !item.isCancelled &&
          <div className="border h-full w-full rounded-xl">
            <div className='relative flex flex-cols gap-2 overflow-hidden rounded-lg shadow-2xl'>
              <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ item.stocks ? '/products/' : '/services/' }` + item.image } />
              <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                <h1 className='font-semibold'>{ item.name.length > 19 ? item.name.substring(0, 19) + "..." : item.name }</h1>
                <h1 className='mt-1 text-sm'>{ item.description.length > 52 ? item.description.substring(0, 52) + "..." : item.description }</h1>
                <div className='grid grid-cols'>
                  <div className='flex flex-cols-2 gap-1'>
                      <div className='text-sm'>Charge for Extra:</div>
                      <div className='text-blue-500 font-semibold text-sm'>{ item.extra.$numberDecimal }</div>
                  </div>
                  <div className='flex flex-cols-2 gap-1'>
                      <div className='text-sm'>Delivery Fees:</div>
                      <div className='text-blue-500 font-semibold text-sm'>{ item.fees.$numberDecimal }</div>
                  </div>
                </div>
                <div className='flex flex-cols items-center text-lg text-red-500'>
                  <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                  <div className='text-black-800'>{ item.stocks ? ((item.price * (item.token === 'high' ? highToken : lowToken) + item.price) * item.quantity + parseFloat(item.extra.$numberDecimal) + parseFloat(item.fees.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (item.price * (item.token === 'high' ? highToken : lowToken) + item.price + parseFloat(item.extra.$numberDecimal) + parseFloat(item.fees.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                  <div className='text-orange-500 text-sm font-semibold italic px-6'>{ item.stocks ? 'Qty: ' + item.quantity : '' }</div>
                </div>
                <button 
                  onClick={ () => orderCancel(item) }
                  className='absolute right-0 bg-red-600 text-white text-xs text-center font-semibold p-2 rounded-l shadow-md'>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        }
      {/* </NavLink> */}
      {/* { item.details.map(det => (
          <div className="flex flex-cols gap-4" key={ det._id }>
            { !det.isShipped ? 
            <div className="mt-4 border h-full w-full rounded-xl">
              <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ det.stocks ? '/products/' : '/services/' }` + det.image } />
                <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                  <h1 className='font-semibold'>{ det.name.length > 19 ? det.name.substring(0, 19) + "..." : det.name }</h1>
                  <h1 className='mt-1 text-sm'>{ det.description.length > 52 ? det.description.substring(0, 52) + "..." : det.description }</h1>
                  <div className='flex flex-cols items-center text-lg text-red-500'>
                      <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                      <div className='text-black-800'>{ det.stocks ? ((det.price * (det.token === 'high' ? highToken : lowToken) + det.price) * det.quantity).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (det.price * (det.token === 'high' ? highToken : lowToken) + det.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                      <div className='text-orange-500 text-sm font-semibold italic px-6'>{ det.stocks ? 'Qty: ' + det.quantity : '' }</div>
                  </div>
                </div>
              </div>
            </div>
              : 
              '' 
            }
          </div>
        )) } */}
         { item.isConfirmed && !item.isShipped && !item.isCancelled && (
          <div className='flex justify-end rounded-lg gap-2 pt-3'>
            <NavLink to="/display-orderReceipt" state={ item }>
              <div className='flex items-center text-gray-400'>
                <FaReceipt color='#84CC16' />
                <p className='text-xs'>View Order Receipt</p>
              </div>
            </NavLink>
          </div>
        ) }
    </div>
  ))

  const displayToReceive = orders.map(item => (
    <div className='mt-6' key={ item._id }>
      { item.isConfirmed && item.isShipped && stores.map(storeItem => (
          <div className="flex flex-cols font-semibold" key={ storeItem._id }>
              <NavLink to='/store' state={ storeItem }>
                  { storeItem.owner === item.owner ? 
                      <div className='flex gap-2 mb-2'>
                          { item.owner === process.env.EPA_ACCT_ID ? 
                              <div className="flex flex-cols gap-2">
                                  <img className='w-6 h-6' alt="EPA" src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                  <div className="text-lime-500 text-center text-xl font-bold">EPA.<span className='text-lg text-orange-500'>Mall</span></div>
                              </div>
                              : 
                              <div className="flex flex-cols gap-2">
                                  <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                  <div>{ storeItem.name }</div>
                              </div>
                          }
                      </div>
                      : 
                      ''
                  }
              </NavLink>
          </div>
      )) }
      <NavLink to={ item.stocks ? '/product' : '/service' } state={ item }>
        { item.isConfirmed && item.isShipped && 
          <div className="border h-full w-full rounded-xl">
            <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
              <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ item.stocks ? '/products/' : '/services/' }` + item.image } />
              <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                <h1 className='font-semibold'>{ item.name.length > 19 ? item.name.substring(0, 19) + "..." : item.name }</h1>
                <h1 className='mt-1 text-sm'>{ item.description.length > 52 ? item.description.substring(0, 52) + "..." : item.description }</h1>
                <div className='grid grid-cols'>
                  <div className='flex flex-cols-2 gap-1'>
                      <div className='text-sm'>Charge for Extra:</div>
                      <div className='text-blue-500 font-semibold text-sm'>{ item.extra.$numberDecimal }</div>
                  </div>
                  <div className='flex flex-cols-2 gap-1'>
                      <div className='text-sm'>Delivery Fees:</div>
                      <div className='text-blue-500 font-semibold text-sm'>{ item.fees.$numberDecimal }</div>
                  </div>
                </div>
                <div className='flex flex-cols items-center text-lg text-red-500'>
                  <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                  <div className='text-black-800'>{ item.stocks ? ((item.price * (item.token === 'high' ? highToken : lowToken) + item.price) * item.quantity + parseFloat(item.extra.$numberDecimal) + parseFloat(item.fees.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (item.price * (item.token === 'high' ? highToken : lowToken) + item.price + parseFloat(item.extra.$numberDecimal) + parseFloat(item.fees.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                  <div className='text-orange-500 text-sm font-semibold italic px-6'>{ item.stocks ? 'Qty: ' + item.quantity : '' }</div>
                </div>
              </div>
            </div>
          </div>
        }
      </NavLink>
      {/* { item.details.map(det => (
          <div className="flex flex-cols gap-4" key={ det._id }>
            { det.isShipped ? 
            <div className="mt-4 border h-full w-full rounded-xl">
              <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ det.stocks ? '/products/' : '/services/' }` + det.image } />
                <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                  <h1 className='font-semibold'>{ det.name.length > 19 ? det.name.substring(0, 19) + "..." : det.name }</h1>
                  <h1 className='mt-1 text-sm'>{ det.description.length > 52 ? det.description.substring(0, 52) + "..." : det.description }</h1>
                  <div className='flex flex-cols items-center text-lg text-red-500'>
                      <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                      <div className='text-black-800'>{ det.stocks ? ((det.price * (det.token === 'high' ? highToken : lowToken) + det.price) * det.quantity).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (det.price * (det.token === 'high' ? highToken : lowToken) + det.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                      <div className='text-orange-500 text-sm font-semibold italic px-6'>{ det.stocks ? 'Qty: ' + det.quantity : '' }</div>
                  </div>
                </div>
              </div>
            </div>
              : 
              '' 
            }
          </div>
        )) } */}
        { item.isConfirmed && item.isShipped && (
          <div className='flex justify-end rounded-lg gap-2 pt-3'>
            <NavLink to="/display-orderReceipt" state={ item }>
              <div className='flex items-center text-gray-400'>
                <FaReceipt color='#84CC16' />
                <p className='text-xs'>View Order Receipt</p>
              </div>
            </NavLink>
          </div>
        ) }
    </div>
  ))

  const displayCancelled = orders.map(item => (
    <div className='mt-6' key={ item._id }>
      { item.isCancelled && stores.map(storeItem => (
        <div className="flex flex-cols font-semibold" key={ storeItem._id }>
          <NavLink to='/store' state={ storeItem }>
            { storeItem.owner === item.owner ? 
                <div className='flex gap-2 mb-2'>
                    { item.owner === process.env.EPA_ACCT_ID ? 
                        <div className="flex flex-cols gap-2">
                            <img className='w-6 h-6' alt="EPA" src={ window.location.origin + '/public/stores/' + storeItem.image } />
                            <div className="text-lime-500 text-center text-xl font-bold">EPA.<span className='text-lg text-orange-500'>Mall</span></div>
                        </div>
                        : 
                        <div className="flex flex-cols gap-2">
                            <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                            <div>{ storeItem.name }</div>
                        </div>
                    }
                </div>
                : 
                ''
            }
          </NavLink>
        </div>
        )) }
    <NavLink to={ item.stocks ? '/product' : '/service' } state={ item }>
      { item.isCancelled && 
        <div className="border h-full w-full rounded-xl">
          <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
            <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ item.stocks ? '/products/' : '/services/' }` + item.image } />
            <div className='flex flex-col pl-1 text-bold text-md justify-center'>
              <h1 className='font-semibold'>{ item.name.length > 19 ? item.name.substring(0, 19) + "..." : item.name }</h1>
              <h1 className='mt-1 text-sm'>{ item.description.length > 52 ? item.description.substring(0, 52) + "..." : item.description }</h1>
              <div className='grid grid-cols'>
                <div className='flex flex-cols-2 gap-1'>
                  <div className='text-sm'>Charge Extra:</div>
                  <div className='text-blue-500 font-semibold text-sm'>{ item.extra.$numberDecimal }</div>
                </div>
                <div className='flex flex-cols-2 gap-1'>
                  <div className='text-sm'>Delivery Fees:</div>
                  <div className='text-blue-500 font-semibold text-sm'>{ item.fees.$numberDecimal }</div>
                </div>
              </div>
              <div className='flex flex-cols items-center text-lg text-red-500'>
                <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                <div className='text-black-800'>{ item.stocks ? ((item.price * (item.token === 'high' ? highToken : lowToken) + item.price) * item.quantity + parseFloat(item.extra.$numberDecimal) + parseFloat(item.fees.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (item.price * (item.token === 'high' ? highToken : lowToken) + item.price + parseFloat(item.extra.$numberDecimal) + parseFloat(item.fees.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                <div className='text-orange-500 text-sm font-semibold italic px-6'>{ item.stocks ? 'Qty: ' + item.quantity : '' }</div>
              </div>
            </div>
          </div>
        </div>
      }
      </NavLink>
      {/* { item.details.map(det => (
          <div className="flex flex-cols gap-4" key={ det._id }>
            { !det.isShipped ? 
            <div className="mt-4 border h-full w-full rounded-xl">
              <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ det.stocks ? '/products/' : '/services/' }` + det.image } />
                <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                  <h1 className='font-semibold'>{ det.name.length > 19 ? det.name.substring(0, 19) + "..." : det.name }</h1>
                  <h1 className='mt-1 text-sm'>{ det.description.length > 52 ? det.description.substring(0, 52) + "..." : det.description }</h1>
                  <div className='flex flex-cols items-center text-lg text-red-500'>
                      <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                      <div className='text-black-800'>{ det.stocks ? ((det.price * (det.token === 'high' ? highToken : lowToken) + det.price) * det.quantity).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (det.price * (det.token === 'high' ? highToken : lowToken) + det.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                      <div className='text-orange-500 text-sm font-semibold italic px-6'>{ det.stocks ? 'Qty: ' + det.quantity : '' }</div>
                  </div>
                </div>
              </div>
            </div>
              : 
              '' 
            }
          </div>
        )) } */}
        { item.isCancelled && (
          <div className='flex justify-end rounded-lg gap-2 pt-3'>
            <NavLink to="/display-orderReceipt" state={ item }>
              <div className='flex items-center text-gray-400'>
                <FaReceipt color='#84CC16' />
                <p className='text-xs'>View Order Receipt</p>
              </div>
            </NavLink>
          </div>
        ) }
    </div>
  ))

  const displayReceived = orders.map(item => (
    <div className='mt-6' key={ item._id }>
      { item.isReceived && stores.map(storeItem => (
          <div className="flex flex-cols font-semibold" key={ storeItem._id }>
              <NavLink to='/store' state={ storeItem }>
                  { storeItem.owner === item.owner ? 
                      <div className='flex gap-2 mb-2'>
                          { item.owner === process.env.EPA_ACCT_ID ? 
                              <div className="flex flex-cols gap-2">
                                  <img className='w-6 h-6' alt="EPA" src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                  <div className="text-lime-500 text-center text-xl font-bold">EPA.<span className='text-lg text-orange-500'>Mall</span></div>
                              </div>
                              : 
                              <div className="flex flex-cols gap-2">
                                  <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                  <div>{ storeItem.name }</div>
                              </div>
                          }
                      </div>
                      : 
                      ''
                  }
              </NavLink>
          </div>
      )) }
      <NavLink to={ item.stocks ? '/product' : '/service' } state={ item }>
      { item.isReceived && 
        <div className="mt-4 border h-full w-full rounded-xl">
          <div className='relative flex flex-cols gap-2 rounded-lg shadow-2xl'>
            <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ item.stocks ? '/products/' : '/services/' }` + item.image } />
            <div className='flex flex-col pl-1 text-bold text-md justify-center'>
              <h1 className='font-semibold'>{ item.name.length > 19 ? item.name.substring(0, 19) + "..." : item.name }</h1>
              <h1 className='mt-1 text-sm'>{ item.description.length > 52 ? item.description.substring(0, 52) + "..." : item.description }</h1>
              <div className='grid grid-cols'>
                <div className='flex flex-cols-2 gap-1'>
                    <div className='text-sm'>Charge for Extra:</div>
                    <div className='text-blue-500 font-semibold text-sm'>{ item.extra.$numberDecimal }</div>
                </div>
                <div className='flex flex-cols-2 gap-1'>
                    <div className='text-sm'>Delivery Fees:</div>
                    <div className='text-blue-500 font-semibold text-sm'>{ item.fees.$numberDecimal }</div>
                </div>
              </div>
              <div className='flex flex-cols items-center text-lg text-red-500'>
                <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                <div className='text-black-800'>{ item.stocks ? ((item.price * (item.token === 'high' ? highToken : lowToken) + item.price) * item.quantity + parseFloat(item.extra.$numberDecimal) + parseFloat(item.fees.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (item.price * (item.token === 'high' ? highToken : lowToken) + item.price + parseFloat(item.extra.$numberDecimal) + parseFloat(item.fees.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                <div className='text-orange-500 text-sm font-semibold italic px-6'>{ item.stocks ? 'Qty: ' + item.quantity : '' }</div>
              </div>
              <button                 
                  onClick={ () => declineReceived(item) }
                  className='absolute right-0 bg-red-600 text-white text-xs text-center font-semibold p-2 rounded-l shadow-md'>
                  No Item?
              </button>
            </div>
          </div>
        </div>
        }
      </NavLink>
      {/* { item.details.map(det => (
          <div className="flex flex-cols gap-4" key={ det._id }>
            { !det.isShipped ? 
            <div className="mt-4 border h-full w-full rounded-xl">
              <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                <img className='object-contain h-20 w-2/5' src={ window.location.origin + '/public' + `${ det.stocks ? '/products/' : '/services/' }` + det.image } />
                <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                  <h1 className='font-semibold'>{ det.name.length > 19 ? det.name.substring(0, 19) + "..." : det.name }</h1>
                  <h1 className='mt-1 text-sm'>{ det.description.length > 52 ? det.description.substring(0, 52) + "..." : det.description }</h1>
                  <div className='flex flex-cols items-center text-lg text-red-500'>
                      <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                      <div className='text-black-800'>{ det.stocks ? ((det.price * (det.token === 'high' ? highToken : lowToken) + det.price) * det.quantity).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (det.price * (det.token === 'high' ? highToken : lowToken) + det.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                      <div className='text-orange-500 text-sm font-semibold italic px-6'>{ det.stocks ? 'Qty: ' + det.quantity : '' }</div>
                  </div>
                </div>
              </div>
            </div>
              : 
              '' 
            }
          </div>
        )) } */}
        { item.isReceived && (
          <div className='flex justify-end rounded-lg gap-2 pt-3'>
            <NavLink to="/display-orderReceipt" state={ item }>
              <div className='flex items-center text-gray-400'>
                <FaReceipt color='#84CC16' />
                <p className='text-xs'>View Order Receipt</p>
              </div>
            </NavLink>
          </div>
        ) }
    </div>
  ))

  return (
    <>
        <div className='px-6 mt-10 mb-6 font-montserrat'>
            <div className='flex items-center gap-2'>
                <FaArrowAltCircleLeft onClick={ () => goBack() } className='text-4xl'/>
            </div>
            <div className='flex justify-center gap-2 text-3xl -mt-7'>
              <h1 className='font-semibold text-xl'>My Orders</h1>
            </div>
        </div>

        <ThemeProvider theme={theme}>
            <Box>
                <Tabs
                    value={value}
                    onChange={ handleChange }
                    variant="scrollable"
                    scrollButtons={ false }
                    aria-label="scrollable prevent tabs example"
                    textColor='primary'
                    // centered
                >
                    <Tab label="All" />
                    <Tab label="To Confirm" />
                    <Tab label="To Ship" />
                    <Tab label="To Receive" />
                    <Tab label="Cancelled" />
                    <Tab label="Received" />
                </Tabs>
                <TabPanel value={ value } index={ 0 }>
                    { orders.length ? displayAll : displayListEmpty }  
                </TabPanel>
                <TabPanel value={ value } index={ 1 }>
                    { orders.find(item => !item.isConfirmed && !item.isCancelled) ? displayToConfirm : displayListEmpty }  
                </TabPanel>
                <TabPanel value={ value } index={ 2 }>
                    { orders.find(item => item.isConfirmed && !item.isShipped && !item.isCancelled) ? displayToShip : displayListEmpty }  
                </TabPanel>
                <TabPanel value={ value } index={ 3 }>
                    { orders.find(item => item.isConfirmed && item.isShipped) ? displayToReceive : displayListEmpty }  
                </TabPanel>
                <TabPanel value={ value } index={ 4 }>
                    { orders.find(item => item.isCancelled) ? displayCancelled : displayListEmpty }  
                </TabPanel>
                <TabPanel value={ value } index={ 5 }>
                    { orders.find(item => item.isReceived) ? displayReceived : displayListEmpty }  
                </TabPanel>
                {/* <TabPanel value={value} index={1}>
                    { orders.find(item => item.isPaid === false) ? displayToPay : displayListEmpty }
                </TabPanel> */}
                {/* <TabPanel value={value} index={2}>
                    { orders.filter(item => !item.details.isConfirmed) ? displayToConfirm : displayListEmpty }
                </TabPanel>
                <TabPanel value={value} index={2}>
                    { orders.filter(item => !item.details.isShipped) ? displayToShip : displayListEmpty }
                </TabPanel>
                <TabPanel value={value} index={3}>
                    { orders.filter(item => item.details.isShipped) ? displayToReceive : displayListEmpty }
                </TabPanel>
                <TabPanel value={value} index={4}>
                    { displayListEmpty }   
                </TabPanel> */}
            </Box>
        </ThemeProvider>

        <div className='mb-20'/>

        <ToastContainer
          position='top-right'
          autoClose={ 1000 }
          hideProgressBar={ true }
          newestOnTop={ false }
          closeOnClick
          rtl={ false }
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='colored'
        />

        < NavbarMobile /> 
    </>
  );
}