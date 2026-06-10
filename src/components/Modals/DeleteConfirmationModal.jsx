export default function DeleteConfirmationModal({message, setDeleteResumeId, setShowDeleteConfirmationModal, onDelete}) {
  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center" onClick={() => setShowDeleteConfirmationModal(false)}>
        <div className="relative bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold mb-4">{message}</h3>


          <div className="flex justify-end gap-3">
            <button
              onClick={() => {setShowDeleteConfirmationModal(false);setDeleteResumeId(null);}}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
