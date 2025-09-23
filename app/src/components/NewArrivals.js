import React from 'react'

const NewArrivals = () => {
  return (
    <>
        <div className='mt-6 hidden lg:flex px-6 xl:px-60'>
            <div className='border bg-green-700 w-full h-96 rounded-2xl'>
                <div className='text-center mt-4'>
                    <h1 className='font-montserrat tracking-tighter text-6xl font-bold'><span className='bg-green-400 px-2 rounded-lg text-green-900'>NEW</span> <span className='text-white'>ARRIVALS</span></h1>
                </div>
                <div className='mt-8 gap-2 flex justify-between px-2'>
                    <div className='ml-3 text-white font-semibold'>
                        <h3 className='mb-4 font-bold'>CHECK OUT NA!</h3>
                        <div className='flex justify-between gap-1'>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-semibold mb-2">Card Title</h2>
                                <p className="text-gray-600">This is a simple card example created using Tailwind CSS.</p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-semibold mb-2">Card Title</h2>
                                <p className="text-gray-600">This is a simple card example created using Tailwind CSS.</p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-semibold mb-2">Card Title</h2>
                                <p className="text-gray-600">This is a simple card example created using Tailwind CSS.</p>
                            </div>
                            
                        </div>
                    </div>
                    <div className='mr-3 text-white font-semibold'>
                        <h3 className='mb-4 font-bold'>FEATURED COLLECTIONS</h3>
                        <div className='flex justify-between gap-1'>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-semibold mb-2">Card Title</h2>
                                <p className="text-gray-600">This is a simple card example created using Tailwind CSS.</p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-semibold mb-2">Card Title</h2>
                                <p className="text-gray-600">This is a simple card example created using Tailwind CSS.</p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-semibold mb-2">Card Title</h2>
                                <p className="text-gray-600">This is a simple card example created using Tailwind CSS.</p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default NewArrivals