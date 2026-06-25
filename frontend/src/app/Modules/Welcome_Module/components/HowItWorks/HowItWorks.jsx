import { motion } from "framer-motion";
import {
    Lightbulb,
    ClipboardCheck,
    Search,
    Users,
    MessageSquare,
    Award
} from 'lucide-react';
import { Link } from "react-router-dom";
import image1 from "../../../../../assets/images/seven.webp";
import image2 from "../../../../../assets/images/eight.webp";
import image3 from "../../../../../assets/images/nine.webp";
import image4 from "../../../../../assets/images/ten.webp";
import image5 from "../../../../../assets/images/eleven.webp";
import image6 from "../../../../../assets/images/twelve.webp";

const HowItWorks = () => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const cards = [
        {
            image: image2,
            icon: <Lightbulb className="w-8 h-8" />,
            title: "Post FYP Ideas",
            description: "Industry professionals submit innovative FYP ideas with detailed descriptions, objectives, and expected outcomes for student opportunities.",
        },
        {
            image: image3,
            icon: <ClipboardCheck className="w-8 h-8" />,
            title: "Review & Approval",
            description: "Educators evaluate proposals for feasibility and educational value, approving projects that meet academic and industry standards.",
        },
        {
            image: image1,
            icon: <Search className="w-8 h-8" />,
            title: "Browse & Select Projects",
            description: "Students explore curated projects filtered by industry, domain, and skills to find their ideal academic challenge.",
        },
    ];

    const cards2 = [
        {
            image: image4,
            icon: <Users className="w-8 h-8" />,
            title: "Collaborative FYP Project Process",
            description: "Students collaborate with peers and industry mentors, fostering teamwork and real-world problem-solving skills.",
        },
        {
            image: image5,
            icon: <MessageSquare className="w-8 h-8" />,
            title: "Industry Engagement",
            description: "Industry professionals provide ongoing feedback to keep projects aligned with current trends and standards.",
        },
        {
            image: image6,
            icon: <Award className="w-8 h-8" />,
            title: "Final Evaluation",
            description: "Comprehensive assessment by academic and industry experts recognizes student achievements.",
        },
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Streamlining the <span className="text-gray-600">FYP Process</span> from Idea to Completion
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Collaborative Edge revolutionizes the Final Year Project experience by creating a seamless collaboration platform for students, educators, and industry professionals.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="bg-gradient-to-br from-brand-50 to-white p-8 rounded-3xl shadow-sm border border-gray-100 relative z-10">
                            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                                Simplifying Project Submission and Approval
                            </h2>
                            <p className="text-gray-600 mb-6">
                                We make it easy for industry professionals to submit ideas and for educators to review them, ensuring students access high-quality, relevant projects that prepare them for real-world challenges.
                            </p>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-brand-100 rounded-2xl -z-0"></div>
                    </div>
                </motion.div>
            </div>

            {/* Core Workflow Section */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our <span className="text-gray-600">Workflow Process</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            A seamless journey from project conception to successful completion
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 wrapper"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {cards.map((card, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                whileHover={{ y: -10 }}
                                className="border-2 border-gray-300 cursor-pointer bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                    <div className="absolute -bottom-6 right-6 bg-white p-3 rounded-full shadow-lg">
                                        <div className="text-gray-600">
                                            {card.icon}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 pt-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                                    <p className="text-gray-600 mb-4">{card.description}</p>
                                    <button className="cursor-pointer text-gray-600 font-medium hover:text-gray-700 transition-colors">
                                        <Link to="/project-ideas">
                                            Learn more →
                                        </Link>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Additional Features Section */}
            <div className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Collaborative <span className="text-gray-600">Features</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Tools designed to enhance the FYP experience for all stakeholders
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {cards2.map((card, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                transition={{ delay: index * 0.1 }}
                                className="border-2 border-gray-300 cursor-pointer group relative overflow-hidden rounded-xl bg-white shadow-md"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <div className="bg-gray-600 p-2 rounded-lg inline-block mb-2">
                                            {card.icon}
                                        </div>
                                        <h3 className="text-xl font-bold">{card.title}</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-600">{card.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;