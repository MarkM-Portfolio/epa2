import React from 'react';

export const Tooltip = ({content}) => {
  return (
    <div className="absolute top-3 right-3 w-3 h-3 flex items-center justify-center cursor-pointer">
      <div className="group cursor-pointer relative inline-block text-center">
        <svg height="0.75em" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm0 1.5c-4.69 0-8.497 3.807-8.497 8.497s3.807 8.498 8.497 8.498 8.498-3.808 8.498-8.498-3.808-8.497-8.498-8.497zm0 6.5c-.414 0-.75.336-.75.75v5.5c0 .414.336.75.75.75s.75-.336.75-.75v-5.5c0-.414-.336-.75-.75-.75zm-.002-3c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1z" fillRule="nonzero" />
        </svg>
        <div style={{maxWidth: 256+'px'}} className="opacity-0 w-max -left-4 mt-2 bg-black/70 text-white text-left text-xs rounded py-2 px-4 absolute z-10 group-hover:opacity-100 pointer-events-none">
          { content }
          <svg style={{left: 18+'px'}} className="absolute text-black h-2 -top-2 rotate-180" x="0px" y="0px" viewBox="0 0 255 255">
            <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
          </svg>
        </div>
      </div>
    </div>
  )
}
