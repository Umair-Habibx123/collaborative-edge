import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useAuth } from "../../../auth/AuthContext.jsx";
import navBarLogo from "../../../assets/images/fyp-connect-favicon.png";
import { LogOut, Sun, Moon, LayoutDashboard, FileClock, Eye, Settings, TrendingUp, ShieldCheck, Menu, X, UserCircle2, Bot, Bell, BellDot } from "lucide-react";
import Loading from "../../Components/loadingIndicator/loading.jsx";
import PendingApprovals from "./components/PendingApprovals/PendingProjectCards.jsx";
import StudentProgress from "./components/StudentProgress/ProjectCards.jsx";
import UniversityProjects from "./components/ProjectSupervision/UniversityProjectCards.jsx";
import ProfileSetting from "./components/ProfileSettings/TeacherProfileSetting.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy.jsx";
import Chatbot from "../AI_Module/Chatbot_v2.jsx"
import Overview from "./components/overview/overview.jsx";
import NotificationScreen from "../Industry_Module/components/NotificationScreen.jsx";

const TeachersDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [showOptions, setShowOptions] = useState(false);
    const { user, isAuthLoading } = useAuth();
    const themeDropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const sidebarControls = useAnimation();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotificationScreen, setShowNotificationScreen] = useState(false);
    const notificationIconRef = useRef(null);
    const [isFetchingCount, setIsFetchingCount] = useState(null);
    


    const fetchUnreadCount = async () => {
        try {
            setIsFetchingCount(true);
            if (!user?.email) return;

            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/notifications/unread-count/${user.email}`,
                { credentials: "include" }
            );
            const data = await response.json();
            if (data.success) setUnreadCount(data.count);
        } catch (error) {

            console.error("Error fetching unread count:", error);
        }
        finally {
            setIsFetchingCount(false);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
    }, [user?.email]);



    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);



    useEffect(() => {
        // Combined effect for both mouse move and click outside handling
        const handleMouseMove = (e) => {
            if (e.clientX < 5 && !showNotificationScreen) {  // Added condition here
                setIsSidebarOpen(true);
                sidebarControls.start({ x: 0 });
            }
        };

        const handleClickOutside = (event) => {
            if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
                const themeButton = document.querySelector('.theme-button');
                if (!themeButton || !themeButton.contains(event.target)) {
                    setShowOptions(false);
                }
            }
        };



        // Set loading to false when all event listeners are set up
        const setupListeners = () => {
            window.addEventListener("mousemove", handleMouseMove);
            document.addEventListener('mousedown', handleClickOutside);
            setIsLoading(false);

            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        };

        const cleanup = setupListeners();
        return cleanup;
    }, [sidebarControls, showNotificationScreen]);  // Added showNotificationScreen to dependencies



    const handleOptionClick = (option) => {
        setSelectedOption(option);
        localStorage.setItem("selectedOption", option);
        setIsSidebarOpen(false);
    };

    const TopMenuItems = [
        { label: "Overview", icon: <LayoutDashboard />, key: "Overview" },
        { label: "Pending Approvals", icon: <FileClock />, key: "Pending Approvals" },
        { label: "Project Supervision", icon: <Eye />, key: "Project Supervision" },
        { label: "Evaluate Student", icon: <TrendingUp />, key: "Evaluate Student" },
    ];

    const BottomMenuItems = [
        { label: "Policy Policy", icon: <ShieldCheck />, key: "Privacy Policy" },
        { label: "Profile", icon: <Settings />, key: "Profile Settings" },
    ];

    const allMenuOptions = [...TopMenuItems, ...BottomMenuItems].map(item => item.key);

    const [selectedOption, setSelectedOption] = useState(() => {
        const savedOption = localStorage.getItem("selectedOption");
        return allMenuOptions.includes(savedOption) ? savedOption : "Overview";
    });

    const logout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/logout`, {
                method: "POST",
                credentials: "include"
            });
            localStorage.clear();
            navigate("/");
            window.location.reload();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const toggleTheme = (selectedTheme) => {
        let newTheme;
        if (selectedTheme === "system") {
            newTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
        } else {
            newTheme = selectedTheme;
        }
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        setShowOptions(false);
    };

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [selectedOption]);


    const renderContent = () => {
        switch (selectedOption) {
            case 'Overview':
                return <Overview theme={theme} />;
            case "Pending Approvals":
                return <PendingApprovals theme={theme} />;
            case "Project Supervision":
                return <UniversityProjects theme={theme} />;
            case "Evaluate Student":
                return <StudentProgress theme={theme} />;
            case "Privacy Policy":
                return <PrivacyPolicy theme={theme} />;
            case "Profile Settings":
                return <ProfileSetting theme={theme} />;
            default:
                return <div className={`p-6 rounded-lg shadow ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white"}`}>Welcome to Your Personal Dashboard!</div>;
        }
    };

    if (isAuthLoading || isLoading || isFetchingCount) {
        return <Loading />;
    }

    const isMobile = windowWidth <= 1024;

    return (
        <div className={`flex flex-col min-h-screen -mt-[70px] md:-mt-[90px] ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} relative`}>
            {/* Main Content */}
            <motion.div
                className="flex-1"
                animate={!isMobile && isChatOpen ? {
                    marginRight: '400px',
                    transition: { type: 'spring', stiffness: 300, damping: 30 }
                } : {}}
            >
                <motion.nav
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className={`bg-white shadow-lg py-3 px-4 sm:px-6 fixed top-0 w-full z-30 border-b ${theme === "dark" ? "dark:bg-gray-800 border-gray-700" : "border-gray-200"}`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                className="cursor-pointer p-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex justify-center items-center shadow-lg hover:shadow-xl transition-shadow"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            >
                                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            <Link to="/">
                                <img
                                    src={navBarLogo}
                                    alt="logo"
                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${theme === "dark" ? "border-gray-800" : "border-white"} `}
                                />
                            </Link>

                            <Link to="/">
                                <span className={`text-xl sm:text-3xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent ${theme === "dark" ? "dark:text-white" : "text-gray-800"}`}>
                                    Collaborate
                                </span>
                                <br />
                                <span className={`text-sm sm:text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                    Edge
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4 px-1">
                            <div className="relative" ref={notificationDropdownRef}>
                                <div className="relative" ref={notificationDropdownRef}>
                                    <button
                                        ref={notificationIconRef}
                                        onClick={() => {
                                            setShowNotificationScreen(true);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`cursor-pointer relative p-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${theme === "dark"
                                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                                            : "bg-white hover:bg-gray-100 text-gray-800"
                                            }`}
                                    >

                                        {unreadCount > 0 ? (
                                            <BellDot className="w-5 h-5" />
                                        ) : (
                                            <Bell className="w-5 h-5" />
                                        )}

                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse z-50">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {showNotificationScreen && (
                                    <NotificationScreen
                                        theme={theme}
                                        onClose={() => {
                                            setShowNotificationScreen(false);
                                            fetchUnreadCount();
                                        }}
                                    />
                                )}
                            </div>

                            <button
                                className={`relative cursor-pointer h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isChatOpen ? 'bg-brand-600' : 'bg-gradient-to-r from-brand-500 to-brand-600'}`}
                                onClick={() => setIsChatOpen(!isChatOpen)}
                                style={{
                                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
                                }}
                            >
                                <Bot size={20} className="text-white" />
                                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-500 text-white text-[10px] sm:text-xs flex items-center justify-center animate-pulse">
                                    <span className="inline-block">AI</span>
                                </span>
                            </button>

                            <div className="relative" ref={themeDropdownRef}>
                                <button
                                    onClick={() => setShowOptions(!showOptions)}
                                    className="cursor-pointer p-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 transition-all shadow-md theme-button"
                                >
                                    {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
                                </button>

                                {showOptions && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ring-1 ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
                                    >
                                        <div className="py-1">
                                            <button
                                                onClick={() => toggleTheme("light")}
                                                className={`cursor-pointer block w-full px-4 py-2 text-sm ${theme === "dark" ? "text-gray-200 hover:bg-gray-700" : "hover:bg-gray-100 text-gray-700"}`}
                                            >
                                                Light
                                            </button>
                                            <button
                                                onClick={() => toggleTheme("dark")}
                                                className={`cursor-pointer block w-full px-4 py-2 text-sm ${theme === "dark" ? "text-gray-200 hover:bg-gray-700" : "hover:bg-gray-100 text-gray-700"}`}
                                            >
                                                Dark
                                            </button>
                                            <button
                                                onClick={() => toggleTheme("system")}
                                                className={`cursor-pointer block w-full px-4 py-2 text-sm ${theme === "dark" ? "text-gray-200 hover:bg-gray-700" : "hover:bg-gray-100 text-gray-700"}`}
                                            >
                                                System
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div
                                className="flex items-center space-x-2 cursor-pointer group"
                                onClick={() => {
                                    setSelectedOption("Profile Settings");
                                    setIsSidebarOpen(false);
                                }}
                            >
                                <p className={`hidden sm:inline-flex text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                                    {user ? user.username : "Guest"}
                                </p>
                                {user?.profilePic ? (
                                    <img
                                        src={user?.profilePic}
                                        alt="Profile"
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 shadow-md group-hover:border-brand-500 transition-all ${theme === "dark" ? "border-gray-800" : "border-white"} `}
                                    />
                                ) : (
                                    <UserCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 rounded-full border-2 border-white group-hover:border-brand-500 transition-all" />
                                )}
                            </div>
                            <button
                                onClick={logout}
                                className={`cursor-pointer hidden sm:flex items-center gap-2 p-2 rounded-lg transition duration-200 ${theme === "dark" ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-gray-100"}`}
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="text-sm font-medium">Logout</span>
                            </button>

                            <button
                                onClick={logout}
                                className={`cursor-pointer sm:hidden p-2 rounded-full ${theme === "dark" ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-gray-100"}`}
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.nav>

                {/* Main Content */}
                <div className="flex min-h-[calc(100vh-68px)] mt-[76px] sm:mt-[88px]">
                    {/* Sidebar */}
                    {isSidebarOpen && (
                        <>
                            <div
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
                                onClick={() => setIsSidebarOpen(false)}
                            />

                            <motion.aside
                                className={`sidebar w-64 sm:w-64 space-y-6 py-7 px-4 fixed h-[calc(100vh-70px)] transition-all duration-300 z-30 ${theme === "dark" ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white border-2" : "bg-gradient-to-r from-brand-500 to-brand-600 text-white"}`}
                                initial={{ x: -300 }}
                                animate={{ x: 0 }}
                                exit={{ x: -300 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex flex-col h-full justify-between">
                                    <nav className="space-y-4">
                                        {TopMenuItems.map(({ label, icon, key }) => (
                                            <button
                                                key={key}
                                                onClick={() => handleOptionClick(key)}
                                                className={`cursor-pointer flex items-center gap-2 w-full text-left py-3 px-4 rounded-lg transition duration-200 ${selectedOption === key
                                                    ? theme === "dark"
                                                        ? "bg-gray-700 text-brand-400 shadow-md"
                                                        : "bg-white text-brand-600 shadow-md"
                                                    : theme === "dark"
                                                        ? "bg-gray-800 hover:bg-gray-700"
                                                        : "bg-brand-600 hover:bg-opacity-75"
                                                    }`}
                                            >
                                                {icon} <span>{label}</span>
                                            </button>
                                        ))}
                                    </nav>

                                    <div className="space-y-4">
                                        {BottomMenuItems.map(({ label, icon, key }) => (
                                            <button
                                                key={key}
                                                onClick={() => handleOptionClick(key)}
                                                className={`cursor-pointer flex items-center gap-2 w-full text-left py-3 px-4 rounded-lg transition duration-200 ${selectedOption === key
                                                    ? theme === "dark"
                                                        ? "bg-gray-700 text-brand-400 shadow-md"
                                                        : "bg-white text-brand-600 shadow-md"
                                                    : theme === "dark"
                                                        ? "bg-gray-800 hover:bg-gray-700"
                                                        : "bg-brand-600 hover:bg-opacity-75"
                                                    }`}
                                            >
                                                {icon} <span>{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.aside>
                        </>
                    )}

                    {/* Main Content */}
                    <motion.main
                        className={`flex-1 overflow-y-auto p-4 sm:p-6 shadow-md ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50"} ${isMobile && isChatOpen ? 'opacity-50 pointer-events-none' : ''}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                    >
                        {renderContent()}
                    </motion.main>
                </div>
            </motion.div>

            {isChatOpen && (
                <motion.div
                    className={`fixed ${isMobile ? 'inset-0' : 'right-0 top-0 h-full'} z-40`}
                    initial={{ x: isMobile ? '100%' : 400 }}
                    animate={{
                        x: 0,
                        width: isMobile ? '100%' : '400px'
                    }}
                    exit={{ x: isMobile ? '100%' : 400 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <Chatbot
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                        className="h-full"
                        isMobile={isMobile}
                    />
                </motion.div>
            )}
        </div>
    );
};

export default TeachersDashboard;