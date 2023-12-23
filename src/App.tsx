// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { EntryManager } from './components/entry-manager/entry-manager'
import { WheelSpinner } from './components/wheel-spinner/wheel-spinner'
import { tempSliceData } from './components/wheel/temp-data'
function App() {

  return (
    <main>

      <div className='wheel'>
        <h1>Spin the Wheel</h1>
        <WheelSpinner initialSliceData={tempSliceData} />
        <div className='wheel-controls'>
          <button>Open Submissions</button>
          <button>Close Submissions</button>
          <button>Settings</button>
          <div className="settings">
            <button>import</button>
            <button>export</button>
            <button>restore removed entries</button>
            <button>clear all submissions</button>
            <label>remove slice after spin?<input type="checkbox" /></label>
          </div>
        </div>
      </div>
      <aside className='wheel-items'>
        {/* open close menu button (autohide once playing?) */}
        <EntryManager />
      </aside>
    </main>
  )
}

export default App
