import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import UserDetails from './AddUser/AddUser';
import { ArrowLeft } from 'lucide-react';
import IndustryDetails from './AddIndustry/AddIndustry';
import { useAuth } from "../../../../../../auth/AuthContext"
import Loading from '../../../../../Components/loadingIndicator/loading';


const AddIndustryUser = () => {
    const location = useLocation();
    const { user, isAuthLoading } = useAuth();
    const [loading, setLoading] = useState(false);

    const theme = location.state?.theme;

    const [userDetails, setUserDetails] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        profilePicture: null, // Store the uploaded file
        role: 'industry',
        status: 'verified',
    });

    const [industryDetails, setIndustryDetails] = useState([
        {
            industryName: '',
            website: '',
            address: '',
            designation: '',
            workEmail: '',
            companyContactNumber: '',
            verificationDocuments: null,
            verified: true,
        },
    ]);

    const [error, setError] = useState('');

    const handleUserDetailsChange = (e) => {
        const { name, value, files } = e.target;
        setUserDetails({
            ...userDetails,
            [name]: files ? files[0] : value,
        });
    };

    const handleIndustryDetailsChange = (index, e) => {
        const { name, value, files, type, checked } = e.target;
        const updatedIndustryDetails = [...industryDetails];

        if (type === 'file' && files) {
            // Handle multiple file uploads
            const existingFiles = updatedIndustryDetails[index][name] || [];
            const newFiles = Array.from(files); // Convert FileList to array
            updatedIndustryDetails[index] = {
                ...updatedIndustryDetails[index],
                [name]: [...existingFiles, ...newFiles], // Append new files to existing ones
            };
        } else {
            updatedIndustryDetails[index] = {
                ...updatedIndustryDetails[index],
                [name]: type === 'checkbox' ? checked : value,
            };
        }

        setIndustryDetails(updatedIndustryDetails);
    };

    const addIndustryDetails = () => {
        setIndustryDetails([
            ...industryDetails,
            {
                industryName: '',
                website: '',
                address: '',
                designation: '',
                workEmail: '',
                companyContactNumber: '',
                verificationDocuments: null,
                verified: true,
            },
        ]);
    };

    const handleRemoveIndustryDetails = () => {
        setIndustryDetails((prevDetails) => {
            if (prevDetails.length > 1) {
                return prevDetails.slice(0, -1); // Remove the last item
            }
            return prevDetails; // Do nothing if there's only one item
        });
    };

    const validateForm = () => {
        const usernameRegex = /^[A-Za-z0-9_]{3,20}$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/;
        const nameRegex = /^[A-Za-z\s]+$/;
        const websiteRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const contactNumberRegex = /^[+\-\d\s()]+$/;

        const { username, password, confirmPassword, email } = userDetails;

        // Validate username
        if (!username || !usernameRegex.test(username)) {
            setError("Enter a valid Username (3-20 characters, letters, numbers, underscores only).");
            return false;
        }

        // Validate password
        if (!password || !confirmPassword) {
            setError("Password is required.");
            return false;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }

        if (!passwordRegex.test(password)) {
            setError("Password must be 6-12 characters and include a letter, number, and special character.");
            return false;
        }

        // Validate email
        if (!email || !emailRegex.test(email)) {
            setError("Enter a valid email address.");
            return false;
        }

        // Validate industry details
        for (let i = 0; i < industryDetails.length; i++) {
            const industry = industryDetails[i];

            if (!industry.industryName || !nameRegex.test(industry.industryName)) {
                setError("Enter a valid Industry Name (letters only).");
                return false;
            }

            if (!industry.website || !websiteRegex.test(industry.website)) {
                setError("Enter a valid Industry Website (e.g., https://example.com).");
                return false;
            }

            if (!industry.address) {
                setError("Enter a valid Industry Address.");
                return false;
            }

            if (!industry.designation || !nameRegex.test(industry.designation)) {
                setError("Enter a valid Industry Designation (letters only).");
                return false;
            }

            if (!industry.workEmail || !emailRegex.test(industry.workEmail)) {
                setError("Enter a valid Industry Work Email (e.g., user@example.com).");
                return false;
            }

            if (!industry.companyContactNumber || !contactNumberRegex.test(industry.companyContactNumber)) {
                setError("Enter a valid Industry Contact Number (digits, +, -, () allowed).");
                return false;
            }
        }

        setError('');
        return true;
    };


    const uploadProfilePic = async (file) => {
        const formData = new FormData();
        formData.append('profilePic', file);

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/uploadProfilePic`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            // Check for backend-specific errors in the response
            if (data.error) {
                throw new Error(data.error); // Throw an error to trigger the catch block
            }

            return data.fileUrl;
        } catch (error) {
            toast.error(`Error uploading profile picture:  ${error.message}`);
            return null;
        }
    };

    const insertUser = async (userData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/insertUsers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            const data = await response.json();

            // Check for backend-specific errors in the response
            if (data.error) {
                throw new Error(data.error); // Throw an error to trigger the catch block
            }

            return data;
        } catch (error) {
            toast.error(`Error inserting user: ${error.message}`);
            return null;
        }
    };


    const uploadVerificationDocuments = async (files) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file);
        });

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/uploadFile`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            // Check for backend-specific errors in the response
            if (data.error) {
                throw new Error(data.error); // Throw an error to trigger the catch block
            }
            return data.fileUrl;
        } catch (error) {
            toast.error(`Error uploading verification documents:  ${error.message}`);
            return null;
        }
    };


    const insertIndustryDetails = async (industryData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/insertIndustryUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(industryData),
            });
            const data = await response.json();

            // Check for backend-specific errors in the response
            if (data.error) {
                throw new Error(data.error); // Throw an error to trigger the catch block
            }
            return data;
        } catch (error) {

            toast.error(`Error inserting industry details: ${error.message}`);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading

        try {
            if (!validateForm()) {

                setLoading(false); // Stop loading on error
                return;
            }

            let profilePicUrl = null;

            // Upload profile picture if it exists
            if (userDetails.profilePicture) {
                profilePicUrl = await uploadProfilePic(userDetails.profilePicture);
                if (!profilePicUrl) {
                    setError('Failed to upload profile picture.');

                    setLoading(false); // Stop loading on error
                    return;
                }
            }

            // Prepare user data for insertion
            const userData = {
                _id: userDetails.email, // Using email as _id
                username: userDetails.username,
                email: userDetails.email,
                password: userDetails.password,
                profilePic: profilePicUrl || "", // Use empty string if no profile picture
                role: userDetails.role,
                status: userDetails.status
            };

            // Insert user data
            const userInsertResponse = await insertUser(userData);

            if (!userInsertResponse || userInsertResponse.error) {

                setError(userInsertResponse?.error || 'Failed to insert user data.');
                setLoading(false); // Stop loading on error
                return;
            }

            // Upload verification documents if they exist
            const verificationDocumentUrls = await Promise.all(
                industryDetails.map(async (industry) => {
                    if (industry.verificationDocuments) {
                        return await uploadVerificationDocuments([industry.verificationDocuments]);
                    }
                    return null;
                })
            );

            const industryData = {
                _id: userDetails.email?.trim(), // Ensure email is not undefined or empty
                email: userDetails.email?.trim(), // Ensure email is not undefined or empty
                representingIndustries: industryDetails.map((industry, index) => ({
                    name: industry.industryName,
                    website: industry.website,
                    address: industry.address,
                    designation: industry.designation,
                    workEmail: industry.workEmail,
                    companyContactNumber: industry.companyContactNumber,
                    verified: industry.verified,
                    verificationDocuments: verificationDocumentUrls[index]
                        ? [{ fileUrl: verificationDocumentUrls[index] }]
                        : [],
                })),
                verifiedBy: user.email,
            };

            // Check before sending
            if (!industryData._id) {

                setError("User email is missing. Cannot submit form.");
                setLoading(false); // Stop loading on error
                return;
            }

            // Insert industry details
            const industryInsertResponse = await insertIndustryDetails(industryData);

            if (!industryInsertResponse || industryInsertResponse.error) {

                setError(industryInsertResponse?.error || 'Failed to insert industry details.');
                setLoading(false); // Stop loading on error
                return;
            }


            toast.success('Form submitted successfully!');
            console.log('Form submitted successfully:', { userDetails, industryDetails });
        } catch (error) {
            // Handle any unexpected errors
            console.error('Error submitting form:', error);
            toast.error('An unexpected error occurred. Please try again.');
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false); // Stop loading in all cases
        }
    };



    if (isAuthLoading) {
        return <Loading />;
    }

    return (


        <div className={`min-h-screen -mt-[70px] md:-mt-[90px] p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <ToastContainer />
            <div className="container mx-auto max-w-7xl">
                {/* Header Section */}
                <div className={`flex flex-col sm:flex-row justify-start items-start sm:items-center border-b pb-4 mb-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                    <button
                        onClick={() => window.history.back()}
                        className={`w-full sm:w-auto mb-4 sm:mb-0 flex items-center border-2 space-x-2 px-4 py-2 rounded-lg transition-all duration-300 
                ${theme === 'dark' ? 'border-gray-600 text-white hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-200'}`}
                    >
                        <ArrowLeft />
                        <span>Back</span>
                    </button>
                    <h1 className="w-full sm:w-10/12 text-center mb-4 sm:mb-0 p-4 text-3xl font-bold text-gradient bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
                        Add New User
                    </h1>
                </div>

                {/* Description */}
                <p className={`mb-8 text-lg text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Fill in the details below to create a new industry user.
                </p>

              

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {loading ? (
                        <Loading />
                    ) : (
                        <>
                            {/* User Details Card */}
                            <div className={`p-8 rounded-xl shadow-lg transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 hover:shadow-gray-700/30' : 'bg-white hover:shadow-gray-200'}`}>
                                <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                    User Details
                                </h2>
                                <UserDetails theme={theme} userDetails={userDetails} handleUserDetailsChange={handleUserDetailsChange} />
                            </div>

                            {/* Industry Details Card */}
                            <div className={`p-8 rounded-xl shadow-lg transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 hover:shadow-gray-700/30' : 'bg-white hover:shadow-gray-200'}`}>
                                <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                    Industry Details
                                </h2>
                                <IndustryDetails
                                    theme={theme}
                                    industryDetails={industryDetails}
                                    handleIndustryDetailsChange={handleIndustryDetailsChange}
                                    addIndustryDetails={addIndustryDetails}
                                    handleRemoveIndustryDetails={handleRemoveIndustryDetails}

                                />
                            </div>

                              {/* Error Message */}
                {error && (
                    <div className={`mb-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-red-900/20 text-red-400 border-red-800' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {error}
                    </div>
                )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl 
                        ${theme === 'dark'
                                        ? 'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white'
                                        : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white'}`}
                            >
                                Create User
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>


    );
};

export default AddIndustryUser;