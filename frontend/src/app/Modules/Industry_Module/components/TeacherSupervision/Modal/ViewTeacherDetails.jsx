import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";

const ViewTeacherModal = ({ isOpen, onClose, userDetails, theme }) => {
    const [isImageLoading, setIsImageLoading] = useState(true);

    useEffect(() => {
        if (userDetails?.profilePic) {
            const img = new Image();
            img.src = userDetails.profilePic;
            img.onload = () => setIsImageLoading(false);
            img.onerror = () => setIsImageLoading(false);
        }
    }, [userDetails]);

    if (!isOpen || !userDetails) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className={`rounded-2xl shadow-lg w-full max-w-lg p-6 relative ${theme === "dark" ? "text-white bg-gray-900" : "text-gray-900 bg-white"}`}>
                
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-center mb-6">User Details</h2>

                <div className="flex flex-col items-center space-y-4">
                    {userDetails.profilePic && (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                            {isImageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                    <div className="animate-spin h-6 w-6 border-t-2 border-gray-500 dark:border-white rounded-full"></div>
                                </div>
                            )}
                            <img 
                                src={userDetails.profilePic} 
                                alt="Profile" 
                                className={`w-full h-full object-cover ${isImageLoading ? "opacity-0" : "opacity-100"}`}
                            />
                        </div>
                    )}
                    <div className="text-center">
                        <p className="text-lg font-semibold">{userDetails.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{userDetails.email}</p>
                    </div>
                </div>

                {userDetails.role === "teacher" && userDetails.teacherDetails && (
                    <div className={`mt-6 p-4 rounded-lg shadow-sm${theme === "dark" ? "text-white bg-gray-900" : "text-gray-900 bg-gray-100"}`}>
                        <h3 className="text-lg font-semibold mb-3">Teacher Details</h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-semibold">Employee ID:</span> {userDetails.teacherDetails.employeeId}</p>
                            <p><span className="font-semibold">Designation:</span> {userDetails.teacherDetails.designation}</p>
                            <p><span className="font-semibold">Department:</span> {userDetails.teacherDetails.department}</p>
                            <p><span className="font-semibold">University:</span> {userDetails.teacherDetails.university}</p>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-center">
                    <button onClick={onClose} className="px-5 py-2.5 text-white rounded-lg bg-brand-600 hover:bg-brand-700 transition-all">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

ViewTeacherModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userDetails: PropTypes.shape({
        username: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
        profilePic: PropTypes.string,
        teacherDetails: PropTypes.shape({
            employeeId: PropTypes.string.isRequired,
            designation: PropTypes.string.isRequired,
            department: PropTypes.string.isRequired,
            university: PropTypes.string.isRequired,
        }),
    }),
    theme: PropTypes.oneOf(["light", "dark"]).isRequired,
};

export default ViewTeacherModal;
