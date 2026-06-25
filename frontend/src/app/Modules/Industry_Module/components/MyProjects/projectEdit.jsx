import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import {
  PROJECT_TYPES,
  SKILL_SUGGESTIONS,
  DIFFICULTY_LEVEL,
} from "../../../../../constants/constants.js";
import PropTypes from "prop-types";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import { ClipLoader } from "react-spinners";
import WarningModal from "./Modal/WarningModal.jsx";
import SuccessModal from "./Modal/SuccessModal.jsx";
import ConfirmationModal from "./Modal/ConfirmationModal.jsx";
import { ToastContainer, toast } from "react-toastify";

const ProjectEdit = ({ project, onCancel }) => {
  const [skillInput, setSkillInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const { id } = useParams();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [editedProject, setProject] = useState(project || {}); // Initialize with project or an empty object
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState(project?.requiredSkills || []);
  const [files, setFiles] = useState([]);
  const [industryNames, setIndustryNames] = useState([]);
  const [deletingFile, setDeletingFile] = useState(null); // Track which file is being deleted
  const location = useLocation();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light"); // Default to light theme

  // Apply theme class to the body element
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const fetchIndustryNames = async (email) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/getIndustryByEmail?email=${email}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.industryNames && data.industryNames.length > 0) {
          const names = data.industryNames;
          setIndustryNames(names);
        } else {
          setIndustryNames([]); // No industries found
        }
      } else {
        console.error("Failed to fetch industry data");
        setIndustryNames([]);
      }
    } catch (error) {
      console.error("Error fetching industry names:", error);
      setIndustryNames([]);
    }
  };

  useEffect(() => {
    if (project) {
      fetchIndustryNames(project.representativeId);
      setSkills(project.requiredSkills || []);
    }
  }, [project, location.pathname]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Filter out files that are already saved or already added
    const newFiles = selectedFiles.filter((file) => {
      // Check if the file is already in the saved attachments
      const isAlreadySaved = editedProject?.attachments?.some(
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

  const handleRemoveFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const handleFileUpload = async (files) => {
    const uploadedFiles = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/uploadFile`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const fileData = await response.json();
        uploadedFiles.push({
          fileName: fileData.fileName,
          fileUrl: fileData.fileUrl,
          uploadedAt: new Date().toISOString(), // Add the current timestamp
        });
      } else {
        console.error("Failed to upload file:", file.name);
      }
    }
    return uploadedFiles;
  };

  // const handleAddSkill = () => {
  //     if (skillInput.trim() !== "" && !skills.includes(skillInput)) {
  //         setSkills([...skills, skillInput]);
  //         setProject((prevProject) => ({
  //             ...prevProject,
  //             requiredSkills: [...skills, skillInput]
  //         }));
  //     }
  //     setSkillInput(""); // Reset input
  // };

  // const handleRemoveSkill = (index) => {
  //     const updatedSkills = skills.filter((_, i) => i !== index);
  //     setSkills(updatedSkills);
  //     setProject((prevProject) => ({
  //         ...prevProject,
  //         requiredSkills: updatedSkills
  //     }));
  // };

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (
      trimmedSkill !== "" &&
      !skills.some((s) => s.toLowerCase() === trimmedSkill.toLowerCase())
    ) {
      const updatedSkills = [...skills, trimmedSkill];
      setSkills(updatedSkills);
      setProject((prevProject) => ({
        ...prevProject,
        requiredSkills: updatedSkills,
      }));
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
    setProject((prevProject) => ({
      ...prevProject,
      requiredSkills: updatedSkills,
    }));
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);

    // Filter skill suggestions dynamically
    if (value) {
      const filtered = SKILL_SUGGESTIONS.filter((skill) =>
        skill.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setProject((prev) => {
      let updatedValue = value;

      // Ensure maxGroups is at least 1
      if (name === "maxGroups") {
        updatedValue = Math.max(1, Number(value)); // Ensure value is 1 or greater
      }

      // If changing a date, update the nested duration object correctly
      if (name === "durationStartDate" || name === "durationEndDate") {
        return {
          ...prev,
          duration: {
            ...prev.duration,
            [name === "durationStartDate" ? "startDate" : "endDate"]: value,
          },
        };
      }
      return { ...prev, [name]: updatedValue };
    });
  };

  // Fetch project details and ensure dates are formatted correctly
  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
      }/api/fetchProjectDetailById/${id}`
    )
      .then((res) => res.json())
      .then((data) => {
        setProject({
          ...data,
          duration: {
            startDate: data.duration?.startDate
              ? data.duration.startDate.slice(0, 10)
              : "",
            endDate: data.duration?.endDate
              ? data.duration.endDate.slice(0, 10)
              : "",
          },
        });
      })
      .catch((err) => console.error("Error fetching project details:", err));
  }, [id]);

  const handleDeleteAttachment = async (fileUrl) => {
    setDeletingFile(fileUrl); // Set the file being deleted

    try {
      // Step 1: Delete the file from storage
      const deleteResponse = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/deletefile`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileUrl }),
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete file");
      }

      const deleteResult = await deleteResponse.json();
      if (!deleteResult.success) {
        throw new Error(deleteResult.message || "Failed to delete file");
      }

      // Step 2: Remove the deleted file from the project's attachments array
      const updatedAttachments = project.attachments.filter(
        (attachment) => attachment.fileUrl !== fileUrl
      );

      // Step 3: Update the project in the database
      const updateResponse = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/updateProject/${project._id
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attachments: updatedAttachments, // Send the updated attachments array
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update project");
      }

      const updateResult = await updateResponse.json();
      if (!updateResult.updatedProject) {
        throw new Error("Failed to update project in the database");
      }

      // Step 4: Update the project state in the UI
      setProject((prevProject) => ({
        ...prevProject,
        attachments: updatedAttachments,
      }));
      console.log("File deleted and project updated successfully");
    } catch (error) {
      console.error("Error deleting file or updating project:", error);
    } finally {
      setDeletingFile(null); // Reset the deleting state
    }
  };

  const handleSaveChanges = async () => {
    // Check if required fields are empty
    if (
      !editedProject.title ||
      !editedProject.projectType ||
      !editedProject.difficultyLevel ||
      !editedProject.industryName
    ) {
      setWarningMessage(
        "Please fill all required fields (Title, Project Type, Difficulty Level, and Industry Name)."
      );
      setIsModalOpen(false);
      setIsWarningOpen(true);
      return; // Stop further execution
    }
    // Check if maxGroups is valid for group projects
    if (
      editedProject?.selection === "Group" &&
      !editedProject?.maxGroups &&
      editedProject?.maxGroups < 1
    ) {
      setWarningMessage(
        "Please specify a valid number of groups (must be at least 1)."
      );
      setIsModalOpen(false);
      setIsWarningOpen(true);
      return; // Stop further execution
    }

    // Check if required skills are added
    if (skills.length === 0) {
      setWarningMessage("Please add at least one required skill.");
      setIsModalOpen(false);
      setIsWarningOpen(true);
      return; // Stop further execution
    }

    // Check if dates are selected
    if (
      !editedProject?.duration?.startDate ||
      !editedProject?.duration?.endDate
    ) {
      setWarningMessage("Please select both start and end dates.");
      setIsModalOpen(false);
      setIsWarningOpen(true);
      return; // Stop further execution
    }

    // Check if startDate is greater than or equal to endDate
    if (
      new Date(editedProject?.duration?.startDate) >=
      new Date(editedProject?.duration?.endDate)
    ) {
      setWarningMessage("Start date must be earlier than end date.");
      setIsModalOpen(false);
      setIsWarningOpen(true);
      return; // Stop further execution
    }

    setIsLoading(true); // Start loading

    try {
      // Upload files and get their URLs
      const uploadedFiles = await handleFileUpload(files);

      // Update the project with the new file URLs
      const updatedProject = {
        ...editedProject,
        attachments: [...(editedProject.attachments || []), ...uploadedFiles],
      };

      // Save the updated project
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/updateProject/${project._id
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProject),
        }
      );

      if (response.ok) {
        console.log("Project updated successfully");
        setIsModalOpen(false);
        setProject(updatedProject); // Update UI after saving
        setIsSuccessModalOpen(true); // Open success modal
        toast.success("Updated success");
        console.log("Uploaded Files:", uploadedFiles);
        setFiles([]); // Clear the files after upload
      } else {
        toast.error("Failed to update project");
      }
    } catch (error) {
      toast.error("Error updating project:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  if (!project) return;
  <Loading />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            value={editedProject?.title || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 ${theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
              }`}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
          >
            Project Type
          </label>
          <select
            name="projectType"
            value={editedProject?.projectType}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 ${theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
              }`}
          >
            <option value="" disabled>
              Select Project Type
            </option>
            {PROJECT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
        >
          Description
        </label>
        <textarea
          name="description"
          value={editedProject?.description || ""}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 resize-none ${theme === "dark"
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-900 border-gray-300"
            }`}
          rows="4"
        />
      </div>

      {/* Difficulty Level and Required Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
          >
            Difficulty Level
          </label>
          <select
            name="difficultyLevel"
            value={editedProject?.difficultyLevel || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 ${theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
              }`}
          >
            {DIFFICULTY_LEVEL.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
          >
            Required Skills
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter a skill"
              value={skillInput}
              onChange={handleSkillInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddSkill();
                  e.preventDefault();
                }
              }}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 ${theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
                }`}
            />
            {/* Skill Suggestions */}
            {skillInput && filteredSuggestions.length > 0 && (
              <div
                className={`absolute z-10 mt-2 w-full rounded-lg shadow-lg max-h-60 overflow-y-auto ${theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                  }`}
              >
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    // onClick={() => {
                    //     setSkills((prevSkills) => [...prevSkills, suggestion]);
                    //     setSkillInput("");
                    // }}
                    onClick={() => {
                      const updatedSkills = [...skills, suggestion];
                      setSkills(updatedSkills);
                      setProject((prev) => ({
                        ...prev,
                        requiredSkills: updatedSkills,
                      }));
                      setSkillInput("");
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-brand-500 hover:text-white transition-all duration-200 ${theme === "dark"
                        ? "text-gray-300 hover:bg-brand-600"
                        : "text-gray-700 hover:bg-brand-100"
                      }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Display Added Skills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {skills.map((skill, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm flex items-center ${theme === "dark"
                    ? "bg-brand-600 text-white"
                    : "bg-brand-100 text-brand-600"
                  }`}
              >
                {skill}
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveSkill(index)}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
          >
            Maximum Groups Allowed
          </label>
          <input
            type="number"
            name="maxGroups"
            min="1"
            value={editedProject?.maxGroups || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 ${theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
              }`}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
          >
            Industry Name
          </label>
          <select
            name="industryName"
            value={editedProject?.industryName || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 ${theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
              }`}
          >
            <option value="" disabled>
              Select Industry Name
            </option>
            {industryNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
          >
            Maximum Students Per Group
          </label>
          <select
            name="maxStudentsPerGroup"
            value={editedProject?.maxStudentsPerGroup || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 ${theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
              }`}
          >
            <option value="" disabled>Select number of students</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
      </div>

      {/* Start Date and End Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
          >
            Start Date
          </label>
          <input
            type="date"
            name="durationStartDate"
            value={editedProject?.duration?.startDate || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 ${theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
              }`}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
          >
            End Date
          </label>
          <input
            type="date"
            name="durationEndDate"
            value={editedProject?.duration?.endDate || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 ${theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
              }`}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
        >
          Additional Info
        </label>
        <textarea
          name="additionalInfo"
          value={editedProject?.additionalInfo || ""}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 resize-none ${theme === "dark"
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-900 border-gray-300"
            }`}
          rows="4"
        />
      </div>

      {/* Attachments Section */}
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
        >
          Attachments
        </label>

        <div
          className={`mt-2 border rounded-md shadow-sm p-2 transition-all duration-300 ${theme === "dark"
              ? "bg-gray-800 border-gray-600 text-gray-100" // Dark mode
              : "bg-white border-gray-300 text-gray-800" // Light mode
            }`}
        >
          {editedProject?.attachments &&
            editedProject.attachments.length > 0 ? (
            <ul
              className="divide-y"
              style={
                theme === "dark"
                  ? { borderColor: "#4b5563" }
                  : { borderColor: "#e5e7eb" }
              }
            >
              {editedProject.attachments.map((attachment) => (
                <li
                  key={attachment?._id?.$oid || attachment?.fileUrl}
                  className={`flex justify-between items-center p-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-50 text-white"
                    }`}
                >
                  <a
                    href={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${attachment?.fileUrl
                      }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${theme === "dark" ? "text-brand-400" : "text-brand-600"
                      } hover:underline`}
                  >
                    {attachment?.fileName || "Unknown File"}
                  </a>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }`}
                    >
                      Uploaded at:{" "}
                      {attachment?.uploadedAt?.$date?.$numberLong
                        ? new Date(
                          parseInt(attachment.uploadedAt.$date.$numberLong)
                        ).toLocaleString()
                        : "N/A"}
                    </span>
                    {deletingFile === attachment.fileUrl ? (
                      <ClipLoader
                        size={16}
                        color={theme === "dark" ? "#ffffff" : "#000000"}
                      />
                    ) : (
                      <button
                        onClick={() =>
                          handleDeleteAttachment(attachment.fileUrl)
                        }
                        className={`${theme === "dark" ? "text-red-400" : "text-red-600"
                          } hover:opacity-80`}
                      >
                        Remove File
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={theme === "dark" ? "text-gray-300" : "text-gray-500"}>
              No attachments available
            </p>
          )}

          {/* Display selected files before upload */}
          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className={`flex justify-between items-center p-2 rounded-lg  ${theme === "dark" ? "bg-transparent" : "bg-white"
                    }`}
                >
                  <span>{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(file.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* Add Attachment Button */}
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

      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${theme === "dark"
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          Cancel
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 ${theme === "dark"
              ? "bg-brand-600 text-white hover:bg-brand-700"
              : "bg-brand-500 text-white hover:bg-brand-600"
            }`}
        >
          <Save /> Save Changes
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleSaveChanges}
        isLoading={isLoading}
        theme={theme}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        theme={theme}
      />

      {/* Warning Modal */}
      <WarningModal
        isOpen={isWarningOpen}
        message={warningMessage}
        onClose={() => setIsWarningOpen(false)} // Close the warning modal
        onConfirm={() => setIsWarningOpen(false)} // You can add additional logic here if needed
        theme={theme}
      />
    </div>
  );
};

ProjectEdit.propTypes = {
  project: PropTypes.object.isRequired, // Changed from bool to object
  onCancel: PropTypes.func.isRequired,
};

export default ProjectEdit;
