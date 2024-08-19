import { useState } from 'react'
import { Tab, TabActive } from './common/constants'
import ActivePage from './components/active-page'
import { FaUsers, FaLayerGroup } from 'react-icons/fa'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Participants)

  const isActiveTab = (tab: Tab) => tab === activeTab ? TabActive.Active : TabActive.Inactive

  return (
    <div className='w-full h-full flex flex-col'>
      <header className='w-full p-5 bg-purple-500 flex items-center justify-between'>
        <div>
          <h1 className='text-white text-2xl font-bold'>Participant Management</h1>
        </div>
      </header>
      <main className='p-12'>
        <div className='md:flex w-full'>
          <ul className='flex-column space-y space-y-4 text-sm font-medium text-gray-500 md:me-4 mb-4 md:mb-0'>
            <li>
              <a onClick={() => setActiveTab(Tab.Participants)} className={isActiveTab(Tab.Participants)}>
                <span className='inline-flex items-center'>
                  <FaUsers size={16} style={{ marginRight: '0.5rem' }} />
                  Participants
                </span>
              </a>
            </li>
            <li>
              <a onClick={() => setActiveTab(Tab.Groups)} className={isActiveTab(Tab.Groups)}>
                <span className='inline-flex items-center'>
                  <FaLayerGroup size={16} style={{ marginRight: '0.5rem' }} />
                  Groups
                </span>
              </a>
            </li>
          </ul>
          <ActivePage tab={activeTab}></ActivePage>
        </div>
      </main>
    </div>
  )
}
