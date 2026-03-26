'use client'

import dynamic from 'next/dynamic'

const App = dynamic(() => import('../ui/App'), { ssr: false })

export default function UiApp() {
  return <App />
}
