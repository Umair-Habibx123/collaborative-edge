import { useState, useEffect } from "react";
import image1 from "../../../../../assets/images/login.png";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ForgotPasswordModal from "../../components/forgotEmailModal/forgot_Modal";
import { useAuth } from "../../../../../auth/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify"

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { checkAuthStatus } = useAuth();

    const navigate = useNavigate();

    // Load saved email from localStorage when component mounts
    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleLogin = async () => {
        setLoading(true);
        setMessage(null);

        if (!email || !password) {
            setMessage({ type: "error", text: "Email and password are required." });
            toast.error("Email and password are required.")
            setLoading(false);
            return;
        }

        // Save email to localStorage if rememberMe is checked
        if (rememberMe) {
            localStorage.setItem("rememberedEmail", email);
        } else {
            localStorage.removeItem("rememberedEmail");
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: result.message });
                toast.success(result.message)

                if (result.user) {
                    await checkAuthStatus();

                    setTimeout(() => {
                        if (result.user.role === "industry") {
                            navigate("/industry-dashboard", { replace: true });
                        } else if (result.user.role === "teacher") {
                            navigate("/teacher-dashboard", { replace: true });
                        } else if (result.user.role === "student") {
                            navigate("/student-dashboard", { replace: true });
                        } else if (result.user.role === "admin") {
                            navigate("/admin-dashboard", { replace: true });
                        } else {
                            setMessage({ type: "error", text: "Invalid role." });
                        }
                    }, 500);
                }
            } else {
                setMessage({ type: "error", text: result.error || "Invalid email or password." });
                toast.error(result.error || "Invalid email or password.")
            }
        } catch (err) {
            setMessage({ type: "error", text: err.message || "An error occurred. Please try again." });
            toast.error(err.message || "An error occurred. Please try again.")
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="min-h-screen flex flex-col -mt-[70px] md:-mt-[90px] md:flex-row bg-gradient-hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <ToastContainer />
            {/* Left Section */}
            <motion.div
                className="w-full md:w-1/2 flex flex-row gap-4 sm:flex-col-reverse justify-center sm:justify-between items-center text-center sm:text-left p-8 md:p-12 lg:p-20"
                initial={{ x: 300 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 25 }}
            >
                <motion.img
                    src={image1}
                    alt="Illustration"
                    className="w-24 sm:w-36 md:w-64 lg:w-80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                />

                <div className="sm:ml-4">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">Collaborative Edge</h1>
                    <p className="mt-4 text-lg text-gray-300 hidden md:block sm:text-center">Empowering collaboration for the future</p>
                </div>
            </motion.div>

            {/* Right Section */}
            <motion.div
                className="w-full md:m-8 md:w-1/2 md:rounded-4xl flex flex-col justify-center p-8 md:p-12 lg:p-20 bg-white/5 border border-white/10 backdrop-blur-2xl shadow-glow"
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 25 }}
            >
                <h1 className="text-4xl font-extrabold text-white">Welcome <span className="text-gradient-brand">Back</span></h1>
                <p className="mt-2 text-gray-300">Login to access your account</p>

                <div className="mt-8 space-y-6">
                    {/* Email Input */}
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-400"
                            htmlFor="verified-email"
                        >
                            Verified Email
                        </label>
                        <input
                            id="verified-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your verified email"
                            className="w-full mt-2 px-4 py-3 bg-white/10 border border-white/10 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-400"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full mt-2 px-4 py-3 bg-white/10 border border-white/10 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                            />
                            <span
                                className="absolute right-4 top-4 text-gray-400 cursor-pointer hover:text-brand-500 transition-all"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <EyeOff size={28} /> : <Eye size={28} />}
                            </span>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember-me"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-brand-600 bg-gray-800 border-gray-600 rounded focus:ring-brand-500"
                            />
                            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-400">
                                Remember Me
                            </label>
                        </div>
                        <p
                            className="text-sm text-brand-300 hover:text-brand-200 cursor-pointer transition-all"
                            onClick={() => setIsForgotPasswordOpen(true)}
                        >
                            Forgot Password?
                        </p>
                    </div>

                    {/* Feedback Message */}
                    {message && (
                        <motion.div
                            className={`mt-4 p-3 rounded-lg ${message.type === "success" ? "bg-green-600" : "bg-red-600"
                                } text-white text-sm`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {message.text}
                        </motion.div>
                    )}

                    {/* Login Button */}
                    <motion.button
                        onClick={handleLogin}
                        disabled={loading}
                        className="cursor-pointer w-full py-3 bg-gradient-brand text-white font-semibold rounded-xl shadow-glow hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-60"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-2 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2">Logging in...</span>
                            </div>
                        ) : (
                            "Login"
                        )}
                    </motion.button>

                    {/* Register Link */}
                    <p className="text-sm text-gray-400 text-center mt-4">
                        Don&apos;t have an account?{" "}
                        <span
                            className="text-brand-300 hover:text-brand-200 cursor-pointer transition-all"
                            onClick={() => navigate("/roleSelection")}
                        >
                            Register
                        </span>
                    </p>
                </div>
            </motion.div>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
        </motion.div>
    );
};

export default Login;