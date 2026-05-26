import React from 'react'

interface TitleProps {
    text1 : string,
    text2 : string,
}

const Title = (props : TitleProps) => {
  return (
    <h1 className='font-medium text-2xl'>
        {props.text1} <span className='underline text-primary'>
            {props.text2}
        </span>
    </h1>
  )
}

export default Title
