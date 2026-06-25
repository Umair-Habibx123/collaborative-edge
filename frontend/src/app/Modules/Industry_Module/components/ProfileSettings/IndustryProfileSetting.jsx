import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import PropTypes from "prop-types";
import ErrorModal from "./Modal/ErrorModal";
import Loading from "../../../../Components/loadingIndicator/loading";
import ConfirmationModal from "./Modal/ConfirmationModal"
import EditIndustryModal from "./Modal/EditIndModal";
import DeleteConfirmationModal from "./Modal/DeletingModal";
import AddIndustryModal from "./Modal/AddNewModal";
import { Building, Calendar1, CircleCheck, CircleX, Clock, Edit, Eye, Globe, Loader2Icon, Mail, Phone, PlusCircle, Save, Trash2, User2, UserCircle2 } from "lucide-react"
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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [files, setFiles] = useState([]);
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [isAddNewModal, setIsAddNewModal] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [industries, setIndustries] = useState([]);
    const [errors, setErrors] = useState({});
    const [deletingModalOpen, setIsDeletingModalOpen] = useState(false);
    const [deletingFile, setDeletingFile] = useState(null); // State for tracking file deletion
    const [isHashing, setIsHashing] = useState(false);



    const addNewIndustry = () => {
        setIndustries([...industries, {
            industryId: `ind_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: "",
            website: "",
            address: "",
            designation: "",
            workEmail: "",
            companyContactNumber: "",
            verified: false,
            verificationDocuments: []
        }]);
        setIsAddNewModal(true);
    };


    const updateIndustry = (index, field, value) => {
        const updatedIndustries = [...industries];
        updatedIndustries[index][field] = value;
        setIndustries(updatedIndustries);
    };


    const handleRemoveFile = (fileName) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    };



    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        // Filter out files that are already saved or already added
        const newFiles = selectedFiles.filter((file) => {
            // Check if the file is already in the saved attachments
            const isAlreadySaved = selectedIndustry?.verificationDocuments?.some(
                (attachment) => attachment.fileName === file.name
            );

            // Check if the file is already in the files list
            const isAlreadyAdded = files.some((f) => f.name === file.name);

            // Only include the file if it's not already saved or added
            return !isAlreadySaved && !isAlreadyAdded;
        });

        // Add the new files to the files state
        if (newFiles.length > 0) {
            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        } else {
            alert("Some files are already saved or already added.");
        }
    };

    const showWarning = (message) => {
        setErrorMessage(message); // Set the error message
        setIsErrorModalOpen(true); // Open the modal
    };

    // Frontend (React)
    const handleIndustyEditSaveChanges = async () => {
        if (!selectedIndustry.name || !selectedIndustry.website || !selectedIndustry.address || !selectedIndustry.designation || !selectedIndustry.workEmail || !selectedIndustry.companyContactNumber) {
            setIsConfirmationModalOpen(false);
            showWarning("Please fill all required fields.");
            return;
        }

        setLoading(true);

        try {
            // Upload files and get their URLs
            const uploadedFiles = await handleFileUpload(files);

            const updatedIndustry = {
                ...selectedIndustry,
                verificationDocuments: [
                    ...(selectedIndustry.verificationDocuments || []),
                    ...uploadedFiles.map(file => ({
                        fileName: file.fileName,
                        fileUrl: file.fileUrl,
                        uploadedAt: new Date().toISOString()
                    }))
                ]
            };

            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/updateRepInd/${user.email}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ industryId: selectedIndustry.industryId, updatedIndustry }),
            });

            if (response.ok) {
                alert("Industry updated successfully");
                setIsEditModalOpen(false);
                setFiles([]);
                window.location.reload();
            } else {
                console.error("Failed to update industry");
            }
        } catch (error) {
            console.error("Error updating industry:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (files) => {
        const uploadedFiles = [];
        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/uploadFile`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const fileData = await response.json();
                uploadedFiles.push({
                    fileName: fileData.fileName,
                    fileUrl: fileData.fileUrl,
                    uploadedAt: new Date().toISOString()
                });
            } else {
                console.error("Failed to upload file:", file.name);
            }
        }
        return uploadedFiles;
    };



    const handleDeleteAttachment = async (fileUrl) => {
        setDeletingFile(fileUrl);

        try {
            // Step 1: Delete the file from storage
            const deleteResponse = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/deletefile`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fileUrl }),
            });

            if (!deleteResponse.ok) {
                throw new Error("Failed to delete file");
            }

            const deleteResult = await deleteResponse.json();
            if (!deleteResult.success) {
                throw new Error(deleteResult.message || "Failed to delete file");
            }

            // Step 2: Update the verificationDocuments array
            const updatedDocuments = selectedIndustry.verificationDocuments.filter(
                (doc) => doc.fileUrl !== fileUrl
            );

            // Step 3: Send the updated industry data to the server
            const updateResponse = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/updateRepInd/${user.email}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        industryId: selectedIndustry.industryId, // Include industryId
                        updatedIndustry: {
                            ...selectedIndustry,
                            verificationDocuments: updatedDocuments,
                        },
                    }),
                }
            );

            if (!updateResponse.ok) {
                throw new Error("Failed to update industry");
            }

            const updateResult = await updateResponse.json();
            if (!updateResult.updatedIndustry) {
                throw new Error("Failed to update industry in the database");
            }

            // Step 4: Update the local state
            setSelectedIndustry((prev) => ({
                ...prev,
                verificationDocuments: updatedDocuments,
            }));
            console.log("File deleted and industry updated successfully");
        } catch (error) {
            console.error("Error deleting file or updating industry:", error);
        } finally {
            setDeletingFile(null);
        }
    };



    const saveIndustriesToDB = async () => {
        setLoading(true); // Start loading
        const newErrors = {};

        // Validate each field
        for (const industry of industries) {
            const nameRegex = /^[A-Za-z\s]+$/;
            const websiteRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const contactNumberRegex = /^[\d+\-()\s]+$/; // Allows numbers, +, -, (, )

            if (!industry.name || !nameRegex.test(industry.name)) {
                newErrors.name = "Enter a valid Industry Name (letters only)";
                setLoading(false); // Stop loading
            }
            if (!industry.website || !websiteRegex.test(industry.website)) {
                newErrors.website = "Enter a valid Website (e.g., https://example.com)";
                setLoading(false); // Stop loading
            }
            if (!industry.address) {
                newErrors.address = "Enter a valid Address";
                setLoading(false); // Stop loading
            }
            if (!industry.designation || !nameRegex.test(industry.designation)) {
                newErrors.designation = "Enter a valid Designation (letters only)";
                setLoading(false); // Stop loading
            }
            if (!industry.workEmail || !emailRegex.test(industry.workEmail)) {
                newErrors.workEmail = "Enter a valid Work Email (e.g., user@example.com)";
                setLoading(false); // Stop loading
            }
            if (!industry.companyContactNumber || !contactNumberRegex.test(industry.companyContactNumber)) {
                newErrors.companyContactNumber = "Enter a valid Contact Number (digits, +, -, () allowed)";
                setLoading(false); // Stop loading
            }

        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        // Upload Files
        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                try {
                    const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/uploadFile`, {
                        method: "POST",
                        body: formData,
                    });

                    const data = await response.json();
                    if (response.ok) {
                        return { fileName: file.name, fileUrl: data.fileUrl };
                    }
                } catch (error) {
                    console.error("Upload failed", error);
                }
                return null;
            })
        );

        // Filter out null files
        const validFiles = uploadedFiles.filter(Boolean);

        const updatedIndustries = industries.map((industry) => ({
            ...industry,
            verificationDocuments: validFiles,
        }));

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/insertRepInd`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    _id: user.email,
                    representingIndustries: updatedIndustries,
                }),
            });

            if (response.ok) {
                toast.success("Industries saved successfully.");
                setIsAddNewModal(false);
                setFiles([]);
                window.location.reload();
            }
        } catch (error) {
            console.error("Network Error", error);
            alert("Network Error! Please Try Again");
            setLoading(false); // Stop loading
        }
        finally {
            setLoading(false); // Stop loading
            setIsConfirmationModalOpen(false); // Close confirmation modal
        }
    };


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
                setUploadedImageUrl(data.profilePic); // Set profile pic from DB
                setPreviousProfilePicUrl(data.profilePic); // Store the previous profile pic URL
            } catch (error) {
                console.error("Error fetching profile:", error.message);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const deleteIndustry = async (industryId) => {
        setLoading(true); // Start loading
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/deleteRepInd/${user.email}/${industryId}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();
            if (response.ok) {
                const response2 = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user-profile`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!response2.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response2.json();
                setUser(data);
                toast.success("Deleted Successfully!");

                // Close the modal and reset the state
                setIsDeletingModalOpen(false); // Close the modal
                setSelectedIndustry(null); // Clear the selected industry
            } else {
                toast.error("Error:", data.message);
            }
        } catch (error) {
            toast.error("Error deleting industry:", error);
        } finally {
            setLoading(false); // Stop loading regardless of success or failure
        }
    };



    const handleEdit = (field) => {
        setEditingField(field);
        setFormData({ ...formData, [field]: user[field] || "" });
    };

    const usernameRegex = /^[A-Za-z0-9_]{3,20}$/; // 3-20 characters, no spaces or special chars except "_"
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/;

    const handleChange = (e) => {
        setFormData({ ...formData, [editingField]: e.target.value });
    };

    const handleBasicInfoSave = async () => {
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

            // Optimistic update
            const updatedUser = { ...user, [editingField]: formData[editingField] };
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
        }
    };

    const resetForm = () => {
        setIndustries([{ name: "", website: "", address: "", designation: "", workEmail: "", companyContactNumber: "" }]);
        setFiles([]);
        setErrors({
            name: "",
            website: "",
            address: "",
            designation: "",
            workEmail: "",
            companyContactNumber: "",
        });
    }

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
                await updateProfilePic(data.fileUrl); // Save new profile pic to DB
                setSelectedProfilePic("");

                // Show success toast
                toast.success("Profile picture uploaded successfully!");

                // Wait for 2 seconds before reloading the page
                setTimeout(() => {
                    window.location.reload();
                }, 2000); // 2000 milliseconds = 2 seconds
            } else {
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
                                <Loader2Icon className="animate-spin mr-2" />
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
                        <CircleCheck
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
                                onClick={handleBasicInfoSave}
                                disabled={isSaving}
                                className={`px-6 py-2 rounded-lg flex items-center justify-center transition ${theme === "dark"
                                    ? "bg-brand-600 hover:bg-brand-700"
                                    : "bg-brand-500 hover:bg-brand-600"
                                    } text-white`}
                            >
                                {isSaving ? (
                                    <Loader2Icon className="animate-spin mr-2" />
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




            {user.role === "industry" && user.industryDetails && user.industryDetails.representingIndustries ? (
                <div className={`mt-8 p-6 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-black"} mb-4 md:mb-0`}>Industry Details</h3>
                        {/* Add New Industry Button */}
                        <button
                            onClick={addNewIndustry}
                            className={`p-2 rounded-full ${theme === "dark" ? "bg-brand-800 hover:bg-brand-900 text-brand-400" : "bg-brand-100 hover:bg-brand-200 text-brand-600"} transition-colors`}
                            title="Add New Industry"
                        >
                            <PlusCircle className="text-2xl" />
                        </button>
                    </div>
                    {user.industryDetails.representingIndustries.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.industryDetails.representingIndustries.map((industry, index) => (
                                <div key={index} className={`mb-6 p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg relative`}>
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => setIsDeletingModalOpen(true)}
                                        className={`absolute top-4 right-4 p-2 rounded-full ${theme === "dark" ? "bg-red-800 hover:bg-red-900 text-red-400" : "bg-red-100 hover:bg-red-200 text-red-600"} transition-colors`}
                                        title="Delete Industry"
                                    >
                                        <Trash2 className="text-lg" />
                                    </button>

                                    <DeleteConfirmationModal
                                        isOpen={deletingModalOpen}
                                        onClose={() => setIsDeletingModalOpen(false)}
                                        onConfirm={() => deleteIndustry(industry.industryId)}
                                        loading={loading}
                                        theme={theme}
                                        industryName={industry.name}
                                    />

                                    {/* Edit Button (Only if not verified) */}
                                    {!industry.verified && (
                                        <button
                                            onClick={() => {
                                                setSelectedIndustry(industry);
                                                setIsEditModalOpen(true);
                                            }}
                                            className={`absolute top-14 right-4 p-2 rounded-full ${theme === "dark" ? "bg-yellow-800 hover:bg-yellow-900 text-yellow-400" : "bg-yellow-100 hover:bg-yellow-200 text-yellow-600"} transition-colors`}
                                            title="Edit Industry"
                                        >
                                            <Edit className="text-lg" />
                                        </button>
                                    )}

                                    {/* Verified Status Icon (Top left) */}
                                    <div className="absolute top-4 left-4">
                                        {industry.verified ? (
                                            <CircleCheck className="text-green-500 text-lg" />
                                        ) : (
                                            <CircleX className="text-red-500 text-lg" />
                                        )}
                                    </div>

                                    {/* Industry Details */}
                                    <p className={`text-xl font-semibold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
                                        <Building className="text-brand-500" /> {industry.name}
                                    </p>
                                    <p className={`flex items-center gap-2 mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
                                        <Globe className="text-gray-500" />
                                        <a
                                            href={industry.website}
                                            className={`${theme === "dark" ? "text-brand-400 hover:underline" : "text-brand-600 hover:underline"}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {industry.website}
                                        </a>
                                    </p>
                                    <p className={`mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
                                        <strong>Address:</strong> {industry.address}
                                    </p>
                                    <p className={`mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
                                        <strong>Designation:</strong> {industry.designation}
                                    </p>
                                    <p className={`flex items-center gap-2 mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
                                        <Mail className="text-gray-500" /> {industry.workEmail}
                                    </p>
                                    <p className={`flex items-center gap-2 mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
                                        <Phone className="text-gray-500" /> {industry.companyContactNumber}
                                    </p>

                                    {industry.verified && (
                                        <div className="absolute bottom-4 right-4">
                                            <button
                                                className="group relative flex items-center gap-1 cursor-pointer"
                                                title="View verification details"
                                            >
                                                <Eye className={`text-lg ${theme === "dark" ? "text-brand-400" : "text-brand-600"}`} />
                                                <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Verified</span>

                                                {/* Verification Details Tooltip */}
                                                <div className={`absolute left-0 bottom-full mb-2 hidden group-hover:block p-3 rounded-lg shadow-lg z-10 min-w-[200px] ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
                                                    <div className="text-sm">
                                                        <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Verification Details</p>
                                                        <div className="mt-1 space-y-1">
                                                            <p className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                                                <User2 className="opacity-70" />
                                                                <span>{user.industryDetails.verifiedBy}</span>
                                                            </p>
                                                            <p className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                                                <Calendar1 className="opacity-70" />
                                                                <span>{new Date(user.industryDetails.verifiedAt).toLocaleDateString()}</span>
                                                            </p>
                                                            <p className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                                                <Clock className="opacity-70" />
                                                                <span>{new Date(user.industryDetails.verifiedAt).toLocaleTimeString()}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`absolute -bottom-1 left-3 w-3 h-3 rotate-45 ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}></div>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-center`}>No industries represented.</p>
                    )}                </div>
            ) : null}



            {/* Add New modal */}


            <AddIndustryModal
                isOpen={isAddNewModal}
                onClose={() => setIsAddNewModal(false)}
                resetForm={resetForm}
                theme={theme}
                industries={industries}
                updateIndustry={updateIndustry}
                errors={errors}
                files={files}
                setFiles={setFiles}
                loading={loading}
                onSave={saveIndustriesToDB}
                isConfirmationModalOpen={isConfirmationModalOpen}
                setIsConfirmationModalOpen={setIsConfirmationModalOpen}
                ConfirmationModal={ConfirmationModal}
            />



            {/* EditModal */}

            <EditIndustryModal
                isOpen={isEditModalOpen}
                selectedIndustry={selectedIndustry}
                theme={theme}
                files={files}
                deletingFile={deletingFile}
                handleFileChange={handleFileChange}
                handleRemoveFile={handleRemoveFile}
                handleDeleteAttachment={handleDeleteAttachment}
                setIsEditModalOpen={setIsEditModalOpen}
                setIsConfirmationModalOpen={setIsConfirmationModalOpen}
                setSelectedIndustry={setSelectedIndustry}
                isConfirmationModalOpen={isConfirmationModalOpen}
                setLoading={setLoading}
                handleIndustyEditSaveChanges={handleIndustyEditSaveChanges}
            />


            {/* Other UI Elements */}
            <ErrorModal
                isOpen={isErrorModalOpen}
                message={errorMessage}
                onClose={() => setIsErrorModalOpen(false)}
                theme={theme}
            />

        </div >
    );


};

ProfileSetting.propTypes = {
    theme: PropTypes.string.isRequired,
};


export default ProfileSetting;