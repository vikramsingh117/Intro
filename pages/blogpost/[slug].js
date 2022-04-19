import React from 'react'
import { useRouter } from 'next/router'
const slug = () => {
  const router = useRouter()
  const { Slug } = router.query
  
  return (
    <div>{Slug}</div>
  )
}

export default slug