import React, { useState, useEffect } from 'react'
import Cookies from 'universal-cookie'
import axios from 'axios'
import { FormControl, Select, MenuItem } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const PackageStatus = () => {
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ allUsers, setAllUsers ] = useState([])
    const [ userSelect, setUserSelect ] = useState('')
    const [ statusPkgEntrepreneur, setStatusPkgEntrepreneur ] = useState('')
    const [ statusPkgSupervisor, setStatusPkgSupervisor ] = useState('')
    const [ statusPkgManager, setStatusPkgManager ] = useState('')
    const [ statusPkgCeo, setStatusPkgCeo ] = useState('')
    const [ statusPkgBusinessEmpire, setStatusPkgBusinessEmpire ] = useState('')
    
    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
    
        if (user && user.id) {
            axios.get(`/api/user`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setAllUsers(res.data.users.sort((a, b) => a.name.localeCompare(b.name)))
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ user ])

    const updatePkg = async (e, userId, pkgStatus, userClass) => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/user/edit-pkgstatus/${ userId }`, { pkgStatus: pkgStatus, userClass: userClass }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.settings)
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

    return (
        <>
            <div>
                <h1 className="uppercase font-bold text-sm">Package Status</h1>
                <div className="flex justify-between rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                    <div className='mt-3'>
                        <FormControl sx={{ m: 0, minWidth: 159 }} size="small">
                            <h1 className='pb-2'>User</h1>
                            <Select
                                labelId="user-select-label"
                                id='user-select'
                                value={ userSelect }
                                label="User"
                                onChange={ (e) => setUserSelect(e.target.value) }
                            >
                            { allUsers.map(item => (
                                <MenuItem key={ item._id } value={ item }>{ item.name } | { item.email }</MenuItem>
                            )) }
                            </Select>
                        </FormControl>
                    </div>
                </div>
                <div className='mt-3'>
                    { userSelect &&
                        <div className='px-6 py-2'>
                            <div className={ `${ userSelect.class === 'Entrepreneur' ? 'text-yellow-200 bg-lime-500' : userSelect.class === 'Supervisor' ? 'text-yellow-200 bg-cyan-500' : userSelect.class === 'Manager' ? 'text-yellow-200 bg-amber-500' : userSelect.class === 'CEO' ? 'text-yellow-200 bg-purple-400' : userSelect.class === 'Business Empire' ? 'text-yellow-200 bg-red-500' : 'text-yellow-200 bg-gray-500' } mb-10 font-semibold text-center text-md rounded-lg shadow-md` }>{ userSelect.class }</div>
                            <div className='flex flex-cols gap-2'>
                                <p className='pt-2 text-lime-500'>Entrepreneur:</p>
                                <FormControl sx={{ m: 0, minWidth: 159 }} size="small">
                                    <Select
                                        labelId="pkgstatus-select-label"
                                        id='pkgstatus-select'
                                        value={ statusPkgEntrepreneur ? statusPkgEntrepreneur : userSelect.entrepreneur }
                                        label="Package Status"
                                        onChange={ (e) => setStatusPkgEntrepreneur(e.target.value) }
                                    >
                                        <MenuItem value='Pending'>Pending</MenuItem>
                                        <MenuItem value='Shipped'>Shipped</MenuItem>
                                        <MenuItem value='Done'>Done</MenuItem>
                                    </Select>
                                </FormControl>
                                <button onClick={ (e) => updatePkg(e, userSelect._id, statusPkgEntrepreneur, 'entrepreneur') } className='text-sm px-4 rounded bg-lime-500 text-white hover:font-semibold hover:bg-red-700'>Set Status</button>
                            </div>
                            <br />
                            <div className='flex flex-cols gap-2'>
                                <p className='pt-2 text-cyan-500'>Supervisor:</p>
                                <FormControl sx={{ m: 0, minWidth: 159 }} size="small">
                                    <Select
                                        labelId="pkgstatus-select-label"
                                        id='pkgstatus-select'
                                        value={ statusPkgSupervisor ? statusPkgSupervisor : userSelect.supervisor }
                                        label="Package Status"
                                        onChange={ (e) => setStatusPkgSupervisor(e.target.value) }
                                    >
                                        <MenuItem value='Pending'>Pending</MenuItem>
                                        <MenuItem value='Shipped'>Shipped</MenuItem>
                                        <MenuItem value='Done'>Done</MenuItem>
                                    </Select>
                                </FormControl>
                                <button onClick={ (e) => updatePkg(e, userSelect._id, statusPkgSupervisor, 'supervisor') } className='text-sm px-4 rounded bg-cyan-500 text-white hover:font-semibold hover:bg-red-700'>Set Status</button>
                            </div>
                            <br />
                            <div className='flex flex-cols gap-2'>
                                <p className='pt-2 text-amber-500'>Manager:</p>
                                <FormControl sx={{ m: 0, minWidth: 159 }} size="small">
                                    <Select
                                        labelId="pkgstatus-select-label"
                                        id='pkgstatus-select'
                                        value={ statusPkgManager ? statusPkgManager : userSelect.manager }
                                        label="Package Status"
                                        onChange={ (e) => setStatusPkgManager(e.target.value) }
                                    >
                                        <MenuItem value='Pending'>Pending</MenuItem>
                                        <MenuItem value='Shipped'>Shipped</MenuItem>
                                        <MenuItem value='Done'>Done</MenuItem>
                                    </Select>
                                </FormControl>
                                <button onClick={ (e) => updatePkg(e, userSelect._id, statusPkgManager, 'manager') } className='text-sm px-4 rounded bg-amber-500 text-white hover:font-semibold hover:bg-red-700'>Set Status</button>
                            </div>
                            <br />
                            <div className='flex flex-cols gap-2'>
                                <p className='pt-2 text-purple-400'>CEO:</p>
                                <FormControl sx={{ m: 0, minWidth: 159 }} size="small">
                                    <Select
                                        labelId="pkgstatus-select-label"
                                        id='pkgstatus-select'
                                        value={ statusPkgCeo ? statusPkgCeo : userSelect.ceo }
                                        label="Package Status"
                                        onChange={ (e) => setStatusPkgCeo(e.target.value) }
                                    >
                                        <MenuItem value='Pending'>Pending</MenuItem>
                                        <MenuItem value='Shipped'>Shipped</MenuItem>
                                        <MenuItem value='Done'>Done</MenuItem>
                                    </Select>
                                </FormControl>
                                <button onClick={ (e) => updatePkg(e, userSelect._id, statusPkgCeo, 'ceo') } className='text-sm px-4 rounded bg-purple-400 text-white hover:font-semibold hover:bg-red-700'>Set Status</button>
                            </div>
                            <br />
                            <div className='flex flex-cols gap-2'>
                                <p className='pt-2 text-red-500'>Business Empire:</p>
                                <FormControl sx={{ m: 0, minWidth: 159 }} size="small">
                                    <Select
                                        labelId="pkgstatus-select-label"
                                        id='pkgstatus-select'
                                        value={ statusPkgBusinessEmpire ? statusPkgBusinessEmpire : userSelect.businessempire }
                                        label="Package Status"
                                        onChange={ (e) => setStatusPkgBusinessEmpire(e.target.value) }
                                    >
                                        <MenuItem value='Pending'>Pending</MenuItem>
                                        <MenuItem value='Shipped'>Shipped</MenuItem>
                                        <MenuItem value='Done'>Done</MenuItem>
                                    </Select>
                                </FormControl>
                                <button onClick={ (e) => updatePkg(e, userSelect._id, statusPkgBusinessEmpire, 'businessempire') } className='text-sm px-4 rounded bg-red-500 text-white hover:font-semibold hover:bg-red-700'>Set Status</button>
                            </div>
                        </div>
                    }
                </div>
            </div>

            <ToastContainer
                position="bottom-center"
                autoClose={3000}
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

export default PackageStatus
