import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UNIVERSITY } from '../../../../../constants/constants.js';
import StepOne from "../../components/StepOne.jsx";
import StepTwo from "../../components/StepTwo.jsx";
import StepThree from "../../components/StepThree.jsx";
import StepFour from "./components/StepFour.jsx";
import { toast, ToastContainer } from "react-toastify"
import StepIndicator from "../StepIndicator.jsx"


const TeacherRegister = () => {
    const variants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 50 },
    };
    const [step, setStep] = useState(1); // 1: Email Input, 2: Verification, 3: Success
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [profileImage, setProfileImage] = useState(""); // Preview image
    const [selectedProfilePic, setSelectedProfilePic] = useState(""); // Preview image
    const [uploadedImageUrl, setUploadedImageUrl] = useState("");
    const [filter, setFilter] = useState('');
    // const { signUp } = useSignUp();
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([
        {
            employeeId: "",
            designation: "",
            department: "",
            university: "",
            verificationDocuments: [], // Store uploaded files
        },
    ]);

    const filteredTypes = UNIVERSITY.filter((type) =>
        type.label.toLowerCase().includes(filter.toLowerCase())
    );


    const updateTeachers = (index, field, value) => {
        const updatedTeachers = teachers.map((teacher, i) =>
            i === index ? { ...teacher, [field]: value } : teacher
        );
        setTeachers(updatedTeachers);
    };

    const handleFileUpload = (index, event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        // Allowed file types
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // DOCX MIME type
        ];

        // Filter valid files
        const validFiles = files.filter(file => allowedTypes.includes(file.type));

        if (validFiles.length !== files.length) {
            toast.error("Only JPG, JPEG, PNG, PDF, and DOCX files are allowed.");
            event.target.value = ""; // Reset input
            return;
        }

        setTeachers((prevTeachers) =>
            prevTeachers.map((teacher, i) => {
                if (i === index) {
                    const existingFiles = teacher.verificationDocuments || [];

                    if (existingFiles.length + validFiles.length > 2) {
                        toast.error("You can only upload up to 2 files.");
                        return teacher;
                    }
                    return {
                        ...teacher,
                        verificationDocuments: [...(teacher.verificationDocuments || []), ...files], // Store files correctly
                    };
                }
                return teacher;
            })
        );
    };

    const handleRemoveFile = (teacherIndex, fileIndex) => {
        setTeachers((prevTeachers) =>
            prevTeachers.map((teacher, i) =>
                i === teacherIndex
                    ? {
                        ...teacher,
                        verificationDocuments: teacher.verificationDocuments.filter((_, idx) => idx !== fileIndex), // Correct field
                    }
                    : teacher
            )
        );
    };




    useEffect(() => {
        if (step === 1) {
            setError("");
            setMessage("");
        }
        else if (step === 2) {
            setError("");
            setMessage("");
        }
        else if (step === 3) {
            setError("");
            setMessage("");
        }
        else if (step === 4) {
            setError("");
            setMessage("");
        }
    }, [step]);


    const handleSendCode = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/send-code`, { email });
            toast.success(response.data.message || message);
            setMessage(response.data.message || message);
            setStep(2);
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.error === "User with this email already exists.") {
                setError("User with this email already exists.");
                toast.error("User with this email already exists.")
            } else {
                setError(error.response?.data?.message || "Error sending code.");
                toast.error(error.response?.data?.message || "Error sending code.");
            }
        } finally {
            setLoading(false);
        }
    };




    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please select a valid image file (JPG, JPEG, PNG).");
                e.target.value = ""; // Reset file input
                return;
            }
        }

        if (!file) return;
        const previewUrl = URL.createObjectURL(file); // Create preview URL
        setProfileImage(previewUrl); // Show image preview
        setSelectedProfilePic(file); // Store file for later upload
    };


    const handleVerifyCode = async () => {
        setLoading(true); // Stop loading
        try {
            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/verify-code`, { email, code });
            setMessage(response.data.message);
            toast.success(response.data.message);

            if (response.data.success) {
                setStep(3);
            }
        } catch (error) {
            setError(error.response?.data?.message || "Error verifying code.");
            toast.error(error.response?.data?.message || "Error verifying code.");

        }
        finally {
            setLoading(false); // Stop loading
        }
    };

    const lastStep = async () => {
        // Step 1: Validate username presence and format (letters, numbers, underscores)
        const usernameRegex = /^[A-Za-z0-9_]{3,20}$/; // 3-20 characters, no spaces or special chars except "_"
        if (!username || !usernameRegex.test(username)) {
            setError("Enter a valid Username (3-20 characters, letters, numbers, underscores only).");
            toast.error("Enter a valid Username (3-20 characters, letters, numbers, underscores only).");
            return;
        }

        // Step 2: Validate both password fields are filled
        if (!password || !confirmPassword) {
            setError("Password is required.");
            toast.error("Password is required.");
            return;
        }

        // Step 3: Validate passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            toast.error("Passwords do not match.");

            return;
        }

        // Step 4: Validate strong password (6-12 characters, at least 1 letter, 1 number, 1 special character)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/;
        if (!passwordRegex.test(password)) {
            setError("Password must be 6-12 characters and include a letter, number, and special character.");
            toast.error("Password must be 6-12 characters and include a letter, number, and special character.");
            return;
        }

        // ✅ If all validations pass, move to the next step
        setStep(4);
    };




    const handleRegister = async () => {
        setLoading(true); // Start loading before requests
        setError("");

        try {
            let uploadedUrl = uploadedImageUrl; // Keep the existing value if no new upload

            for (const teacher of teachers) {
                if (teacher.employeeId === "" || !/^[A-Za-z0-9-]+$/.test(teacher.employeeId)) {
                    throw new Error("Enter a valid Employee ID.");

                }
                if (teacher.designation === "" || !/^[A-Za-z\s]+$/.test(teacher.designation)) {
                    throw new Error("Enter a valid Designation (letters only).");

                }
                if (teacher.department === "" || !/^[A-Za-z\s]+$/.test(teacher.department)) {
                    throw new Error("Enter a valid Department (letters only).");

                }
                if (teacher.university === "" || !/^[A-Za-z\s]+$/.test(teacher.university)) {
                    throw new Error("Enter a valid University Name (letters only).");

                }
            }



            if (selectedProfilePic) {
                const formData = new FormData();
                formData.append("profilePic", selectedProfilePic);

                const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/uploadProfilePic`, {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(`Profile picture upload failed: ${data.error}`);
                }

                uploadedUrl = data.fileUrl; // Store uploaded URL in a variable
                setUploadedImageUrl(uploadedUrl); // Update state
            }


            // Step 6: Prepare user data for MongoDB
            const userData = {
                _id: email,
                email: email,
                username: username,
                password: password,
                profilePic: uploadedUrl, // Use uploaded image URL
                role: "teacher", // Default role
                status: "pending"
            };

            const teacherUserData = {
                _id: email,
                email: email,
                employeeId: teachers[0].employeeId,
                designation: teachers[0].designation,
                department: teachers[0].department,
                university: teachers[0].university,
                verified: false,
                verificationDocuments: await Promise.all(
                    (teachers[0].verificationDocuments || []).map(async (file) => {
                        const formData = new FormData();
                        formData.append("file", file);

                        const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/uploadFile`, {
                            method: "POST",
                            body: formData,
                        });

                        const data = await response.json();
                        if (!response.ok) {
                            throw new Error(`File upload failed: ${data.error}`);
                        }
                        return {
                            fileName: file.name,
                            fileUrl: data.fileUrl,
                            uploadedAt: new Date().toISOString(),
                        };
                    })
                ).then((docs) => docs.filter(Boolean)), // Remove any failed uploads

                approvedProjects: [], // Empty initially
                verifiedAt: null,
                verifiedBy: null,
            };


            // Insert user data
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/insertUsers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorMessage1 = await response.text();
                throw new Error(`Failed to insert user: ${errorMessage1}`);
            }

            // Save the data in MongoDB
            const response2 = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/insertTeacherUser`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(teacherUserData),
            });


            if (!response2.ok) {
                const errorMessage2 = await response2.text();
                throw new Error(`Failed to insert Student-user: ${errorMessage2}`);
            }
            setSuccess("User registered successfully!");
            toast.success("User registered successfully!");
            navigate("/waitingMessage", { replace: true });
        } catch (error) {
            console.error("Error:", error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
        return emailRegex.test(email);
    };


    return (
        <div className="flex flex-col min-h-screen md:flex-row -mt-[70px] md:-mt-[90px]">
            <ToastContainer />

            {/* Right Section  */}
            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.5 }}
                className="md:w-1/2 w-full bg-brand-600 text-white flex items-center justify-center p-6"
            >
                <h1 className="text-5xl font-bold text-center">Collaborative Edge</h1>
            </motion.div>

            {/* Left Section */}
            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="md:w-1/2 w-full flex flex-col items-center justify-start p-6 bg-gray-100 overflow-y-auto min-h-screen order-2 md:order-2"
            >

                <StepIndicator step={step} colors={{ primary: "#9810fa", gray400: "#f3f4f6", secondary: "#f2f2f2" }} labels={["Email Verification", "Enter Code", "Profile Details", "Academic Details"]} />

                {/* Error, Success, and Message Handling */}
                {error && (
                    <motion.p
                        className="text-red-500 text-sm mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {error}
                    </motion.p>
                )}

                {success && (
                    <motion.p
                        className="text-green-500 text-sm mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {success}
                    </motion.p>
                )}

                {message && (
                    <motion.p
                        className="text-green-500 text-sm mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {message}
                    </motion.p>
                )}

                <div className="flex flex-col items-center justify-center h-full">



                    {step === 1 && (
                        <>
                            <StepOne
                                email={email}
                                setEmail={setEmail}
                                handleSendCode={handleSendCode}
                                loading={loading}
                                isValidEmail={isValidEmail}
                            />
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <StepTwo
                                code={code}
                                setCode={setCode}
                                handleVerifyCode={handleVerifyCode}
                                loading={loading}
                                handleSendCode={handleSendCode}

                            />
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <StepThree
                                username={username}
                                setUsername={setUsername}
                                profileImage={profileImage}
                                handleImageChange={handleImageChange}
                                password={password}
                                setPassword={setPassword}
                                confirmPassword={confirmPassword}
                                setConfirmPassword={setConfirmPassword}
                                lastStep={lastStep}
                            />
                        </>
                    )}

                    {step === 4 && (
                        <StepFour
                            teachers={teachers}
                            updateTeachers={updateTeachers}
                            filteredTypes={filteredTypes}
                            handleFileUpload={handleFileUpload}
                            handleRemoveFile={handleRemoveFile}
                            loading={loading}
                            handleRegister={handleRegister}
                        />
                    )}

                </div>
            </motion.div>
        </div>
    );
};

export default TeacherRegister;