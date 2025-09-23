import React, { useState, useEffect } from 'react'
import axios from 'axios'
// import { useDetectClickOutside } from 'react-detect-click-outside'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  Filler,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
)

export const AreaChart = () => {
  const [ allUsers, setAllUsers ] = useState([])
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
        setAllUsers(sortedUsers)
    }).catch((err) => {
        if (axios.isCancel(err)) console.log('Successfully Aborted')
        else console.error(err)
    }).finally(() => {
        setIsLoading(false)
    })
    return () => { source.cancel() }
  }, [ ])

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

  let janTotal = 0, febTotal = 0, marTotal = 0, aprTotal = 0, mayTotal = 0, junTotal = 0,
      julTotal = 0, augTotal = 0, sepTotal = 0, octTotal = 0, novTotal = 0, decTotal = 0

  allUsers.forEach((item, idx) => {
    if (formatDate(new Date(item.createdAt)).split(' ')[0] === 'Jan') {
      janTotal ++
    }
    if (formatDate(new Date(item.createdAt)).split(' ')[0] === 'Feb') {
      febTotal ++
    }
    if (formatDate(new Date(item.createdAt)).split(' ')[0] === 'Mar') {
      marTotal ++
    }
    if (formatDate(new Date(item.createdAt)).split(' ')[0] === 'Apr') {
      aprTotal ++
    }
    if (formatDate(new Date(item.createdAt)).split(' ')[0] === 'May') {
      mayTotal ++
    }
    if (formatDate(new Date(item.createdAt)).split(' ')[0] === 'Jun') {
      junTotal ++
    }
    if (formatDate(new Date(item.createdAt)).split(' ')[0] === 'Jul') {
      julTotal ++
    }
    if (formatDate(new Date(item.createdAt)).split(' ')[0] === 'Aug') {
      augTotal ++
    }
    if (formatDate(new Date(item.createdAt)).split(' ')[0] === 'Sep') {
      sepTotal ++
    }
    if (formatDate(new Date(item.createdAt)).split(' ')[0] === 'Oct') {
      octTotal ++
    }
    if (formatDate(new Date(item.createdAt)).split(' ')[0] === 'Nov') {
      novTotal ++
    }
    if (formatDate(new Date(item.createdAt)).split(' ')[0] === 'Dec') {
      decTotal ++
    }
  })

  // Chart data
  const data = [
    {
      id: 5,
      label: '2024 Jan',
      joinings: janTotal
    },
    {
      id: 6,
      label: '2024 Feb',
      joinings: febTotal
    },
    {
      id: 7,
      label: '2024 Mar',
      joinings: marTotal
    },
    {
      id: 8,
      label: '2024 Apr',
      joinings: aprTotal
    },
    {
      id: 9,
      label: '2024 May',
      joinings: mayTotal
    },
    {
      id: 10,
      label: '2024 Jun',
      joinings: junTotal
    },
    {
      id: 11,
      label: '2024 Jul',
      joinings: julTotal
    },
    {
      id: 12,
      label: '2024 Aug',
      joinings: augTotal
    },
    {
      id: 13,
      label: '2024 Sep',
      joinings: sepTotal
    },
    {
      id: 14,
      label: '2024 Oct',
      joinings: octTotal
    },
    {
      id: 15,
      label: '2024 Nov',
      joinings: novTotal
    },
    {
      id: 16,
      label: '2024 Dec',
      joinings: decTotal
    }
  ]

  data.unshift({ id: 4, label: '2023 Jan', joinings: 0 })
  data.unshift({ id: 3, label: '2022 Jan', joinings: 0 })
  data.unshift({ id: 2, label: '2021 Jan', joinings: 0 })
  data.unshift({ id: 1, label: '2020 Jan', joinings: 0 })

  const formatLabel = (str) => {
    if (typeof str === 'string') {
      const part = str.split(' ')
      return part[0] + ' ' + part[1]
    }
    return str
  }

  const [ isVisible, setIsVisible ] = useState(false)
  const [ computedLabel, setComputedLabel ] = useState('')
  const [ computedJoinings, setComputedJoinings ] = useState('')

  const toggleSort = (val) => {
    if (val === 'year') {
      setComputedLabel([...Array.from(new Set(data.map(item => item.label.split(' ')[0])))])
      setComputedJoinings(data.reduce((acc, entry) => {
        const year = entry.label.split(' ')[0]
        acc[year] = (acc[year] || 0) + entry.joinings
        return acc
      }, {}))
    } else if (val === 'day') {
      const result = []
      const lastLabel = data[data.length - 1].label
      // const lastDate = new Date(lastLabel)
      const lastDate = new Date()
      const numberOfDays = 12

      Array.from({ length: numberOfDays }, (_, index) => {
        // const currentDate = new Date()
        const currentDate = new Date(lastDate)
        currentDate.setDate(lastDate.getDate() - index)
        const date = currentDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
        // const existingData = data.find(item => item.label.includes(date))
        const existingData = allUsers.filter(item => formatDate(new Date(item.createdAt)).split(' ')[0] + ' ' + formatDate(new Date(item.createdAt)).split(' ')[1].replace(',','') === date)

        result.push({
          label: date,
          // joinings: existingData ? existingData.joinings : 0
          joinings: existingData ? existingData.length : 0
        })
      })
      
      setComputedLabel(result.reverse().map(item => item.label))
      setComputedJoinings(result.map(item => item.joinings))
    } else {
      setComputedLabel(data.map(d => formatLabel(d.label)).slice(-12))
      setComputedJoinings(data.map(d => formatLabel(d.joinings)).slice(-12))
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
    scales: {
      y: {
        min: 0,
        suggestedMin: 0
      }
    }
  }

  const dataset = {
    labels: computedLabel ? computedLabel : data.map(d => formatLabel(d.label)).slice(-12),
    datasets: [
      {
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.5,
        fill: true,
        label: 'Joinings',
        data: computedJoinings ? computedJoinings : data.map(d => formatLabel(d.joinings)).slice(-12),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(165, 180, 252, 0.5)',
      }
    ],
  }

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
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { toggleSort('day'), setIsVisible(false) } }>
                  Day
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={ () => { toggleSort('month'), setIsVisible(false) } }>
                Month
              </li>
              <li className="px-5 py-1 hover:bg-gray-500/5" onClick={() => { toggleSort('year'), setIsVisible(false) } }>
                Year
              </li>
            </ul>
          ) }
        </div>
      </div>

      <Line options={ options } data={ dataset } />

    </div>
  )
}