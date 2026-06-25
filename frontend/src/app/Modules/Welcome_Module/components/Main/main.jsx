import { GraduationCap, Lightbulb, BookOpen, Users, Rocket, CheckCircle, Handshake, ClipboardList } from "lucide-react";
import image3 from '../../../../../assets/images/one.webp';
import image1 from '../../../../../assets/images/two.webp';
import image2 from '../../../../../assets/images/three.webp';
import image4 from '../../../../../assets/images/four.webp';
import image5 from '../../../../../assets/images/five.webp';
import image6 from '../../../../../assets/images/six.webp';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./main.css";

const Main = () => {
    // Animation variants
    const fadeInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const fadeInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const staggerContainer = {
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cards = [
        {
            image: image1,
            title: "Industry-Collaborated FYPs",
            //  or -> "Industry-Proposed FYPs" , "Industry-Linked FYPs", "Industry-Partnered FYPs" , "Industry-Suggested FYPs", "Real-World FYPs (Powered by Industry)"
            description: "Industry representatives upload Final Year Project (FYP) ideas to the portal, providing students with real-world challenges while bridging the gap between academia and industry.",
            icon: <Handshake size={24} className="text-brand-600" />
        },
        {
            image: image2,
            title: "Teacher Approval System",
            description: "University teachers review and approve project proposals from industry professionals, ensuring relevance, feasibility, and alignment with academic standards before students can claim them.",
            icon: <ClipboardList size={24} className="text-brand-600" />
        },
        {
            image: image3,
            title: "Student Project Claim & Tracking",
            description: "Once approved, students can claim FYPs and track their progress through the portal, allowing teachers and industry representatives to monitor and guide project development effectively.",
            icon: <GraduationCap size={24} className="text-brand-600" />
        },
    ];

    return (
        <div className="bg-white overflow-hidden">
            {/* Mission and Vision */}
            <section className="py-20 px-6 md:px-16 lg:px-28">
                <motion.div
                    className="flex flex-col md:flex-row gap-12 items-start"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                    <motion.div className="md:w-1/2" variants={fadeInLeft}>
                        <div className="flex items-center gap-3 mb-4">
                            <Rocket size={24} className="text-brand-600" />
                            <span className="text-brand-600 font-medium">Our Purpose</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand leading-tight">
                            Our Mission & Vision
                        </h2>
                    </motion.div>
                    <motion.div className="md:w-1/2" variants={fadeInRight}>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            At Collaborative Edge, our mission is to revolutionize the Final Year Project (FYP) experience by bridging the gap between academia and industry. We provide a seamless platform where students, educators, and industry professionals can collaborate on innovative, real-world projects.
                        </p>
                        <div className="mt-6 p-6 bg-brand-50 rounded-xl border border-brand-100">
                            <p className="text-gray-700">
                                Our vision is to create a dynamic ecosystem that fosters impactful solutions, prepares students for professional challenges, and drives growth for both educational institutions and industries.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Collaboration & Project Ideas Section */}
            <section className="py-20 px-6 md:px-16 lg:px-28 bg-gray-50">
                <motion.div
                    className="flex flex-col md:flex-row gap-12 items-start"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                    <motion.div className="md:w-1/2" variants={fadeInLeft}>
                        <div className="flex items-center gap-3 mb-4">
                            <Lightbulb size={24} className="text-brand-600" />
                            <span className="text-brand-600 font-medium">Innovation</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand leading-tight">
                            Transform Collaboration & Explore Innovative Ideas
                        </h2>
                    </motion.div>
                    <motion.div className="md:w-1/2" variants={fadeInRight}>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Collaborative Edge revolutionizes the Final Year Project (FYP) process by seamlessly connecting students, educators, and industry professionals. Our platform fosters effective collaboration, ensuring a smooth workflow and meaningful outcomes.
                        </p>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            {["Real-world challenges", "Industry mentorship", "Academic alignment", "Progress tracking"].map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-500" />
                                    <span className="text-gray-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Cards */}
            <section className="py-20 px-6 md:px-16 lg:px-28">
                <motion.div
                    className="cursor-pointer grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 wrapper"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                    {cards.map((card, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            whileHover={{ y: -10 }}
                            className="group border-2 border-gray-300 relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div className="overflow-hidden h-60">
                                <motion.img
                                    src={card.image}
                                    alt={card.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    initial={{ scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    {card.icon}
                                    <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
                                </div>
                                <p className="text-gray-600 mb-6">{card.description}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="cursor-pointer flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium transition-colors"
                                >
                                    <Link to="/how-it-works">
                                        Learn more
                                    </Link>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Teacher's Role Section */}
            <section className="py-20 px-6 md:px-16 lg:px-28 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="flex flex-col lg:flex-row gap-12 items-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div className="lg:w-1/2" variants={fadeInLeft}>
                            <div className="flex items-center gap-3 mb-4">
                                <BookOpen size={24} className="text-brand-400" />
                                <span className="text-brand-400 font-medium">Academic Oversight</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Guiding Project Approvals and Standards
                            </h2>
                            <p className="text-gray-300 mb-8">
                                Teachers ensure industry-submitted FYPs meet academic standards, approve projects, and guide students while maintaining academic integrity.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-brand shadow-glow hover:brightness-110 rounded-lg font-medium transition-colors"
                            >
                                <Link to="/how-it-works">
                                    Learn more
                                </Link>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </motion.button>
                        </motion.div>
                        <motion.div className="lg:w-1/2" variants={fadeInRight}>
                            <div className="rounded-xl overflow-hidden shadow-2xl">
                                <motion.img
                                    src={image4}
                                    alt="Teacher Role"
                                    className="w-full h-auto"
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Student Empowerment Section */}
            <section className="py-20 px-6 md:px-16 lg:px-28 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="flex flex-col lg:flex-row gap-12 items-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div className="lg:w-1/2 order-2 lg:order-1" variants={fadeInLeft}>
                            <div className="rounded-xl overflow-hidden shadow-2xl">
                                <motion.img
                                    src={image5}
                                    alt="Empowering Students"
                                    className="w-full h-full"
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </motion.div>
                        <motion.div className="lg:w-1/2 order-1 lg:order-2" variants={fadeInRight}>
                            <div className="flex items-center gap-3 mb-4">
                                <GraduationCap size={24} className="text-brand-600" />
                                <span className="text-brand-600 font-medium">Student Success</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Empowering Students in Project Selection
                            </h2>
                            <p className="text-gray-700 mb-8">
                                At Collaborative Edge, we simplify the Final Year Project (FYP) process by connecting students with industry-driven opportunities.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Explore industry-approved projects",
                                    "Select projects matching skills",
                                    "Collaborate with mentors and peers",
                                ].map((text, index) => (
                                    <motion.li
                                        key={index}
                                        className="flex items-start gap-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                                        <span className="text-gray-700">{text}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Industry Collaboration Section */}
            <section className="py-20 px-6 md:px-16 lg:px-28 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="flex flex-col lg:flex-row gap-12 items-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div className="lg:w-1/2" variants={fadeInLeft}>
                            <div className="flex items-center gap-3 mb-4">
                                <Users size={24} className="text-brand-600" />
                                <span className="text-brand-600 font-medium">Partnership</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Strengthening Industry-Academia Collaboration
                            </h2>
                            <p className="text-gray-700 mb-8">
                                Collaborative Edge bridges academia and industry by enabling industry representatives to propose FYP ideas. Teachers review and approve projects, ensuring they meet academic standards.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Seamless Project Idea Submission",
                                    "Educator Review for Academic Alignment",
                                    "Real-World Experience for Students",
                                ].map((text, index) => (
                                    <motion.li
                                        key={index}
                                        className="flex items-start gap-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                                        <span className="text-gray-700">{text}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div className="lg:w-1/2" variants={fadeInRight}>
                            <div className="rounded-xl overflow-hidden shadow-2xl">
                                <motion.img
                                    src={image6}
                                    alt="Industry Collaboration"
                                    className="w-full h-auto"
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Main;