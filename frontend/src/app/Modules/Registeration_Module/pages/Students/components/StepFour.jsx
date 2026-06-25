import PropTypes from 'prop-types';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, CalendarDays, IdCard, School, File, XCircle, Rocket, Loader2, University } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

const StepFour = ({ students, updateStudents, filteredTypes, handleFileUpload, handleRemoveFile, handleRegister, loading }) => {
    const [duplicateStudentIds, setDuplicateStudentIds] = useState({});
    const [checkingIds, setCheckingIds] = useState({});

    // Debounced version of the check function
    const debouncedCheckId = useCallback(
        debounce(async (studentId, index) => {
            if (!studentId.trim()) {
                setDuplicateStudentIds(prev => ({ ...prev, [index]: false }));
                setCheckingIds(prev => ({ ...prev, [index]: false }));
                return;
            }

            setCheckingIds(prev => ({ ...prev, [index]: true }));

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/check-stdId`,
                    { params: { studentId } }
                );

                setDuplicateStudentIds(prev => ({
                    ...prev,
                    [index]: response.data.exists
                }));
            } catch (error) {
                console.error("Error checking student ID:", error);
                setDuplicateStudentIds(prev => ({ ...prev, [index]: false }));
            } finally {
                setCheckingIds(prev => ({ ...prev, [index]: false }));
            }
        }, 500),
        []
    );



    const isFormValid = () => {
        return students.every((student, index) => {
            return (
                student.studentId.trim() !== "" &&
                !duplicateStudentIds[index] &&
                student.yearOfStudy.trim() !== "" &&
                validateYearOfStudy(student.yearOfStudy) &&
                student.degreeOrProgram.trim() !== "" &&
                student.university.trim() !== ""
            );
        });
    };

    const isAnyIdVerifying = () => {
        return Object.values(checkingIds).some(status => status === true);
    };


    const validateYearOfStudy = (year) => {
        const currentYear = new Date().getFullYear();
        const maxAllowedYear = currentYear + 4;

        if (!/^\d{4}$/.test(year)) return false;

        const yearNum = parseInt(year, 10);
        return yearNum <= maxAllowedYear;
    };

    // Cancel debounce on unmount
    useEffect(() => {
        return () => {
            debouncedCheckId.cancel();
        };
    }, [debouncedCheckId]);

    const handleStudentIdChange = (index, value) => {
        updateStudents(index, "studentId", value);
        setDuplicateStudentIds(prev => ({ ...prev, [index]: false }));
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
                {/* Student Details */}
                {students.map((student, index) => (
                    <motion.div
                        key={index}
                        className="p-6 bg-white/10 border border-white/20 rounded-xl shadow-lg mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" /> Student
                        </h3>

                        {/* Grid Container for Input Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Student ID */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Student ID"
                                    value={student.studentId}
                                    onChange={(e) => handleStudentIdChange(index, e.target.value)}
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                {checkingIds[index] ? (
                                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                                ) : null}
                                {duplicateStudentIds[index] && (
                                    <p className="text-red-500 text-xs mt-1">
                                        This Student ID already exists
                                    </p>
                                )}
                            </div>

                            {/* Year of Study */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Year of Study (e.g., 2023)"
                                    value={student.yearOfStudy}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Only allow numbers and limit to 4 digits
                                        if (/^\d{0,4}$/.test(value)) {
                                            updateStudents(index, "yearOfStudy", value);
                                        }
                                    }}
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                {student.yearOfStudy && !validateYearOfStudy(student.yearOfStudy) && (
                                    <p className="text-red-500 text-xs mt-1">
                                        Year of Study must be reasonable
                                    </p>
                                )}
                            </div>

                            {/* Degree or Program */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Degree or Program"
                                    value={student.degreeOrProgram}
                                    onChange={(e) => updateStudents(index, "degreeOrProgram", e.target.value)}
                                    className="w-full p-3 pl-10 bg-white/20 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <School className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            </div>

                            {/* University */}
                            <div className="relative">
                                <select
                                    value={student.university}
                                    onChange={(e) => updateStudents(index, "university", e.target.value)}
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
                            {student.verificationDocuments &&
                                student.verificationDocuments.map((file, fileIndex) => (
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
                                ? "Please wait while we verify student IDs"
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
    students: PropTypes.arrayOf(
        PropTypes.shape({
            studentId: PropTypes.string.isRequired,
            yearOfStudy: PropTypes.string.isRequired,
            degreeOrProgram: PropTypes.string.isRequired,
            university: PropTypes.string.isRequired,
            verificationDocuments: PropTypes.arrayOf(
                PropTypes.shape({
                    name: PropTypes.string.isRequired,
                })
            ).isRequired,
        })
    ).isRequired,
    updateStudents: PropTypes.func.isRequired,
    filteredTypes: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    handleFileUpload: PropTypes.func.isRequired,
    handleRemoveFile: PropTypes.func.isRequired,
    handleRegister: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default StepFour;