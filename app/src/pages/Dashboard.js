import React, { useState, useEffect } from 'react'
import Cookies from 'universal-cookie'
import axios from 'axios'
import { BalanceCard } from '../components/Dashboard/BalanceCard'
import { BarChart } from '../components/Dashboard/BarChart'
import { AreaChart } from '../components/Dashboard/AreaChart'
import { PerformanceTable } from '../components/Dashboard/PerformanceTable'
import { LeadCapture } from '../components/Dashboard/LeadCapture'
import { DataTable } from '../components/Dashboard/DataTable'
import { MembersTable } from '../components/Dashboard/MembersTable'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Dashboard = () => {

  const cookies = new Cookies()
  const [ user ] = useState(cookies.get('user'))
  // const [ currentUser, setCurrentUser ] = useState([])
  const [ allEpaCash, setAllEpaCash ] = useState([])
  const [ generatedEpaCash, setGeneratedEpaCash ] = useState('')
  const [ distributedEpaCash, setDistributedEpaCash ] = useState('')
  const [ rewards, setRewards ] = useState('')
  const [ totalSubscribers, setTotalSubscribers ] = useState('')

  // useEffect(() => {
  //   const CancelToken = axios.CancelToken
  //   const source = CancelToken.source()

  //   if (user && user.id) {
  //       axios.get(`/api/user/${ user.id }`, {
  //           headers: {
  //               'Content-Type': 'application/json',
  //               'Accept': 'application/json',
  //               'X-Api-Key': process.env.API_KEY
  //           },
  //           data: { cancelToken: source.token }
  //       }).then(res => {
  //           console.log('Success OK: ', res.status)
  //           setCurrentUser(res.data.user)
  //       }).catch((err) => {
  //           if (axios.isCancel(err)) console.log('Successfully Aborted')
  //           else console.error(err)
  //       })
  //       return () => { source.cancel() }
  //   }
  // }, [ user ])

  useEffect(() => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    let totalEpaCash = 0, count = 0

    axios.get(`/api/user`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Key': process.env.API_KEY
        },
        data: { cancelToken: source.token }
    }).then(res => {
        console.log('Success OK: ', res.status)
        res.data.users.forEach(item => {
          count ++
          if (item._id !== process.env.EPA_ACCT_ID)
            totalEpaCash += parseFloat(item.epacash.$numberDecimal)
        })
        setAllEpaCash(totalEpaCash)
        setTotalSubscribers(count)
    }).catch((err) => {
        if (axios.isCancel(err)) console.log('Successfully Aborted')
        else console.error(err)
    })
    return () => { source.cancel() }
  }, [ ])

  useEffect(() => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    let totalGeneratedEpaCash = 0, totalDistributedEpaCash = 0, totalRewards = 0

    if (user && user.id) {
        // axios.get(`/api/load/${ user.id }`, {
        axios.get(`/api/load/${ process.env.EPA_ACCT_ID }`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            res.data.load.forEach(item => {
              if (item.type === 'Generate EPA Cash')
                totalGeneratedEpaCash += parseFloat(item.amount.$numberDecimal)
              if (item.type === 'Send EPA Cash')
                totalDistributedEpaCash += parseFloat(item.amount.$numberDecimal)
              if (item.type === 'Received for personal allowance' && item.type === 'Received for children support benefits' && item.type === 'Received triple (3x) employed salary benefits to EPA Cash' || item.type === 'Received triple (3x) self-employed salary benefits to EPA Cash' || item.type === 'Received double (2x) pension benefits to EPA Cash')
                totalRewards += parseFloat(item.amount.$numberDecimal)
            })
            setGeneratedEpaCash(totalGeneratedEpaCash)
            setDistributedEpaCash(totalDistributedEpaCash)
            setRewards(totalRewards)
        }).catch((err) => {
            if (axios.isCancel(err)) console.log('Successfully Aborted')
            else console.error(err)
        })
        return () => { source.cancel() }
    }
  }, [ user ])

  const data = [
    {
      id: 1,
      name: 'EPA Cash Total',
      description: 'EPA Cash total of all users (except EPA Account Main)',
      bgColor: '#F7FEE7',
      color: '#7E22CE',
      price: allEpaCash
    },
    {
      id: 2,
      name: 'Generated',
      description: 'Total generated EPA Cash',
      bgColor: '#CCFBF1',
      color: '#65A30D',
      price: generatedEpaCash
    },
    {
      id: 3,
      name: 'Distributed',
      description: 'Total distributed EPA Cash',
      bgColor: '#EDE9FE',
      color: '#38BDF8',
      price: distributedEpaCash
    },
    {
      id: 4,
      name: 'Allowances',
      description: 'Total allowances & rewards earned by all users (except EPA Account Main)',
      bgColor: '#E0F2FE',
      color: '#2DD4BF',
      price: rewards
    },
    {
      id: 5,
      name: 'Pending Amount',
      description: 'Pending payouts',
      bgColor: '#FEF2F2',
      color: '#3B82F6',
      price: 0
    },
    {
      id: 6,
      name: 'Total Subscribers',
      description: 'Total subscribers',
      bgColor: '#FFD7B5',
      color: '#EF4444',
      price: totalSubscribers
    }
  ]
  
  return (
    <>
      <div className="grid grid-cols-12 gap-x-5 gap-y-4 pt-10 md:pt-0">
        <div className="col-span-12 md:col-span-7 bg-white rounded-md p-3 pt-4 pb-10">
            <p className="uppercase mb-6">Quick Balance</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              { data.map(item => (
                <BalanceCard key={ item.id } content={ item } />
              )) }
            </div>
          </div>
          <div className="col-span-12 md:col-span-5 bg-white rounded-md p-3 pt-4 pb-10">
            <p className="uppercase mb-6">Payout Overview</p>

            {/* Put data here else No data found */}
            
            <div className="flex flex-col items-center">
              <div>
                <img className="w-32 h-32" src="https://static.vecteezy.com/system/resources/previews/010/856/652/large_2x/no-result-data-document-or-file-not-found-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-etc-vector.jpg" alt="file-not-found" />
              </div>
              <p className="text-zinc-300">No data found...</p>
            </div>
          </div>
          <div className="relative col-span-12 md:col-span-6 bg-white rounded-md p-4">
            <p className="uppercase mb-6">Income vs Commission</p>
            <div>
              <BarChart />
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 bg-white shadow-sm rounded-md p-4">
            <p className="uppercase mb-6">Income & Commission</p>
            <div>
              <DataTable />
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 bg-white rounded-md p-3 pt-4 pb-10">
            <p className="uppercase mb-6">Team Performance</p>
            <div>
              <PerformanceTable />
            </div>
          </div>
          <div className="relative col-span-12 md:col-span-6 bg-white rounded-md p-4">
            <p className="uppercase mb-6">Joinings</p>
            <div>
              <AreaChart />
            </div>
          </div>
          <div className="relative col-span-12 md:col-span-6 bg-white shadow-sm rounded-md p-3 pt-4 pb-10">
            <p className="uppercase mb-2">New Members</p>
            <div>
              <MembersTable />
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 bg-white rounded-md p-3 pt-4 pb-10">
            <p className="uppercase mb-2">Lead Capture</p>
            <div>
              <LeadCapture />
            </div>
          </div>
        </div>
        
        <ToastContainer
            position="bottom-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
        />
    </>
  )
}

export default Dashboard
