import { useState, useEffect } from 'react'
import axios from 'axios'
import { Participant } from '../common/types'
import EditParticipant from './edit-participant'
import CreateParticipant from './create-participant'
import Delete from './delete'
import { FaUser, FaSpinner } from 'react-icons/fa'

export default function TabParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const populateParticipants = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await axios.get('http://localhost:3001/participants')
      setParticipants(response.data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteParticipant = async (id: string): Promise<void> => {
    try {
      await axios.delete(`http://localhost:3001/participants`, { data: { id } })
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
      <div className='w-10 h-10 me-2 text-gray-500 flex items-center justify-center'>
        <FaUser size={20} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen w-full'>
        <div className='animate-spin text-purple-500'>
          <FaSpinner size={20} />
        </div>
      </div>
    )
  }

  if (participants.length === 0) {
    return (
      <div className='text-center py-10 w-full h-screen flex items-center justify-center flex-col'>
        <h2 className='text-2xl font-semibold text-gray-600'>No participants found</h2>
        <p className='text-gray-500 mt-2'>Add a new participant to get started.</p>
        <CreateParticipant updated={populateParticipants} />
      </div>
    )
  }

  return (
    <div className='relative overflow-x-auto shadow-md sm:rounded-lg w-full'>
      <CreateParticipant updated={populateParticipants} />
      <table className='w-full text-sm text-left text-gray-500'>
        <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
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
            <tr key={participant.id} className='bg-white border-b hover:bg-gray-50'>
              <th scope='row' className='flex items-center px-6 py-4 text-gray-900 whitespace-nowrap'>
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
