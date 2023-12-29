// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.scss'
import { EntryManager } from './components/entry-manager/entry-manager'
import { WheelSpinner } from './components/wheel-spinner/wheel-spinner'
import { EntryProps, entryState$ } from './components/entry-manager/entry-state'
import { observer } from '@legendapp/state/react'
const App = observer(() => {

  return (
    <main>

      <div className='wheel'>
        <h1>Spin the Wheel</h1>
        <WheelSpinner slices={getActiveSlices(entryState$.get())} />
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
})

function getActiveSlices(entries: EntryProps[]) {
  const activeEntries = entries.filter((entry) => entry.isOnWheel).map((entry) => entry.text)
  return activeEntries.map((entry) => ({ text: entry, color: 'green', weight: 1 }))
}
export default App
