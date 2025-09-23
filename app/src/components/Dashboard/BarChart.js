import React, { useState, useEffect } from 'react'
// import { useDetectClickOutside } from 'react-detect-click-outside'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export const BarChart = () => {
  // Chart data
  const data = [
    {
      id: 1,
      label: '2022 Nov',
      income: 203,
      commission: 25
    },
    {
      id: 2,
      label: '2022 Dec',
      income: 390,
      commission: 25
    },
    {
      id: 3,
      label: '2023 Feb',
      income: 5,
      commission: 5
    },
    {
      id: 4,
      label: '2023 Mar',
      income: 200,
      commission: 25
    },
    {
      id: 5,
      label: '2023 Apr',
      income: 5,
      commission: 5
    },
    {
      id: 6,
      label: '2023 May',
      income: 5,
      commission: 5
    },
    {
      id: 7,
      label: '2023 Jun',
      income: 290,
      commission: 10
    },
    {
      id: 8,
      label: '2023 Jul',
      income: 390,
      commission: 25
    },
    {
      id: 9,
      label: '2023 Aug',
      income: 5,
      commission: 5
    },
    {
      id: 10,
      label: '2023 Sep',
      income: 290,
      commission: 10
    },
    {
      id: 11,
      label: '2023 Oct',
      income: 5,
      commission: 5
    }
  ]

  const [ isVisible, setIsVisible ] = useState(false)
  const [ computedLabel, setComputedLabel ] = useState(data.map(d => d.label))
  const [ computedIncome, setComputedIncome ] = useState(data.map(d => d.income))
  const [ computedCommission, setComputedCommission ] = useState(data.map(d => d.commission))

  const toggleSort = (val) => {
    if (val === 'year') {
      setComputedLabel(['2018', '2019', '2020', '2021', ...Array.from(new Set(data.map(item => item.label.split(' ')[0])))])
      setComputedIncome(data.reduce((acc, entry) => {
        const year = entry.label.split(' ')[0]
        acc[year] = (acc[year] || 0) + entry.income
        return acc
      }, {}))
      setComputedCommission(data.reduce((acc, entry) => {
        const year = entry.label.split(' ')[0]
        acc[year] = (acc[year] || 0) + entry.commission
        return acc
      }, {}))
    } else {
      setComputedLabel(data.map(d => d.label))
      setComputedIncome(data.map(d => d.income))
      setComputedCommission(data.map(d => d.commission))
    }
  }

  const toggleVisible = () => {
    setIsVisible(!isVisible)
  }
  
  // const ref = useDetectClickOutside({ onTriggered: () => setIsVisible(false) })
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    },
  }
  
  const dataset = {
    labels: computedLabel,
    datasets: [
      {
        barThickness: 16,
        label: 'Income',
        data: computedIncome,
        backgroundColor: 'rgb(56 189 248)',
      },
      {
        barThickness: 16,
        label: 'Commission',
        data: computedCommission,
        backgroundColor: 'rgb(29 78 216)',
      },
    ],
  }

  return (
    <div>
      <div className="absolute right-2 top-4 cursor-pointer">
        <div className="relative">
          <span /* ref={ ref } */ className="flex items-center justify-center w-6 h-6 rounded-full" onClick={toggleVisible}>
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 128 512">
              <path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" />
            </svg>
          </span>
          { isVisible && (
            <ul className="absolute -right-2 top-full rounded py-2 bg-white shadow-2xl h-fit w-40">
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { toggleSort('month'), setIsVisible(false) } }>
                Month
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { toggleSort('year'), setIsVisible(false) } }>
                Year
              </li>
            </ul>
          ) }
        </div>
      </div>
      <Bar options={ options } data={ dataset } />
    </div>
  )
}
