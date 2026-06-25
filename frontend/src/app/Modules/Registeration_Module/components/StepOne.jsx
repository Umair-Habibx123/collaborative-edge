import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useLocation } from "react-router-dom";

const StepOne = ({ email, setEmail, handleSendCode, loading, isValidEmail }) => {
    const location = useLocation();

    const routeHeading = {
        "/student-register": "Student Registration",
        "/industry-representative-register": "Industry Representative Registration",
        "/teacher-register": "Teacher Registration",
    };

    const routeMessages = {
        "/student-register": " Use your Academic (.edu/.ac) email for verification."
    };

    const message1 = routeMessages[location.pathname] || "Use your email for verification.";
    const message2 = routeHeading[location.pathname] || "Registration";

    return (
        <div className='bg-white p-4 md:p-8 rounded-2xl shadow-2xl max-w-md mx-auto w-full'>

            <motion.h2
                className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {message2}
            </motion.h2>
            <motion.input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 md:p-4 mb-2 border-2 rounded-lg text-sm font-medium outline-none transition-all ${!isValidEmail(email) && email
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            />
            <motion.p
                className="p-2 md:p-4 mt-1 text-sm text-gray-600 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                {message1}
            </motion.p>
            {!isValidEmail(email) && email && (
                <motion.p
                    className="text-red-500 text-sm mt-1 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    Please enter a valid email address.
                </motion.p>
            )}
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
                    onClick={handleSendCode}
                    className={`cursor-pointer w-full p-3 md:p-4 rounded-lg font-semibold text-sm transition-all ${isValidEmail(email)
                        ? "bg-brand-600 text-white hover:bg-brand-700 shadow-lg hover:shadow-brand-500/30"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                    disabled={!isValidEmail(email) || loading}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    Send Verification Code
                </motion.button>
            )}

            {/* Divider */}
            <motion.div
                className="flex items-center my-4 md:my-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
            >
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-sm text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </motion.div>

            {/* Google Sign-In Button */}
            <motion.button
                onClick={null}
                className="cursor-not-allowed w-full p-3 md:p-4 rounded-lg bg-gray-300 border-2 border-gray-200 text-gray-700 flex items-center justify-center font-semibold text-sm transition-all hover:border-gray-300 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                disabled={true}
                transition={{ duration: 0.4, delay: 0.5 }}
            >
                {/* <Google className="w-5 h-5 mr-3" /> */}
                Sign up with Google
            </motion.button>
        </div>
    );
};

StepOne.propTypes = {
    email: PropTypes.string.isRequired,
    setEmail: PropTypes.func.isRequired,
    handleSendCode: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    isValidEmail: PropTypes.func.isRequired,
};

export default StepOne;