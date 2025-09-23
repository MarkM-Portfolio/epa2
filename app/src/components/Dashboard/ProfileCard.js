import React from 'react'
import { TbCurrencyPeso } from 'react-icons/tb'

export const ProfileCard = ({ name, email, avatar, description, count, currency, product }) => {

  const formatCurrency = (number) => {
    if (isNaN(number)) {
      return number
    }
  
    if (number === 0) {
      return <div className='flex flex-cols-2 items-center'><TbCurrencyPeso/>0</div>
    }

    const suffixes = ['', 'K', 'M', 'B', 'T']
    const suffixIndex = Math.floor(Math.log10(Math.abs(number)) / 3)
    const scaledNumber = number / Math.pow(10, suffixIndex * 3)
    const formattedNumber = scaledNumber.toFixed(2)
    const result = formattedNumber + suffixes[suffixIndex]

    return <div className='flex flex-cols-2 items-center'><TbCurrencyPeso />{ result }</div>
  }

  return (
    <div className="flex border-t gap-3 py-3">

      <svg className="text-blue-300" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="42" height="36" viewBox="0 0 512 512">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <span className="flex items-center justify-center bg-orange-100 rounded-full">
              {/* profile image here else svg */}
              <img src={ avatar ? window.location.origin + '/private/avatar/' + avatar : 'https://source.unsplash.com/uJ8LNVCBjFQ/400x400' } style={{ borderRadius: '50%', width: '100%', height: '100%' }} />
            </span>
          </div>
        </foreignObject>
        {/* <path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" /> */}
      </svg>

      <div>
        <h1 className="text-md font-medium leading-4">{ name.length > 24 ? name.substring(0, 24) + "..." : name }</h1>
        { !product && (
          <p className="text-xs text-orange-500">{ email.length > 24 ? email.substring(0, 24) + "..." : email }</p>
        )}
        <p className={ `${ description ? 'text-sky-700' : 'text-green-500' } text-xs` }>
          { product ? `You have ${ count } ${ name } package purchases in your team.` : description }
        </p>
      </div>

      <div className="ml-auto">
        <span className="rounded block text-center cursor-pointer bg-sky-400 hover:bg-blue-800 text-white px-2 py-1">
          { currency || product ? formatCurrency(count) : count + ' JBA' }
        </span>
      </div>

    </div>
  )
}

ProfileCard.defaultProps = {
  name: 'Pablo',
  count: 1,
  currency: false,
  product: false
}
