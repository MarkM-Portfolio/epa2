import React, { Component } from 'react'
import { AdminProvider } from './context/AdminContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import Cookies from 'universal-cookie'
import axios from 'axios'
import Header from './components/Header'
import Login from './components/Login'
import Register from './components/Register'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
// import LoginProtectRoute from './components/LoginProtectRoute'
// import ProtectedRoutes from './components/ProtectedRoutes'
// import DashboardProtectRoute from './components/DashboardProtectRoute'
import AppDashboard from './components/AppDashboard'
import ProductCarousel from './components/ProductCarousel'
import slides from './components/mock.json'
import NavigationIcons from './components/NavigationIcons'
import NewArrivals from './components/NewArrivals'
import AppMobile from './components/PagesMobile/AppMobile'
import HomeMobile from './components/MobileView/HomeMobile'
import Chat from './components/Chat/Chat'
// import ValidationBeforeRegister from '../components/ValidationBeforeRegister'
import Policy from './components/Policy'
import MyStore from './components/PagesMobile/ProfilePage/MyStore'
import MyProduct from './components/PagesMobile/ProfilePage/MyProduct'
import EditProduct from './components/PagesMobile/EditProduct'
import MyService from './components/PagesMobile/ProfilePage/MyService'
import EditService from './components/PagesMobile/EditService'
import MySales from './components/PagesMobile/ProfilePage/MySales'

const cookies = new Cookies()

class App extends Component {  
  constructor(props) {
    super(props)
    
    this.state = {
      connected: null,
      loaded: false,
      user: cookies.get('user') || null,
      dashboard: (window.location.host.split('.')[0] === 'dashboard'),
      chat: (window.location.host.split('.')[0] === 'chat')
    }
  }

  componentDidMount() {
    this.callBackendAPI()
      .then(connected => this.setState({ connected }))
      .catch(err => console.log({ err, connected: null }))
  }

  callBackendAPI = async () => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    const response = await axios.get('/api', {
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': process.env.API_KEY
      },
      data: { cancelToken: source.token }
    }).then(res => {
      console.log('Success OK: ', res.status)
      return res.data
    }).catch((err) => {
      if (axios.isCancel(err)) console.log('Successfully Aborted')
      else console.error(err)
      return err
    })

    return response
  }
  
  welcomeMessage() {
    console.log(this.state.connected)
    console.log(process.env.NODE_ENV.toUpperCase())
    console.log(`node ${ process.env.NODE_VER }`)
    console.log(`npm ${ process.env.NPM_VER }`)
    console.log(this.state.dashboard ? `Welcome to Dashboard panel` : this.state.chat ? `Welcome to Chat` : `Welcome to ${ window.location.host } site!`)
  }

  render() {

    { this.state.connected ? this.welcomeMessage() : '' }

    return (
      <AdminProvider>
        { this.state.connected ? 
          <BrowserRouter>
            <Routes>
              {/* <Route element={ < ProtectedRoutes /> }> */}
              <Route>
                { this.state.dashboard ? 
                  <Route path='*' element={ cookies.get('token') ? < AppDashboard /> : < Login /> } />
                  :
                  this.state.chat ? 
                  <Route path='*' element={ cookies.get('token') ? < Chat /> : < Login /> } />
                  :
                process.env.NODE_ENV === 'production' ?
                  isMobile ? 
                    <Route>
                      <Route path='*' element={ cookies.get('delegatePin') ? < MyStore /> : < AppMobile /> } />
                      <Route path='/myproduct' element={ < MyProduct /> } />
                      <Route path='/editproduct' element={ < EditProduct /> } />
                      <Route path='/myservice' element={ < MyService />} />
                      <Route path='/editservice' element={ < EditService />} />
                      <Route path='/mysales' element={ < MySales />} />
                    </Route> 
                    :
                    this.state.dashboard ?
                      <Route path='*' element={ cookies.get('token') ? < AppDashboard /> : < Login /> } />
                      :
                      <Route path='/' element={ <>< Header />< ProductCarousel slides={ slides } />< NavigationIcons />< NewArrivals /></> }/> 
                    :
                    // <Route element={ < DashboardProtectRoute /> }>
                    <Route>
                      { isMobile ? 
                      <Route>
                        <Route path='*' element={ cookies.get('delegatePin') ? < MyStore /> : < AppMobile /> } />
                        <Route path='/myproduct' element={ < MyProduct /> } />
                        <Route path='/editproduct' element={ < EditProduct /> } />
                        <Route path='/myservice' element={ < MyService />} />
                        <Route path='/editservice' element={ < EditService />} />
                        <Route path='/mysales' element={ < MySales />} />
                        <Route path='/dashboard/*' element={ cookies.get('token') ? < AppDashboard /> : < Login /> } />
                        <Route path='/chat/*' element={ cookies.get('token') ? <>< Header />< Chat /></> : < Login /> } />
                      </Route>
                      : 
                      <Route>
                        <Route path='/' element={ <>< Header />< ProductCarousel slides={ slides } />< NavigationIcons />< NewArrivals /></> }/>
                        <Route path='/dashboard/*' element={ cookies.get('token') ? < AppDashboard /> : < Login /> }/>
                        <Route path='/chat/*' element={ cookies.get('token') ? <>< Header />< Chat /></> : < Login /> } />
                      </Route>
                      }
                </Route>
                }
              </Route>

              {/* <Route element={ < LoginProtectRoute /> }> */}
              <Route>
                { !cookies.get('token') && !cookies.get('delegatePin') ?
                  isMobile ?  
                  <Route path='*' element={ < AppMobile /> } />
                  :
                  this.state.dashboard ?
                    <Route path='*' element={ cookies.get('token') ? < AppDashboard /> : < Login /> } />
                    :
                    <Route path='/' element={ <>< Header />< ProductCarousel slides={ slides } />< NavigationIcons />< NewArrivals /></> }/> 
                  :
                  isMobile && !cookies.get('delegatePin') ? 
                  <Route path='*' element={ < HomeMobile /> } />
                  :
                  <Route path='/' element={ <>< Header />< ProductCarousel slides={ slides } />< NavigationIcons />< NewArrivals /></> }/> 
                }
                <Route exact path='/login' element={ < Login /> } />
                {/* <Route exact path='/validation-before-register' element={ < ValidationBeforeRegister /> } /> */}
                <Route exact path='/register/*' element={ < Register />} />
                <Route path='/forgotpassword' element={ < ForgotPassword /> } />
                <Route path='/privacypolicy' element={ < Policy /> } />
                { cookies.get('resetToken') ? 
                  <Route path='/resetpassword' element={ < ResetPassword />} />
                  :
                  <Route exact path='/login' element={ < Login /> } />
                }
              </Route>
            </Routes>
          </BrowserRouter>
          : 
          '' 
        }
      </AdminProvider>
    )
  }
}

export default App
