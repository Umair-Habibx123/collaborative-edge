import PropTypes from "prop-types";
import ClipLoader from "react-spinners/ClipLoader";

const ConfirmationModal = ({ theme, isOpen, onClose, onConfirm, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`p-6 rounded-lg shadow-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-800 dark:text-white" : "bg-white text-gray-900"}`}>
                <h3 className={`text-lg font-bold ${theme === "dark" ? "dark:text-white" : "text-gray-900"}`}>
                    Confirm Save
                </h3>
                <p className={`mt-2 ${theme === "dark" ? "dark:text-gray-300" : "text-gray-600"}`}>
                    Are you sure you want to save these changes?
                </p>
                <div className="flex justify-end space-x-4 mt-4">
                    {isLoading ? (
                        <ClipLoader color={theme === "dark" ? "#ffffff" : "#000000"} loading={isLoading} size={20} />

                    ) : (
                        <>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 rounded-lg transition-all duration-300 bg-brand-500 text-white hover:bg-brand-600"
                            >
                                Yes, Save
                            </button>
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-600 text-white hover:bg-gray-700" : "bg-gray-500 text-white hover:bg-gray-600"}`}
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    theme: PropTypes.string.isRequired,
};

export default ConfirmationModal;