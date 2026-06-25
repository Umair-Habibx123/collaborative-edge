import { motion } from "framer-motion";
import { FileText, Mail, Scale, BookOpen, Shield, AlertCircle, Edit } from "lucide-react";

const TermsAndConditions = () => {
    const sections = [
        {
            title: "Introduction",
            content: "Welcome to Collaborative Edge. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to comply with these terms. If you do not agree, please do not use our services.",
            icon: <FileText className="w-5 h-5 text-brand-500" />
        },
        {
            title: "Definitions",
            content: "In these Terms, the following terms shall have the following meanings:",
            listItems: [
                <span key="user-def"><strong>User:</strong> Refers to any individual or entity accessing the Collaborative Edge platform.</span>,
                <span key="services-def"><strong>Services:</strong> Refers to the functionalities provided by Collaborative Edge, including project submissions, reviews, and communications.</span>,
                <span key="content-def"><strong>Content:</strong> Refers to any information, text, graphics, or other materials uploaded or submitted by Users.</span>
            ],
            icon: <BookOpen className="w-5 h-5 text-brand-500" />
        },
        {
            title: "User Responsibilities",
            content: "Users agree to:",
            listItems: [
                "Provide accurate and complete information when creating an account.",
                "Maintain the confidentiality of their account credentials.",
                "Use the Services only for lawful purposes and in accordance with these Terms."
            ],
            icon: <Shield className="w-5 h-5 text-brand-500" />
        },
        {
            title: "Intellectual Property",
            content: "All content and materials on the Collaborative Edge platform are the property of Collaborative Edge or its licensors. Users may not reproduce, distribute, or create derivative works without prior written consent.",
            icon: <Edit className="w-5 h-5 text-brand-500" />
        },
        {
            title: "Limitation of Liability",
            content: "Collaborative Edge shall not be liable for any indirect, incidental, or consequential damages arising from the use of our Services. Users agree to use the platform at their own risk.",
            icon: <AlertCircle className="w-5 h-5 text-brand-500" />
        },
        {
            title: "Modifications",
            content: "Collaborative Edge reserves the right to modify these Terms at any time. Users will be notified of any changes, and continued use of the Services constitutes acceptance of the modified Terms.",
            icon: <Edit className="w-5 h-5 text-brand-500" />
        },
        {
            title: "Governing Law",
            content: "These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Collaborative Edge operates.",
            icon: <Scale className="w-5 h-5 text-brand-500" />
        },
        {
            title: "Contact Information",
            content: "If you have any questions about these Terms, please contact us at support@Collaborative Edge.com.",
            icon: <Mail className="w-5 h-5 text-brand-500" />
        }
    ];

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
                        Terms and Conditions
                    </h1>
                    <div className="w-24 h-1.5 bg-brand-500 mx-auto rounded-full" />
                </motion.div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 sm:p-8 md:p-10 lg:p-12 space-y-8">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                className="border-b border-gray-100 pb-8 last:border-0 last:pb-0"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true, margin: "-50px" }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
                                            {section.icon}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <span className="text-brand-600">{index + 1}.</span>
                                            {section.title}
                                        </h2>
                                        <div className="prose prose-indigo text-gray-600 max-w-none text-sm sm:text-base">
                                            <p className="leading-relaxed">{section.content}</p>
                                            {section.listItems && (
                                                <ul className="mt-4 space-y-3 pl-5">
                                                    {section.listItems.map((item, itemIndex) => (
                                                        <li
                                                            key={itemIndex}
                                                            className="relative before:absolute before:left-0 before:top-[0.6rem] before:h-1.5 before:w-1.5 before:rounded-full before:bg-brand-300 pl-4"
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
                    <div className="bg-gray-50 px-6 sm:px-8 py-5 text-center">
                        <p className="text-xs sm:text-sm text-gray-500 inline-flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>Need help? Contact us at support@Collaborative Edge.com</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;