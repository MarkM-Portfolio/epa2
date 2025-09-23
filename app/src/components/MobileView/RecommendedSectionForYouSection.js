import React, { useState, useEffect } from 'react'
import Cookies from 'universal-cookie'
import axios from 'axios'
import PropTypes from 'prop-types'
import { Rating, Stack, createTheme, ThemeProvider, Box, Tab, Tabs } from '@mui/material'
import { NavLink } from 'react-router-dom'
import { TbCurrencyPeso } from 'react-icons/tb'
import MiniSearch from 'minisearch'
import epa_coin from '../../assets/epa-coin.gif'

const RecommendedSectionForYouSection = ({ search }) => {
    const cookies = new Cookies()
    const isAuth = cookies.get('token')
    const [ user ] = useState(cookies.get('user'))
    // const [ currentUser, setCurrentUser ] = useState([])
    const [ products, setProducts ] = useState([])
    const [ services, setServices ] = useState([])
    const [ epaProducts, setEpaProducts ] = useState([])
    const [ epaServices, setEpaServices ] = useState([])
    const [ value, setValue ] = React.useState(0)
    const [ highToken, setHighToken ] = useState('')

    // useEffect(() => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     if (isAuth) {
    //         axios.get(`/api/user/${ user.id }`, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json',
    //                 'X-Api-Key': process.env.API_KEY
    //             },
    //             data: { cancelToken: source.token }
    //         }).then(res => {
    //             console.log('Success OK: ', res.status)
    //             setCurrentUser(res.data.user)
    //         }).catch((err) => {
    //             if (axios.isCancel(err)) console.log('Successfully Aborted')
    //             else console.error(err)
    //         })
    //         return () => { source.cancel() }
    //     }
    // }, [ isAuth ])

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
            setHighToken(res.data.settings.highToken)
        }).catch((err) => {
            if (axios.isCancel(err)) console.log('Successfully Aborted')
            else console.error(err)
        })
        return () => { source.cancel() }
    }, [ ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        axios.get(`/api/product`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            res.data.products.forEach(item => {
                let count = 0
                if (item.ratings.length) {
                    item.ratings.forEach(rate => {
                        count += parseFloat(rate.ratings)
                    })
                    item.globalRating = parseFloat(count/item.ratings.length).toFixed(1)
                }
            })
            setProducts(res.data.products.filter(item => !item.owner.includes(process.env.EPA_ACCT_ID)))
            setEpaProducts(res.data.products.filter(item => item.owner.includes(process.env.EPA_ACCT_ID)))
        }).catch((err) => {
            if (axios.isCancel(err)) console.log('Successfully Aborted')
            else console.error(err)
        })
        return () => { source.cancel() }
    }, [ ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        axios.get(`/api/service`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            res.data.services.forEach(item => {
                let count = 0
                if (item.ratings.length) {
                    item.ratings.forEach(rate => {
                        count += parseFloat(rate.ratings)
                    })
                    item.globalRating = parseFloat(count/item.ratings.length).toFixed(1)
                }
            })
            setServices(res.data.services.filter(item => !item.owner.includes(process.env.EPA_ACCT_ID)))
            setEpaServices(res.data.services.filter(item => item.owner.includes(process.env.EPA_ACCT_ID)))
        }).catch((err) => {
            if (axios.isCancel(err)) console.log('Successfully Aborted')
            else console.error(err)
        })
        return () => { source.cancel() }
    }, [ ])

    const customFont = {
        fontFamily: 'montserrat',
        fontWeight: 700,
    }
    
    const theme = createTheme({
        palette: {
            primary: {
                main: isAuth ? user.class === 'Entrepreneur' ? '#84CC16' : user.class === 'Supervisor' ? '#06b6D4' : user.class === 'Manager' ? '#F59E0B' : user.class === 'CEO' ? '#C084FC' : user.class === 'Business Empire' ? '#EF4444' : user.class === 'Silver' ? '#C0C0C0' : user.class === 'Gold' ? '#FFD700' : '#50C8A0' : '#50C8A0'
            },
        },
        typography: {
            fontFamily: 'montserrat', 
        },
        components: {
            MuiTab: {
                styleOverrides: {
                root: customFont,
              },
            },
        }
    })
    
    const TabPanel = (props) => {
        const { children, value, index, ...other } = props
      
        return (
            <div
                role="tabpanel"
                hidden={ value !== index }
                id={`full-width-tabpanel-${ index }`}
                aria-labelledby={`full-width-tab-${ index }`}
                { ...other }
            >
                {  value === index && (
                <Box sx={{ p: 3 }}>
                    <div>{ children }</div>
                </Box>
                ) }
            </div>
        )
    }
      
    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    }
      
    const a11yProps = (index) => {
        return {
            id: `full-width-tab-${ index }`,
            'aria-controls': `full-width-tabpanel-${ index }`,
        }
    }

    const epaGoods = epaProducts.concat(epaServices)

    /* SEARCH */
    const searchIndex = new MiniSearch({ 
        idField: '_id',
        fields: [ 'name', 'description', 'category', 'store' ] ,
        storeFields: [ 'image', 'owner', 'name', 'description', 'price', 'bonusToken', 'favorites', 'stocks', 'ratings', 'globalRating' ],
        searchOptions: {
            boost: { name: 2, description: 1, category: 2, store: 2 },
            prefix: true,
            fuzzy: 0.25
        }
    })
    
    searchIndex.addAll(products)
    searchIndex.addAll(services)
    searchIndex.addAll(epaGoods)

    const searchResults = searchIndex.search(search)
    /* SEARCH */

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    const searchDisplay = ( search && searchResults.map(item =>
        <div className="flex flex-2 items-end" key={ item.id }>
            <NavLink to={ `${ item.stocks ? '/product' : '/service' }` } state={ item }>
                <div className={ `border h-30 ${ innerWidth >=400 ? 'w-[178px]' : 'w-[152px]' } rounded-xl shadow-md` }>
                    <div className='items-center'>
                        <div className="relative flex h-30 overflow-hidden rounded-xl" id="itemTitle">
                        { item.owner === process.env.EPA_ACCT_ID &&
                            <div className="absolute top-0 right-0 px-2 bg-red-500 text-lime-300 text-center text-sm font-bold">EPA.<span className='text-sm font-semibold text-white'>Mall</span></div>
                        }
                        { item.bonusToken && item.bonusToken.$numberDecimal !== '0' &&
                            <div className='absolute top-6 right-0 border border-black bg-amber-500 rounded-l-lg'>
                                <div className="text-black px-2 text-center text-xs">Bonus</div>
                                <div className='bg-black rounded-bl-md px-1 text-white text-center text-xs font-semibold'>{ String(parseFloat(item.bonusToken.$numberDecimal * 10)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                            </div>
                        }
                            <img className='object-contain mb-2' src={ window.location.origin + '/public' + `${ item.stocks ? '/products/' : '/services/' }` + item.image } />
                        </div>
                    </div>
                    <div id="itemTitle" className='text-xs ml-2'>
                        <div className='font-semibold text-md'>{ item.name }</div>
                        <div className='flex items-center text-xl text-red-500'>
                            <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                            <div className='text-black-800'>{ String(parseFloat(item.price * highToken + Number(item.price)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                        </div>
                        <div className='text-blue-800'>{ String(parseFloat((item.price * highToken + Number(item.price)) * 10).toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                        <div className='flex gap-1'>
                            <p className='text-gray-500 py-0.5'>{ item.globalRating } / 5</p>
                            <Stack spacing={ 1 }>
                                <Rating name="search-items-ratings" size='small' defaultValue={ parseFloat(item.globalRating) } precision={ 0.5 } readOnly />
                            </Stack>
                        </div>
                    </div>
                </div>
            </NavLink>
        </div>
    ))
    
    const productsDisplay = ( products && products.map(item =>
        <div className="flex flex-2 items-end" key={ item._id }>
            <NavLink to={ "/product" } state={ item }>
                <div className={ `border h-30 ${ innerWidth >=400 ? 'w-[178px]' : 'w-[152px]' } rounded-xl shadow-md` }>
                    <div className='items-center'>
                        <div className="relative flex h-30 overflow-hidden rounded-xl" id="itemTitle">
                        { item.owner === process.env.EPA_ACCT_ID &&
                            <div className="absolute top-0 right-0 px-2 bg-red-500 text-lime-300 text-center text-sm font-bold">EPA.<span className='text-sm font-semibold text-white'>Mall</span></div>
                        }
                        { item.bonusToken && item.bonusToken.$numberDecimal !== '0' &&
                            <div className='absolute top-6 right-0 border border-black bg-amber-500 rounded-l-lg'>
                                <div className="text-black px-2 text-center text-xs">Bonus</div>
                                <div className='bg-black rounded-bl-md px-1 text-white text-center text-xs font-semibold'>{ String(parseFloat(item.bonusToken.$numberDecimal * 10)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                            </div>
                        }
                            <img className='object-contain mb-2' src={ window.location.origin + '/public/products/' + item.image } />
                        </div>
                    </div>
                    <div id="itemTitle" className='text-xs ml-2'>
                        <div className='font-semibold text-md'>{ item.name }</div>
                        <div className='flex items-center text-xl text-red-500'>
                            <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                            <div className='text-black-800'>{ String(parseFloat(item.price * highToken + parseFloat(item.price)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                        </div>
                        <div className='text-blue-800'>{ String(parseFloat((item.price * highToken + parseFloat(item.price)) * 10).toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                        <div className='flex gap-1'>
                            <p className='text-gray-500 py-0.5'>{ item.globalRating } / 5</p>
                            <Stack spacing={ 1 }>
                                <Rating name="product-ratings" size='small' defaultValue={ parseFloat(item.globalRating) } precision={ 0.5 } readOnly />
                            </Stack>
                        </div>
                    </div>
                </div>
            </NavLink>
        </div>
    ))

    const servicesDisplay = ( services && services.map(item =>
        <div className="flex flex-2 items-end" key={ item._id }>
            <NavLink to={ "/service" } state={ item }>
                <div className={ `border h-30 ${ innerWidth >=400 ? 'w-[178px]' : 'w-[152px]' } rounded-xl shadow-md` }>
                    <div className='items-center'>
                        <div className="relative flex h-30 overflow-hidden rounded-xl" id="itemTitle">
                        { item.owner === process.env.EPA_ACCT_ID &&
                            <div className="absolute top-0 right-0 px-2 bg-red-500 text-lime-300 text-center text-sm font-bold">EPA.<span className='text-sm font-semibold text-white'>Mall</span></div>
                        }
                        { item.bonusToken && item.bonusToken.$numberDecimal !== '0' &&
                            <div className='absolute top-6 right-0 border border-black bg-amber-500 rounded-l-lg'>
                                <div className="text-black px-2 text-center text-xs">Bonus</div>
                                <div className='bg-black rounded-bl-md px-1 text-white text-center text-xs font-semibold'>{ String(parseFloat(item.bonusToken.$numberDecimal * 10)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                            </div>
                        }
                            <img className='object-contain mb-2' src={ window.location.origin + '/public/services/' + item.image } />
                        </div>
                    </div>
                    <div id="itemTitle" className='text-xs ml-2'>
                        <div className='font-semibold text-md'>{ item.name }</div>
                        <div className='flex items-center text-xl text-red-500'>
                            <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                            <div className='text-black-800'>{ String(parseFloat(item.price * highToken + parseFloat(item.price)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                        </div>
                        <div className='text-blue-800'>{ String(parseFloat((item.price * highToken + parseFloat(item.price)) * 10).toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                        <div className='flex gap-1'>
                            <p className='text-gray-500 py-0.5'>{ item.globalRating } / 5</p>
                            <Stack spacing={ 1 }>
                                <Rating name="service-ratings" size='small' defaultValue={ parseFloat(item.globalRating) } precision={ 0.5 } readOnly />
                            </Stack>
                        </div>
                    </div>
                </div>
            </NavLink>
        </div>
    ))

    const epaDisplay = ( epaGoods && epaGoods.map(item =>
        <div className="flex flex-2 items-end" key={ item._id }>
            <NavLink to={ `${ item.stocks ? '/product' : '/service' }` } state={ item }>
                <div className={ `border h-30 ${ innerWidth >=400 ? 'w-[178px]' : 'w-[152px]' } rounded-xl shadow-md` }>
                    <div className='items-center'>
                        <div className="relative flex h-30 overflow-hidden rounded-xl" id="itemTitle">
                        { item.owner === process.env.EPA_ACCT_ID &&
                            <div className="absolute top-0 right-0 px-2 bg-red-500 text-lime-300 text-center text-sm font-bold">EPA.<span className='text-sm font-semibold text-white'>Mall</span></div>
                        }
                        { item.bonusToken && item.bonusToken.$numberDecimal !== '0' &&
                            <div className='absolute top-6 right-0 border border-black bg-amber-500 rounded-l-lg'>
                                <div className="text-black px-2 text-center text-xs">Bonus</div>
                                <div className='bg-black rounded-bl-md px-1 text-white text-center text-xs font-semibold'>{ String(parseFloat(item.bonusToken.$numberDecimal * 10)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                            </div>
                        }
                        { item.stocks ?
                            <img className='object-contain mb-2' src={ window.location.origin + `${ item.stocks ? '/public/products/' : '/public/services/' }`  + item.image } />
                            :
                            <img className='object-contain mb-2' src={ window.location.origin + '/public/services/' + item.image } />
                        }
                        </div>
                    </div>
                    <div id="itemTitle" className='text-xs ml-2'>
                        <div className='font-semibold text-md'>{ item.name }</div>
                        <div className='flex items-center text-xl text-red-500'>
                            <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                            <div className='text-black-800'>{ String(parseFloat(item.price * highToken + parseFloat(item.price)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                        </div>
                        <div className='text-blue-800'>{ String(parseFloat((item.price * highToken + parseFloat(item.price)) * 10).toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                        <div className='flex gap-1'>
                            <p className='text-gray-500 py-0.5'>{ item.globalRating } / 5</p>
                            <Stack spacing={ 1 }>
                                <Rating name="service-ratings" size='small' defaultValue={ parseFloat(item.globalRating) } precision={ 0.5 } readOnly />
                            </Stack>
                        </div>
                    </div>
                </div>
            </NavLink>
        </div>
    ))

    return (
        <>        
            <div className='lg:hidden font-montserrat'>
            { search ? 
                <>
                <h2 className='px-6 mt-4 text-gray-400 text-sm'>Search Results</h2>
                
                <br />

                <div className='flex flex-wrap gap-2 justify-center mb-4'>
                    { searchDisplay }
                </div> 
                </>
                :
                <>
                    {/* <div className='px-6 mt-4'>
                        <h1 className='font-semibold text-normal font-montserrat'>Recommended For You!</h1>
                        <h2 className='text-gray-400 text-sm'>Most picked products</h2>
                    </div> */}

                    <br />

                    <div className="flex justify-between rounded-lg bg-white">
                        <ThemeProvider theme={ theme }>
                            <Box sx={{ bgcolor: 'background.paper', width: '100vw' }}>
                                <Tabs
                                    value={ value }
                                    onChange={ handleChange }
                                    textColor='primary'
                                    variant='fullWidth'
                                    centered
                                >
                                    <Tab label="Products" { ...a11yProps(0) } />
                                    <Tab label="Services" { ...a11yProps(1) } />
                                    <Tab label="EPA Mall" { ...a11yProps(2) } />
                                </Tabs>
                                <TabPanel value={ value } index={ 0 } dir={ theme.direction }>
                                    <div className='flex flex-wrap gap-2 justify-center mb-2'>
                                        { productsDisplay }
                                    </div>
                                </TabPanel>
                                <TabPanel value={ value } index={ 1 } dir={ theme.direction }>
                                    <div className='flex flex-wrap gap-2 justify-center mb-2'>
                                        { servicesDisplay }
                                    </div>
                                </TabPanel>
                                <TabPanel value={ value } index={ 2 } dir={ theme.direction }>
                                    <div className='flex flex-wrap gap-2 justify-center mb-2'>
                                        { epaDisplay }
                                    </div>
                                </TabPanel>
                            </Box>
                        </ThemeProvider>
                    </div>
                </>
            }
            </div>

            <div className='mb-20'/>
        </>
    )
}

export default RecommendedSectionForYouSection
