import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const EditApprovalModal = ({ isOpen, onClose, approval, onSubmit, theme }) => {
    const [status, setStatus] = useState("");
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(false); // Loading state

    useEffect(() => {
        if (approval) {
            setStatus(approval.status);
            setComments(approval.comments);
        }
    }, [approval]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setLoading(true); // Set loading to true when the save process starts
        try {
            await onSubmit({ status, comments }); // Await the onSubmit function
        } catch (error) {
            console.error("Error submitting approval:", error);
        } finally {
            setLoading(false); // Reset loading state
            onClose(); // Close the modal
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className={`${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-600"} p-6 rounded-lg shadow-lg w-1/3 transition-colors duration-300`}>
                <h2 className="text-xl font-bold mb-4">Edit Approval</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={`w-full p-2 border ${theme === "dark" ? "border-gray-600 bg-gray-700 text-gray-300" : "border-gray-300 bg-white text-gray-600"} rounded-lg transition-colors duration-300`}
                    >
                        <option value="approved">Approved</option>
                        <option value="needMoreInfo">Need More Info</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Comments</label>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className={`resize-none h-48 w-full p-2 border ${theme === "dark" ? "border-gray-600 bg-gray-700 text-gray-300" : "border-gray-300 bg-white text-gray-600"} rounded-lg transition-colors duration-300`}
                        rows="4"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 ${theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-gray-500 text-white"} rounded-lg mr-2 transition-colors duration-300`}
                        disabled={loading} // Disable cancel button while loading
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`px-4 py-2 bg-brand-500 text-white rounded-lg flex items-center justify-center transition-colors duration-300`}
                        disabled={loading} // Disable save button while loading
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 mr-2 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Saving...
                            </>
                        ) : (
                            "Save"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

EditApprovalModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    approval: PropTypes.shape({
        status: PropTypes.string.isRequired,
        comments: PropTypes.string.isRequired
    }).isRequired,
    onSubmit: PropTypes.func.isRequired,
    theme: PropTypes.oneOf(["dark", "light"]).isRequired
};

export default EditApprovalModal;