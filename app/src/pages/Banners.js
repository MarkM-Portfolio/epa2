import React, { useState, useEffect } from 'react'
import Cookies from 'universal-cookie'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Banners = () => {
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ banners, setBanners ] = useState([])
    const [ bannerImg1, setBannerImg1 ] = useState('')
    const [ bannerImg2, setBannerImg2 ] = useState('')
    const [ bannerImg3, setBannerImg3 ] = useState('')
    const [ bannerImg4, setBannerImg4 ] = useState('')
    const [ bannerImg5, setBannerImg5 ] = useState('')
    const [ bannerImg6, setBannerImg6 ] = useState('')

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        axios.get(`/api/setting`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            setBanners(res.data.settings.banners)
        }).catch((err) => {
            if (axios.isCancel(err)) console.log('Successfully Aborted')
            else console.error(err)
        })
        return () => { source.cancel() }
    }, [ ])

    const readFileAsBlob = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const result = reader.result
                resolve(new Blob([result], { type: file.type }))
            }
            reader.onerror = reject
            reader.readAsArrayBuffer(file)
        })
    }

    const editBanners = async () => {
        const bannerImg1Blob = bannerImg1 ? await readFileAsBlob(bannerImg1) : banners[0]
        const bannerImg2Blob = bannerImg2 ? await readFileAsBlob(bannerImg2) : banners[1]
        const bannerImg3Blob = bannerImg3 ? await readFileAsBlob(bannerImg3) : banners[2]
        const bannerImg4Blob = bannerImg4 ? await readFileAsBlob(bannerImg4) : banners[3]
        const bannerImg5Blob = bannerImg5 ? await readFileAsBlob(bannerImg5) : banners[4]
        const bannerImg6Blob = bannerImg6 ? await readFileAsBlob(bannerImg6) : banners[5]

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const formData = new FormData()
        formData.append('banners', bannerImg1Blob)
        formData.append('banners', bannerImg2Blob)
        formData.append('banners', bannerImg3Blob)
        formData.append('banners', bannerImg4Blob)
        formData.append('banners', bannerImg5Blob)
        formData.append('banners', bannerImg6Blob)

        await axios.put(`/api/setting/banners/${ user.id }`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'multipart/form-data',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.message)
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
                <h1 className="uppercase font-bold text-sm">Banners</h1>
                { banners.map((banner, idx) => (
                    <div key={ idx }className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5 bg-cover">
                        <div className='ml-2 flex-rows gap-4 mt-2 items-center font-semibold'>
                            <div>Banner # { idx + 1 }</div>
                            { 
                                idx === 0 && bannerImg1 ? 
                                <img src={ bannerImg1 instanceof Blob ? URL.createObjectURL(bannerImg1) : bannerImg1 } className='object-contain mb-2 h-3/4 w-3/4' />
                                : idx === 1 && bannerImg2 ? 
                                <img src={ bannerImg2 instanceof Blob ? URL.createObjectURL(bannerImg2) : bannerImg2 } className='object-contain mb-2 h-3/4 w-3/4' />
                                : idx === 2 && bannerImg3 ? 
                                <img src={ bannerImg3 instanceof Blob ? URL.createObjectURL(bannerImg3) : bannerImg3 } className='object-contain mb-2 h-3/4 w-3/4' />
                                : idx === 3 && bannerImg4 ? 
                                <img src={ bannerImg4 instanceof Blob ? URL.createObjectURL(bannerImg4) : bannerImg4 } className='object-contain mb-2 h-3/4 w-3/4' />
                                : idx === 4 && bannerImg5 ? 
                                <img src={ bannerImg5 instanceof Blob ? URL.createObjectURL(bannerImg5) : bannerImg5 } className='object-contain mb-2 h-3/4 w-3/4' />
                                : idx === 5 && bannerImg6 ? 
                                <img src={ bannerImg6 instanceof Blob ? URL.createObjectURL(bannerImg6) : bannerImg6 } className='object-contain mb-2 h-3/4 w-3/4' />
                                :
                                <img src={ window.location.origin + '/public/banners/' + banner } className='object-contain mb-2 h-3/4 w-3/4' />
                            }
                            { 
                                idx === 0 ? 
                                <input type='file' accept='image/jpeg, image/jpg, image/png' onChange={ (e) => setBannerImg1(e.target.files[0]) } />
                                : idx === 1 ?
                                <input type='file' accept='image/jpeg, image/jpg, image/png' onChange={ (e) => setBannerImg2(e.target.files[0]) } />
                                : idx === 2 ?
                                <input type='file' accept='image/jpeg, image/jpg, image/png' onChange={ (e) => setBannerImg3(e.target.files[0]) } />
                                : idx === 3 ?
                                <input type='file' accept='image/jpeg, image/jpg, image/png' onChange={ (e) => setBannerImg4(e.target.files[0]) } />
                                : idx === 4 ?
                                <input type='file' accept='image/jpeg, image/jpg, image/png' onChange={ (e) => setBannerImg5(e.target.files[0]) } />
                                :
                                <input type='file' accept='image/jpeg, image/jpg, image/png' onChange={ (e) => setBannerImg6(e.target.files[0]) } />
                            }
                        </div>
                    </div>
                )) }
                <button onClick={ () => editBanners() } className='ml-2 text-xl w-full px-10 rounded-md bg-emerald-400 text-white hover:font-semibold hover:bg-red-700'>Upload All</button>
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

export default Banners
