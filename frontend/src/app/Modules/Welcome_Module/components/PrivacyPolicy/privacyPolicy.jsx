import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../../auth/AuthContext";
import Loading from "../../../../Components/loadingIndicator/loading";
import { AlertTriangle, Search, ShieldAlert, Mail } from "lucide-react";

const PrivacyPolicy = () => {
    const { user, isAuthLoading } = useAuth();
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true); // Track initial load

    useEffect(() => {
        if (isAuthLoading) return;

        const fetchPrivacyPolicy = async () => {
            try {
                setLoading(true);
                setError(null);

                // var roleToFetch = "main";

                // if (user?.role === "industry") {
                //     roleToFetch = user?.role;
                // }
                // else if (user?.role === "teacher") {
                //     roleToFetch = user?.role;
                // }
                // else if (user?.role === "student") {
                //     roleToFetch = user?.role;
                // }
                // else if (user?.role === "admin") {
                //     roleToFetch = "main";
                // }


                const roleToFetch = new Set(["industry", "teacher", "student"]).has(user?.role)
                    ? user.role
                    : "main";


                const response = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/get-privacy-policy`,
                    { params: { role: roleToFetch } }
                );
                setPolicy(response.data);
            } catch (err) {
                console.error("Error fetching privacy policy:", err);
                setError("Failed to load privacy policy. Please try again later.");
            } finally {
                setLoading(false);
                setInitialLoad(false);
            }
        };
        if (initialLoad || policy === null) {
            fetchPrivacyPolicy();
        }

    }, [user, isAuthLoading, initialLoad]);

     if (isAuthLoading || (loading && initialLoad)) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-gray-50 px-4">
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="flex justify-center text-red-500 mb-4">
                        <AlertTriangle className="w-12 h-12" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600 text-sm sm:text-base">{error}</p>
                </div>
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-gray-50 px-4">
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="flex justify-center text-gray-400 mb-4">
                        <Search className="w-12 h-12" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No Policy Found</h2>
                    <p className="text-gray-600 text-sm sm:text-base">The privacy policy could not be loaded.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                {/* Header with Role */}
                <motion.div
                    className="text-center mb-8 sm:mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
                            Privacy Policy
                        </h1>
                        {user && (
                            <span className="text-brand-600 text-lg sm:text-xl md:text-2xl font-medium bg-brand-50 px-3 py-1 rounded-full">
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Version
                            </span>
                        )}
                    </div>
                    <div className="w-20 sm:w-24 h-1.5 bg-brand-500 mx-auto mt-3 sm:mt-4 rounded-full" />

                    <motion.div
                        className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2 bg-gray-100 rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <ShieldAlert className="w-4 h-4" />
                        <span>
                            Last updated: {new Date(policy.lastUpdated).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </motion.div>
                </motion.div>

                {/* Policy Content */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-5 sm:p-8 md:p-10 lg:p-12 space-y-8 sm:space-y-10">
                        {policy.sections.map((section, index) => (
                            <motion.div
                                key={index}
                                className="border-b border-gray-100 pb-8 sm:pb-10 last:border-0 last:pb-0"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true, margin: "-50px" }}
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-brand-100 flex items-center justify-center mr-3 sm:mr-4 mt-0.5">
                                        <span className="text-brand-600 font-medium text-sm sm:text-base">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                                            {section.title}
                                        </h2>
                                        <div className="prose prose-indigo text-gray-600 max-w-none text-sm sm:text-base">
                                            <p className="leading-relaxed">{section.content}</p>
                                            {section.listItems.length > 0 && (
                                                <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 pl-4 sm:pl-5">
                                                    {section.listItems.map((item, itemIndex) => (
                                                        <li
                                                            key={itemIndex}
                                                            className="relative before:absolute before:left-0 before:top-[0.6rem] sm:before:top-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-brand-300 pl-3 sm:pl-4"
                                                        >
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-5 sm:px-8 py-4 sm:py-6 text-center">
                        <p className="text-xs sm:text-sm text-gray-500 inline-flex items-center gap-1.5">
                            <Mail className="w-4 h-4" />
                            <span>If you have any questions about this Privacy Policy, please contact us.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;