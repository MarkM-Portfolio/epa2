import classNames from 'classnames'

const ModalDeleteItem = ({ show, onClose, children, state }) => {

    const overlayClasses = classNames(
        'fixed inset-0 flex items-center justify-center z-50',
        {
          'hidden': !show,
          'block': show
        }
    )
        
    const modalClasses = classNames(
        'bg-gray-200 rounded-lg p-6 overflow-y-auto',
        {
            'hidden': !show,
            'block': show,
            'sm:w-3/4': show,
            'md:w-1/2': show,
            'lg:w-1/3': show
        }
    )

    const yesButton = async (e, val, state) => {
        e.preventDefault()
        e.currentTarget.disabled = true
    
        onClose(val, state)
    }

    return (
      <>
        <div className={ overlayClasses }>
            <div className={ modalClasses }>
                <div className="flex justify-end">
                    <button className="text-gray-500 hover:text-gray-800 focus:outline-none" onClick={ onClose } >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="mt-4">{ children }
                    <div className='flex justify-end text-white gap-4 mt-4'>
                        <button onClick={ (e) => yesButton(e, e.target.value, state) } value={ 'yes' } className='bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded'>Yes</button>
                        <button onClick={ onClose } className='bg-red-500 hover:bg-red-700 py-2 px-4 rounded'>No</button>
                    </div>
                </div>
            </div>
        </div>
      </>
    )
}

export default ModalDeleteItem
