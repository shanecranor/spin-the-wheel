// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { WheelSpinner } from './components/wheel-spinner/wheel-spinner'
import { tempSliceData } from './components/wheel/temp-data'
function App() {

  return (
    <>
      <h1>Spin the Wheel</h1>
      <WheelSpinner initialSliceData={tempSliceData} />
    </>
  )
}

export default App
