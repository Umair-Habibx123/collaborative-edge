import { useState, useEffect } from "react";
import { PROJECT_TYPES, SKILL_SUGGESTIONS, DIFFICULTY_LEVEL, SELECTION } from '../../../../../constants/constants.js';
import PropTypes from "prop-types";
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./Modal/ConfirmationModal.jsx";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import { useRef } from 'react';
import { Rocket, RefreshCw } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const ProjectForm = ({ theme }) => {
    const [loading, setLoading] = useState(false);
    const [formSubmitLoading, setFormSubmitLoading] = useState(false);
    const [durationType, setDurationType] = useState("");
    const navigate = useNavigate();
    const { user, isAuthLoading } = useAuth();
    const [skills, setSkills] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [projectType, setProjectType] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState();
    const [requiredSkills, setRequiredSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [selection, setSelection] = useState("");
    const [maxStudentsPerGroup, setMaxStudentsPerGroup] = useState(3);
    const [maxGroups, setMaxGroups] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const [selectedIndustry, setSelectedIndustry] = useState('');


    const [projectDates, setProjectDates] = useState({
        startDate: "",
        endDate: "",
    });
    const [filter, setFilter] = useState('');
    const [customType, setCustomType] = useState('');
    const [industryNames, setIndustryNames] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Filtered options
    const filteredTypes = PROJECT_TYPES.filter((type) =>
        type.label.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredSelection = SELECTION.filter((type) =>
        type.label.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredLevel = DIFFICULTY_LEVEL.filter((type) =>
        type.label.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredSuggestions = SKILL_SUGGESTIONS.filter(
        (suggestion) =>
            suggestion.toLowerCase().includes(skillInput.toLowerCase()) &&
            !requiredSkills.includes(suggestion)
    );

    const fetchIndustryNames = async (email) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/getIndustryByEmail?email=${email}`);
            if (response.ok) {
                const data = await response.json();
                if (data.industryNames && data.industryNames.length > 0) {
                    setIndustryNames(data.industryNames);
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
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!user) {
            navigate("/");
        } else {
            fetchIndustryNames(user.email);
        }
    }, [user, navigate]);



    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);

        if (newFiles.length + attachments.length > 2) {
            toast.warning("You can only attach up to 2 files.");
            e.target.value = null;
            return;
        }

        setAttachments((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const handleRemoveFile = (index) => {
        setAttachments((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };


    const handleAddSkill = () => {
        const trimmedSkill = skillInput.trim();
        if (trimmedSkill && !requiredSkills.includes(trimmedSkill)) {
            setRequiredSkills((prevSkills) => [...prevSkills, trimmedSkill]);
        }
        setSkillInput(""); // Reset input field
    };


    const handleConfirmSubmit = async () => {

        if (!title || !projectType || !description || !difficultyLevel || !selection) {
            toast.warning("Please fill in all required fields.");
            setIsModalOpen(false);
            setFormSubmitLoading(false);
            return;
        }

        if (requiredSkills.length === 0) {
            toast.warning("Please add at least one required skill.");
            setIsModalOpen(false);
            setFormSubmitLoading(false);
            return;
        }

        if (selection === "Individual" && (!maxStudent || maxStudent < 1)) {
            toast.warning("Please specify the maximum number of students. (must be greater than 1)");
            setIsModalOpen(false);
            setFormSubmitLoading(false);
            return;
        }

        if (selection === "Group" && (!maxStudentsPerGroup || maxStudentsPerGroup < 1)) {
            toast.warning("Please specify the number of students per group.");
            setIsModalOpen(false);
            setFormSubmitLoading(false);
            return;
        }

        if (selection === "Group" && (!maxGroups || maxGroups < 1)) {
            toast.warning("Please specify the number of groups university can have.");
            setIsModalOpen(false);
            setFormSubmitLoading(false);
            return;
        }

        if (!selectedIndustry) {
            toast.warning("Please specify Industry name from which this project belongs...");
            setIsModalOpen(false);
            setFormSubmitLoading(false);
            return;
        }

        if (!durationType) {
            toast.warning("Please select a project duration.");
            setIsModalOpen(false);
            setFormSubmitLoading(false);
            return;
        }

        if (durationType === "custom") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (!projectDates.startDate || !projectDates.endDate) {
                toast.warning("Please select valid start and end dates.");
                setIsModalOpen(false);
                setFormSubmitLoading(false);
                return;
            }

            const startDate = new Date(projectDates.startDate);
            const endDate = new Date(projectDates.endDate);

            if (startDate < today) {
                toast.warning("Start date must be today or a future date.");
                setIsModalOpen(false);
                setFormSubmitLoading(false);
                return;
            }

            if (endDate <= startDate) {
                toast.warning("End date must be after the start date.");
                setIsModalOpen(false);
                setFormSubmitLoading(false);
                return;
            }
        }

        if (!user || !user.email) {
            console.error("Industry ID (user.email) is not available yet.");
            setIsModalOpen(false);
            toast.warning("Something Went Wrong");
            setFormSubmitLoading(false);
            return;
        }

        setIsModalOpen(false);

        let finalProjectDates = projectDates;

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("projectType", projectType);
        formData.append("representativeId", user.email);
        formData.append("difficultyLevel", difficultyLevel);
        formData.append("industryName", selectedIndustry);
        formData.append("selection", selection);
        formData.append("additionalInfo", additionalInfo);
        formData.append("duration", JSON.stringify(finalProjectDates));
        formData.append("requiredSkills", JSON.stringify(requiredSkills));

        if (selection === "Group") {
            formData.append("maxStudentsPerGroup", maxStudentsPerGroup);
            formData.append("maxGroups", maxGroups);
        } else if (selection === "Individual") {
            formData.append("maxStudent", maxStudent);
        }

        const uploadedFiles = [];

        for (const file of attachments) {
            const fileData = new FormData();
            fileData.append("file", file);

            try {
                const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/uploadFile`, {
                    method: "POST",
                    body: fileData,
                });

                const data = await response.json();


                if (response.ok) {
                    uploadedFiles.push({
                        fileName: file.name,
                        fileUrl: data.fileUrl,
                        uploadedAt: new Date().toISOString(),
                    });
                } else {
                    console.error("File upload failed:", data.error);
                }
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }

        formData.append("attachments", JSON.stringify(uploadedFiles));
        console.log("Uploading attachments:", uploadedFiles);

        const formDataObject = {};
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });

        console.log("Project Data (as JSON):", JSON.stringify(formDataObject, null, 2));

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/AddProject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formDataObject),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Project added successfully:");
                resetForm();
            } else {
                toast.error("Error adding project: " + data.error);
                console.error("Error adding project:", data.error);
            }
        } catch (error) {
            toast.error("Error adding project: " + error);
            console.error("Request failed:", error);
        } finally {
            setFormSubmitLoading(false);
        }
    };

    const handleCancelSubmit = () => {
        setFormSubmitLoading(false);
        setIsModalOpen(false);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitLoading(true);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setAdditionalInfo('');
        setProjectType('');
        setDifficultyLevel('');
        setSelectedIndustry('');
        setSelection('');
        setDurationType('');
        setRequiredSkills([]);
        setSkillInput('');
        setProjectDates({
            startDate: "",
            endDate: "",
        });
        setAttachments([]);
        setSkills([]);
        setMaxStudentsPerGroup(3);
        setMaxGroups(1);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };


    if (isAuthLoading || loading) {
        return <Loading />;
    }

    return (
        <>
            <ToastContainer />
            <form
                onSubmit={handleFormSubmit}
                className={`border-2 border-gray-300 p-4 sm:p-8 max-w-7xl mx-auto rounded-2xl shadow-xl space-y-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white"}`}
            >
                {/* Header Section */}
                <div
                    className={`relative p-4 sm:p-8 ${theme === "dark"
                        ? "rounded-t-2xl shadow-md bg-gradient-to-r from-gray-800 to-brand-900"
                        : ""
                        }`}
                >
                    <h2 className={`text-2xl sm:text-4xl font-extrabold text-center tracking-wide ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Submit Your Project Idea
                    </h2>
                    <p className={`text-center text-sm sm:text-lg mt-2 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                        Fill out the form below with your project details.
                    </p>
                    <div className={`w-16 sm:w-24 h-1 mx-auto mt-4 rounded-full ${theme === "light" ? "bg-gray-900" : "bg-white"}`}></div>
                </div>

                {/* Submit and Reset Buttons */}
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-6">
                    <button
                        type="button"
                        onClick={handleFormSubmit}
                        disabled={formSubmitLoading}
                        className={`w-full sm:w-48 px-4 sm:px-6 py-3 sm:py-4 font-semibold text-base sm:text-lg rounded-xl shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center ${formSubmitLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-500 hover:to-brand-400 focus:ring-4 focus:ring-brand-500"
                            }`}
                    >
                        {formSubmitLoading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                                Processing...
                            </div>
                        ) : (
                            <>
                                <Rocket className="w-5 h-5 mr-2" />
                                Submit
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={resetForm}
                        disabled={formSubmitLoading}
                        className="w-full sm:w-48 px-4 sm:px-6 py-3 sm:py-4 bg-gray-200 text-gray-800 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-400 transition-all duration-200 flex items-center justify-center"
                    >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Reset
                    </button>
                </div>



                {/* Project Information */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
                    <div className="space-y-6">
                        {/* Project Title */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                                Project Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter project title"
                                required
                                className={`border-2 mt-2 w-full rounded-xl border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-base placeholder-gray-400 px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
                            />
                        </div>
                    </div>
                    <div className="space-y-6">
                        {/* Project Type */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                                Project Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={projectType}
                                onChange={(e) => setProjectType(e.target.value)}
                                required
                                className={`border-2 mt-2 w-full rounded-xl border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-base px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
                            >
                                <option value="" disabled>Select type</option>
                                {filteredTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            {filter && (
                                <div className={`absolute top-full left-0 w-full border border-gray-300 shadow-lg mt-1 z-10 max-h-60 overflow-y-auto ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}>
                                    {filteredTypes.length === 0 ? (
                                        <div className="p-2">No results found</div>
                                    ) : (
                                        filteredTypes.map((type) => (
                                            <div
                                                key={type.value}
                                                onClick={() => setCustomType(type.label)}
                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {type.label}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">

                    <div className="space-y-6">
                        {/* Difficulty Level */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                                Difficulty Level <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={difficultyLevel}
                                onChange={(e) => setDifficultyLevel(e.target.value)}
                                required
                                className={`border-2 w-full rounded-xl border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-base px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
                            >
                                <option value="" disabled>Select level</option>
                                {filteredLevel.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            {filter && (
                                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                                    {filteredLevel.length === 0 ? (
                                        <div className="p-2 text-gray-700">No results found</div>
                                    ) : (
                                        filteredLevel.map((type) => (
                                            <div
                                                key={type.value}
                                                onClick={() => setCustomType(type.label)}
                                                className="p-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {type.label}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Which Industry Level */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                                Belongs to which industry <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedIndustry}
                                onChange={(e) => setSelectedIndustry(e.target.value)}
                                required
                                className={`border-2 w-full rounded-xl border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-base px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
                            >

                                <option value="" disabled>Select industry</option>
                                {industryNames.length > 0 ? (
                                    industryNames.map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No industries available</option>
                                )}
                            </select>
                            {filter && (
                                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                                    {filteredLevel.length === 0 ? (
                                        <div className="p-2 text-gray-700">No results found</div>
                                    ) : (
                                        filteredLevel.map((type) => (
                                            <div
                                                key={type.value}
                                                onClick={() => setCustomType(type.label)}
                                                className="p-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {type.label}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>


                </div>

                {/* Selection by */}
                <div className="space-y-6">
                    <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                        Selection by <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={selection}
                        onChange={(e) => setSelection(e.target.value)}
                        required
                        className={`border-2 w-full rounded-xl border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-base px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
                    >
                        <option value="" disabled>Select level</option>
                        {filteredSelection.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    {selection === "Group" && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Max Groups Input */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                                    Max Groups <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={maxGroups}
                                    onChange={(e) => setMaxGroups(Number(e.target.value))}
                                    required
                                    disabled
                                    className={`border-2 w-full rounded-xl border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-base px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
                                    placeholder="Enter max groups"
                                />
                            </div>

                            {/* Max Students Per Group Input */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                                    Max Students Per Group <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={maxStudentsPerGroup}
                                    onChange={(e) => setMaxStudentsPerGroup(Number(e.target.value))}
                                    required
                                    className={`border-2 w-full rounded-xl border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-base px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
                                    placeholder="Enter max students per group"
                                >
                                    <option value="" disabled>Select max students per group</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                    <option value={5}>5</option>
                                </select>
                            </div>
                            <p className="mt-1 text-xs sm:text-sm font-medium text-red-600">
                                Note regarding &quot;Max Groups&quot;: This specifies the maximum number of groups that can be selected
                                per university where the project will be approved.
                            </p>
                        </div>
                    )}
                </div>

                {/* Project Duration */}
                <div>
                    <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                        Project Timeline <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-4">
                        {/* Duration Type Selection */}
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="durationType"
                                    value="custom"
                                    required
                                    checked={durationType === "custom"}
                                    onChange={() => setDurationType("custom")}
                                    className={`border-2 ${theme === "dark" ? "text-brand-400" : "text-brand-600"} focus:ring-brand-500`}
                                />
                                <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
                                    Specific Start and End Dates
                                </span>
                            </label>
                        </div>

                        {/* Custom Start and End Dates */}
                        {durationType === "custom" && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                                <input
                                    type="date"
                                    value={projectDates.startDate}
                                    onChange={(e) =>
                                        setProjectDates((prev) => ({
                                            ...prev,
                                            startDate: e.target.value,
                                        }))
                                    }
                                    required
                                    className={`border-2 w-full rounded-xl border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-base px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
                                />
                                <input
                                    type="date"
                                    value={projectDates.endDate}
                                    onChange={(e) =>
                                        setProjectDates((prev) => ({
                                            ...prev,
                                            endDate: e.target.value,
                                        }))
                                    }
                                    required
                                    className={`border-2 w-full rounded-xl border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-base px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Project Description */}
                <div>
                    <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                        Project Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your project in detail"
                        rows="4"
                        required
                        maxLength={1500}
                        className={`border-2 mt-2 w-full rounded-xl border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-base placeholder-gray-400 px-4 py-3 resize-none h-32 md:h-48 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
                    ></textarea>

                    <p className={`mt-1 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {description.length}/1500 characters
                    </p>


                </div>


                {/* Attach Files Section */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <div>
                        <label className={`block text-sm sm:text-base font-medium mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                            Attach Files
                        </label>

                        {/* Improved File Input Container */}
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className={`mt-1 flex justify-center px-4 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 border-2 border-dashed rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 hover:border-brand-400 ${theme === "dark"
                                ? "border-gray-600 bg-gray-800/50 hover:bg-gray-800/70"
                                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                                }`}
                        >
                            <div className="space-y-1 text-center">
                                <div className="flex justify-center">
                                    <svg
                                        className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                                            }`}
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <div className="flex flex-col sm:flex-row text-xs sm:text-sm">
                                    <p
                                        className={`font-medium ${theme === "dark"
                                            ? "text-brand-400 hover:text-brand-300"
                                            : "text-brand-600 hover:text-brand-500"
                                            }`}
                                    >
                                        Click to upload
                                    </p>
                                    <p className={`sm:ml-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                        or drag and drop
                                    </p>
                                </div>
                                <p
                                    className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                                        }`}
                                >
                                    PDF, DOC, JPG, PNG up to 10MB (max 2 files)
                                </p>
                            </div>
                            <input
                                type="file"
                                name="files"
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="sr-only"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                        </div>

                        <p
                            className={`mt-1 text-xs sm:text-sm font-medium ${theme === "dark" ? "text-red-400" : "text-red-600"
                                }`}
                        >
                            You can only attach up to 2 files (PDF, DOC, JPG, PNG, etc.)
                        </p>
                    </div>

                    {/* Display Attached Files */}
                    {attachments.length > 0 && (
                        <div className="space-y-2 sm:space-y-3">
                            <h4
                                className={`text-xs sm:text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"
                                    }`}
                            >
                                Attached Files ({attachments.length}/2)
                            </h4>
                            <ul className="space-y-1 sm:space-y-2">
                                {attachments.map((file, index) => (
                                    <li
                                        key={index}
                                        className={`flex items-center justify-between p-2 sm:p-3 rounded-md sm:rounded-lg ${theme === "dark"
                                            ? "bg-gray-800/30 border border-gray-700"
                                            : "bg-gray-100 border border-gray-200"
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2 sm:space-x-3 truncate">
                                            <div
                                                className={`p-1 sm:p-2 rounded-md sm:rounded-lg ${theme === "dark"
                                                    ? "bg-gray-700 text-brand-400"
                                                    : "bg-white text-brand-600"
                                                    }`}
                                            >
                                                {file.type.includes("image") ? (
                                                    <svg
                                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                ) : file.type.includes("pdf") ? (
                                                    <svg
                                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                ) : file.type.includes("document") ||
                                                    file.type.includes("word") ? (
                                                    <svg
                                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p
                                                    className={`text-xs sm:text-sm font-medium truncate ${theme === "dark" ? "text-gray-200" : "text-gray-800"
                                                        }`}
                                                >
                                                    {file.name}
                                                </p>
                                                <p
                                                    className={`text-2xs sm:text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                                                        }`}
                                                >
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFile(index)}
                                            type="button"
                                            className={`p-1 rounded-full ${theme === "dark"
                                                ? "text-red-400 hover:bg-gray-700 hover:text-red-300"
                                                : "text-red-500 hover:bg-gray-200 hover:text-red-700"
                                                }`}
                                        >
                                            <svg
                                                className="w-4 h-4 sm:w-5 sm:h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Skills */}
                <div>
                    <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                        Required Skills <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter a skill"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleAddSkill();
                                e.preventDefault();
                            }
                            // Keyboard navigation for suggestions
                            if (filteredSuggestions.length > 0) {
                                if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setHighlightedIndex(prev =>
                                        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
                                    );
                                } else if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
                                } else if (e.key === "Enter" && highlightedIndex >= 0) {
                                    e.preventDefault();
                                    const selectedSkill = filteredSuggestions[highlightedIndex];
                                    setRequiredSkills((prevSkills) => [...prevSkills, selectedSkill]);
                                    setSkills([...skills, selectedSkill]);
                                    setSkillInput("");
                                    setHighlightedIndex(-1);
                                }
                            }
                        }}
                        className={`border-2 mt-2 w-full rounded-xl border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-base placeholder-gray-400 px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
                    />

                    {/* Display Matching Suggestions */}
                    {skillInput && filteredSuggestions.length > 0 && (
                        <div className={`mt-2 rounded-xl shadow-lg max-h-60 overflow-y-auto border ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}>
                            {filteredSuggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                        setRequiredSkills((prevSkills) => [...prevSkills, suggestion]);
                                        setSkillInput("");
                                        setSkills([...skills, suggestion]);
                                    }}
                                    className={`block w-full text-left px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200 ease-in-out ${theme === "dark"
                                        ? `text-white hover:bg-gray-600 ${highlightedIndex === index ? "bg-gray-600" : ""}`
                                        : `text-gray-700 hover:bg-brand-100 hover:text-brand-600 ${highlightedIndex === index ? "bg-brand-100 text-brand-600" : ""}`
                                        }`}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Display Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {skills.map((skill, index) => (
                            <span
                                key={index}
                                className={`text-sm font-medium px-3 py-1 rounded-full flex items-center space-x-2 shadow-md transition-all ${theme === "dark" ? "bg-brand-600 text-white hover:bg-brand-700" : "bg-brand-500 text-white hover:bg-brand-600"}`}
                            >
                                <span>{skill}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSkills(skills.filter((_, i) => i !== index));
                                        setRequiredSkills((prevSkills) =>
                                            prevSkills.filter((_, i) => i !== index)
                                        );
                                    }}
                                    className={`focus:outline-none transition-all ${theme === "dark" ? "text-white hover:text-red-400" : "text-white hover:text-red-400"}`}
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Additional Information */}
                <div>
                    <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                        Additional Information
                    </label>
                    <textarea
                        placeholder="Provide any extra links, or references"
                        rows="3"
                        type="text"
                        value={additionalInfo}
                        maxLength={1000}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        className={`border-2 resize-none h-32 md:h-48 mt-2 w-full rounded-xl border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-base placeholder-gray-400 px-4 py-3 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
                    ></textarea>

                    <p className={`mt-1 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {additionalInfo.length}/1500 characters
                    </p>
                </div>


                <ConfirmationModal theme={theme} isOpen={isModalOpen} onClose={handleCancelSubmit} onConfirm={handleConfirmSubmit} />
            </form >
        </>


    );
};

ProjectForm.propTypes = {
    theme: PropTypes.string.isRequired,
};



export default ProjectForm;