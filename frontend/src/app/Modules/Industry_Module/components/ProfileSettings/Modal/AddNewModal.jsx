import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const AddIndustryModal = ({
    isOpen,
    onClose,
    theme,
    industries,
    updateIndustry,
    errors,
    files,
    setFiles,
    loading,
    onSave,
    isConfirmationModalOpen,
    setIsConfirmationModalOpen,
    ConfirmationModal,
}) => {
    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 flex items-center justify-center ${theme === 'dark' ? 'bg-black/70' : 'bg-black/40'} backdrop-blur-sm`}>
            <motion.div
                className={`w-full max-w-2xl p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} rounded-xl shadow-xl relative`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    ✖
                </button>

                <h2 className="text-2xl font-semibold mb-6 text-center">
                    Add Industry Details
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    {/* Industry Name */}
                    <div>
                        <label className="block font-medium mb-2">Industry Name</label>
                        <input
                            type="text"
                            placeholder="Industry Name"
                            value={industries[0]?.name || ""}
                            onChange={(e) => updateIndustry(0, "name", e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-brand-500' : 'border-gray-300 focus:ring-brand-400'}`}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Website */}
                    <div>
                        <label className="block font-medium mb-2">Website</label>
                        <input
                            type="text"
                            placeholder="Website"
                            value={industries[0]?.website || ""}
                            onChange={(e) => updateIndustry(0, "website", e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-brand-500' : 'border-gray-300 focus:ring-brand-400'}`}
                        />
                        {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block font-medium mb-2">Address</label>
                        <input
                            type="text"
                            placeholder="Address"
                            value={industries[0]?.address || ""}
                            onChange={(e) => updateIndustry(0, "address", e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-brand-500' : 'border-gray-300 focus:ring-brand-400'}`}
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    {/* Designation */}
                    <div>
                        <label className="block font-medium mb-2">Designation</label>
                        <input
                            type="text"
                            placeholder="Designation"
                            value={industries[0]?.designation || ""}
                            onChange={(e) => updateIndustry(0, "designation", e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-brand-500' : 'border-gray-300 focus:ring-brand-400'}`}
                        />
                        {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation}</p>}
                    </div>

                    {/* Work Email */}
                    <div>
                        <label className="block font-medium mb-2">Work Email</label>
                        <input
                            type="email"
                            placeholder="Work Email"
                            value={industries[0]?.workEmail || ""}
                            onChange={(e) => updateIndustry(0, "workEmail", e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-brand-500' : 'border-gray-300 focus:ring-brand-400'}`}
                        />
                        {errors.workEmail && <p className="text-red-500 text-sm mt-1">{errors.workEmail}</p>}
                    </div>

                    {/* Company Contact Number */}
                    <div>
                        <label className="block font-medium mb-2">Company Contact Number</label>
                        <input
                            type="text"
                            placeholder="Company Contact Number"
                            value={industries[0]?.companyContactNumber || ""}
                            onChange={(e) => updateIndustry(0, "companyContactNumber", e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-brand-500' : 'border-gray-300 focus:ring-brand-400'}`}
                        />
                        {errors.companyContactNumber && <p className="text-red-500 text-sm mt-1">{errors.companyContactNumber}</p>}
                    </div>
                </div>

                {/* File Upload Section */}
                <div className="mt-4">
                    <label className="block font-medium mb-2">
                        Upload Verification Documents
                    </label>
                    <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                            if (e.target.files.length + files.length > 2) {
                                alert("Maximum 2 files are allowed.");
                                return;
                            }
                            const newFiles = Array.from(e.target.files);
                            setFiles([...files, ...newFiles].slice(0, 2));
                        }}
                        className={`w-full p-3 border rounded-lg cursor-pointer transition-all duration-300 ${theme === "dark"
                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                            }`}
                    />

                    {/* Display Uploaded Files */}
                    {files.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-2 rounded-lg shadow-md transition-all duration-300 ${theme === "dark"
                                        ? "bg-gray-700 text-white border border-gray-600"
                                        : "bg-gray-100 text-gray-800 border border-gray-300"
                                        }`}
                                >
                                    <span className="text-sm truncate">{file.name}</span>
                                    <button
                                        onClick={() => {
                                            setFiles(files.filter((_, i) => i !== index));
                                        }}
                                        className="text-red-500 hover:text-red-700 transition-all duration-300"
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {files.length === 2 && (
                        <p className={`text-sm mt-2 ${theme === "dark" ? "text-brand-400" : "text-brand-500"}`}>
                            Maximum 2 files allowed.
                        </p>
                    )}
                </div>

                {/* Modal Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className={`px-5 py-2 ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-500 text-white hover:bg-gray-600'} transition rounded-lg`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => setIsConfirmationModalOpen(true)}
                        disabled={loading}
                        className={`px-5 py-2 ${theme === 'dark' ? 'bg-brand-700 text-white hover:bg-brand-600' : 'bg-brand-600 text-white hover:bg-brand-700'} transition rounded-lg`}
                    >
                        {loading ? "Saving..." : "Save Industries"}
                    </button>

                    {/* Confirmation Modal */}
                    <ConfirmationModal
                        isOpen={isConfirmationModalOpen}
                        title="Confirm Deletion"
                        message={`Are you sure you want to add new? This action cannot be undone.`}
                        onConfirm={() => {
                            onSave(); // Call save function
                            setIsConfirmationModalOpen(false); // Close modal after saving
                        }}
                        onCancel={() => setIsConfirmationModalOpen(false)}
                        theme={theme}
                    />

                </div>
            </motion.div >
        </div >
    );
};

AddIndustryModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    theme: PropTypes.oneOf(['light', 'dark']).isRequired,
    industries: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            website: PropTypes.string,
            address: PropTypes.string,
            designation: PropTypes.string,
            workEmail: PropTypes.string,
            companyContactNumber: PropTypes.string,
        })
    ).isRequired,
    updateIndustry: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
    files: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
    setFiles: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    isConfirmationModalOpen: PropTypes.bool.isRequired,
    setIsConfirmationModalOpen: PropTypes.func.isRequired,
    ConfirmationModal: PropTypes.elementType.isRequired,
};

export default AddIndustryModal;