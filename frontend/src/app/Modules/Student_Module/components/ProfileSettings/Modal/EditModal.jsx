import PropTypes from 'prop-types';
import ConfirmationModal from "./ConfirmationModal";
import ClipLoader from 'react-spinners/ClipLoader';

const EditModal = ({
    isEditModalOpen,
    setIsEditModalOpen,
    theme,
    selectedStudent,
    setSelectedStudent,
    UNIVERSITY,
    handleDeleteAttachment,
    deletingFile,
    files,
    handleFileChange,
    handleRemoveFile,
    isConfirmationModalOpen,
    setIsConfirmationModalOpen,
    handleSaveChanges,
    loading,
}) => {
    return (
        isEditModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div
                    className={`${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-900"} p-6 rounded-lg w-11/12 max-w-2xl shadow-lg transition-all duration-300`}
                >
                    <h2 className="text-xl font-semibold mb-4">Edit Student Details</h2>

                    {/* Input Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Student ID */}
                        <div>
                            <label className="block text-sm font-medium">Student ID</label>
                            <input
                                type="text"
                                value={selectedStudent.studentId || ""}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, studentId: e.target.value })}
                                className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
                            />
                        </div>

                        {/* Year Of Study */}
                        <div>
                            <label className="block text-sm font-medium">Year Of Study</label>
                            <input
                                type="text"
                                value={selectedStudent.yearOfStudy || ""}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, yearOfStudy: e.target.value })}
                                className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
                            />
                        </div>

                        {/* Degree / Program */}
                        <div>
                            <label className="block text-sm font-medium">Degree / Program</label>
                            <input
                                type="text"
                                value={selectedStudent.degreeOrProgram || ""}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, degreeOrProgram: e.target.value })}
                                className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
                            />
                        </div>

                        {/* University */}
                        <div>
                            <label className="block text-sm font-medium">University</label>
                            <select
                                value={selectedStudent.university || ""}
                                onChange={(e) =>
                                    setSelectedStudent({ ...selectedStudent, university: e.target.value })
                                }
                                className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
                            >
                                <option value="" disabled>Select University</option>
                                {UNIVERSITY.map((uni, index) => (
                                    <option key={index} value={uni.value}>
                                        {uni.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Verification Documents Section */}
                    <div className="mt-4">
                        <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                            Verification Documents
                        </label>
                        <div className={`mt-2 border rounded-md shadow-sm p-2 transition-all duration-300 ${theme === "dark" ? "dark:bg-gray-700 dark:text-white dark:border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}>
                            {selectedStudent.verificationDocuments.length > 0 ? (
                                <ul>
                                    {selectedStudent.verificationDocuments.map((file, fileIndex) => (
                                        <li key={fileIndex} className="flex justify-between items-center p-2 border-b last:border-none">
                                            <a
                                                href={file.fileUrl || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-brand-500 hover:underline"
                                            >
                                                {file.fileName || "Unknown File"}
                                            </a>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 text-sm">
                                                    Uploaded at:{" "}
                                                    {file.uploadedAt
                                                        ? new Date(file.uploadedAt).toLocaleString()
                                                        : "N/A"}
                                                </span>
                                                {deletingFile === file.fileUrl ? (
                                                    <ClipLoader size={16} color={theme === "dark" ? "#ffffff" : "#000000"} />
                                                ) : (
                                                    <button
                                                        onClick={() => handleDeleteAttachment(file.fileUrl)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={`text-gray-500 ${theme === "dark" ? "dark:text-gray-400" : "text-gray-400"}`}>
                                    No verification documents available
                                </p>
                            )}

                            {/* File Upload Section */}
                            <div className="mt-4">
                                {files.length > 0 && (
                                    <ul className="mt-4">
                                        {files.map((file, index) => (
                                            <li
                                                key={index}
                                                className="flex justify-between items-center p-2 border-b last:border-none"
                                            >
                                                <span>{file.name}</span>
                                                <button
                                                    onClick={() => handleRemoveFile(file.name)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    ×
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="mb-4"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            className={`${theme === "dark" ? "bg-gray-600" : "bg-gray-300"} px-4 py-2 rounded`}
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-brand-600 text-white px-4 py-2 rounded"
                            onClick={() => setIsConfirmationModalOpen(true)}
                        >
                            Save
                        </button>
                    </div>

                    {/* Confirmation Modal */}
                    <ConfirmationModal
                        isOpen={isConfirmationModalOpen}
                        title="Confirm Changes"
                        message="Are you sure you want to save these changes? This action cannot be undone."
                        onConfirm={async () => {
                            try {
                                setIsConfirmationModalOpen(false);
                                await handleSaveChanges();
                            } catch (error) {
                                console.error(error);
                            }
                        }}
                        onCancel={() => setIsConfirmationModalOpen(false)}
                        theme={theme}
                    />
                </div>
            </div>
        )
    );
};

EditModal.propTypes = {
    isEditModalOpen: PropTypes.bool.isRequired,
    setIsEditModalOpen: PropTypes.func.isRequired,
    theme: PropTypes.string.isRequired,
    selectedStudent: PropTypes.object.isRequired,
    setSelectedStudent: PropTypes.func.isRequired,
    UNIVERSITY: PropTypes.array.isRequired,
    handleDeleteAttachment: PropTypes.func.isRequired,
    deletingFile: PropTypes.string,
    files: PropTypes.array.isRequired,
    handleFileChange: PropTypes.func.isRequired,
    handleRemoveFile: PropTypes.func.isRequired,
    isConfirmationModalOpen: PropTypes.bool.isRequired,
    setIsConfirmationModalOpen: PropTypes.func.isRequired,
    handleSaveChanges: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default EditModal;