import { useEffect, useState } from "react";
import { Bell, User, X, CheckCircle, Clock, AlertCircle, Info, ChevronLeft, ChevronRight, Check, MoreVertical, MailWarning, Link, ExternalLink } from "lucide-react";
import { useAuth } from "../../../../auth/AuthContext.jsx";
import Loading from "../../../Components/loadingIndicator/loading.jsx";
import {motion} from "framer-motion"

const NotificationScreen = ({ theme, onClose }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [notificationsPerPage] = useState(8);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Fetch notifications (same as original)
    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/notifications/user/${user.email}`,
                { credentials: "include" }
            );
            const data = await response.json();
            if (data.success) setNotifications(data.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Mark as read (same as original)
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/notifications/mark-as-read/${notificationId}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user.email }),
                }
            );

            if (response.ok) {
                setNotifications(prev => prev.map(n => {
                    if (n._id === notificationId) {
                        const updatedRecipients = n.recipients.map(r => {
                            if (r.userId === user.email) {
                                return { ...r, read: true, readAt: new Date() };
                            }
                            return r;
                        });
                        return { ...n, recipients: updatedRecipients };
                    }
                    return n;
                }));
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    // Mark all as read (same as original)
    const markAllAsRead = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/notifications/mark-all-as-read`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user.email }),
                }
            );

            if (response.ok) {
                setNotifications(prev => prev.map(n => {
                    const updatedRecipients = n.recipients.map(r => {
                        if (r.userId === user.email) {
                            return { ...r, read: true, readAt: new Date() };
                        }
                        return r;
                    });
                    return { ...n, recipients: updatedRecipients };
                }));
            }
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    // Handle notification action (same as original)
    const handleNotificationAction = async (notificationId, action) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/notifications/respond/${notificationId}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.email,
                        response: action,
                        responded: true
                    }),
                }
            );

            if (response.ok) {
                setNotifications(prev => prev.map(n => {
                    if (n._id === notificationId) {
                        const updatedRecipients = n.recipients.map(r => {
                            if (r.userId === user.email) {
                                return { ...r, responded: true, response: action };
                            }
                            return r;
                        });
                        return { ...n, recipients: updatedRecipients };
                    }
                    return n;
                }));
            }
        } catch (error) {
            console.error("Error handling notification action:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user?.email]);

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        const recipient = notification.recipients.find(r => r.userId === user.email);
        if (filter === 'all') return true;
        if (filter === 'unread') return !recipient?.read;
        if (filter === 'read') return recipient?.read;
        if (filter === 'action') return notification.actionRequired && !recipient?.responded;
        return true;
    });

    // Pagination logic
    const indexOfLastNotification = currentPage * notificationsPerPage;
    const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
    const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification);
    const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);

    // Helper functions
    const getNotificationIcon = (type) => {
        const icons = {
            success: <CheckCircle className="w-5 h-5 text-green-500" />,
            warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
            error: <AlertCircle className="w-5 h-5 text-red-500" />,
            info: <Info className="w-5 h-5 text-brand-500" />
        };
        return icons[type] || icons.info;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-gray-200 text-gray-800',
            medium: 'bg-brand-200 text-brand-800',
            high: 'bg-orange-200 text-orange-800',
            critical: 'bg-red-200 text-red-800'
        };
        return colors[priority] || colors.medium;
    };

    const getReadStatus = (notification) => {
        const recipient = notification.recipients.find(r => r.userId === user.email);
        return recipient?.read;
    };

    const getActionStatus = (notification) => {
        const recipient = notification.recipients.find(r => r.userId === user.email);
        return recipient?.responded ? recipient.response : null;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const getActionButtonStyle = (action) => {
        const base = "flex-1 py-2 rounded-lg font-medium transition-all active:scale-95 flex items-center justify-center space-x-2";
        if (action === 'approved') {
            return `${base} bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400`;
        } else {
            return `${base} bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400`;
        }
    };

    return (
        <div className={`fixed inset-0 z-50 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            {/* List View Screen */}

            <div className={`sticky top-0 z-20 p-3 border-b backdrop-blur-lg ${theme === 'dark' ? 'border-gray-700 bg-gray-900/90' : 'border-gray-100 bg-white/95'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onClose}
                            className={`p-1.5 rounded-full transition-all active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold">Notifications</h1>
                    </div>

                    <div className="flex items-center space-x-1">
                        <button
                            onClick={markAllAsRead}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 ${theme === 'dark' ? 'text-brand-400 hover:bg-gray-800' : 'text-brand-600 hover:bg-gray-50'}`}
                        >
                            Mark all
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`p-1.5 rounded-full transition-all active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            {isMenuOpen && (
                                <div
                                    className={`absolute right-0 mt-1 w-40 rounded-xl shadow-lg py-1 z-30 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-md'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <button
                                        onClick={markAllAsRead}
                                        className={`flex items-center w-full px-3 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-700/80' : 'hover:bg-gray-50'}`}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark all read
                                    </button>
                                    <button
                                        onClick={() => setFilter('unread')}
                                        className={`flex items-center w-full px-3 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-700/80' : 'hover:bg-gray-50'}`}
                                    >
                                        <MailWarning className="w-4 h-4 mr-2" />
                                        Unread only
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter tabs - Horizontal scroll with gradient fade */}
                <div className="relative mt-3">
                    <div className="flex overflow-x-auto scrollbar-hide pb-1 space-x-1.5 px-1">
                        {['all', 'unread', 'read', 'action'].map((tab) => {
                            const count = tab === 'unread'
                                ? filteredNotifications.filter(n => !getReadStatus(n)).length
                                : tab === 'action'
                                    ? filteredNotifications.filter(n => n.actionRequired && !getActionStatus(n)).length
                                    : null;

                            return (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setFilter(tab);
                                        setCurrentPage(1);
                                    }}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center ${filter === tab
                                        ? theme === 'dark'
                                            ? 'bg-brand-600/90 text-white shadow-md'
                                            : 'bg-brand-500 text-white shadow-md'
                                        : theme === 'dark'
                                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {tab === 'action' ? 'Action' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    {count !== null && count > 0 && (
                                        <span className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${filter === tab
                                            ? 'bg-white/20'
                                            : theme === 'dark'
                                                ? 'bg-gray-700'
                                                : 'bg-gray-200'
                                            }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div className={`absolute right-0 top-0 bottom-0 w-6 pointer-events-none ${theme === 'dark'
                        ? 'bg-gradient-to-l from-gray-900'
                        : 'bg-gradient-to-l from-white'
                        }`}></div>
                </div>
            </div>

            {/* Notification list with subtle animations */}
            <div className="pb-20">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-3">
                        <div className="relative">
                            <Bell className="w-12 h-12 text-gray-400 animate-pulse" />
                            <div className="absolute -inset-2 rounded-full border-2 border-gray-400 border-t-transparent animate-spin"></div>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Loading notifications...</p>
                    </div>
                ) : currentNotifications.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center h-64 p-6 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="relative mb-4">
                            <Bell className="w-16 h-16 opacity-30" />
                            <div className="absolute -inset-3 rounded-full border-4 border-gray-400 border-t-transparent opacity-20"></div>
                        </div>
                        <p className="text-lg font-medium">
                            {filter === 'unread' ? "All caught up!" :
                                filter === 'action' ? "No actions required" :
                                    "No notifications"}
                        </p>
                        <p className="text-sm mt-1 max-w-xs">
                            {filter === 'all' ? "New notifications will appear here" : "We'll notify you when there's something new"}
                        </p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-2 p-2"
                    >
                        {currentNotifications.map((notification) => {
                            const isRead = getReadStatus(notification);
                            const actionStatus = getActionStatus(notification);
                            const recipient = notification.recipients.find(r => r.userId === user.email);

                            return (
                                <motion.div
                                    key={notification._id}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    onClick={() => {
                                        if (!isRead) markAsRead(notification._id);
                                        setSelectedNotification(notification);
                                    }}
                                    className={`relative p-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer ${!isRead
                                        ? theme === 'dark'
                                            ? 'bg-brand-900/20 hover:bg-brand-900/30 shadow-md'
                                            : 'bg-brand-50 hover:bg-brand-100 shadow-sm'
                                        : theme === 'dark'
                                            ? 'hover:bg-gray-800/50'
                                            : 'hover:bg-gray-50'
                                        } ${notification.actionRequired && !actionStatus ? 'ring-1 ring-yellow-500/30' : ''}`}
                                >
                                    {!isRead && (
                                        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                                    )}

                                    <div className="flex items-start gap-3 pl-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type, theme)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className={`font-medium line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {notification.title}
                                                </h3>

                                                <div className="flex items-center space-x-1.5">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${notification.priority === 'high'
                                                        ? theme === 'dark'
                                                            ? 'bg-red-900/50 text-red-400'
                                                            : 'bg-red-100 text-red-700'
                                                        : notification.priority === 'medium'
                                                            ? theme === 'dark'
                                                                ? 'bg-yellow-900/50 text-yellow-400'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                            : theme === 'dark'
                                                                ? 'bg-brand-900/50 text-brand-400'
                                                                : 'bg-brand-100 text-brand-700'
                                                        }`}>
                                                        {notification.priority}
                                                    </span>
                                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {formatTime(notification.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className={`text-sm mt-1 line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {notification.message}
                                            </p>

                                            {notification.actionRequired && !actionStatus && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex space-x-2 mt-3"
                                                >
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleNotificationAction(notification._id, 'approved');
                                                        }}
                                                        className="flex-1 py-1.5 bg-green-500/90 text-white text-xs rounded-lg hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center space-x-1"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        <span>Approve</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleNotificationAction(notification._id, 'rejected');
                                                        }}
                                                        className="flex-1 py-1.5 bg-red-500/90 text-white text-xs rounded-lg hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center space-x-1"
                                                    >
                                                        <X className="w-3 h-3" />
                                                        <span>Reject</span>
                                                    </button>
                                                </motion.div>
                                            )}

                                            {notification.actionRequired && actionStatus && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className={`mt-2 text-xs px-2 py-1 rounded-lg inline-flex items-center ${actionStatus === 'approved'
                                                        ? theme === 'dark'
                                                            ? 'bg-green-900/30 text-green-400'
                                                            : 'bg-green-100 text-green-700'
                                                        : theme === 'dark'
                                                            ? 'bg-red-900/30 text-red-400'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    <Check className="w-3 h-3 mr-1" />
                                                    You {actionStatus} this request
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* Floating pagination controls (appears only when scrolling) */}
            <div className={`fixed bottom-0 left-0 right-0 p-3 border-t backdrop-blur-lg transition-all duration-300 ${theme === 'dark' ? 'border-gray-700 bg-gray-900/90' : 'border-gray-100 bg-white/95'}`}>
                <div className="flex items-center justify-between">
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Showing {currentNotifications.length} of {filteredNotifications.length}
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`p-1.5 rounded-lg transition-all active:scale-95 ${currentPage === 1
                                ? 'opacity-50 cursor-not-allowed'
                                : theme === 'dark'
                                    ? 'hover:bg-gray-800 text-gray-300'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage === 1) {
                                    pageNum = i + 1;
                                } else if (currentPage === totalPages) {
                                    pageNum = totalPages - 2 + i;
                                } else {
                                    pageNum = currentPage - 1 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all active:scale-95 ${currentPage === pageNum
                                            ? theme === 'dark'
                                                ? 'bg-brand-600 text-white'
                                                : 'bg-brand-500 text-white'
                                            : theme === 'dark'
                                                ? 'hover:bg-gray-700 text-gray-300'
                                                : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {totalPages > 3 && currentPage < totalPages - 1 && (
                                <span className={`px-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>...</span>
                            )}

                            {totalPages > 3 && currentPage < totalPages - 1 && (
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all active:scale-95 ${theme === 'dark'
                                        ? 'hover:bg-gray-700 text-gray-300'
                                        : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {totalPages}
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`p-1.5 rounded-lg transition-all active:scale-95 ${currentPage === totalPages
                                ? 'opacity-50 cursor-not-allowed'
                                : theme === 'dark'
                                    ? 'hover:bg-gray-800 text-gray-300'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>




            {/* Notification detail view */}


            {selectedNotification && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-50 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
                >
                    <div className="flex flex-col h-full">
                        {/* Sticky header with glass effect */}
                        <div className={`sticky top-0 p-3 border-b backdrop-blur-lg flex items-center justify-between z-10 ${theme === 'dark' ? 'border-gray-700 bg-gray-900/90' : 'border-gray-100 bg-white/95'
                            }`}>
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className={`p-2 rounded-full transition-all active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <h2 className="text-lg font-semibold">Notification Details</h2>

                            <button
                                onClick={onClose}
                                className={`p-2 rounded-full transition-all active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable content with subtle padding */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="max-w-lg mx-auto">
                                {/* Header with icon and title */}
                                <div className="flex items-start gap-4 mb-6">
                                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                                        }`}>
                                        {getNotificationIcon(selectedNotification.type, theme)}
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            {selectedNotification.title}
                                        </h3>
                                        <div className="flex items-center mt-2 space-x-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${selectedNotification.priority === 'high'
                                                ? theme === 'dark'
                                                    ? 'bg-red-900/50 text-red-400'
                                                    : 'bg-red-100 text-red-700'
                                                : selectedNotification.priority === 'medium'
                                                    ? theme === 'dark'
                                                        ? 'bg-yellow-900/50 text-yellow-400'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    : theme === 'dark'
                                                        ? 'bg-brand-900/50 text-brand-400'
                                                        : 'bg-brand-100 text-brand-700'
                                                }`}>
                                                {selectedNotification.priority}
                                            </span>
                                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                {formatTime(selectedNotification.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Message content with subtle background */}
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className={`p-5 rounded-xl mb-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800/70' : 'bg-gray-50'
                                        }`}
                                >
                                    <p className={`whitespace-pre-line ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        {selectedNotification.message}
                                    </p>
                                </motion.div>

                                {/* Action section with animated elements */}
                                {selectedNotification.actionRequired && (
                                    <motion.div
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className={`p-5 rounded-xl mb-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800/70' : 'bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`w-3 h-3 rounded-full ${getActionStatus(selectedNotification) === 'approved'
                                                ? 'bg-green-500'
                                                : getActionStatus(selectedNotification) === 'rejected'
                                                    ? 'bg-red-500'
                                                    : 'bg-yellow-500 animate-pulse'
                                                }`}></span>
                                            <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                Action Required
                                            </h4>
                                        </div>

                                        {getActionStatus(selectedNotification) ? (
                                            <motion.div
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                                className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
                                                    }`}
                                            >
                                                <p className={`font-medium flex items-center gap-2 ${getActionStatus(selectedNotification) === 'approved'
                                                    ? theme === 'dark'
                                                        ? 'text-green-400'
                                                        : 'text-green-600'
                                                    : theme === 'dark'
                                                        ? 'text-red-400'
                                                        : 'text-red-600'
                                                    }`}>
                                                    <CheckCircle className="w-4 h-4" />
                                                    You've {getActionStatus(selectedNotification)} this request
                                                </p>
                                                {recipient?.comments && (
                                                    <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                                        }`}>
                                                        {recipient.comments}
                                                    </p>
                                                )}
                                            </motion.div>
                                        ) : (
                                            <div className="space-y-4">
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                                    }`}>
                                                    Please review and respond to this request
                                                </p>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleNotificationAction(selectedNotification._id, 'approved')}
                                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${theme === 'dark'
                                                            ? 'bg-green-600/90 hover:bg-green-700 text-white'
                                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                                            }`}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        <span>Approve</span>
                                                    </motion.button>
                                                    <motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleNotificationAction(selectedNotification._id, 'rejected')}
                                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${theme === 'dark'
                                                            ? 'bg-red-600/90 hover:bg-red-700 text-white'
                                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                                            }`}
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span>Reject</span>
                                                    </motion.button>
                                                </div>

                                                {selectedNotification.responseDeadline && (
                                                    <p className={`text-xs mt-3 flex items-center gap-1.5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                                                        }`}>
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Response required by: {new Date(selectedNotification.responseDeadline).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Metadata grid with animated entry */}
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className={`pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                        }`}
                                >
                                    <h4 className={`font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        Details
                                    </h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                }`}>Date</p>
                                            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {new Date(selectedNotification.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                }`}>Time</p>
                                            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {new Date(selectedNotification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                }`}>Status</p>
                                            <p className={`mt-1 text-sm flex items-center gap-1.5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {getReadStatus(selectedNotification) ? (
                                                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                ) : (
                                                    <MailWarning className="w-3.5 h-3.5 text-yellow-500" />
                                                )}
                                                {getReadStatus(selectedNotification) ? 'Read' : 'Unread'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                }`}>Priority</p>
                                            <p className={`mt-1 text-sm capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {selectedNotification.priority}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedNotification.sender && (
                                        <div className="mt-4">
                                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                }`}>Sender</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                                    }`}>
                                                    <User className="w-3 h-3" />
                                                </div>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                    {selectedNotification.sender.name} ({selectedNotification.sender.role})
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedNotification.relatedEntity && (
                                        <div className="mt-4">
                                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                }`}>Related to</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                                    }`}>
                                                    <Link className="w-3 h-3" />
                                                </div>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                    {selectedNotification.relatedEntity.type}: {selectedNotification.relatedEntity.id}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedNotification.actionLink && (
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="mt-6"
                                        >
                                            <a
                                                href={selectedNotification.actionLink}
                                                target="_self"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium shadow-sm ${theme === 'dark'
                                                    ? 'bg-brand-600 hover:bg-brand-700 text-white'
                                                    : 'bg-brand-500 hover:bg-brand-600 text-white'
                                                    } transition-colors`}
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                <span>View related item</span>
                                            </a>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}


        </div>
    );
};

export default NotificationScreen;