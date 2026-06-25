import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle2 } from "lucide-react";
import { ClipLoader } from "react-spinners";
import logo from "../../../../../assets/images/navbar.png";
import { useAuth } from '../../../../../auth/AuthContext';
import "./navbar.css";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const [lastScrollY, setLastScrollY] = useState(0);
    const [visible, setVisible] = useState(true);
    const [isProfilePicLoading, setIsProfilePicLoading] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && visible) {
                setVisible(false);
            } else if (currentScrollY < lastScrollY && !visible) {
                setVisible(true);
            }
            setLastScrollY(currentScrollY);

            if (location.pathname === "/") {
                setIsScrolled(currentScrollY > 0);
            } else {
                setIsScrolled(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY, visible, location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        if (location.pathname === "/") {
            setIsScrolled(window.scrollY > 0);
            window.addEventListener("scroll", handleScroll);
        } else {
            setIsScrolled(true);
        }

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/logout`, {
                method: "POST",
                credentials: "include"
            });
            // Clear local storage
            localStorage.clear();
            navigate("/");
            window.location.reload();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleDashboardClick = () => {
        if (user) {
            if (user.role === "student") {
                navigate("/student-dashboard");
            } else if (user.role === "industry") {
                navigate("/industry-dashboard");
            } else if (user.role === "teacher") {
                navigate("/teacher-dashboard");
            } else if (user.role === "admin") {
                navigate("/admin-dashboard");
            }
        }
    };

    // Simulate profile picture loading
    useEffect(() => {
        if (user && user.profilePic) {
            const img = new Image();
            img.src = user.profilePic;
            img.onload = () => setIsProfilePicLoading(false);
            img.onerror = () => setIsProfilePicLoading(false);
        } else {
            setIsProfilePicLoading(false);
        }
    }, [user]);

    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 w-[100%] h-[70px] md:h-[90px] max-w-screen z-50 transition-all duration-300 ${isScrolled ? "bg-slate-900/80 backdrop-blur-xl text-white shadow-glow border-b border-white/10" : "bg-transparent text-white"} px-6 py-4 ${visible ? "translate-y-0" : "-translate-y-full"}`}
        >
            <div id="center" className="hidden xl:grid grid-cols-12 items-center justify-center w-full">
                <motion.div className="col-span-3 flex items-center justify-end w-full max-w-screen-xl" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Link to="/">
                        <img src={logo} alt="Logo" className="h-10 object-cover" />
                    </Link>
                </motion.div>

                <motion.ul className="hidden xl:flex col-span-7 justify-center space-x-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    {["About Us", "How It Works", "Project Ideas", "Success Stories", "Contact Us"].map((item, index) => {
                        const path = `/${item.toLowerCase().replace(/ /g, "-")}`;
                        const isActive = location.pathname === path;

                        return (
                            <motion.li
                                key={index}
                                className={`font-bold text-[16px] cursor-pointer transition px-2 relative rounded-lg ${isActive
                                    ? "text-white bg-gradient-brand shadow-glow"
                                    : "text-white/90 hover:text-white hover:bg-white/10"
                                    }`}
                                whileHover={{ scale: 1.1 }}
                            >
                                <Link to={path} className="block px-4 py-2">
                                    {item}
                                </Link>
                            </motion.li>
                        );
                    })}
                </motion.ul>
                {/* Right Section: Show User Profile or "Get Started" Button */}
                <motion.div className="hidden xl:flex col-span-2 justify-start" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    {user ? (
                        <div className="relative cursor-pointer" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                            {isProfilePicLoading ? (
                                <ClipLoader size={20} color={"#ffffff"} loading={isProfilePicLoading} />
                            ) : user.profilePic ? (
                                <img src={user.profilePic} alt="Profile" className="h-10 w-10 rounded-full border-2 border-white" />
                            ) : (
                                <UserCircle2 className="h-10 w-10 text-white rounded-full" />
                            )}
                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg py-2 z-50 px-4"
                                    >
                                        <div className="px-4 py-2 border-b text-gray-700 font-semibold">{user.username}</div>
                                        <button onClick={handleDashboardClick} className="cursor-pointer flex items-center px-4 py-2 w-full hover:bg-gray-100">
                                            <Home size={16} className="mr-2" /> Dashboard
                                        </button>
                                        <button onClick={handleLogout} className="cursor-pointer flex items-center px-4 py-2 w-full text-left text-red-600 hover:bg-gray-100">
                                            <LogOut size={16} className="mr-2" /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link to="/welcome-aboard">
                            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="bg-gradient-brand rounded-xl text-lg px-6 py-2.5 text-white font-bold uppercase tracking-wide cursor-pointer shadow-glow transition-all duration-300 hover:brightness-110">
                                Get Started
                            </motion.button>

                        </Link>
                    )}
                </motion.div>
            </div>

            <div className="xl:hidden flex justify-between items-center w-full">
                <div className="flex-1 flex justify-center">
                    <Link to="/">
                        <img src={logo} alt="Logo" className="h-10 object-cover p-1" />
                    </Link>
                    <motion.button className="text-white focus:outline-none right-6 p-1" whileTap={{ scale: 0.9 }} onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={28} /> : <Menu size={28} />}
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="absolute top-16 left-0 w-full bg-slate-900/95 backdrop-blur-xl text-white shadow-glow border-b border-white/10 xl:hidden">
                        <ul className="flex flex-col space-y-4 text-center py-6">
                            {["About Us", "How It Works", "Project Ideas", "Success Stories", "Contact Us"].map((item, index) => (
                                <motion.li key={index} className="hover:text-brand-500 cursor-pointer transition px-4" whileHover={{ scale: 1.1 }}>
                                    <Link to={`/${item.toLowerCase().replace(/ /g, "-")}`} onClick={() => setMenuOpen(false)}>{item}</Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;