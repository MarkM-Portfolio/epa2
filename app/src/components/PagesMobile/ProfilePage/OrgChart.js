import React, { useEffect, useState, useLocation, useCallback } from 'react'
import Cookies from 'universal-cookie'
import axios from 'axios'
import Tree from 'react-d3-tree'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { GiOrganigram } from 'react-icons/gi'
import { NavLink } from 'react-router-dom'

const OrgChart = () => {
    const [ toggleCard, setToggleCard ] = useState(false)
    const [ cardData, setCardData ] = useState({})
    const [ x, setX ] = useState(0)
    const [ y, setY ] = useState(0)
    let [ zoom, setZoom ] = useState(1)

    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ teams, setTeams ] = useState([])
    const [ childrenCount, setChildrenCount ] = useState([])
    const [ isLoading, setIsLoading ] = useState(false)

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (user && user.id) {
            axios.get(`/api/user/${ user.id }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setCurrentUser(res.data.user)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
        }
        return () => { source.cancel() }
    }, [ user ])

    useEffect(() => {
        setIsLoading(true)
        
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (user && user.id) {
            axios.get(`/api/user/teams/${ user.id }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setTeams(res.data.teams)
                setChildrenCount(res.data.count)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            }).finally(() => {
                setIsLoading(false)
            })
        }
        return () => { source.cancel() }
    }, [ user ])
    
    const orgChart = {}

    if (currentUser) {
        orgChart.id = 0
        
        orgChart.name = currentUser.name
        orgChart.email = currentUser.email
        orgChart.attributes = {}
        orgChart.attributes.imgUrl = currentUser.avatar ? window.location.origin + '/private/avatar/' + currentUser.avatar : 'https://source.unsplash.com/uJ8LNVCBjFQ/400x400'
        orgChart.attributes.class = currentUser.class
        // orgChart.parent = 0
        // orgChart.attributes.personal = 0
        // orgChart.attributes.group = 1230

        if (teams) {
            const data = JSON.stringify(teams).split(' ').map((word) => word.replace('avatar', 'attributes":{"imgUrl').replace('imgUrl":"avatar', `imgUrl":"${ window.location.origin + '/private/avatar/' }avatar`).replace(',"children', '},"children').replace(',},"children', '},"children')).join(' ')
            orgChart.children = JSON.parse(data)
        }
    }

    const toggleCardFunc = (e, node) => {
        if (node && !node.attributes)
            return
        setToggleCard(true)
        setCardData(node)
        setX(e.clientX)
        setY(e.clientY)
    }

    const toggleZoom = (action) => {
        if (action === 'plus' && zoom >= 1) {
            setZoom(zoom += 1)
        } else if (action === 'plus' && zoom <= 1) {
            setZoom(zoom += 0.2)
        } else if (action === 'minus' && zoom > 1) {
            setZoom(zoom -= 1)
        } else if (action === 'minus' && zoom <= 1) {
            setZoom(zoom -= 0.2)
        } else {
            setZoom(1)
        }
    }

    const renderRectSvgNode = ({ nodeDatum, toggleNode }) => (
        <g>
            <circle cx="0" cy="0" r="24" stroke="#ffffff" fill={ nodeDatum.attributes ? 'rgb(255 237 213)' : 'rgb(255 255 255)'} strokeWidth="8" width="24" height="24" onMouseLeave={ () => setToggleCard(false)} onMouseEnter={(e) => toggleCardFunc(e, nodeDatum) } />
            
            { nodeDatum.attributes && 
                <svg className="pointer-events-none" strokeWidth="0" xmlns="http://www.w3.org/2000/svg" x="-20" y="-20" fill="rgb(147 197 253)" height="40" width="40" viewBox="0 0 512 512">
                    <path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" />
                </svg>
            }

            { !nodeDatum.attributes &&
                <svg className="pointer-events-none" x="-8" y="-20" fill="rgb(56 189 248)" xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">
                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                </svg>
            }
            
            { nodeDatum.attributes?.imgUrl &&
                <svg className="pointer-events-none" width="60" height="60" x={-30} y={-30}>rgb(255 237 213)
                    <defs>
                        <clipPath id="roundedMask">
                            <circle cx="30" cy="30" r="20" fill="white" />
                        </clipPath>
                    </defs>
                    <image x="10" y="10" width="40" height="40"
                        xlinkHref={ nodeDatum.attributes?.imgUrl }
                        clipPath="url(#roundedMask)"
                    />
                </svg>
            }

            { nodeDatum.attributes &&
                <foreignObject onClick={ toggleNode } className="bg-white" x="-47" y="28" width="95" height="40">
                    <div className={ `${ nodeDatum.attributes?.class === 'Entrepreneur' ? 'text-yellow-200 bg-lime-500' : nodeDatum.attributes?.class === 'Supervisor' ? 'text-yellow-200 bg-cyan-500' : nodeDatum.attributes?.class === 'Manager' ? 'text-yellow-200 bg-amber-500' : nodeDatum.attributes?.class === 'CEO' ? 'text-yellow-200 bg-purple-400' : nodeDatum.attributes?.class === 'Business Empire' ? 'text-yellow-200 bg-red-500' : nodeDatum.attributes?.class === 'Silver' ? 'text-yellow-200 bg-gradient-to-r from-stone-600 to-stone-300 border-2 border-gray-600' : nodeDatum.attributes?.class === 'Gold' ? 'text-yellow-200 bg-gradient-to-r from-amber-600 to-amber-300 border-2 border-gray-600' : 'text-yellow-200 bg-gray-500' } rounded-lg` }>
                        <div className="text-center text-xs font-semibold w-fit mx-auto leading-5">
                            { nodeDatum.name }
                        </div>
                    </div>
                </foreignObject>
            }

            { nodeDatum.children &&nodeDatum.__rd3t?.collapsed &&
                <svg onClick={ toggleNode } xmlns="http://www.w3.org/2000/svg" x="-6" y="60" fill="rgb(55 48 163)" height="16" width="10" viewBox="0 0 320 512">
                    <path d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z" />
                </svg>
            }
        </g>
    )

    const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }) => {
        const [ translate, setTranslate ] = useState(defaultTranslate)
        const [ dimensions, setDimensions ] = useState()

        const containerRef = useCallback((containerElem) => {
            if (containerElem !== null) {
                const { width, height } = containerElem.getBoundingClientRect()
                setDimensions({ width, height })
                setTranslate({ x: width / 2, y: height / 16 })
            }
        }, [])
        
        return [ dimensions, translate, containerRef ]
    }

    const [ dimensions, translate, containerRef ] = useCenteredTree()
        
    return (
        <>
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
            
            <div className='font-montserrat lg:hidden fixed top-0 right-0 left-0 inset-x-0'>
                <div className='px-6 mt-10'>
                    <div className='flex items-center gap-2'> 
                        <div className='grid grid-cols-2 font-bold font-montserrat'>
                            <NavLink to="/profile">
                                <FaArrowAltCircleLeft className='text-4xl' />
                            </NavLink>
                        </div>   
                    </div>
                </div>
                <div className='flex justify-center gap-2 text-3xl -mt-7'>
                    <GiOrganigram className='fill-orange-500' />
                    <h1 className='text-lg text-center font-semibold mb-10 pl-1'>Organizational Chart</h1>
                </div>

                <div className='-mt-7 mb-7 flex flex-cols justify-center font-semibold text-xs gap-2 rounded-1xl text-center'>
                    <p className='font-normal'>Please Wait 10-15 minutes for the Org Chart to populate</p>
                </div>
                <hr />

                <div className='pt-2 bg-gray-100'>
                    <div className='px-6 flex flex-cols gap-2 font-semibold'>
                        <div className='pt-1 text-center text-xs'>Total Subscribers</div>
                        <p className='text-blue-800'>{ childrenCount.childrenCount ? childrenCount.childrenCount : 0 }</p>
                    </div>
                    <div className='px-6 mb-1 flex flex-cols gap-2 font-semibold'>
                        <div className='pt-1 text-center text-xs rounded-lg shadow-md text-yellow-200 bg-gray-500 w-20'>Member</div>
                        <p className='text-blue-800'>{ childrenCount.childrenMember ? childrenCount.childrenMember : 0 }</p>
                    </div>
                    <div className='px-6 mb-1 flex flex-cols gap-2 font-semibold'>
                        <div className='pt-1 text-center text-xs rounded-lg shadow-md text-yellow-200 bg-lime-500 w-36'>Entrepreneur</div>
                        <p className='text-blue-800'>{ childrenCount.childrenEntrep ? childrenCount.childrenEntrep : 0 }</p>
                    </div>
                    <div className='px-6 mb-1 flex flex-cols gap-2 font-semibold'>
                        <div className='pt-1 text-center text-xs rounded-lg shadow-md text-yellow-200 bg-cyan-500 w-36'>Supervisor</div>
                        <p className='text-blue-800'>{ childrenCount.childrenSupervisor ? childrenCount.childrenSupervisor : 0 }</p>
                    </div>
                    <div className='px-6 mb-1 flex flex-cols gap-2 font-semibold'>
                        <div className='pt-1 text-center text-xs rounded-lg shadow-md text-yellow-200 bg-amber-500 w-32'>Manager</div>
                        <p className='text-blue-800'>{ childrenCount.childrenManager ? childrenCount.childrenManager : 0 }</p>
                    </div>
                    <div className='px-6 mb-1 flex flex-cols gap-2 font-semibold'>
                        <div className='pt-1 text-center text-xs rounded-lg shadow-md text-yellow-200 bg-purple-400 w-20'>CEO</div>
                        <p className='text-blue-800'>{ childrenCount.childrenCeo ? childrenCount.childrenCeo : 0 }</p>
                    </div>
                    <div className='px-6 mb-1 flex flex-cols gap-2 font-semibold'>
                        <div className='pt-1 text-center text-xs rounded-lg shadow-md text-yellow-200 bg-red-500 w-40'>Business Empire</div>
                        <p className='text-blue-800'>{ childrenCount.childrenBusiness ? childrenCount.childrenBusiness : 0 }</p>
                    </div>
                    <div className='px-6 mb-1 flex flex-cols gap-2 font-semibold'>
                        <div className='pt-1 text-center text-xs rounded-lg shadow-md text-yellow-200 bg-gradient-to-r from-stone-600 to-stone-300 border-2 border-gray-600 w-32'>Silver</div>
                        <p className='text-blue-800'>{ childrenCount.childrenSilver ? childrenCount.childrenSilver : 0 }</p>
                    </div>
                    { currentUser.class === 'Silver' && currentUser.rank === 'Business Empire' && (
                        <div className='px-6 mb-1 flex flex-cols gap-2 font-semibold'>
                            <div className='pt-1 text-center text-xs rounded-lg shadow-md text-yellow-200 bg-gradient-to-r from-amber-600 to-amber-300 border-2 border-gray-600 w-32'>Gold</div>
                            <p className='text-blue-800'>{ childrenCount.childrenGold ? childrenCount.childrenGold : 0 }</p>
                        </div>
                    )}
                    { currentUser.class === 'Gold' && (
                        <div className='px-6 mb-1 flex flex-cols gap-2 font-semibold'>
                            <div className='pt-1 text-center text-xs rounded-lg shadow-md text-yellow-200 bg-gradient-to-r from-amber-600 to-amber-300 border-2 border-gray-600 w-32'>Gold</div>
                            <p className='text-blue-800'>{ childrenCount.childrenGold ? childrenCount.childrenGold : 0 }</p>
                        </div>
                    )}
                    <div className='pb-2 px-6 flex flex-cols gap-2 font-semibold'> 
                        <div className='pt-1 text-center text-xs'>Valid Subscribers</div>
                        <p className='text-blue-800'>{ childrenCount.childrenCount ? childrenCount.childrenCount - childrenCount.childrenMember : 0 }</p>
                    </div>
                </div>

                <div ref={ containerRef } className="bg-white rounded-lg h-screen">

                <div className="flex justify-end gap-1 pt-2 pr-2">
                    <span onClick={() => toggleZoom('plus')} className="cursor-pointer border border-gray-300 w-8 h-8 flex items-center justify-center bg-slate-100">
                        <svg width="16" height="16" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="m15.97 17.031c-1.479 1.238-3.384 1.985-5.461 1.985-4.697 0-8.509-3.812-8.509-8.508s3.812-8.508 8.509-8.508c4.695 0 8.508 3.812 8.508 8.508 0 2.078-.747 3.984-1.985 5.461l4.749 4.75c.146.146.219.338.219.531 0 .587-.537.75-.75.75-.192 0-.384-.073-.531-.22zm-5.461-13.53c-3.868 0-7.007 3.14-7.007 7.007s3.139 7.007 7.007 7.007c3.866 0 7.007-3.14 7.007-7.007s-3.141-7.007-7.007-7.007zm-.744 6.26h-2.5c-.414 0-.75.336-.75.75s.336.75.75.75h2.5v2.5c0 .414.336.75.75.75s.75-.336.75-.75v-2.5h2.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-2.5v-2.5c0-.414-.336-.75-.75-.75s-.75.336-.75.75z" fillRule="nonzero" />
                        </svg>
                    </span>

                    <span onClick={() => toggleZoom('minus')} className="cursor-pointer border border-gray-300 w-8 h-8 flex items-center justify-center bg-slate-100">
                        <svg width="16" height="16" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="m15.97 17.031c-1.479 1.238-3.384 1.985-5.461 1.985-4.697 0-8.509-3.812-8.509-8.508s3.812-8.508 8.509-8.508c4.695 0 8.508 3.812 8.508 8.508 0 2.078-.747 3.984-1.985 5.461l4.749 4.75c.146.146.219.338.219.531 0 .587-.537.75-.75.75-.192 0-.384-.073-.531-.22zm-5.461-13.53c-3.868 0-7.007 3.14-7.007 7.007s3.139 7.007 7.007 7.007c3.866 0 7.007-3.14 7.007-7.007s-3.141-7.007-7.007-7.007zm3.256 6.26h-6.5c-.414 0-.75.336-.75.75s.336.75.75.75h6.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z" fillRule="nonzero" />
                        </svg>
                    </span>

                    <span onClick={() => toggleZoom('reset')} className="cursor-pointer border border-gray-300 w-8 h-8 flex items-center justify-center bg-slate-100">
                        <svg width="16" height="16" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.979 3.055c4.508.489 8.021 4.306 8.021 8.945.001 2.698-1.194 5.113-3.075 6.763l-1.633-1.245c1.645-1.282 2.709-3.276 2.708-5.518 0-3.527-2.624-6.445-6.021-6.923v2.923l-5.25-4 5.25-4v3.055zm-1.979 15.865c-3.387-.486-6-3.401-6.001-6.92 0-2.237 1.061-4.228 2.697-5.509l-1.631-1.245c-1.876 1.65-3.066 4.061-3.065 6.754-.001 4.632 3.502 8.444 8 8.942v3.058l5.25-4-5.25-4v2.92z" />
                        </svg>
                    </span>
                </div>

                <Tree
                    data={ orgChart }
                    collapsible={ true }
                    zoomable={ true }
                    scaleExtent={{ max: 3, min: 0 }}
                    translate={ translate }
                    orientation="vertical"
                    pathFunc="step"
                    // dimensions={ dimensions }
                    renderCustomNodeElement={ renderRectSvgNode }
                    zoom={ zoom }
                />
                { toggleCard && 
                    <div className={`absolute -translate-x-1/2 shadow-md bg-transparent border rounded`} style={{ left: x, top: y }}><div>
                    <div className="flex flex-col items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500 text-white w-60 h-32">
                        <span className="flex items-center justify-center bg-orange-100 rounded-full">
                            {/* profile image here else svg */}
                            <svg className="pointer-events-none" width="60" height="60" x={-30} y={-30}>
                                <image x="8" y="8" width="45" height="45"
                                    xlinkHref={ cardData.attributes?.imgUrl ? cardData.attributes?.imgUrl : 'https://source.unsplash.com/uJ8LNVCBjFQ/400x400' }
                                    clipPath="url(#roundedMask)"
                                />
                            </svg>
                        </span>
                        <div className="mt-2">{ cardData.name }</div>
                        <div>{ cardData.email }</div>
                        <div className={ `${ cardData.attributes?.class === 'Entrepreneur' ? 'text-yellow-200 bg-lime-500 w-36' : cardData.attributes?.class === 'Supervisor' ? 'text-yellow-200 bg-cyan-500 w-36' : cardData.attributes?.class === 'Manager' ? 'text-yellow-200 bg-amber-500 w-32' : cardData.attributes?.class === 'CEO' ? 'text-yellow-200 bg-purple-400 w-20' : cardData.attributes?.class === 'Business Empire' ? 'text-yellow-200 bg-red-500 w-40' : cardData.attributes?.class === 'Silver' ? 'text-yellow-200 bg-gradient-to-r from-stone-600 to-stone-300 border-2 border-gray-600 w-32' : cardData.attributes?.class === 'Gold' ? 'text-yellow-200 bg-gradient-to-r from-amber-600 to-amber-300 border-2 border-gray-600 w-32' : 'text-yellow-200 bg-gray-500 w-20' } mt-1 font-semibold text-center text-xs rounded-lg shadow-md` }>{ cardData.attributes?.class }</div>
                    </div>
                    
                    {/* <div className="bg-white p-4">
                        <div className="grid grid-cols-4">
                            <p className="col-span-3">Personal PV</p>
                            <p className="flex justify-start text-left">{ cardData.attributes?.personal }</p>
                        </div>

                        <div className="grid grid-cols-4">
                            <p className="col-span-3">Group PV</p>
                            <p className="text-left">{ cardData.attributes?.group }</p>
                        </div>
                    </div> */}

                    </div>
                    </div> 
                }
                </div>
            </div>
        </>
    )
}

export default OrgChart
