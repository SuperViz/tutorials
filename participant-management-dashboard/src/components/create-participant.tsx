import { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: 'transparent',
    border: 'none'
  },
};

Modal.setAppElement('#root');

export default function EditParticipant({ updated }: { updated: () => void }) {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  async function save() {
    try {
      await axios.post('http://localhost:3001/participants', {
        id,
        name,
        email,
        avatar
      })
      closeModal()
      updated()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <a onClick={openModal} className="font-medium text-purple-600 hover:underline cursor-pointer">Create Participant</a>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <div className="relative w-full max-w-2xl max-h-full">
          {/* <!-- Modal content --> */}
          <div className="relative bg-white rounded-lg shadow">
            {/* <!-- Modal header --> */}
            <div className="flex items-start justify-between p-4 border-b rounded-t">
              <h3 className="text-xl font-semibold text-gray-900">
                Create Participant
              </h3>
              <button onClick={closeModal} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="editUserModal">
                <svg onClick={closeModal} className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            {/* <!-- Modal body --> */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="id" className="block mb-2 text-sm font-medium text-gray-900">ID</label>
                  <input onChange={(e) => setId(e.target.value)} value={id} type="text" name="id" id="id" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5" placeholder="1297" required />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Name</label>
                  <input onChange={(e) => setName(e.target.value)} value={name} type="text" name="name" id="name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5" placeholder="Bonnie" />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                  <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" name="email" id="email" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5" placeholder="example@company.com" />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="avatar" className="block mb-2 text-sm font-medium text-gray-900">Avatar</label>
                  <input onChange={(e) => setAvatar(e.target.value)} value={avatar} type="text" name="avatar" id="avatar" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5" placeholder="https://<URL>.com/your-image.png" />
                </div>
              </div>
            </div>
            {/* <!-- Modal footer --> */}
            <div onClick={save} className="flex items-center p-6 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
              <button type="submit" className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Create</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
