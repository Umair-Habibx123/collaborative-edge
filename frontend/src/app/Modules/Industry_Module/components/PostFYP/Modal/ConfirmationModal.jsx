import PropTypes from "prop-types";

const ConfirmationModal = ({ theme, isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className={`p-8 rounded-lg shadow-lg max-w-md ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
                <h3 className="text-xl font-semibold">Confirm Submission</h3>
                <p className={`mt-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Are you sure you want to upload this project? It will be marked as <strong>pending</strong> until respective universities reviews and approves it. Once approved, only students from <strong>approved</strong> university will be able to select and work on it.
                </p>
                <div className="flex justify-end mt-4 space-x-4">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-brand-600 text-white rounded-lg"
                    >
                        Yes, Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    theme: PropTypes.string.isRequired,
};

export default ConfirmationModal