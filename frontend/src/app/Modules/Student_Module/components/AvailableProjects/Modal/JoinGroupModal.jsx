import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Users, Hash } from 'lucide-react';

const JoinGroupModal = ({ isOpen, onClose, onJoin, theme }) => {
    const [selectionId, setSelectionId] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Clear the input field and error when the modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectionId('');
            setError('');
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleJoinClick = async () => {
        if (!selectionId) {
            setError('Selection ID is required');
            return;
        }

        if (selectionId.length < 5) {
            setError('Selection ID must be at least 5 characters long');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const result = await onJoin(selectionId);
            if (!result.success) {
                setError(result.error);
            } else {
                onClose();
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50"
        onClick={onClose}
        >
            <div 
                className={`relative w-full max-w-md rounded-xl shadow-2xl transition-all duration-300 ease-in-out ${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-3 rounded-full ${theme === "dark" ? "bg-brand-900/30" : "bg-brand-100"}`}>
                            <Users size={24} className="text-brand-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Join Existing Group</h2>
                            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                Enter the selection ID to join a group
                            </p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="selectionId" className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                            Selection ID
                        </label>
                        <div className={`relative flex items-center border rounded-lg transition-all ${error ? "border-red-500" : theme === "dark" ? "border-gray-700 focus-within:border-brand-500" : "border-gray-300 focus-within:border-brand-500"}`}>
                            <div className={`absolute left-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                <Hash size={18} />
                            </div>
                            <input
                                id="selectionId"
                                type="text"
                                placeholder="e.g. ABC123"
                                value={selectionId}
                                onChange={(e) => setSelectionId(e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 bg-transparent outline-none rounded-lg ${theme === "dark" ? "placeholder-gray-500" : "placeholder-gray-400"}`}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                <X size={14} className="inline" /> {error}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleJoinClick}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg font-medium text-white bg-brand-500 hover:bg-brand-600 transition-colors flex items-center gap-2 ${isLoading ? "opacity-80 cursor-not-allowed" : ""}`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Joining...
                                </>
                            ) : (
                                <>
                                    Join Group
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// PropTypes validation
JoinGroupModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onJoin: PropTypes.func.isRequired,
    user: PropTypes.shape({
        email: PropTypes.string.isRequired,
        name: PropTypes.string,
    }).isRequired,
    projectId: PropTypes.string.isRequired,
    theme: PropTypes.string.isRequired,
};

export default JoinGroupModal;