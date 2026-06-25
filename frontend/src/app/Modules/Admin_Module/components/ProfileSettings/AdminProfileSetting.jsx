import { useState, useEffect } from "react";
import { UserCircle2, Edit, LoaderCircle, Save, CheckCircle, Edit2, CircleX } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import Loading from "../../../../Components/loadingIndicator/loading";
import bcrypt from 'bcryptjs';

const ProfileSetting = ({ theme }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [error, setError] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [profileImage, setProfileImage] = useState(null);
    const [selectedProfilePic, setSelectedProfilePic] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState("");
    const [previousProfilePicUrl, setPreviousProfilePicUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isHashing, setIsHashing] = useState(false);
    const navigate = useNavigate();




    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user-profile`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setUser(data);
                setUploadedImageUrl(data.profilePic);
                setPreviousProfilePicUrl(data.profilePic);
            } catch (error) {
                console.error("Error fetching profile:", error.message);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);





    const handleEdit = (field) => {
        setEditingField(field);
        setFormData({ ...formData, [field]: user[field] || "" });
    };

    const usernameRegex = /^[A-Za-z0-9_]{3,20}$/; // 3-20 characters, no spaces or special chars except "_"
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/;

    const handleChange = (e) => {
        setFormData({ ...formData, [editingField]: e.target.value });
    };


    const handleSave = async () => {
        if (editingField === "username" && !usernameRegex.test(formData.username)) {
            setErrorMessage("Invalid username. It should be 3-16 characters long and can contain letters, numbers, underscores, and hyphens.");
            setIsErrorModalOpen(true);
            return;
        }

        if (editingField === "password" && !passwordRegex.test(formData.password)) {
            setErrorMessage("Invalid password. It should be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.");
            setIsErrorModalOpen(true);
            return;
        }

        setIsSaving(true);
        try {
            let valueToUpdate = formData[editingField];

            if (editingField === "password") {
                setIsHashing(true);
                const hashedPassword = await bcrypt.hash(formData.password, 10);
                valueToUpdate = hashedPassword;
                setIsHashing(false);
            }

            // Optimistic update (don't show hashed password in UI)
            const updatedUser = { ...user, [editingField]: editingField === "password" ? "********" : formData[editingField] };
            setUser(updatedUser);

            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/updateProfile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ [editingField]: valueToUpdate })
            });

            if (!response.ok) throw new Error("Failed to update profile");

            toast.success("Profile updated successfully!");
            setEditingField(null);
        } catch (error) {
            // Revert optimistic update on error
            setUser(user);
            toast.error("Failed to update profile. Please try again.");
            console.error("Update error:", error);
        } finally {
            setIsSaving(false);
            setIsHashing(false);
        }
    };


    const handleCancel = async () => {
        if (editingField === "username") {
            setEditingField(null);
            return;
        }

        if (editingField === "password") {
            setEditingField(null);
            return;
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file); // Create preview URL
        setProfileImage(previewUrl); // Show image preview
        setSelectedProfilePic(file); // Store file for later upload
    };

    const handleUploadImage = async () => {
        if (!selectedProfilePic) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("profilePic", selectedProfilePic);

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/uploadProfilePic`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                // Delete the old profile picture if it exists
                if (previousProfilePicUrl) {
                    await deleteProfilePic(previousProfilePicUrl);
                }

                setUploadedImageUrl(data.fileUrl);
                await updateProfilePic(data.fileUrl);
                toast.success("Profile picture uploaded successfully!", { autoClose: 2000 });

                setSelectedProfilePic("");

                setTimeout(() => {
                    window.location.reload();
                }, 2000); // Match the autoClose time
            }
            else {
                toast.error("Profile picture upload failed. Please try again.");
                console.error("Profile picture upload failed:", data.error);
            }
        } catch (error) {
            toast.error("Error uploading profile picture. Please try again.");
            console.error("Error uploading profile picture:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const deleteProfilePic = async (fileUrl) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/deletefile`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fileUrl }),
            });

            const result = await response.json();
            if (!response.ok) {
                console.error("Failed to delete profile picture:", result.message);
            } else {
                console.log("Profile picture deleted successfully:", result.message);
            }
        } catch (error) {
            console.error("Error deleting profile picture:", error);
        }
    };



    const updateProfilePic = async (imageUrl) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/updateProfile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ profilePic: imageUrl }),
            });

            if (!response.ok) throw new Error("Failed to update profile picture");
            setUser({ ...user, profilePic: imageUrl });
        } catch (error) {
            console.error("Update error:", error);
        }
    };



    if (loading) {
        return (
            <Loading />
        );
    }


    if (error) {
        return <p className="text-red-500 text-center">{error}</p>;
    }

    return (
        <div
            className={`border-2 border-gray-300 max-w-7xl p-6 sm:p-8 shadow-xl my-16 sm:my-24 rounded-xl mx-auto bg-gradient-to-br ${theme === "dark"
                ? "from-gray-800 to-gray-900 text-white"
                : "from-gray-50 to-white text-gray-800"
                }`}
        >
            <ToastContainer />

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-accent-500">
                Profile Settings
            </h2>

            {/* Profile Image and Details */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                {/* Profile Image Section */}
                <div className="relative w-full md:w-1/3 flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg">
                        {profileImage || uploadedImageUrl ? (
                            <img
                                src={profileImage || uploadedImageUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <UserCircle2 className="w-full h-full text-gray-400" />
                        )}
                    </div>

                    {/* Edit Profile Image Button */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="profilePicInput"
                    />
                    <label
                        htmlFor="profilePicInput"
                        className={`absolute bottom-0 right-0 p-2 rounded-full shadow-md cursor-pointer transition ${theme === "dark"
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-white hover:bg-gray-100"
                            }`}
                    >
                        <Edit className="text-brand-500" />
                    </label>

                    {/* Upload Button */}
                    {selectedProfilePic && (
                        <button
                            onClick={handleUploadImage}
                            disabled={isUploading}
                            className={`mt-4 px-6 py-2 rounded-lg flex items-center justify-center transition ${theme === "dark"
                                ? "bg-brand-600 hover:bg-brand-700"
                                : "bg-brand-500 hover:bg-brand-600"
                                } text-white`}
                        >
                            {isUploading ? (
                                <LoaderCircle className="animate-spin mr-2" />
                            ) : (
                                <Save className="mr-2" />
                            )}
                            {isUploading ? "Uploading..." : "Upload Profile Picture"}
                        </button>
                    )}
                </div>

                {/* User Details Section */}
                <div className="w-full md:w-2/3 space-y-4">
                    {/* Email */}
                    <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-opacity-50 backdrop-blur-sm bg-white/10">
                        <p>
                            <strong>Email:</strong> {user.email}
                        </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2 p-4 rounded-lg shadow-sm bg-opacity-50 backdrop-blur-sm bg-white/10">
                        <strong>Status:</strong>
                        <CheckCircle
                            className={
                                user.status === "verified" ? "text-green-500" : "text-red-500"
                            }
                        />
                        <span>{user.status}</span>
                    </div>

                    {/* Username */}
                    <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-opacity-50 backdrop-blur-sm bg-white/10">
                        <p>
                            <strong>Username:</strong>{" "}
                            {editingField === "username" ? (
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`border rounded p-2 w-full ${theme === "dark"
                                        ? "bg-gray-800 text-white border-gray-700"
                                        : "bg-white text-black border-gray-300"
                                        }`}
                                />
                            ) : (
                                user.username
                            )}
                        </p>
                        <button
                            onClick={() => handleEdit("username")}
                            className={`p-2 rounded-full shadow-md transition ${theme === "dark"
                                ? "bg-gray-700 hover:bg-gray-600"
                                : "bg-white hover:bg-gray-100"
                                }`}
                        >
                            <Edit className="text-brand-500" />
                        </button>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-opacity-50 backdrop-blur-sm bg-white/10">
                        <p>
                            <strong>Password:</strong>{" "}
                            {editingField === "password" ? (
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`border rounded p-2 w-full ${theme === "dark"
                                        ? "bg-gray-800 text-white border-gray-700"
                                        : "bg-white text-black border-gray-300"
                                        }`}
                                />
                            ) : (
                                "********"
                            )}
                        </p>
                        <button
                            onClick={() => handleEdit("password")}
                            className={`p-2 rounded-full shadow-md transition ${theme === "dark"
                                ? "bg-gray-700 hover:bg-gray-600"
                                : "bg-white hover:bg-gray-100"
                                }`}
                        >
                            <Edit className="text-brand-500" />
                        </button>
                    </div>

                    {/* Save and Cancel Buttons */}
                    {editingField && (
                        <div className="flex space-x-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`px-6 py-2 rounded-lg flex items-center justify-center transition ${theme === "dark"
                                    ? "bg-brand-600 hover:bg-brand-700"
                                    : "bg-brand-500 hover:bg-brand-600"
                                    } text-white`}
                            >
                                {isSaving ? (
                                    <LoaderCircle className="animate-spin mr-2" />
                                ) : (
                                    <Save className="mr-2" />
                                )}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                onClick={handleCancel}
                                className={`px-6 py-2 rounded-lg flex items-center justify-center transition ${theme === "dark"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-red-500 hover:bg-red-600"
                                    } text-white`}
                            >
                                <CircleX className="mr-2" />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Info Section */}
            <div
                className={`space-y-4 border-t pt-6 ${theme === "dark" ? "border-gray-700" : "border-gray-300"
                    }`}
            >
                <p className={`${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    <strong>Role:</strong> {user.role}
                </p>
                <p className={`${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    <strong>Account Created:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <p className={`${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(user.updatedAt).toLocaleDateString()}
                </p>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <motion.div
                        className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Success!</h2>
                        <p className="text-gray-600">Industries saved successfully.</p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="mt-4 px-5 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                        >
                            OK
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Error Modal */}
            <ErrorModal
                isOpen={isErrorModalOpen}
                message={errorMessage}
                onClose={() => setIsErrorModalOpen(false)}
                theme={theme}
            />
        </div>
    );


};

ProfileSetting.propTypes = {
    theme: PropTypes.string.isRequired,
};


const ErrorModal = ({ theme, isOpen, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm ${theme === 'dark' ? 'bg-black/60' : 'bg-black/40'}`}>
            <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-lg w-96`}>
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{message}</p>
                <button
                    className={`mt-4 px-4 py-2 ${theme === 'dark' ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'} text-white rounded`}
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>

    );
};

ErrorModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,  // Boolean flag to show/hide the modal
    message: PropTypes.string.isRequired, // Error message should be a string
    onClose: PropTypes.func.isRequired, // Function to close the modal
    theme: PropTypes.string.isRequired, // Function to close the modal

};


const ConfirmationModal = ({ theme, isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className={`p-6 rounded-lg shadow-lg w-96  ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
                <p className={` ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{message}</p>
                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        className={`px-4 py-2 rounded  ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className={`px-4 py-2 rounded text-white  ${theme === 'dark' ? 'bg-red-700 hover:bg-red-600' : 'bg-red-500 hover:bg-red-600'}`}
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>

    );
};

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    theme: PropTypes.string.isRequired, // Function to close the modal

};





export default ProfileSetting;