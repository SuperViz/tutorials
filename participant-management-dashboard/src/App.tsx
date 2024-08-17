import { useState } from 'react'
import { Tab, TabActive } from './common/constants'
import ActivePage from './components/active-page'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Participants)

  const isActiveTab = (tab: Tab) => tab === activeTab ? TabActive.Active : TabActive.Inactive

  return (
    <div className='w-full h-full flex flex-col'>
      <header className='w-full p-5 bg-gray-800 flex items-center justify-between'>
        <div>
          <h1 className='text-white text-2xl font-bold'>Participant Management</h1>
        </div>
      </header>
      <main className='p-12'>
        <div className='md:flex'>
          <ul className='flex-column space-y space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400 md:me-4 mb-4 md:mb-0'>
            <li>
              <a onClick={() => setActiveTab(Tab.Participants)} className={isActiveTab(Tab.Participants)}>
                <svg className='w-4 h-4 me-2 text-white' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z' />
                </svg>
                Participants 
              </a>
            </li>
            <li>
              <a onClick={() => setActiveTab(Tab.Groups)} className={isActiveTab(Tab.Groups)}>
                <svg className='w-4 h-4 me-2 text-gray-500 dark:text-gray-400' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 18 18'><path d='M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z' /></svg>
                 Groups
              </a>
            </li>
          </ul>
          <ActivePage tab={activeTab}></ActivePage>
        </div>
      </main>
    </div>
  )
}
