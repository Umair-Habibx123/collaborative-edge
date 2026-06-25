import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, University, School } from "lucide-react";

const RoleSelection = () => {
    const navigate = useNavigate();

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
        hover: { scale: 1.1 },
    };

    const roles = [
        {
            icon: <School size={48} className="mx-auto" />,
            title: "Student",
            description: "Login as a student to explore the Projects and get the Projects.",
            link: "/student-register",
        },
        {
            icon: <University size={48} className="mx-auto" />,
            title: "Teacher",
            description: "Login as a teacher to approve industry projects and track student progress.",
            link: "/teacher-register",
        },
        {
            icon: <Building2 size={48} className="mx-auto" />,
            title: "Industry Representative",
            description: "Login as an Industry member to upload project ideas.",
            link: "/industry-representative-register",
        },
    ];

    return (
        <div className="-mt-[70px] md:-mt-[90px] bg-gradient-to-b from-brand-900 to-brand-700 min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <motion.h1 
                className="text-white text-3xl sm:text-4xl font-bold mb-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Select Your Role
            </motion.h1>
            
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.2,
                        },
                    },
                }}
            >
                {roles.map((role, index) => (
                    <motion.div
                        key={index}
                        variants={cardVariants}
                        whileHover="hover"
                        className="bg-white p-8 rounded-2xl shadow-xl text-center transition-transform transform hover:shadow-2xl cursor-pointer"
                        onClick={() => navigate(role.link, { replace: true })}
                    >
                        <div className="text-brand-700 mb-4">
                            {role.icon}
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">{role.title}</h2>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{role.description}</p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default RoleSelection;