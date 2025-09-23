import React, { useState, useEffect } from 'react'
// import Cookies from 'universal-cookie'
import axios from 'axios'
// import { useDetectClickOutside } from 'react-detect-click-outside'
import { TbCurrencyPeso } from 'react-icons/tb'

export const MembersTable = () => {
  // const cookies = new Cookies()
  // const [ user ] = useState(cookies.get('user'))
  const [ newUsers, setNewUsers ] = useState([])
  const [ allUsers, setAllUsers ] = useState([])
  const [ isVisible, setIsVisible ] = useState(false)
  const [ monthFilter, setMonthFilter ] = useState('')
  const [ isLoading, setIsLoading ] = useState(false)

  useEffect(() => {
    setIsLoading(true)

    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    axios.get(`/api/user`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Key': process.env.API_KEY
        },
        data: { cancelToken: source.token }
    }).then(res => {
        console.log('Success OK: ', res.status)
        const sortedUsers = res.data.users
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setNewUsers(sortedUsers.slice(0, 10))
        setAllUsers(sortedUsers)
    }).catch((err) => {
        if (axios.isCancel(err)) console.log('Successfully Aborted')
        else console.error(err)
    }).finally(() => {
        setIsLoading(false)
    })
    return () => { source.cancel() }
  }, [ ])

  const toggleVisible = () => {
    setIsVisible(!isVisible)
  }
  
  // const ref = useDetectClickOutside({ onTriggered: () => setIsVisible(false) })
  
  const formatDate = (inputDate) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }
  
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(inputDate)
    return formattedDate
  }

  const formatCurrency = (number) => {
    if (isNaN(number)) {
      return number
    }
  
    if (number === 0) {
      return <><TbCurrencyPeso/>0</>
    }

    const suffixes = ['', 'K', 'M', 'B', 'T']
    const suffixIndex = Math.floor(Math.log10(Math.abs(number)) / 3)
    const scaledNumber = number / Math.pow(10, suffixIndex * 3)
    const formattedNumber = scaledNumber.toFixed(2)
    const result = formattedNumber + suffixes[suffixIndex]

    return <><TbCurrencyPeso />{ result }</>
  }

  const data = [], filterData = []

  newUsers.forEach((item, idx) => (
    data.push({ 'id': idx + 1, 'name': item.name, 'email': item.email, 'avatar': item.avatar, 'class': item.rank ? item.rank : item.class, 'earnings': parseFloat(item.totalIncome.$numberDecimal), 'date': item.createdAt })
  ))

  allUsers.forEach((item, idx) => (
    filterData.push({ 'id': idx + 1, 'name': item.name, 'email': item.email, 'avatar': item.avatar, 'class': item.rank ? item.rank : item.class, 'earnings': parseFloat(item.totalIncome.$numberDecimal), 'date': item.createdAt })
  ))

  const displayNew = data.map(item => (
    <div key={ item.id } className="flex border-b gap-3 py-3">

      <svg className="text-blue-300" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="42" height="36" viewBox="0 0 512 512">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <span className="flex items-center justify-center bg-orange-100 rounded-full">
              {/* profile image here else svg */}
              <img src={ item.avatar ? window.location.origin + '/private/avatar/' + item.avatar : 'https://source.unsplash.com/uJ8LNVCBjFQ/400x400' } style={{ borderRadius: '50%', width: '100%', height: '100%' }} />
            </span>
          </div>
        </foreignObject>
        {/* <path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" /> */}
      </svg>

      <div>
        <h1 className="text-md font-medium leading-4 mb-1">{ item.name > 24 ? item.name.substring(0, 24) + "..." : item.name }</h1>
        <p className="text-xs text-orange-500">{ item.email.length > 24 ? item.email.substring(0, 24) + "..." : item.email }</p>
        <p className="text-xs text-sky-700">{ item.class }</p>
      </div>
      
      <div className="ml-auto">
        <p className="leading-4 text-green-600 font-semibold flex flex-cols justify-end">{ formatCurrency(item.earnings) }</p>
        <small>{ formatDate(new Date(item.date)) }</small>
      </div>

    </div>
  ))

  const displayFilter = filterData.map(item => (
    <div key={ item.id }>
      { monthFilter && formatDate(new Date(item.date)).split(' ')[0] === monthFilter && (
        <div className="flex border-b gap-3 py-3">

          <svg className="text-blue-300" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="42" height="36" viewBox="0 0 512 512">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml">
                <span className="flex items-center justify-center bg-orange-100 rounded-full">
                  {/* profile image here else svg */}
                  <img src={ item.avatar ? window.location.origin + '/private/avatar/' + item.avatar : 'https://source.unsplash.com/uJ8LNVCBjFQ/400x400' } style={{ borderRadius: '50%', width: '100%', height: '100%' }} />
                </span>
              </div>
            </foreignObject>
            {/* <path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" /> */}
          </svg>

          <div>
            <h1 className="text-md font-medium leading-4 mb-1">{ item.name }</h1>
            <p className="text-xs text-sky-700">{ item.class }</p>
          </div>
          
          <div className="ml-auto">
            <p className="leading-4 text-green-600 font-semibold flex flex-cols justify-end">{ formatCurrency(item.earnings) }</p>
            <small>{ formatDate(new Date(item.date)) }</small>
          </div>

        </div>
      )}
    </div>
  ))

  return (
    <div>

      { isLoading && ((
          <div className="fixed top-0 left-0 w-full h-full bg-gray-300 opacity-50 z-50 flex justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                  <rect width={10} height={10} x={1} y={1} fill="#FF441F" rx={1}>
                      <animate id="svgSpinnersBlocksShuffle30" fill="freeze" attributeName="x" begin="0;svgSpinnersBlocksShuffle3b.end" dur="0.2s" values="1;13"></animate>
                      <animate id="svgSpinnersBlocksShuffle31" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle38.end" dur="0.2s" values="1;13"></animate>
                      <animate id="svgSpinnersBlocksShuffle32" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle39.end" dur="0.2s" values="13;1"></animate>
                      <animate id="svgSpinnersBlocksShuffle33" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle3a.end" dur="0.2s" values="13;1"></animate>
                  </rect>
                  <rect width={10} height={10} x={1} y={13} fill="#0D8CFF" rx={1}>
                      <animate id="svgSpinnersBlocksShuffle34" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle30.end" dur="0.2s" values="13;1"></animate>
                      <animate id="svgSpinnersBlocksShuffle35" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle31.end" dur="0.2s" values="1;13"></animate>
                      <animate id="svgSpinnersBlocksShuffle36" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle32.end" dur="0.2s" values="1;13"></animate>
                      <animate id="svgSpinnersBlocksShuffle37" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle33.end" dur="0.2s" values="13;1"></animate>
                  </rect><rect width={10} height={10} x={13} y={13} fill="#10A555" rx={1}>
                      <animate id="svgSpinnersBlocksShuffle38" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle34.end" dur="0.2s" values="13;1"></animate>
                      <animate id="svgSpinnersBlocksShuffle39" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle35.end" dur="0.2s" values="13;1"></animate>
                      <animate id="svgSpinnersBlocksShuffle3a" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle36.end" dur="0.2s" values="1;13"></animate>
                      <animate id="svgSpinnersBlocksShuffle3b" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle37.end" dur="0.2s" values="1;13"></animate>
                  </rect>
              </svg>
          </div>
      )) }

      <div className="absolute right-2 top-4 cursor-pointer">
        <div className="relative">
          <span /* ref={ ref } */ className="flex items-center justify-center w-6 h-6 rounded-full" onClick={ toggleVisible }>
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 128 512">
              <path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" />
            </svg>
          </span>
          { isVisible && (
            <ul className="absolute -right-2 top-full rounded py-2 bg-white shadow-2xl h-fit w-40">
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter(''), setIsVisible(false) } }>
                Newest 10
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter('Jan'), setIsVisible(false) } }>
                January
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter('Feb'), setIsVisible(false) } }>
                February
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter('Mar'), setIsVisible(false) } }>
                March
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter('Apr'), setIsVisible(false) } }>
                April
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter('May'), setIsVisible(false) } }>
                May
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter('Jun'), setIsVisible(false) } }>
                June
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter('Jul'), setIsVisible(false) } }>
                July
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter('Aug'), setIsVisible(false) } }>
                August
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter('Sep'), setIsVisible(false) } }>
                September
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter('Oct'), setIsVisible(false) } }>
                October
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter('Nov'), setIsVisible(false) } }>
                November
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { setMonthFilter('Dec'), setIsVisible(false) } }>
                December
              </li>
            </ul> 
          ) }
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        { monthFilter ? displayFilter : displayNew }
      </div>

    </div>
  )
}
