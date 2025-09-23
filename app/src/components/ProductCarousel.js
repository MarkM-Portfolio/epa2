// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCube, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/effect-cube'
import 'swiper/css/pagination'

import image1 from '../assets/pngegg-1.png'
import image2 from '../assets/pngegg-2.png'
import image3 from '../assets/pngegg-3.png'


const ProductCarousel = ({ slides }) => {
  return (
    <>
        <div className='hidden lg:flex px-6 xl:px-60'>
            <div>
                <Swiper
                    effect={'cube'}
                    grabCursor={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    speed= {2000}
                    cubeEffect={{
                    shadow: true,
                    slideShadows: true,
                    shadowOffset: 20,
                    shadowScale: 0.94,
                    }}
                    pagination={true}
                    modules={[EffectCube, Pagination, Autoplay]}
                    loop={true}
                    className='hidden lg:block w-60'
                >
                    {/* {slides.map((item) => (
                            <SwiperSlide>
                                <img src={item.image} className='h-full p-6 border'/>
                            </SwiperSlide>
                    ))}     */}
                    <SwiperSlide>
                        <img src={image1} alt="Phone"/>
                    </SwiperSlide>
                    <SwiperSlide>
                        <img src={image2} alt="Phone"/>
                    </SwiperSlide>
                    <SwiperSlide>
                        <img src={image3} alt="Phone"/>
                    </SwiperSlide>
                </Swiper>
            </div>
            
            <div className='hidden lg:flex justify-between ml-10 w-full'>
                <div className='w-[50%] h-full border-2 bg-green-500'>
                    Ads Banner
                </div>
                <div className='w-[50%]'>
                    <div className='bg-green-500 border-2 w-full h-[48%] ml-2 mb-2'>
                        Ads Banner
                    </div>
                    <div className='bg-green-500 border-2 w-full h-[49%] ml-2'>
                        Ads Banner
                    </div>
                </div>
            </div>
            
        </div>
    </>     
  )
}

export default ProductCarousel
