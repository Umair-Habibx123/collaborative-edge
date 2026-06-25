import PropTypes from "prop-types";
import { X, UploadCloud, File, Trash2 } from "lucide-react";
import { useState } from "react";

const UploadFiles = ({ isOpen, onClose, title, name, email, theme, onSubmit, isSubmitting }) => {
    const [files, setFiles] = useState([]);
    const [comment, setComment] = useState("");

    if (!isOpen) return null;

    const handleFileUpload = (e) => {
        const uploadedFiles = Array.from(e.target.files);

        const allowedFiles = uploadedFiles.filter((file) => {
            const extension = file.name.split(".").pop().toLowerCase();
            return ["zip", "rar", "pdf", "docx"].includes(extension);
        });

        if (files.length + allowedFiles.length > 2) {
            alert("You can only upload a maximum of 2 files.");
            return;
        }

        setFiles((prevFiles) => [...prevFiles, ...allowedFiles]);
        e.target.value = null; // Clear input to allow re-uploading same files
    };

    const handleRemoveFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSubmit(files, comment);
    };

    const bgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
    const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
    const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-300";
    const inputBgColor = theme === "dark" ? "bg-gray-700" : "bg-gray-100";
    const inputTextColor = theme === "dark" ? "text-gray-300" : "text-gray-700";
    const buttonBgColor = theme === "dark" ? "bg-gray-600" : "bg-gray-300";
    const buttonHoverBgColor = theme === "dark" ? "hover:bg-gray-500" : "hover:bg-gray-400";
    const buttonTextColor = theme === "dark" ? "text-gray-300" : "text-gray-700";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className={`${bgColor} ${textColor} p-6 rounded-xl shadow-lg w-full max-w-lg`}>
                {/* Modal Header */}
                <div className={`flex justify-between items-center border-b ${borderColor} pb-4 mb-4`}>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className={`text-gray-500 ${theme === "dark" ? "hover:text-gray-200" : "hover:text-gray-800"}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Info Section */}
                <div className={`mb-4 p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                    <p className={`text-sm ${textColor}`}>
                        <span className="font-semibold">Note:</span> You can upload a maximum of 2 files. Allowed formats: ZIP, RAR, PDF, DOCX.
                    </p>
                </div>

                {/* Name and Email Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-medium ${textColor}`}>Name</label>
                        <input
                            type="text"
                            value={name}
                            readOnly
                            className={`mt-1 block w-full px-3 py-2 ${inputBgColor} ${inputTextColor} border ${borderColor} rounded-md`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${textColor}`}>Email</label>
                        <input
                            type="email"
                            value={email}
                            readOnly
                            className={`mt-1 block w-full px-3 py-2 ${inputBgColor} ${inputTextColor} border ${borderColor} rounded-md`}
                        />
                    </div>
                </div>

                {/* File Upload Section */}
                <div className="mt-6">
                    <label className={`block text-sm font-medium ${textColor}`}>Upload Files</label>
                    <div
                        className={`mt-2 border-dashed border-2 ${borderColor} rounded-lg p-6 text-center cursor-pointer hover:border-brand-500 transition-all duration-300`}
                        onClick={() => document.getElementById("file-upload").click()}
                    >
                        <UploadCloud className="w-8 h-8 mx-auto text-gray-400" />
                        <p className={`mt-2 text-sm ${textColor}`}>
                            Drag & drop files or <span className="text-brand-500">browse</span>
                        </p>
                        <p className={`text-xs ${textColor}`}>Allowed Formats: ZIP, RAR, PDF, DOCX</p>
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".zip,.rar,.pdf,.docx"
                        />
                    </div>
                </div>

                {/* Uploaded Files Preview */}
                {files.length > 0 && (
                    <div className="mt-6">
                        <h3 className={`text-sm font-medium ${textColor}`}>Uploaded Files ({files.length}/2)</h3>
                        <div className="mt-2 space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-3 ${inputBgColor} rounded-md border ${borderColor}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <File className="w-5 h-5 text-gray-500" />
                                        <span className={`text-sm ${textColor} truncate max-w-xs`}>{file.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFile(index)}
                                        className="text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments Box */}
                <div className="mt-6">
                    <label className={`block text-sm font-medium ${textColor}`}>Comments</label>
                    <textarea
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add comments..."
                        className={`resize-none mt-1 block w-full px-3 py-2 ${inputBgColor} ${inputTextColor} border ${borderColor} rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500`}
                    />
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 ${buttonBgColor} ${buttonTextColor} rounded-md ${buttonHoverBgColor}`}
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={files.length === 0}
                        className={`px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 ${files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>

    );
};

UploadFiles.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    isSubmitting: PropTypes.bool,
    theme: PropTypes.oneOf(["light", "dark"]).isRequired,
    onSubmit: PropTypes.func.isRequired,
};

UploadFiles.defaultProps = {
    title: "Upload Files",
    isSubmitting: false,
};

export default UploadFiles;