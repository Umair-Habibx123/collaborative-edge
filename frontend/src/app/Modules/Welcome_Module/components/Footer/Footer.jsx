import { Link } from "react-router-dom";
import { Facebook, Linkedin, Twitter, Mail, MapPin, Phone, Github } from "lucide-react";
import { motion } from "framer-motion";
import Image from "../../../../../assets/images/umair.png";

const Footer = () => {
    const developer = {
        name: "Umair Habib",
        imageUrl: Image,
        role: "Full Stack Developer",
        github: "https://github.com/",
        linkedin: "https://www.linkedin.com/in/umair-habib-developer"
    };                                  

    const socialLinks = [
        { icon: <Facebook size={18} />, url: "https://facebook.com", name: "Facebook" },
        { icon: <Twitter size={18} />, url: "https://twitter.com", name: "Twitter" },
        { icon: <Linkedin size={18} />, url: "https://linkedin.com", name: "LinkedIn" },
        { icon: <Mail size={18} />, url: "mailto:collaborateedgeofficials@gmail.com", name: "Email" }
    ];

    const quickLinks = ["About Us", "How It Works", "Project Ideas", "Success Stories"];
    const resources = ["Privacy Policy", "Terms and Conditions", "Contact Us"];
    const contactInfo = [
        { icon: <MapPin size={18} />, text: "123 Street, Islamabad, Pakistan", url: "" },
        { icon: <Mail size={18} />, text: "collaborateedgeofficials@gmail.com", url: "mailto:collaborateedgeofficials@gmail.com" },
        { icon: <Phone size={18} />, text: "+92 (234) 567-1234", url: "tel:+922345671234" }
    ];

    return (
        <footer className="w-full bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto">
                {/* Main Footer Content */}
                <div className="flex justify-center w-full">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8 max-w-7xl px-4 w-full"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, staggerChildren: 0.2 }}
                    >
                        {/* Brand Section */}
                        <motion.div
                            className="flex flex-col items-center md:items-start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link to="/" className="flex items-center mb-6 group">
                                <motion.h2
                                    className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <span className="bg-gradient-to-r from-brand-500 to-cyan-400 bg-clip-text text-transparent">
                                        COLLABORATE
                                    </span>
                                    <span className="text-white">EDGE</span>
                                </motion.h2>
                            </Link>
                            <p className="text-gray-400 leading-relaxed text-center md:text-left text-sm sm:text-base mb-6">
                                Bridging the gap between academia and industry through innovative project collaboration.
                            </p>
                            <div className="flex space-x-3">
                                {socialLinks.map((social, index) => (
                                    <motion.a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg bg-gray-800 hover:bg-gray-700 group relative"
                                        whileHover={{ y: -3 }}
                                        whileTap={{ scale: 0.95 }}
                                        aria-label={social.name}
                                    >
                                        {social.icon}
                                        <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {social.name}
                                        </span>
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div
                            className="flex flex-col items-center md:items-start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <h3 className="text-lg font-semibold text-white mb-4 relative inline-block">
                                Quick Links
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"></span>
                            </h3>
                            <ul className="space-y-3 flex flex-col items-center md:items-start w-full">
                                {quickLinks.map((name, index) => (
                                    <motion.li
                                        key={index}
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <Link
                                            to={`/${name.toLowerCase().replace(/ /g, '-')}`}
                                            className="text-gray-400 hover:text-white transition-colors flex items-center group text-sm sm:text-base"
                                        >
                                            <span className="w-1.5 h-1.5 bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full mr-3 transition-all group-hover:w-2 group-hover:h-2"></span>
                                            {name}
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div
                            className="flex flex-col items-center md:items-start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h3 className="text-lg font-semibold text-white mb-4 relative inline-block">
                                Contact Us
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"></span>
                            </h3>
                            <ul className="space-y-4">
                                {contactInfo.map((contact, index) => (
                                    <motion.li
                                        key={index}
                                        className="flex items-start gap-3 group"
                                        whileHover={{ x: 5 }}
                                        onClick={() => {
                                            if (contact.url) {
                                                window.open(contact.url, "_blank");
                                            }
                                        }}
                                    >
                                        <div className="mt-0.5 text-brand-400 group-hover:text-cyan-300 transition-colors">
                                            {contact.icon}
                                        </div>
                                        <span className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm sm:text-base">
                                            {contact.text}
                                        </span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Resources */}
                        <motion.div
                            className="flex flex-col items-center md:items-start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <h3 className="text-lg font-semibold text-white mb-4 relative inline-block">
                                Resouces
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"></span>
                            </h3>
                            <ul className="space-y-3 flex flex-col items-center md:items-start w-full">
                                {resources.map((name, index) => (
                                    <motion.li
                                        key={index}
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <Link
                                            to={`/${name.toLowerCase().replace(/ /g, '-')}`}
                                            className="text-gray-400 hover:text-white transition-colors flex items-center group text-sm sm:text-base"
                                        >
                                            <span className="w-1.5 h-1.5 bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full mr-3 transition-all group-hover:w-2 group-hover:h-2"></span>
                                            {name}
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Divider */}
                <motion.div
                    className="relative my-8 mx-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 bg-gray-900 text-gray-500 text-sm rounded-full">
                            COLLABORATE EDGE
                        </span>
                    </div>
                </motion.div>

                {/* Copyright and Developer */}
                <motion.div
                    className="flex flex-col md:flex-row justify-between items-center pt-4 px-4 relative"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <p className="text-gray-500 text-sm mb-4 md:mb-0 text-center md:text-left">
                        &copy; {new Date().getFullYear()} Collaborate Edge. All rights reserved.
                    </p>


                    {/* Developer Card */}
                    <motion.div
                        className="mt-4 md:mt-0 md:absolute md:right-4 md:bottom-6 w-full md:w-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 hover:from-gray-700 hover:to-gray-800 transition-all border border-gray-700 hover:border-brand-400/30 shadow-lg max-w-xs mx-auto md:ml-auto">
                            <div className="flex items-center gap-3 mb-3">
                                <motion.div whileHover={{ rotate: 5, scale: 1.05 }}>
                                    <img
                                        src={developer.imageUrl}
                                        alt={developer.name}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-brand-400/80 shadow-md"
                                    />
                                </motion.div>
                                <div>
                                    <h4 className="font-medium text-white text-sm">{developer.name}</h4>
                                    <p className="text-xs bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
                                        {developer.role}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <motion.a
                                    href={developer.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 hover:text-white bg-gray-700/50 p-1.5 rounded-lg transition-all hover:bg-gray-600 text-sm flex items-center border border-gray-600 hover:border-brand-400/30"
                                    whileHover={{ y: -2 }}
                                >
                                    <Github size={16} className="mr-1" />
                                    GitHub
                                </motion.a>
                                <motion.a
                                    href={developer.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 hover:text-brand-400 bg-gray-700/50 p-1.5 rounded-lg transition-all hover:bg-gray-600 text-sm flex items-center border border-gray-600 hover:border-brand-400/30"
                                    whileHover={{ y: -2 }}
                                >
                                    <Linkedin size={16} className="mr-1" />
                                    LinkedIn
                                </motion.a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;