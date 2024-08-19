import { useState, useEffect } from 'react'
import axios from 'axios'
import { Group } from '../common/types'
import EditGroups from './edit-groups'
import CreateGroup from './create-group'
import Delete from './delete'
import { FaSpinner } from 'react-icons/fa'

export default function TabGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const populateGroups = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await axios.get('http://localhost:3001/groups')
      setGroups(response.data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteGroup = async (id: string): Promise<void> => {
    try {
      await axios.delete(`http://localhost:3001/groups`, { data: { id } })
      populateGroups()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    populateGroups()
  }, [])

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen w-full'>
        <div className='animate-spin text-purple-500'>
          <FaSpinner size={20} />
        </div>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className='text-center py-10 w-full h-screen flex items-center justify-center flex-col'>
        <h2 className='text-2xl font-semibold text-gray-600'>No groups found</h2>
        <p className='text-gray-500 mt-2'>Add a new group to get started.</p>
        <CreateGroup updated={populateGroups} />
      </div>
    )
  }

  return (
    <div className='relative overflow-x-auto shadow-md sm:rounded-lg w-full'>
      <CreateGroup updated={populateGroups} />
      <table className='w-full text-sm text-left text-gray-500'>
        <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
          <tr>
            <th scope='col' className='px-6 py-3'>
              ID
            </th>
            <th scope='col' className='px-6 py-3'>
              Name
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
          {groups.map((group) => (
            <tr key={group.id} className='bg-white border-b hover:bg-gray-50'>
              <td className='px-6 py-4'>{group.id}</td>
              <td className='px-6 py-4'>{group.name}</td>
              <td className='px-6 py-4'>{group.createdAt}</td>
              <td className='px-6 py-4'>
                <EditGroups group={group} updated={populateGroups} />
                <Delete confirm={() => deleteGroup(group.id)} /> 
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
