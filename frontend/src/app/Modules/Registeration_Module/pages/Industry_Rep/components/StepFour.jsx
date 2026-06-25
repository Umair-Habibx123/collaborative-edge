import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Building, Globe, MapPin, GraduationCap, Mail, Phone, File, XCircle, Loader2, Rocket } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';

const StepFour = ({ industries, updateIndustry, handleFileUpload, handleRemoveFile, handleRegister, loading }) => {

    const [duplicateTeacherIds, setDuplicateTeacherIds] = useState({});
    const [checkingIds, setCheckingIds] = useState({});

    // Debounced version of the check function
    const debouncedCheckId = useCallback(
        debounce(async (workemail, index) => {
            if (!workemail.trim()) {
                setDuplicateTeacherIds(prev => ({ ...prev, [index]: false }));
                setCheckingIds(prev => ({ ...prev, [index]: false }));
                return;
            }

            setCheckingIds(prev => ({ ...prev, [index]: true }));

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/check-workemail`,
                    { params: { workemail } }
                );

                setDuplicateTeacherIds(prev => ({
                    ...prev,
                    [index]: response.data.exists
                }));
            } catch (error) {
                console.error("Error checking Email:", error);
                setDuplicateTeacherIds(prev => ({ ...prev, [index]: false }));
            } finally {
                setCheckingIds(prev => ({ ...prev, [index]: false }));
            }
        }, 500),
        []
    );


    const isAnyIdVerifying = () => {
        return Object.values(checkingIds).some(status => status === true);
    };

    // Validation function to check if all fields are filled and files are uploaded
    const isFormValid = () => {
        return industries.every((industry, index) => {
            return (
                industry.name.trim() !== "" &&
                industry.website.trim() !== "" &&
                industry.address.trim() !== "" &&
                !duplicateTeacherIds[index] &&
                industry.designation.trim() !== "" &&
                industry.workEmail.trim() !== "" &&
                industry.companyContactNumber.trim() !== "");
        });
    };

    useEffect(() => {
        return () => {
            debouncedCheckId.cancel();
        };
    }, [debouncedCheckId]);

    const handleTeacherIdChange = (index, value) => {
        updateIndustry(index, "workEmail", value);
        setDuplicateTeacherIds(prev => ({ ...prev, [index]: false }));
        debouncedCheckId(value, index);
    };

    return (
        <div className='bg-white p-4 md:p-8 rounded-2xl shadow-2xl w-full'>
            <motion.h2
                className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Enter Industrial Details
            </motion.h2>
            <motion.div
                className="w-full p-2 bg-white/30 backdrop-blur-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {industries.map((industry, index) => (
                    <motion.div
                        key={index}
                        className="p-6 bg-white/10 border border-white/20 rounded-xl shadow-lg mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Industry {index + 1}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Industry Name */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Industry Name"
                                    value={industry.name}
                                    onChange={(e) => updateIndustry(index, "name", e.target.value)}
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>

                            {/* Website */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Website"
                                    value={industry.website}
                                    onChange={(e) => updateIndustry(index, "website", e.target.value)}
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>

                            {/* Address */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={industry.address}
                                    onChange={(e) => updateIndustry(index, "address", e.target.value)}
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>

                            {/* Designation */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Designation"
                                    value={industry.designation}
                                    onChange={(e) => updateIndustry(index, "designation", e.target.value)}
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>

                            {/* Work Email */}
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Work Email"
                                    value={industry.workEmail}
                                    onChange={(e) => handleTeacherIdChange(index, e.target.value)}
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                {checkingIds[index] ? (
                                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                                ) : null}
                                {duplicateTeacherIds[index] && (
                                    <p className="text-red-500 text-xs mt-1">
                                        This Work email already exists
                                    </p>
                                )}
                            </div>


                            {/* Company Contact Number */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Company Contact Number"
                                    value={industry.companyContactNumber}
                                    onChange={(e) => updateIndustry(index, "companyContactNumber", e.target.value)}
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        {/* File Upload for Verification Documents */}
                        <div className="mt-4">
                            <label className="text-gray-600 font-medium block mb-2">
                                Upload Verification Documents
                            </label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,.docx"
                                multiple
                                onChange={(e) => handleFileUpload(index, e)}
                                className="w-full p-3 bg-white/20 border border-gray-300 text-gray-600 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-brand-500 file:text-white hover:file:bg-brand-600"
                            />

                            {/* Show uploaded files with remove option */}
                            {industry.files &&
                                industry.files.map((file, fileIndex) => (
                                    <div
                                        key={fileIndex}
                                        className="mt-2 text-gray-600 text-sm flex items-center justify-between bg-white/10 p-2 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <File className="w-4 h-4" /> {file.name}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFile(index, fileIndex)}
                                            className="text-red-500 font-bold text-lg ml-2"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                        </div>

                        <p className="mt-1 text-xs sm:text-sm font-medium text-red-600">
                            For verification purposes only - Please upload official academic documents.
                            Ensure all documents are clearly visible and contain no sensitive personal information.
                        </p>
                    </motion.div>
                ))}

                {loading ? (
                    <motion.div
                        className="flex justify-center items-center mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <svg className="animate-spin h-6 w-6 text-brand-600" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                            />
                        </svg>
                        <span className="ml-2 text-brand-600 text-sm font-semibold">Processing...</span>
                    </motion.div>
                ) : (
                    <motion.button
                        onClick={handleRegister}
                        disabled={!isFormValid() || loading || isAnyIdVerifying()}
                        className={`cursor-pointer w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white p-4 rounded-xl font-bold shadow-lg transition-all duration-300 mt-4 flex items-center justify-center gap-2 ${!isFormValid() || isAnyIdVerifying() ? "opacity-50 cursor-not-allowed" : "hover:from-brand-700 hover:to-brand-600"
                            }`}
                        whileHover={{ scale: isFormValid() && !isAnyIdVerifying() ? 1.05 : 1 }}
                        whileTap={{ scale: isFormValid() && !isAnyIdVerifying() ? 0.95 : 1 }}
                        title={
                            isAnyIdVerifying()
                                ? "Please wait while we verify work email"
                                : !isFormValid()
                                    ? "Please fill all fields correctly"
                                    : ""
                        }

                    >
                        <Rocket className="w-5 h-5" />
                        {isAnyIdVerifying() ? "Verifying work Email..." : "Register"}
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
};

StepFour.propTypes = {
    industries: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            website: PropTypes.string.isRequired,
            address: PropTypes.string.isRequired,
            designation: PropTypes.string.isRequired,
            workEmail: PropTypes.string.isRequired,
            companyContactNumber: PropTypes.string.isRequired,
            files: PropTypes.arrayOf(PropTypes.instanceOf(File)),
        })
    ).isRequired,
    updateIndustry: PropTypes.func.isRequired,
    handleFileUpload: PropTypes.func.isRequired,
    handleRemoveFile: PropTypes.func.isRequired,
    handleRegister: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default StepFour;