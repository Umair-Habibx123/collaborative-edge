import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { useRef, useEffect, useState } from "react";

const StepTwo = ({ code, setCode, handleVerifyCode, loading, handleSendCode }) => {
    const inputRefs = useRef([]);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const codeArray = code.split("").concat(Array(6 - code.length).fill(""));

    // Handle resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResendClick = async () => {
        if (resendCooldown > 0) return;
        
        setResendLoading(true);
        setResendSuccess(false);
        
        try {
            await handleSendCode();
            setResendCooldown(30); // 30 seconds cooldown
            setResendSuccess(true);
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setResendSuccess(false);
            }, 3000);
        } catch (error) {
            console.error("Error resending code:", error);
        } finally {
            setResendLoading(false);
        }
    };

    const handleInputChange = (index, value) => {
        if (/^\d$/.test(value) || value === "") {
            const newCodeArray = [...codeArray];
            newCodeArray[index] = value;
            setCode(newCodeArray.join(""));

            // Move focus to the next input box
            if (value !== "" && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text/plain");
        const digits = pastedText.replace(/\D/g, "").split("").slice(0, 6);

        if (digits.length > 0) {
            const newCodeArray = [...codeArray];
            digits.forEach((digit, i) => {
                if (i < 6) {
                    newCodeArray[i] = digit;
                }
            });
            setCode(newCodeArray.join(""));

            const lastFilledIndex = digits.length - 1;
            if (lastFilledIndex < 5) {
                inputRefs.current[lastFilledIndex + 1].focus();
            } else {
                inputRefs.current[5].focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && index > 0 && codeArray[index] === "") {
            inputRefs.current[index - 1].focus();
        }
    };

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    return (
        <div className='bg-white p-4 md:p-8 rounded-2xl shadow-2xl max-w-sm md:max-w-md mx-auto w-full'>
            <motion.h2
                className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Enter Verification Code
            </motion.h2>
            
            <p className="text-center text-gray-600 mb-6">
                We've sent a 6-digit code to your email
            </p>
            
            <div className="flex justify-center space-x-2 md:space-x-4 mb-4 md:mb-6">
                {codeArray.map((digit, index) => (
                    <motion.input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        ref={(el) => (inputRefs.current[index] = el)}
                        className={`w-10 h-10 md:w-16 md:h-16 text-center text-lg md:text-2xl font-bold border-2 rounded-lg outline-none transition-all ${digit
                            ? "border-brand-500 focus:border-brand-700 focus:ring-2 focus:ring-brand-300"
                            : "border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-300"
                            }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        disabled={loading}
                    />
                ))}
            </div>
            
            {/* Resend Code Section */}
            <div className="text-center mb-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {resendSuccess ? (
                        <p className="text-green-600 text-sm font-medium">
                            Verification code resent successfully!
                        </p>
                    ) : resendCooldown > 0 ? (
                        <p className="text-gray-500 text-sm">
                            Resend code in {resendCooldown} seconds
                        </p>
                    ) : (
                        <button
                            onClick={handleResendClick}
                            disabled={resendLoading}
                            className="text-brand-600 hover:text-brand-800 text-sm font-medium disabled:opacity-50"
                        >
                            {resendLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                "Didn't receive a code? Resend"
                            )}
                        </button>
                    )}
                </motion.div>
            </div>
            
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
                    onClick={handleVerifyCode}
                    className={`cursor-pointer w-full p-2 md:p-4 rounded-lg font-semibold text-sm transition-all ${code.length === 6
                        ? "bg-brand-600 text-white hover:bg-brand-700 shadow-lg hover:shadow-brand-500/30"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                    disabled={code.length !== 6 || loading}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    Verify Code
                </motion.button>
            )}
        </div>
    );
};

StepTwo.propTypes = {
    code: PropTypes.string.isRequired,
    setCode: PropTypes.func.isRequired,
    handleVerifyCode: PropTypes.func.isRequired,
    handleResendCode: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default StepTwo;