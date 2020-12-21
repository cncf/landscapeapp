import dynamic from 'next/dynamic'

const currentDevice = dynamic(_ => import('current-device'), { ssr: false })

export default currentDevice

