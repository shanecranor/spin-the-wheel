// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { Wheel } from './components/wheel/wheel'
const sliceData = [
  { id: 0, text: 'end stream', weight: 1 },
  { id: 1, text: 'play valorant', weight: 1 },
  { id: 2, text: 'cry ', weight: 1 },
  { id: 3, text: 'eat spicy chip', weight: 1 },
  { id: 4, text: 'jumping jacks', weight: 2 },
  { id: 5, text: '100 pushups', weight: 0.1 },


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
