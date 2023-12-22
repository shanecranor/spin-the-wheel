// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { Wheel } from './components/wheel/wheel'
const sliceData = [
  { id: 0, text: 'slice 1', weight: 1 },
  { id: 1, text: 'slice 2', weight: 1 },
  { id: 2, text: 'slice 3', weight: 1 },
  { id: 3, text: 'slice 4', weight: 1 },
]
function App() {

  return (
    <>
      <h1>Spin the Wheel</h1>
      <Wheel sliceData={sliceData} />
    </>
  )
}

export default App
