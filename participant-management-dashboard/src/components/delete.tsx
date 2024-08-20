import { useState } from 'react';
import Modal from 'react-modal'

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

export default function Delete({ confirm }: { confirm: () => void }) {
  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function confirmEvent () {
    confirm()
    closeModal()
  }

  return (
    <div>
      <a onClick={openModal} className="font-medium text-purple-600 hover:underline cursor-pointer">Delete</a>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow">
            <button type="button" className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-4 md:p-5 text-center">
              <svg className="mx-auto mb-4 text-gray-400 w-12 h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-500">Are you sure you want to delete this product?</h3>
              <button onClick={confirmEvent} data-modal-hide="popup-modal" type="button" className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                Yes, I'm sure
              </button>
              <button onClick={closeModal} data-modal-hide="popup-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-purple-700 focus:z-10 focus:ring-4 focus:ring-gray-100">No, cancel</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
