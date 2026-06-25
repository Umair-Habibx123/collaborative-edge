import PropTypes from "prop-types";
import { memo } from "react";

const NoInternetModal = memo(({ isOpen, onClose }) => {
  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out hover:scale-105">
        <div className="text-center">
          {/* Icon for visual appeal */}
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Internet Connection
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            You are currently offline. Please check your internet connection and
            try again.
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  ) : null;
});

NoInternetModal.displayName = "NoInternetModal";

NoInternetModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NoInternetModal;