import { useState, useEffect } from 'react'
import axios from 'axios'
import { Participant } from '../common/types'
import EditParticipant from './edit-participant'
import CreateParticipant from './create-participant'
import Delete from './delete'

export default function TabParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([])

  const populateParticipants = async (): Promise<void> => {
    try {
      const response = await axios.get('http://localhost:5000/participants')
      setParticipants(response.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  const deleteParticipant = async (id: string): Promise<void> => {
    try {
      await axios.delete(`http://localhost:5000/participants`, { data: { id } })
      populateParticipants()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    populateParticipants()
  }, [])

  const avatar = (avatar?: string) => {
    if (avatar) {
      return <img className='w-10 h-10 rounded-full' src={avatar} alt='avatar' />
    }

    return (
      <svg className='w-10 h-10 me-2 text-white' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 20 20'>
        <path d='M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z' />
      </svg>
    )
  }

  return (
    <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
      <CreateParticipant updated={populateParticipants} />
      <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
        <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
          <tr>
            <th scope='col' className='px-6 py-3'>
              Name
            </th>   
            <th scope='col' className='px-6 py-3'>
             ID 
            </th>
            <th scope='col' className='px-6 py-3'>
              Created At
            </th>
            <th scope='col' className='px-6 py-3'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant) => (
            <tr key={participant.id} className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'>
              <th scope='row' className='flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white'>
                {avatar(participant.avatar)}
                <div className='ps-3'>
                  <div className='text-base font-semibold'>{participant.name}</div>
                  <div className='font-normal text-gray-500'>{participant.email}</div>
                </div>
              </th>
              <td className='px-6 py-4'>{participant.id}</td>
              <td className='px-6 py-4'>{participant.createdAt}</td>
              <td className='px-6 py-4'>
                <EditParticipant participant={participant} updated={populateParticipants}  />
                <Delete confirm={() => deleteParticipant(participant.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
