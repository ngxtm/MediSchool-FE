import React, { Suspense } from 'react'
import Loading from './Loading'

const LazyComponent = ({ component }) => {
  const Component = component
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  )
}

export default LazyComponent
