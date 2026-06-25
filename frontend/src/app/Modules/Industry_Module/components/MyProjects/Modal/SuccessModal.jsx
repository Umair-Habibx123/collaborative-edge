import PropTypes from "prop-types";

const SuccessModal = ({ theme, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`p-6 rounded-lg shadow-lg text-center transition-all duration-300 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                <h3 className={`text-lg font-bold ${theme === "dark" ? "dark:text-white" : "text-gray-900"}`}>
                    Success
                </h3>
                <p className={`mt-2 ${theme === "dark" ? "dark:text-gray-300" : "text-gray-600"}`}>
                    Project updated successfully!
                </p>
                <button
                    onClick={() => {
                        onClose(); // Call the onClose function
                        window.location.reload(); // Reload the page
                    }}
                    className={`mt-4 px-4 py-2 rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-brand-600 text-white hover:bg-brand-700" : "bg-brand-500 text-white hover:bg-brand-600"}`}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

SuccessModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    theme: PropTypes.string.isRequired,
};

export default SuccessModal;