import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';

import { User, GraduationCap, Warehouse, IdCard, File, XCircle, Rocket, Loader2, University } from 'lucide-react';


const StepFour = ({
    teachers,
    updateTeachers,
    filteredTypes,
    handleFileUpload,
    handleRemoveFile,
    loading,
    handleRegister
}) => {

    const [duplicateTeacherIds, setDuplicateTeacherIds] = useState({});
    const [checkingIds, setCheckingIds] = useState({});

    // Debounced version of the check function
    const debouncedCheckId = useCallback(
        debounce(async (employeeId, index) => {
            if (!employeeId.trim()) {
                setDuplicateTeacherIds(prev => ({ ...prev, [index]: false }));
                setCheckingIds(prev => ({ ...prev, [index]: false }));
                return;
            }

            setCheckingIds(prev => ({ ...prev, [index]: true }));

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/check-techId`,
                    { params: { employeeId } }
                );

                setDuplicateTeacherIds(prev => ({
                    ...prev,
                    [index]: response.data.exists
                }));
            } catch (error) {
                console.error("Error checking ID:", error);
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


    const isFormValid = () => {
        return teachers.every((teacher, index) => {
            return (
                teacher.employeeId.trim() !== "" &&
                teacher.designation.trim() !== "" &&
                !duplicateTeacherIds[index] &&
                teacher.department.trim() !== "" &&
                teacher.university.trim() !== ""
            );
        });
    };


    useEffect(() => {
        return () => {
            debouncedCheckId.cancel();
        };
    }, [debouncedCheckId]);

    const handleTeacherIdChange = (index, value) => {
        updateTeachers(index, "employeeId", value);
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
                Enter Academic Details
            </motion.h2>
            <motion.div
                className="w-full p-2 bg-white/30 backdrop-blur-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Teacher Details */}
                {teachers.map((teacher, index) => (
                    <motion.div
                        key={index}
                        className="p-6 bg-white/10 border border-white/20 rounded-xl shadow-lg mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" /> Teacher
                        </h3>
                        {/* Grid Container for Input Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Employee ID */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Employee ID"
                                    value={teacher.employeeId}
                                    // onChange={(e) => updateTeachers(index, "employeeId", e.target.value)}
                                    onChange={(e) => handleTeacherIdChange(index, e.target.value)}
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                {checkingIds[index] ? (
                                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                                ) : null}
                                {duplicateTeacherIds[index] && (
                                    <p className="text-red-500 text-xs mt-1">
                                        This Employee ID already exists
                                    </p>
                                )}
                            </div>



                            {/* Designation */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Designation"
                                    value={teacher.designation}
                                    onChange={(e) => updateTeachers(index, "designation", e.target.value)}
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            </div>

                            {/* Department */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Department"
                                    value={teacher.department}
                                    onChange={(e) => updateTeachers(index, "department", e.target.value)}
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <Warehouse className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            </div>

                            {/* University */}
                            <div className="relative mb-4">
                                <select
                                    value={teacher.university}
                                    onChange={(e) => updateTeachers(index, "university", e.target.value)}
                                    required
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                >
                                    <option value="" disabled>Select University</option>
                                    {filteredTypes.map((university) => (
                                        <option key={university.value} value={university.value}>
                                            {university.label}
                                        </option>
                                    ))}
                                </select>
                                <University className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            </div>
                        </div>

                        {/* File Upload for Verification Documents */}
                        <div className="mt-4">
                            <label className="text-gray-600 font-medium block mb-2">
                                Upload Verification Documents
                            </label>
                            <input
                                type="file"
                                accept=".jpg,.png,.pdf"
                                multiple // Allow multiple file selection
                                onChange={(e) => handleFileUpload(index, e)}
                                className="w-full p-3 bg-white/20 border border-gray-300 text-gray-600 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-brand-500 file:text-white hover:file:bg-brand-600"
                            />

                            {/* Show uploaded files with remove option */}
                            {teacher.verificationDocuments &&
                                teacher.verificationDocuments.map((file, fileIndex) => (
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
                        <Loader2 className="animate-spin h-6 w-6 text-brand-600" />
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
                                ? "Please wait while we verify teacher IDs"
                                : !isFormValid()
                                    ? "Please fill all fields correctly"
                                    : ""
                        }

                    >
                        <Rocket className="w-5 h-5" />
                        {isAnyIdVerifying() ? "Verifying IDs..." : "Register"}
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
};


StepFour.propTypes = {
    teachers: PropTypes.arrayOf(
        PropTypes.shape({
            employeeId: PropTypes.string.isRequired,
            designation: PropTypes.string.isRequired,
            department: PropTypes.string.isRequired,
            university: PropTypes.string.isRequired,
            verificationDocuments: PropTypes.arrayOf(
                PropTypes.shape({
                    name: PropTypes.string.isRequired,
                })
            ).isRequired,
        })
    ).isRequired,
    updateTeachers: PropTypes.func.isRequired,
    filteredTypes: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    filter: PropTypes.bool.isRequired,
    setCustomType: PropTypes.func.isRequired,
    handleFileUpload: PropTypes.func.isRequired,
    handleRemoveFile: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    handleRegister: PropTypes.func.isRequired,
};

export default StepFour;