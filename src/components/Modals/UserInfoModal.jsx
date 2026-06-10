
import { getCookie } from "../../utils/cookies";

export default function UserInfoModal({ setShowUserInfoModal, onDeleteAccount, setShowUpdateInfoModal, userName, userEmail, isLoggedIn}) {
  const userId = getCookie("userId");

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center" onClick={()=> setShowUserInfoModal(false)}>
      <div className="relative bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e)=>e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-center">
          User Information
        </h2>
        <div className="text-center">
          <table className="border-separate w-full text-left mb-4 border-spacing-2">
            <tbody>
              <tr>
                <td className="w-1/2 pl-2 font-semibold pr-4 bg-gray-200 rounded-l-sm">
                  Name:
                </td>
                <td className="bg-gray-200 pl-2 rounded-r-sm">
                  {userName || "GuestUser"}
                </td>
              </tr>
              <tr>
                <td className="font-semibold pl-2 pr-4 bg-gray-200 rounded-l-sm">
                  User ID:
                </td>
                <td className="bg-gray-200 pl-2 rounded-r-sm">
                  {userId || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="font-semibold pl-2 pr-4 bg-gray-200 rounded-l-sm">
                  Email:
                </td>
                <td className="bg-gray-200 pl-2 rounded-r-sm px-2">
                  {isLoggedIn ? userEmail : "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          onClick={() => setShowUserInfoModal(false)}
          className="absolute py-1 px-2  rounded-full top-2 right-4 border bg-blue-500 text-white hover:bg-blue-600"
          title="close"
        >
          ✕
        </button>
        <div className="flex gap-2">
          <button
            className="mt-4 w-full bg-red-600 text-white py-2 enabled:cursor-pointer enabled:hover:bg-red-700 rounded-lg disabled:opacity-50"
            disabled={!isLoggedIn}
            onClick={onDeleteAccount}
          >
            Delete Account
          </button>

          <button
            className="mt-4 w-full bg-gray-600 text-white py-2 cursor-pointer hover:bg-gray-700 rounded-lg"
            onClick={() => setShowUpdateInfoModal(true)}
          >
            Update Info
          </button>
        </div>
      </div>
    </div>
  );
}
