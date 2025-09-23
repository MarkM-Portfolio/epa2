import React, { useState } from 'react';

export const DataTable = () => {
  const [tab, setTab] = useState(1);

  const formatCurrency = (number) => {
    if (isNaN(number)) {
      return number;
    }
  
    if (number === 0) {
      return '$0';
    }

    const suffixes = ['', 'K', 'M', 'B', 'T'];

    const suffixIndex = Math.floor(Math.log10(Math.abs(number)) / 3);

    const scaledNumber = number / Math.pow(10, suffixIndex * 3);

    const formattedNumber = scaledNumber.toFixed(2);

    const result = '$' + formattedNumber + suffixes[suffixIndex];

    return result;
  }

  const data = {
    income: [
      { id: 1, name: 'Register', value: 2460, initial: 'R' },
      { id: 2, name: 'Commission Charge', value: 22.40, initial: 'C' },
      { id: 3, name: 'Fund Transfer Fee', value: 0, initial: 'F' },
      { id: 4, name: 'Payout Fee', value: 0, initial: 'P' }
    ],
    commission: [
      { id: 1, name: 'Register', value: 2460, initial: 'R' },
      { id: 2, name: 'Commission Charge', value: 22.40, initial: 'C' },
      { id: 3, name: 'Fund Transfer Fee', value: 0, initial: 'F' },
      { id: 4, name: 'Payout Fee', value: 0, initial: 'P' }
    ]
  }
  return (
    <div>
      <div className="flex gap-6 border-b">
        <p onClick={() => setTab(1)} className={`${tab === 1 ? 'after:visible bg-cyan-600/5 text-cyan-600' : 'after:invisible'} relative text-sm cursor-pointer py-1 hover:after:visible after:absolute after:content-[''] after:border-b-2 after:left-0 after:bottom-0 after:right-0 after:border-cyan-600 hover:bg-cyan-600/5 hover:text-cyan-600`}>
          Income
        </p>
        <p onClick={() => setTab(2)} className={`${tab === 2 ? 'after:visible bg-cyan-600/5 text-cyan-600' : 'after:invisible'} relative text-sm cursor-pointer py-1 hover:after:visible after:absolute after:content-[''] after:border-b-2 after:left-0 after:bottom-0 after:right-0 after:border-cyan-600 hover:bg-cyan-600/5 hover:text-cyan-600`}>
          Commission
        </p>
      </div>
      <div className="max-h-96 overflow-y-auto">
        { data[tab === 1 ? 'income' : 'commission'].map(item => (
          <div key={item.id} className="grid grid-cols-4 items-center border-t gap-3 py-3 px-3">
            <div className="col-span-2">
              <h1 className="text-md font-medium leading-4">{ item.name }</h1>
            </div>
            <div>
              <p className="text-green-500">{ formatCurrency(item.value) }</p>
            </div>
            <div className="flex justify-end">
              <span className="rounded block w-20 text-center cursor-pointer bg-sky-400 hover:bg-blue-800 text-white px-4 py-1">
                { item.initial }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
};
