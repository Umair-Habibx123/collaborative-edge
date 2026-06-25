import PropTypes from "prop-types";
import { UserCircle2, X, Mail, Shield, Clock, CheckCircle2, AlertCircle, Ban } from "lucide-react";

const ViewModal = ({ user, onClose, theme }) => {
    if (!user) return null;
    
    const profilePicUrl = user.profilePic
        ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${user.profilePic}`
        : null;

    // Status display configuration
    const statusConfig = {
        verified: {
            icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
            text: "Verified",
            bgColor: "bg-green-100 dark:bg-green-900",
            textColor: "text-green-800 dark:text-green-200"
        },
        pending: {
            icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
            text: "Pending Verification",
            bgColor: "bg-yellow-100 dark:bg-yellow-900",
            textColor: "text-yellow-800 dark:text-yellow-200"
        },
        banned: {
            icon: <Ban className="w-4 h-4 text-red-500" />,
            text: "Banned",
            bgColor: "bg-red-100 dark:bg-red-900",
            textColor: "text-red-800 dark:text-red-200"
        }
    };

    const currentStatus = statusConfig[user.status] || statusConfig.pending;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className={`p-6 rounded-xl shadow-xl max-w-md w-full mx-auto border ${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white border-gray-200"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center space-y-4">
                    {/* Close button (top right) */}
                    <button
                        onClick={onClose}
                        className={`self-end p-1 rounded-full ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Profile Picture */}
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-2 flex items-center justify-center"
                            style={{ borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb" }}
                        >
                            {profilePicUrl ? (
                                <img
                                    src={profilePicUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/150";
                                    }}
                                />
                            ) : (
                                <UserCircle2 className="w-full h-full text-gray-400" strokeWidth={1} />
                            )}
                        </div>
                        {user.status === "verified" && (
                            <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-2 border-white dark:border-gray-800">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Username with role badge */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">{user.username}</h2>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                user.role === "admin" 
                                    ? "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200" 
                                    : user.role === "industry"
                                    ? "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200"
                                    : user.role === "teacher"
                                    ? "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200"
                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }`}>
                                {user.role}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${currentStatus.bgColor} ${currentStatus.textColor}`}>
                                {currentStatus.icon}
                                <span className="ml-1">{currentStatus.text}</span>
                            </span>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="w-full space-y-3">
                        <div className={`flex items-center p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                            <Mail className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>

                        {/* Enhanced Status Display */}
                        <div className={`flex items-center p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                            <Shield className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                                <div className="flex items-center gap-2">
                                    {currentStatus.icon}
                                    <p className="font-medium capitalize">{currentStatus.text}</p>
                                </div>
                            </div>
                        </div>

                        {/* Role-Specific Verification Status */}
                        {user.roleVerified !== undefined && (
                            <div className={`flex items-center p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                                <CheckCircle2 className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Role Verification</p>
                                    <p className="font-medium">
                                        {user.roleVerified ? "Verified" : "Pending Verification"}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className={`flex flex-col p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                                <div className="flex items-center mb-1">
                                    <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                                </div>
                                <p className="font-medium text-sm">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className={`flex flex-col p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                                <div className="flex items-center mb-1">
                                    <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Updated</p>
                                </div>
                                <p className="font-medium text-sm">
                                    {new Date(user.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className={`mt-4 px-6 py-2 rounded-lg font-medium transition-colors ${
                            theme === "dark" 
                                ? "bg-gray-700 hover:bg-gray-600 text-white" 
                                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

ViewModal.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string,
        username: PropTypes.string,
        email: PropTypes.string,
        profilePic: PropTypes.string,
        role: PropTypes.string,
        status: PropTypes.string,
        roleVerified: PropTypes.bool,
        createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    }),
    onClose: PropTypes.func.isRequired,
    theme: PropTypes.string.isRequired,
};

export default ViewModal;