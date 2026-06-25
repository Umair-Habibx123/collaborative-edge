import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { ChevronDown, Loader2, Pencil, Check, Trash2, Plus, FileText, X } from "lucide-react";
import { useAuth } from "../../../../../auth/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure toast styles are applied
import Loading from "../../../../Components/loadingIndicator/loading";
import axios from "axios";


const PrivacyPolicyUpdate = ({ theme }) => {
    const { user, isAuthLoading } = useAuth();
    const [policy, setPolicy] = useState(null);
    const [selectedRole, setSelectedRole] = useState("industry");
    const [isFetching, setIsFetching] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [editedPolicy, setEditedPolicy] = useState(null);
    const [isSaving, setIsSaving] = useState(false);


    useEffect(() => {
        fetchPrivacyPolicy(selectedRole);
    }, [selectedRole]);

    const fetchPrivacyPolicy = async (role) => {
        setIsFetching(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/get-privacy-policy`, {
                params: { role },
            });
            setPolicy(response.data);
            setEditedPolicy(response.data);
        } catch (error) {
            console.error("Error fetching privacy policy:", error);
            toast.error("Failed to fetch privacy policy. Resetting to initial role.");
            setSelectedRole("industry");
        } finally {
            setIsFetching(false);
        }
    };

    const handleRoleChange = (event) => {
        const newRole = event.target.value;
        setSelectedRole(newRole);
    };

    const handleEditClick = (index) => {
        setEditingSection(index);
    };

    const handleCancelEdit = () => {
        setEditedPolicy(policy); // Reset to original policy
        setEditingSection(null);
    };

    const handleSaveClick = async (index) => {
        const section = editedPolicy.sections[index];

        // Validate fields
        if (!section.title.trim() || !section.content.trim()) {
            toast.error("Title and Content cannot be empty");
            return;
        }

        if (section.listItems.some(item => !item.trim())) {
            toast.error("List items cannot be empty");
            return;
        }

        setIsSaving(true);
        try {
            const updatedSections = [...editedPolicy.sections];
            const updatedPolicy = { ...editedPolicy, sections: updatedSections };

            await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/update-privacy-policy`, {
                role: selectedRole,
                sections: updatedSections,
            });

            setPolicy(updatedPolicy);
            setEditingSection(null);
            toast.success("Privacy policy updated successfully");
        } catch (error) {
            console.error("Error updating privacy policy:", error);
            toast.error("Failed to update privacy policy");
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (index, field, value, itemIndex) => {
        const updatedSections = [...editedPolicy.sections];
        if (field === "listItems") {
            updatedSections[index].listItems[itemIndex] = value;
        } else {
            updatedSections[index][field] = value;
        }
        setEditedPolicy({ ...editedPolicy, sections: updatedSections });
    };

    const handleAddSection = (index) => {
        const newSection = {
            title: "New Section",
            content: "",
            listItems: [],
        };

        const updatedSections = [...editedPolicy.sections];
        updatedSections.splice(index + 1, 0, newSection);

        setEditedPolicy({
            ...editedPolicy,
            sections: updatedSections,
        });

        toast.info("Please edit and save the new section to reflect changes!", {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            position: "top-center",
            style: {
                fontSize: "18px",
                fontWeight: "bold",
            },
            theme: theme,
        });
    };

    const handleAddListItem = (sectionIndex) => {
        const updatedSections = [...editedPolicy.sections];
        updatedSections[sectionIndex].listItems.push("");
        setEditedPolicy({ ...editedPolicy, sections: updatedSections });
    };

    const handleDeleteSection = async (index) => {
        const updatedSections = [...editedPolicy.sections];
        updatedSections.splice(index, 1);

        setIsSaving(true);
        try {
            await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/update-privacy-policy`, {
                role: selectedRole,
                sections: updatedSections,
            });

            setEditedPolicy({ ...editedPolicy, sections: updatedSections });
            toast.success("Section deleted successfully");
        } catch (error) {
            console.error("Error deleting section:", error);
            toast.error("Failed to delete section");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteListItem = async (sectionIndex, itemIndex) => {
        const updatedSections = [...editedPolicy.sections];
        updatedSections[sectionIndex].listItems.splice(itemIndex, 1);

        setIsSaving(true);
        try {
            await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/update-privacy-policy`, {
                role: selectedRole,
                sections: updatedSections,
            });

            setEditedPolicy({ ...editedPolicy, sections: updatedSections });
            toast.success("List item deleted successfully");
        } catch (error) {
            console.error("Error deleting list item:", error);
            toast.error("Failed to delete list item");
        } finally {
            setIsSaving(false);
        }
    };


    if (isAuthLoading) {
        return <Loading />;
    }

    return (

        <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Top Heading Section */}
            <div className={`p-6 rounded-b-xl ${theme === "dark" ? "bg-gradient-to-r from-gray-800 to-gray-900" : "bg-gradient-to-r from-white to-gray-50"}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Left side - Heading with icon */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className={`p-3 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-brand-50"}`}>
                            <FileText className="w-6 h-6 text-brand-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-accent-500">
                                Privacy Policy Update
                            </h1>
                            <p className={`text-sm flex items-center gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                <FileText className="w-4 h-4" />
                                Update Your Portal Privacy Policy Details
                            </p>
                        </div>
                    </div>

                    {/* Right side - Select dropdown */}
                    <div className="w-full sm:w-64 relative">
                        <select
                            id="role-select"
                            value={selectedRole}
                            onChange={handleRoleChange}
                            className={`w-full p-3 pl-4 pr-10 rounded-lg border transition-all focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none ${theme === "dark"
                                    ? "bg-gray-800 border-gray-700 text-white"
                                    : "bg-white border-gray-300 text-gray-900"
                                }`}
                        >
                            <option value="industry">Industry</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                            <option value="main">Main Screen</option>
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-3.5 h-5 w-5 pointer-events-none ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                                }`}
                        />
                    </div>

                </div>
            </div>

            {/* Loading Indicator */}
            {isFetching && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                </div>
            )}

            {/* Policy Content */}
            {!isFetching && editedPolicy && (
                <div className="px-4 sm:px-6 py-6 space-y-6">
                    <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"
                        } shadow-sm`}>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}>
                            Last Updated: {new Date(editedPolicy.lastUpdated).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    {/* Sections */}
                    {editedPolicy.sections.map((section, index) => (
                        <div key={index} className={`p-6 rounded-xl transition-all ${theme === "dark"
                            ? "bg-gray-800 hover:bg-gray-750 border-gray-700"
                            : "bg-white hover:bg-gray-50 border-gray-200"
                            } border shadow-sm`}>
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                {editingSection === index ? (
                                    <input
                                        type="text"
                                        value={editedPolicy.sections[index].title}
                                        onChange={(e) => handleInputChange(index, "title", e.target.value)}
                                        className={`flex-1 w-full text-2xl font-semibold p-3 rounded-lg border transition-all focus:ring-2 focus:ring-brand-500 ${theme === "dark"
                                            ? "bg-gray-700 border-gray-600 text-white"
                                            : "bg-gray-50 border-gray-300 text-gray-900"
                                            }`}
                                        disabled={isSaving}
                                    />
                                ) : (
                                    <h2 className="text-2xl font-semibold text-brand-600">{`${index + 1}. ${section.title}`}</h2>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    {editingSection === index ? (
                                        <>
                                            {isSaving ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleSaveClick(index)}
                                                        className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
                                                        title="Save changes"
                                                    >
                                                        <Check className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className={`p-2 rounded-full ${theme === "dark"
                                                            ? "bg-gray-700 hover:bg-gray-600 text-red-400"
                                                            : "bg-gray-100 hover:bg-gray-200 text-red-600"
                                                            } transition-colors`}
                                                        title="Cancel editing"
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleEditClick(index)}
                                            className={`p-2 rounded-full ${theme === "dark"
                                                ? "bg-gray-700 hover:bg-gray-600 text-brand-400"
                                                : "bg-gray-100 hover:bg-gray-200 text-brand-600"
                                                } transition-colors`}
                                            title="Edit section"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDeleteSection(index)}
                                        className={`p-2 rounded-full ${theme === "dark"
                                            ? "bg-gray-700 hover:bg-gray-600 text-red-400"
                                            : "bg-gray-100 hover:bg-gray-200 text-red-600"
                                            } transition-colors`}
                                        title="Delete section"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Section Content */}
                            <div className="mb-4">
                                {editingSection === index ? (
                                    <textarea
                                        value={editedPolicy.sections[index].content}
                                        onChange={(e) => handleInputChange(index, "content", e.target.value)}
                                        className={`w-full p-3 rounded-lg border transition-all focus:ring-2 focus:ring-brand-500 min-h-[120px] ${theme === "dark"
                                            ? "bg-gray-700 border-gray-600 text-white"
                                            : "bg-gray-50 border-gray-300 text-gray-900"
                                            }`}
                                        disabled={isSaving}
                                    />
                                ) : (
                                    <p className={`leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                                        }`}>{section.content}</p>
                                )}
                            </div>

                            {/* List Items */}
                            {section.listItems.length > 0 && (
                                <ul className="space-y-2 mb-4">
                                    {section.listItems.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${theme === "dark" ? "bg-gray-400" : "bg-gray-500"
                                                }`} />
                                            <div className="flex-1 flex items-center gap-2">
                                                {editingSection === index ? (
                                                    <input
                                                        type="text"
                                                        value={editedPolicy.sections[index].listItems[idx]}
                                                        onChange={(e) => handleInputChange(index, "listItems", e.target.value, idx)}
                                                        className={`flex-1 w-full p-2 rounded-lg border transition-all focus:ring-2 focus:ring-brand-500 ${theme === "dark"
                                                            ? "bg-gray-700 border-gray-600 text-white"
                                                            : "bg-gray-50 border-gray-300 text-gray-900"
                                                            }`}
                                                        disabled={isSaving}
                                                    />
                                                ) : (
                                                    <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                                        {item}
                                                    </p>
                                                )}
                                                {editingSection === index && (
                                                    <button
                                                        onClick={() => handleDeleteListItem(index, idx)}
                                                        className={`p-1.5 rounded-full ${theme === "dark"
                                                            ? "hover:bg-gray-700 text-red-400"
                                                            : "hover:bg-gray-200 text-red-600"
                                                            } transition-colors`}
                                                        title="Delete item"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Add List Item Button */}
                            {editingSection === index && (
                                <button
                                    onClick={() => handleAddListItem(index)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${theme === "dark"
                                        ? "bg-gray-700 hover:bg-gray-600 text-brand-400"
                                        : "bg-gray-100 hover:bg-gray-200 text-brand-600"
                                        } transition-colors mb-6`}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add List Item
                                </button>
                            )}

                            {/* Add Section Button */}
                            <div className="relative">
                                <hr className={`border-t ${theme === "dark" ? "border-gray-700" : "border-gray-300"
                                    }`} />
                                <button
                                    onClick={() => handleAddSection(index)}
                                    className={`absolute -right-2 -top-3.5 ${theme === "dark"
                                        ? "bg-brand-600 hover:bg-brand-700 text-white"
                                        : "bg-brand-500 hover:bg-brand-600 text-white"
                                        } rounded-full p-2 transition-colors shadow-md`}
                                    title="Add new section"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

PrivacyPolicyUpdate.propTypes = {
    theme: PropTypes.string.isRequired,
};

export default PrivacyPolicyUpdate;