import { useState, useEffect } from 'react'
import axios from 'axios'
import { Group } from '../common/types'
import EditGroups from './edit-groups'
import CreateGroup from './create-group'
import Delete from './delete'

export default function TabGroups() {
  const [groups, setGroups] = useState<Group[]>([])

  const populateGroups = async (): Promise<void> => {
    try {
      const response = await axios.get('http://localhost:5000/groups')
      setGroups(response.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  const deleteGroup = async (id: string): Promise<void> => {
    try {
      await axios.delete(`http://localhost:5000/groups`, { data: { id } })
      populateGroups()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    populateGroups()
  }, [])

  return (
    <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
      <CreateGroup updated={populateGroups} />
      <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
        <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
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
            <tr key={group.id} className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'>
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
