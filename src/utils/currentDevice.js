import dynamic from 'next/dynamic'

// TODO: fix this
// const currentDevice = dynamic(_ => import('current-device'), { ssr: false })

const currentDevice = {
  ios: () => false,
  desktop: () => true,
  landscape: () => true
}

export default currentDevice

