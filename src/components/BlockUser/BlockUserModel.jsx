import { AlertCircle } from "lucide-react";

const BlockedUserModal = ({ onReturn }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="flex items-center gap-2 text-red-600 text-xl font-semibold">
            <AlertCircle className="h-6 w-6" />
            Account Blocked
          </h2>
        </div>
        <div className="p-4">
          <p className="text-lg mb-4">
            Your account has been blocked by an administrator.
          </p>
          <p className="text-gray-600">
            Please contact support for further assistance and information
            regarding your account status.
          </p>
        </div>
        <div className="p-4 border-t">
          <button
            onClick={onReturn}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Return to Login Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockedUserModal;
