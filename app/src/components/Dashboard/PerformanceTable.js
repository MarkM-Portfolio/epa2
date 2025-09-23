import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ProfileCard } from './ProfileCard'

export const PerformanceTable = () => {
  const [ tab, setTab ] = useState(1)
  const [ topEarners, setTopEarners ] = useState([])
  const [ topRecruiters, setTopRecruiters ] = useState([])

  useEffect(() => {
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
        const sortedEarners = res.data.users
          .sort((a, b) => b.totalIncome.$numberDecimal - a.totalIncome.$numberDecimal)
        setTopEarners(sortedEarners.slice(0, 20))
    }).catch((err) => {
        if (axios.isCancel(err)) console.log('Successfully Aborted')
        else console.error(err)
    })
    return () => { source.cancel() }
  }, [ ])

  useEffect(() => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    axios.get(`/api/user/teams`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Key': process.env.API_KEY
        },
        data: { cancelToken: source.token }
    }).then(res => {
        console.log('Success OK: ', res.status)
        setTopRecruiters(res.data.users)
    }).catch((err) => {
        if (axios.isCancel(err)) console.log('Successfully Aborted')
        else console.error(err)
    })
    return () => { source.cancel() }
  }, [ ])

  const data = {
    earners: [],
    recruiters: [],
    package: []
  }

  topEarners.forEach((item, idx) => (
    data.earners.push({ 'id': idx + 1, 'name': item.name, 'email': item.email, 'avatar': item.avatar, 'class': item.rank ? item.rank : item.class, 'earnings': parseFloat(item.totalIncome.$numberDecimal) })
  ))

  topRecruiters.forEach((item, idx) => (
    data.recruiters.push({ 'id': idx + 1, 'name': item.name, 'email': item.email, 'avatar': item.avatar, 'class': item.rank ? item.rank : item.class, 'recruits': item.childrenCount })
  ))

  // allUsers.forEach((item, idx) => (
  data.package.push(
    { id: 1, product: 'Simple Product', purchase: 4 },
    { id: 2, product: 'Product 2', purchase: 6 },
    { id: 3, product: 'Product 3', purchase: 1 }
  )
  // ))

  return (
    <div>

      <div className="flex gap-6 border-b">
        <p onClick={() => setTab(1)} className={`${ tab === 1 ? 'after:visible bg-cyan-600/5 text-cyan-600' : 'after:invisible'} relative text-sm cursor-pointer py-1 hover:after:visible after:absolute after:content-[''] after:border-b-2 after:left-0 after:bottom-0 after:right-0 after:border-cyan-600 hover:bg-cyan-600/5 hover:text-cyan-600`}>
          Top Earners
        </p>
        <p onClick={() => setTab(2)} className={`${ tab === 2 ? 'after:visible bg-cyan-600/5 text-cyan-600' : 'after:invisible'} relative text-sm cursor-pointer py-1 hover:after:visible after:absolute after:content-[''] after:border-b-2 after:left-0 after:bottom-0 after:right-0 after:border-cyan-600 hover:bg-cyan-600/5 hover:text-cyan-600`}>
          Top JBA
        </p>
        <p onClick={() => setTab(3)} className={`${ tab === 3 ? 'after:visible bg-cyan-600/5 text-cyan-600' : 'after:invisible'} relative text-sm cursor-pointer py-1 hover:after:visible after:absolute after:content-[''] after:border-b-2 after:left-0 after:bottom-0 after:right-0 after:border-cyan-600 hover:bg-cyan-600/5 hover:text-cyan-600`}>
          Package Overview
        </p>
      </div>

      <div className="max-h-80 overflow-y-auto">
        { tab === 1 && data.earners.sort((a, b) => b.earnings - a.earnings).map(item => (
          <ProfileCard key={ item.id } name={ item.name } email={ item.email } avatar={ item.avatar } description={ item.class } count={ item.earnings } currency />
        )) }
        { tab === 2 && data.recruiters.sort((a, b) => b.recruits - a.recruits).map(item => (
          <ProfileCard key={ item.id } name={ item.name } email={ item.email } avatar={ item.avatar } description={ item.class } count={ item.recruits } />
        )) }
        { tab === 3 && data.package.map(item => (
          <ProfileCard key={ item.id } name={ item.product } count={ item.purchase } product />
        )) }
      </div>

    </div>
  )
}
