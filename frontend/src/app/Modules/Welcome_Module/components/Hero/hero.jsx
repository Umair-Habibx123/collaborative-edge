import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Button from "../../../../ui/Button.jsx";
import image1 from "../../../../../assets/images/banner1.webp";
import image2 from "../../../../../assets/images/banner2.webp";
import image3 from "../../../../../assets/images/banner3.webp";
import "./hero.css";

const Hero = () => {
    const slides = [
        {
            image: image1,
            heading: "Bridge the Gap Between Academia and Industry",
            text: "Collaborative Edge fosters seamless collaboration between students, teachers, and industry professionals. Discover industry-vetted project ideas that meet academic standards and real-world challenges.",
            buttonText: "Explore Now",
            buttonLink: "/about-us",
        },
        {
            image: image2,
            heading: "Transform Your Final Year Project Experience",
            text: "Access a curated list of innovative project ideas, approved by educators and industry experts. Work on impactful projects that prepare you for professional success.",
            buttonText: "Get Started",
            buttonLink: "/login",
        },
        {
            image: image3,
            heading: "Effortless FYP Management and Collaboration",
            text: "Stay on top of your project with Collaborative Edge's Web Portal. Collaborate with mentors, track progress, and ensure timely completion of your final year project.",
            buttonText: "Learn More",
            buttonLink: "/how-it-works",
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <div className="-mt-[70px] md:-mt-[90px] relative w-full h-screen overflow-hidden">
            {/* Background Slider with Zoom Effect */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 w-full h-screen hero-slide"
                >
                    <motion.img
                        src={slides[currentIndex].image}
                        alt={slides[currentIndex].heading}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.1 }}
                        transition={{ duration: 8, ease: "linear" }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

            {/* Hero Content Container */}
            <div className="container mx-auto h-full flex items-center px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-3xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <motion.h1
                                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white leading-tight"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {slides[currentIndex].heading}
                            </motion.h1>
                            <motion.p
                                className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {slides[currentIndex].text}
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Link to={slides[currentIndex].buttonLink}>
                                    <Button
                                        as={motion.button}
                                        size="lg"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-lg"
                                    >
                                        {slides[currentIndex].buttonText}
                                        <ArrowRight size={18} />
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Dots Navigation */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
                {slides.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`cursor-pointer w-3 h-3 rounded-full focus:outline-none ${index === currentIndex ? "bg-white" : "bg-gray-400"}`}
                        whileHover={{ scale: 1.3 }}
                        aria-label={`Go to slide ${index + 1}`}
                        initial={{ scale: 1 }}
                        animate={{
                            scale: index === currentIndex ? 1.2 : 1,
                            opacity: index === currentIndex ? 1 : 0.7
                        }}
                        transition={{ type: "spring", stiffness: 500 }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Hero;