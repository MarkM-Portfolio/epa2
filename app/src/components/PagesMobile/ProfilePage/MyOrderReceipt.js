import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import noReceiptImg from '../../../assets/noreceipt.png'

const MyOrderReceipt = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [ orders, setOrders ] = useState('')

  useEffect(() => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    if (state) {
      axios.get(`/api/order/${ state.orderId }`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Key': process.env.API_KEY
        },
        data: { cancelToken: source.token }
    }).then(res => {
        console.log('Success OK: ', res.status)
        setOrders(res.data.order)
        // setOrders(res.data.orders.filter(item => item.email.includes(user.email)))
    }).catch((err) => {
        if (axios.isCancel(err)) console.log('Successfully Aborted')
        else console.error(err)
    })

    return () => { source.cancel() }
    }
}, [ state ])

const goBack = () => {
    navigate(-1)
  }

  return (
    <>
    <div className='px-6 mt-10 mb-6 font-montserrat'>
            <div className='flex items-center gap-6'>
                <FaArrowAltCircleLeft onClick={ () => goBack() } className='text-4xl'/>
                <h1 className='font-semibold text-xl'>Order Receipt</h1>
            </div>
        </div>
    <div>
        { orders && ((
            <div className='flex flex-wrap items-center px-6 gap-2'>
                <h3 className='font-md'>Order Receipt 1</h3>
                { orders.idImage1 ? 
                    <img className='object-contain mb-2 h-40 w-full' src={window.location.origin + '/private/order/' + orders.idImage1} />
                    :
                    <img className='object-contain mb-2 h-40 w-full' src={ noReceiptImg } />
                }
                <h3 className='font-md'>Order Receipt 2</h3>
                { orders.idImage2 ? 
                    <img className='object-contain mb-2 h-40 w-full' src={window.location.origin + '/private/order/' + orders.idImage2} />
                    :
                    <img className='object-contain mb-2 h-40 w-full' src={ noReceiptImg } />
                }
                <h3 className='font-md'>Order Receipt 3</h3>
                { orders.idImage3 ? 
                    <img className='object-contain mb-2 h-40 w-full' src={window.location.origin + '/private/order/' + orders.idImage3} />
                    :
                    <img className='object-contain mb-2 h-40 w-full' src={ noReceiptImg } />
                }
            </div>          
        )) }
    </div>
    </>
  )
};

export default MyOrderReceipt
