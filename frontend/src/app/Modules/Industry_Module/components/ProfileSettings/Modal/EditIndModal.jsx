import ConfirmationModal from './ConfirmationModal'; 
import PropTypes from 'prop-types';
import ClipLoader from 'react-spinners/ClipLoader';

const EditIndustryModal = ({
    isOpen,
    selectedIndustry,
    theme,
    files,
    deletingFile,
    handleFileChange,
    handleRemoveFile,
    handleDeleteAttachment,
    setIsEditModalOpen,
    setIsConfirmationModalOpen,
    setSelectedIndustry,
    isConfirmationModalOpen,
    setLoading,
    handleIndustyEditSaveChanges,
}) => {
    if (!isOpen || !selectedIndustry) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div
                className={`${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-900"} p-6 rounded-lg w-11/12 max-w-2xl shadow-lg transition-all duration-300`}
            >
                <h2 className="text-xl font-semibold mb-4">Edit Industry</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            value={selectedIndustry.name}
                            onChange={(e) => setSelectedIndustry({ ...selectedIndustry, name: e.target.value })}
                            className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Website</label>
                        <input
                            type="text"
                            value={selectedIndustry.website}
                            onChange={(e) => setSelectedIndustry({ ...selectedIndustry, website: e.target.value })}
                            className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Address</label>
                        <input
                            type="text"
                            value={selectedIndustry.address}
                            onChange={(e) => setSelectedIndustry({ ...selectedIndustry, address: e.target.value })}
                            className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Designation</label>
                        <input
                            type="text"
                            value={selectedIndustry.designation}
                            onChange={(e) => setSelectedIndustry({ ...selectedIndustry, designation: e.target.value })}
                            className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Work Email</label>
                        <input
                            type="email"
                            value={selectedIndustry.workEmail}
                            onChange={(e) => setSelectedIndustry({ ...selectedIndustry, workEmail: e.target.value })}
                            className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Company Contact</label>
                        <input
                            type="text"
                            value={selectedIndustry.companyContactNumber}
                            onChange={(e) => setSelectedIndustry({ ...selectedIndustry, companyContactNumber: e.target.value })}
                            className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        Verification Documents
                    </label>
                    <div className={`mt-2 border rounded-md shadow-sm p-2 transition-all duration-300 ${theme === "dark" ? "dark:bg-gray-700 dark:text-white dark:border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}>
                        {selectedIndustry.verificationDocuments?.length > 0 ? (
                            <ul>
                                {selectedIndustry.verificationDocuments.map((file, fileIndex) => (
                                    <li key={fileIndex} className="flex justify-between items-center p-2 border-b last:border-none">
                                        <a
                                            // href={file.fileUrl || "#"}
                                            href= {`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${file.fileUrl}`}
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
                                                    ? new Date(parseInt(file.uploadedAt)).toLocaleString()
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

                        <div className="mt-4">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="mb-4"
                            />
                        </div>
                    </div>
                </div>

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

                    <ConfirmationModal
                        isOpen={isConfirmationModalOpen}
                        title="Confirm Deletion"
                        message={`Are you sure you want to add new. This action cannot be undone.`}
                        onConfirm={async () => {
                            try {
                                setLoading(true);
                                setIsConfirmationModalOpen(false);
                                await handleIndustyEditSaveChanges();
                            } catch (error) {
                                console.error(error);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        onCancel={() => setIsConfirmationModalOpen(false)}
                        theme={theme}
                    />
                </div>
            </div>
        </div>
    );
};

EditIndustryModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    selectedIndustry: PropTypes.object,
    theme: PropTypes.string.isRequired,
    files: PropTypes.array.isRequired,
    deletingFile: PropTypes.string,
    handleFileChange: PropTypes.func.isRequired,
    handleRemoveFile: PropTypes.func.isRequired,
    handleDeleteAttachment: PropTypes.func.isRequired,
    setIsEditModalOpen: PropTypes.func.isRequired,
    setIsConfirmationModalOpen: PropTypes.func.isRequired,
    setSelectedIndustry: PropTypes.func.isRequired,
    isConfirmationModalOpen: PropTypes.bool.isRequired,
    setLoading: PropTypes.func.isRequired,
    handleIndustyEditSaveChanges: PropTypes.func.isRequired,
};

export default EditIndustryModal;