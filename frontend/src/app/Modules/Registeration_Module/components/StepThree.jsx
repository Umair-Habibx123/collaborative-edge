import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { User, Lock, Image, Rocket } from "lucide-react"; // Import Lucide icons

const StepThree = ({
    username,
    setUsername,
    profileImage,
    handleImageChange,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    lastStep,
}) => {
    const isFormValid = username && password && confirmPassword;

    return (
        <div className='bg-white p-4 md:p-8 rounded-2xl shadow-2xl max-w-sm md:max-w-md mx-auto w-full'>
            <motion.h2
                className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Enter Profile Details
            </motion.h2>
            <motion.div
                className="w-full p-8 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Username Field */}
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-4 pl-12 bg-white/30 border border-white/30 text-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none backdrop-blur-lg transition-all duration-200 placeholder:text-gray-500"
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" /> {/* Lucide User Icon */}
                </div>

                {/* Profile Picture Upload */}
                <div className="mb-6">

                    <div className="flex gap-2">
                        <Image className=" text-gray-500 w-5 h-5" />
                        <label className="text-gray-700 font-medium block mb-3">Profile Picture</label>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Choose a file to set as your profile picture.</p>

                    {/* Image Preview */}
                    {profileImage && (
                        <motion.div
                            className="mb-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img
                                src={profileImage}
                                alt="Profile Preview"
                                className="w-24 h-24 rounded-full object-cover border-2 border-white/50 shadow-md"
                            />
                        </motion.div>
                    )}

                    <div className="relative">
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleImageChange}
                            className="w-full p-4 bg-white/30 border border-white/30 text-gray-700 rounded-xl cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-brand-500 file:text-white hover:file:bg-brand-600 backdrop-blur-lg transition-all duration-200"
                        />
                    </div>

                </div>

                {/* Password Field */}
                <div className="relative mb-6">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 pl-12 bg-white/30 border border-white/30 text-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none backdrop-blur-lg transition-all duration-200 placeholder:text-gray-500"
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" /> {/* Lucide Lock Icon */}
                </div>

                {/* Confirm Password Field */}
                <div className="relative mb-8">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-4 pl-12 bg-white/30 border border-white/30 text-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none backdrop-blur-lg transition-all duration-200 placeholder:text-gray-500"
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" /> {/* Lucide Lock Icon */}
                </div>

                {/* Register Button */}
                <motion.button
                    onClick={lastStep}
                    disabled={!isFormValid}
                    className={`cursor-pointer w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white p-4 rounded-xl font-bold shadow-lg transition-all duration-300 relative overflow-hidden ${!isFormValid ? "opacity-50 cursor-not-allowed" : "hover:from-brand-700 hover:to-brand-600"
                        }`}
                    whileHover={isFormValid ? { scale: 1.05 } : {}}
                    whileTap={isFormValid ? { scale: 0.95 } : {}}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2"> <Rocket className="w-5 h-5" />Last Step</span>
                    {isFormValid && (
                        <motion.span
                            className="absolute inset-0 bg-white/10 z-0"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "0%" }}
                            transition={{ duration: 0.5 }}
                        />
                    )}
                </motion.button>
            </motion.div>
        </div>
    );
};

// Prop Types Validation
StepThree.propTypes = {
    username: PropTypes.string.isRequired,
    setUsername: PropTypes.func.isRequired,
    profileImage: PropTypes.string,
    handleImageChange: PropTypes.func.isRequired,
    password: PropTypes.string.isRequired,
    setPassword: PropTypes.func.isRequired,
    confirmPassword: PropTypes.string.isRequired,
    setConfirmPassword: PropTypes.func.isRequired,
    lastStep: PropTypes.func.isRequired,
};

export default StepThree;