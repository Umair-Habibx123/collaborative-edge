// EditTeacherModal.js
import { useState } from "react";
import PropTypes from "prop-types";
import ConfirmationModal from "./ConfirmationModal"; // Assuming ConfirmationModal is in a separate file
import ClipLoader from "react-spinners/ClipLoader"; // Assuming you're using react-spinners for loading

const EditTeacherModal = ({
  isOpen,
  onClose,
  selectedTeacher,
  setSelectedTeacher,
  theme,
  UNIVERSITY,
  handleDeleteAttachment,
  handleFileChange,
  handleRemoveFile,
  files,
  deletingFile,
  handleSaveChanges,
}) => {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-900"} p-6 rounded-lg w-11/12 max-w-2xl shadow-lg transition-all duration-300`}
      >
        <h2 className="text-xl font-semibold mb-4">Edit Teacher Details</h2>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee ID */}
          <div>
            <label className="block text-sm font-medium">Employee ID</label>
            <input
              type="text"
              value={selectedTeacher.employeeId || ""}
              onChange={(e) =>
                setSelectedTeacher({ ...selectedTeacher, employeeId: e.target.value })
              }
              className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
            />
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium">Designation</label>
            <input
              type="text"
              value={selectedTeacher.designation || ""}
              onChange={(e) =>
                setSelectedTeacher({ ...selectedTeacher, designation: e.target.value })
              }
              className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium">Department</label>
            <input
              type="text"
              value={selectedTeacher.department || ""}
              onChange={(e) =>
                setSelectedTeacher({ ...selectedTeacher, department: e.target.value })
              }
              className={`${theme === "dark" ? "bg-gray-700 text-gray-300" : "border"} w-full p-2 rounded mt-1`}
            />
          </div>

          {/* University */}
          <div>
            <label className="block text-sm font-medium">University</label>
            <select
              value={selectedTeacher.university || ""}
              onChange={(e) =>
                setSelectedTeacher({ ...selectedTeacher, university: e.target.value })
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
          <label
            className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
          >
            Verification Documents
          </label>
          <div
            className={`mt-2 border rounded-md shadow-sm p-2 transition-all duration-300 ${theme === "dark" ? "dark:bg-gray-700 dark:text-white dark:border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
          >
            {selectedTeacher.verificationDocuments.length > 0 ? (
              <ul>
                {selectedTeacher.verificationDocuments.map((file, fileIndex) => (
                  <li
                    key={fileIndex}
                    className="flex justify-between items-center p-2 border-b last:border-none"
                  >
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
              <p
                className={`text-gray-500 ${theme === "dark" ? "dark:text-gray-400" : "text-gray-400"}`}
              >
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

              <input type="file" multiple onChange={handleFileChange} className="mb-4" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className={`${theme === "dark" ? "bg-gray-600" : "bg-gray-300"} px-4 py-2 rounded`}
            onClick={onClose}
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
              setLoading(true);
              setIsConfirmationModalOpen(false);
              await handleSaveChanges();
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
  );
};

// Prop validation
EditTeacherModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedTeacher: PropTypes.object.isRequired,
  setSelectedTeacher: PropTypes.func.isRequired,
  theme: PropTypes.oneOf(["dark", "light"]).isRequired,
  UNIVERSITY: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleDeleteAttachment: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  handleRemoveFile: PropTypes.func.isRequired,
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  deletingFile: PropTypes.string,
  handleSaveChanges: PropTypes.func.isRequired,
};

export default EditTeacherModal;