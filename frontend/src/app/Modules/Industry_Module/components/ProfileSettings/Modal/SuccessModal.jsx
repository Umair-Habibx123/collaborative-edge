import PropTypes from "prop-types";
import { motion } from "framer-motion";

const SuccessModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <motion.div
                className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Success!</h2>
                <p className="text-gray-600">{message}</p>
                <button
                    onClick={onClose}
                    className="mt-4 px-5 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                >
                    OK
                </button>
            </motion.div>
        </div>
    );
};

// PropTypes for type-checking
SuccessModal.propTypes = {
    isOpen: PropTypes.bool.isRequired, // Controls whether the modal is open
    onClose: PropTypes.func.isRequired, // Function to close the modal
    message: PropTypes.string.isRequired, // Success message to display
};

export default SuccessModal;