import { motion } from "framer-motion";
import { CheckCircle, Bell, Mail, Lock, Home } from "lucide-react";

const WaitingMessage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-50 to-brand-50 p-6 -mt-[70px] md:-mt-[90px]">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-opacity-10 border-gray-200"
            >
                {/* CheckCircle Icon with Animation */}
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="animate-float"
                >
                    <CheckCircle className="w-20 h-20 mx-auto text-green-600 mb-4" />
                </motion.div>

                {/* Heading */}
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-3xl font-bold text-gray-800 mb-4"
                >
                    Account Created! 🎉
                </motion.h2>

                {/* Main Message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-3 text-gray-600 text-lg"
                >
                    Your account has been successfully created but is currently{" "}
                    <strong className="text-brand-600">pending approval</strong>.
                </motion.p>

                {/* Notification Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="mt-6 p-5 bg-yellow-50 rounded-xl text-yellow-800 border border-yellow-200"
                >
                    <p className="flex items-center justify-center space-x-2">
                        <Bell className="w-5 h-5 text-yellow-600" />
                        <span>You will receive an email once an admin approves your account.</span>
                    </p>
                    <p className="flex items-center justify-center space-x-2 mt-2">
                        <Mail className="w-5 h-5 text-yellow-600" />
                        <span>If verified, you will be able to log in.</span>
                    </p>
                </motion.div>

                {/* Password Reminder Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="mt-6 p-5 bg-brand-50 rounded-xl text-brand-800 border border-brand-200"
                >
                    <p className="flex items-center justify-center space-x-2">
                        <Lock className="w-5 h-5 text-brand-600" />
                        <span>No worries about your password! We will send you a reminder email if needed.</span>
                    </p>
                </motion.div>

                {/* Thank You Message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.5 }}
                    className="mt-8 text-gray-500 text-sm"
                >
                    Thank you for your patience! 🚀
                </motion.p>

                {/* Home Button */}
                <motion.a
                    href="/"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 0.5 }}
                    className="inline-flex items-center justify-center bg-brand-600 text-white py-3 px-6 my-6 rounded-lg font-semibold text-lg hover:bg-brand-700 transition duration-300 ease-in-out shadow-lg hover:shadow-xl"
                >
                    <Home className="w-5 h-5 mr-2" /> Take me Home
                </motion.a>
            </motion.div>
        </div>
    );
};

export default WaitingMessage;