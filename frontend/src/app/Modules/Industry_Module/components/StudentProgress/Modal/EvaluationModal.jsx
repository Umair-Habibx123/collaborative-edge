import { useState } from "react";
import PropTypes from "prop-types";
import { Star, X, MessageSquare,ClipboardList,AlertCircle,Loader2,Send } from "lucide-react";
import axios from "axios";
const EvaluationModal = ({ 
    submissionId, 
    projectId, 
    selectionId, 
    onClose,
    onReviewSubmit,
    theme,
    user
}) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comments, setComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const reviewerId = user.email;
            const fullName = user.username;
            const reviewerRole = user.role;

            const reviewData = {
                projectId,
                selectionId,
                review: {
                    reviewerId,
                    reviewerRole,
                    fullName,
                    comments,
                    rating,
                    reviewedAt: new Date().toISOString()
                }
            };

            const response = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/insertReview`,
                reviewData
            );

            onReviewSubmit(response.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-300 ${theme === 'dark' ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/50 backdrop-blur-sm'}`}>
            <div className="flex items-center justify-center min-h-screen p-4">
                <div 
                    className={`relative rounded-2xl shadow-2xl w-full max-w-md mx-auto transition-all duration-300 transform ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                >
                    <button
                        onClick={onClose}
                        className={`absolute top-4 right-4 rounded-full p-2 transition-colors duration-200 ${
                            theme === 'dark' 
                                ? 'text-gray-400 hover:bg-gray-700/80 hover:text-white' 
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="p-6 space-y-6">
                        <div className="text-center">
                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                                <ClipboardList className={`h-6 w-6 ${theme === 'dark' ? 'text-brand-400' : 'text-brand-500'}`} />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Evaluate Submission</h2>
                            <p className={`mt-1 text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                                Share your honest feedback
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className={`block text-sm font-medium mb-3 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Rating
                                </label>
                                <div className="flex items-center justify-center space-x-1">
                                    {[...Array(5)].map((_, index) => {
                                        const currentRating = index + 1;
                                        return (
                                            <button
                                                type="button"
                                                key={currentRating}
                                                className={`transition-all duration-200 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-300'} ${
                                                    (hover || rating) >= currentRating 
                                                        ? theme === 'dark' 
                                                            ? 'text-yellow-400 scale-110' 
                                                            : 'text-yellow-500 scale-110' 
                                                        : ''
                                                }`}
                                                onClick={() => setRating(currentRating)}
                                                onMouseEnter={() => setHover(currentRating)}
                                                onMouseLeave={() => setHover(0)}
                                            >
                                                <Star 
                                                    className={`h-9 w-9 ${(hover || rating) >= currentRating ? 'fill-current' : ''}`} 
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className={`mt-2 text-center text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    {rating > 0 ? (
                                        <span className="font-medium">
                                            You rated {rating} star{rating !== 1 ? 's' : ''}
                                        </span>
                                    ) : "Select a rating"}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="comments" className={`block text-sm font-medium mb-3 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Feedback Comments
                                </label>
                                <div className={`relative rounded-xl shadow-sm overflow-hidden transition-all duration-200 ${
                                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                                }`}>
                                    <div className="absolute top-3 left-3">
                                        <MessageSquare className={`h-5 w-5 ${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }`} />
                                    </div>
                                    <textarea
                                        id="comments"
                                        name="comments"
                                        rows={4}
                                        className={`resize-none block w-full pl-10 pr-3 py-3 border-0 ${
                                            theme === 'dark' 
                                                ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500/50' 
                                                : 'bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-400/50'
                                        } rounded-xl focus:outline-none transition-all duration-200`}
                                        placeholder="Provide detailed feedback..."
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className={`p-3 rounded-lg flex items-start space-x-2 ${
                                    theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                                }`}>
                                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        theme === 'dark' 
                                            ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                                            : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                                    }`}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-5 py-2.5 text-sm font-medium rounded-lg text-white transition-colors duration-200 ${
                                        theme === 'dark' 
                                            ? 'bg-brand-600 hover:bg-brand-700' 
                                            : 'bg-brand-500 hover:bg-brand-600'
                                    } flex items-center justify-center min-w-[120px] ${
                                        rating === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    disabled={isSubmitting || rating === 0}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit Review
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

EvaluationModal.propTypes = {
    submissionId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    selectionId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onReviewSubmit: PropTypes.func.isRequired,
    theme: PropTypes.string.isRequired,
    user: PropTypes.shape({
        email: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired
    }).isRequired
};

export default EvaluationModal;