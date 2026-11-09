// text, image -> text

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, X, User, ImageIcon, Send, MessageCircle, XCircle, Copy, Share2, Maximize, Minimize, Trash2 } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { toast, ToastContainer } from "react-toastify";

// Messages go through our backend (POST /api/ai/chat), which holds the Gemini API key.
// The key must never be in the browser: every VITE_ variable ends up in the public JavaScript.
const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || "";

const Chatbot = ({ isOpen, onClose, className }) => {
    const { user } = useAuth();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);

    // This useEffect will run whenever isOpen changes
    useEffect(() => {
        if (isOpen) {
            const savedTheme = localStorage.getItem("theme");
            setTheme(savedTheme || "light");
        }
    }, [isOpen]);

    useEffect(() => {
        loadChatHistory();
    }, [user._id]);

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);


    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (chatContainerRef.current && isOpen) {
                chatContainerRef.current.style.width = getChatDimensions().width;
                chatContainerRef.current.style.height = getChatDimensions().height;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen, isFullscreen]);

    const loadChatHistory = async () => {
        if (!user?._id) return;

        const savedChats = localStorage.getItem(`chat_history_${user._id}`);
        if (savedChats) {
            try {
                setMessages(JSON.parse(savedChats));
            } catch (error) {
                console.error("Error parsing chat history:", error);
            }
        }
    };

    const transformMessagesToGeminiFormat = (messages) => {
        return messages.map(message => ({
            role: message.sender === 'user' ? 'user' : 'model',
            parts: [{ text: message.text }]
        }));
    };

    const saveChatHistory = useCallback(() => {
        if (!user?._id) return;
        setMessages(prevMessages => {
            localStorage.setItem(`chat_history_${user._id}`, JSON.stringify(prevMessages));
            return prevMessages;
        });
    }, [user?._id]);

    const clearChatHistory = () => {
        if (!user?._id) return;
        setMessages([]);
        localStorage.removeItem(`chat_history_${user._id}`);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() && uploadedImages.length === 0) return;

        const userMessage = inputMessage;
        setInputMessage("");

        const userMessageObj = {
            text: userMessage,
            sender: 'user',
            images: [...uploadedImages],
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessageObj]);
        setUploadedImages([]);
        setIsLoading(true);

        const botMessageId = Date.now();

        try {
            const botMessageObj = {
                id: botMessageId,
                text: "",
                sender: 'bot',
                isStreaming: true,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, botMessageObj]);
            saveChatHistory();

            const prompt = userMessage || "Please describe or analyze these images";
            const history = transformMessagesToGeminiFormat(
                messages.filter(message => message.text && !message.isStreaming)
            );

            const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history,
                    message: prompt,
                    images: uploadedImages.map(file => ({ data: file.base64, mimeType: file.type })),
                }),
            });
            if (!response.ok || !response.body) {
                const problem = await response.json().catch(() => ({}));
                throw new Error(problem.error || `The assistant is unavailable right now (${response.status}).`);
            }

            // The reply streams as server-sent events: one "data: {json}" line per chunk.
            let fullResponse = "";
            let buffered = "";
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffered += decoder.decode(value, { stream: true });
                const lines = buffered.split("\n");
                buffered = lines.pop();
                for (const line of lines) {
                    if (!line.startsWith("data:")) continue;
                    let event;
                    try {
                        event = JSON.parse(line.slice(5));
                    } catch {
                        continue;
                    }
                    const chunkText = (event.candidates?.[0]?.content?.parts || [])
                        .map(part => part.text || "")
                        .join("");
                    if (!chunkText) continue;
                    fullResponse += chunkText;
                    setMessages(prev => prev.map(msg =>
                        msg.id === botMessageId
                            ? { ...msg, text: fullResponse }
                            : msg
                    ));
                }
            }

            setMessages(prev => prev.map(msg =>
                msg.id === botMessageId
                    ? { ...msg, isStreaming: false }
                    : msg
            ));

            saveChatHistory();
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => prev.filter(msg => msg.id !== botMessageId));
            setMessages(prev => [...prev, {
                text: "Error: " + error.message,
                sender: 'bot',
                timestamp: new Date().toISOString()
            }]);
            saveChatHistory();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            saveChatHistory();
        };
    }, [saveChatHistory]);

    const deleteMessage = (index) => {
        setMessages(prev => {
            const newMessages = [...prev];

            if (index < newMessages.length - 1 && newMessages[index].sender === 'user' && newMessages[index + 1].sender === 'bot') {
                newMessages.splice(index, 2);
            } else if (index > 0 && newMessages[index].sender === 'bot' && newMessages[index - 1].sender === 'user') {
                newMessages.splice(index - 1, 2);
            } else {
                newMessages.splice(index, 1);
            }

            return newMessages;
        });

        saveChatHistory();
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = [];
        files.forEach(file => {
            if (!file.type.match('image.*')) return;

            const reader = new FileReader();
            reader.onload = (upload) => {
                const base64 = upload.target.result.split(',')[1];
                newImages.push({
                    name: file.name,
                    type: file.type,
                    base64: base64,
                    preview: URL.createObjectURL(file)
                });

                if (newImages.length === files.length) {
                    setUploadedImages(prev => [...prev, ...newImages]);
                }
            };
            reader.readAsDataURL(file);
        });

        e.target.value = '';
    };

    const removeImage = (index) => {
        const newImages = [...uploadedImages];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        setUploadedImages(newImages);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success("Copied to clipboard!");
        }).catch(err => {
            toast.error('Failed to copy text: ', err);
        });
    };

    const shareMessage = async (text) => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'AI Chat Response',
                    text: text
                });
            } else {
                copyToClipboard(text);
                toast.warning('Copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const openImagePreview = (image) => {
        setSelectedImage(image);
    };

    const closeImagePreview = () => {
        setSelectedImage(null);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const getChatDimensions = () => {
        if (isFullscreen) {
            return {
                width: '100vw',
                height: '100vh',
                bottom: '0',
                right: '0',
                borderRadius: '0'
            };
        }

        const isMobile = window.innerWidth < 640;
        const isTablet = window.innerWidth < 1024;

        if (isMobile) {
            return {
                width: 'calc(100vw - 32px)',
                height: '70vh',
                bottom: '16px',
                right: '16px',
                borderRadius: '12px'
            };
        } else if (isTablet) {
            return {
                width: '380px',
                height: '65vh',
                bottom: '20px',
                right: '20px',
                borderRadius: '12px'
            };
        } else {
            return {
                width: '420px',
                height: '600px',
                bottom: '20px',
                right: '20px',
                borderRadius: '12px'
            };
        }
    };

    return (
        <div className={`font-sans h-full flex flex-col ${theme === "dark" ? "dark" : ""} ${className}`}>
            <ToastContainer />
            {isOpen && (
                <div className={`h-full flex flex-col shadow-xl border ${theme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-100"
                    }`}
                >

                    {/* Chat header */}
                    <div className={`p-3 sm:p-4 rounded-t-xl flex justify-between items-center ${theme === "dark"
                        ? "bg-gradient-to-r from-brand-700 to-accent-600"
                        : "bg-gradient-to-r from-brand-500 to-accent-500"
                        } text-white`}>
                        <div className="flex items-center space-x-2">
                            <Bot size={18} className="text-white cursor-pointer" />
                            <h3 className="cursor-pointer font-semibold text-sm">CollaborativeEdge AI</h3>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>


                    {/* Messages container */}
                    <div className={`flex-1 p-3 sm:p-4 overflow-y-auto ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
                        {messages.length === 0 ? (
                            <div className={`flex flex-col items-center justify-center h-full text-center p-4 ${theme === "dark" ? "text-gray-300" : "text-gray-500"
                                }`}>
                                <Bot size={40} className="text-brand-400 mb-3" />
                                <p className="font-medium text-sm sm:text-base">How can I help you today?</p>
                                <p className="text-xs sm:text-sm mt-1">Ask me anything or upload images</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-end mb-2">
                                    <button
                                        onClick={clearChatHistory}
                                        className={`text-xs px-2 py-1 rounded cursor-pointer ${theme === "dark"
                                            ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                            }`}
                                    >
                                        Clear Chat
                                    </button>
                                </div>

                                {messages.map((message, index) => (
                                    <div
                                        key={message.id || index}
                                        className={`relative flex flex-col items-center`}
                                    >
                                        {index % 2 === 0 && (
                                            <div className="flex items-center justify-center my-3 sm:my-4 relative w-full">
                                                <div className={`flex-grow border-t ${theme === "dark" ? "border-gray-600" : "border-gray-300"
                                                    } h-px`}></div>
                                                <button
                                                    onClick={() => deleteMessage(index)}
                                                    className={`mx-2 shrink-0 cursor-pointer ${theme === "dark"
                                                        ? "text-gray-400 hover:text-red-400"
                                                        : "text-gray-500 hover:text-red-500"
                                                        }`}
                                                    title="Delete message pair"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <div className={`flex-grow border-t ${theme === "dark" ? "border-gray-600" : "border-gray-300"
                                                    } h-px`}></div>
                                            </div>
                                        )}

                                        <div className={`flex w-full ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center ${message.sender === 'user'
                                                ? theme === "dark"
                                                    ? "bg-brand-900 text-brand-300 ml-2"
                                                    : "bg-brand-100 text-brand-600 ml-2"
                                                : theme === "dark"
                                                    ? "bg-brand-900 text-brand-300 mr-2"
                                                    : "bg-brand-100 text-brand-600 mr-2"
                                                }`}>
                                                {message.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                                            </div>
                                            <div
                                                className={`px-3 py-2 rounded-xl relative group/message max-w-[85%] sm:max-w-[90%] ${message.sender === 'user'
                                                    ? theme === "dark"
                                                        ? "bg-brand-800 text-brand-50 rounded-tr-none"
                                                        : "bg-brand-600 text-white rounded-tr-none"
                                                    : theme === "dark"
                                                        ? "bg-gray-700 text-gray-200 border border-gray-600 rounded-tl-none shadow-sm"
                                                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm"
                                                    } ${message.isStreaming ? 'animate-pulse' : ''}`}
                                            >
                                                {message.text && (
                                                    <div className="flex flex-col">
                                                        {message.sender === 'bot' ? (
                                                            <div className="text-xs sm:text-sm mb-2 space-y-2 sm:space-y-3">
                                                                {message.text.split('\n\n').map((paragraph, i) => {
                                                                    if (paragraph.trim().startsWith('*')) {
                                                                        return (
                                                                            <ul key={i} className="list-disc pl-4 sm:pl-5 space-y-1">
                                                                                {paragraph.split('*').filter(item => item.trim()).map((item, j) => (
                                                                                    <li key={j} className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                                                                                        {item.split('\n').map((line, k) => (
                                                                                            <span key={k}>
                                                                                                {line}
                                                                                                {k !== item.split('\n').length - 1 && <br />}
                                                                                            </span>
                                                                                        ))}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        )
                                                                    }

                                                                    return (
                                                                        <p key={i} className={`leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                                                                            }`}>
                                                                            {paragraph}
                                                                        </p>
                                                                    )
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <p className={`text-xs sm:text-sm mb-2 ${theme === "dark" ? "text-brand-100" : "text-white"
                                                                }`}>{message.text}</p>
                                                        )}

                                                        {message.sender === 'bot' && (
                                                            <div className="flex space-x-2 justify-end opacity-0 group-hover/message:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => copyToClipboard(message.text)}
                                                                    className={`cursor-pointer ${theme === "dark"
                                                                        ? "text-gray-400 hover:text-brand-400"
                                                                        : "text-gray-500 hover:text-brand-600"
                                                                        }`}
                                                                    title="Copy"
                                                                >
                                                                    <Copy size={12} />
                                                                </button>
                                                                <button
                                                                    onClick={() => shareMessage(message.text)}
                                                                    className={`cursor-pointer ${theme === "dark"
                                                                        ? "text-gray-400 hover:text-brand-400"
                                                                        : "text-gray-500 hover:text-brand-600"
                                                                        }`}
                                                                    title="Share"
                                                                >
                                                                    <Share2 size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {message.images && message.images.length > 0 && (
                                                    <div className="flex overflow-x-auto gap-2 py-2 max-w-[200px] sm:max-w-[240px]">
                                                        {message.images.map((img, imgIndex) => (
                                                            <div key={imgIndex} className="relative flex-shrink-0">
                                                                <img
                                                                    src={`data:${img.type};base64,${img.base64}`}
                                                                    alt={`Uploaded ${imgIndex}`}
                                                                    className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                                                                    onClick={() => openImagePreview(img)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {message.isStreaming && !message.text && (
                                                    <div className="flex space-x-1">
                                                        <div className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full animate-bounce ${theme === "dark" ? "bg-gray-500" : "bg-gray-400"
                                                            }`} style={{ animationDelay: '0ms' }}></div>
                                                        <div className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full animate-bounce ${theme === "dark" ? "bg-gray-500" : "bg-gray-400"
                                                            }`} style={{ animationDelay: '150ms' }}></div>
                                                        <div className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full animate-bounce ${theme === "dark" ? "bg-gray-500" : "bg-gray-400"
                                                            }`} style={{ animationDelay: '300ms' }}></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Image preview area */}
                    {uploadedImages.length > 0 && (
                        <div className={`px-2 sm:px-3 pt-1 sm:pt-2 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"
                            }`}>
                            <div className="flex overflow-x-auto gap-2 pb-1 sm:pb-2">
                                {uploadedImages.map((img, index) => (
                                    <div key={index} className="relative flex-shrink-0">
                                        <img
                                            src={img.preview}
                                            alt={`Preview ${index}`}
                                            className={`h-14 w-14 sm:h-16 sm:w-16 object-cover rounded-md border ${theme === "dark" ? "border-gray-600" : "border-gray-200"
                                                } cursor-pointer`}
                                            onClick={() => openImagePreview({
                                                ...img,
                                                preview: `data:${img.type};base64,${img.base64}`
                                            })}
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className={`absolute -top-1 -right-1 rounded-full p-0.5 shadow-sm hover:bg-opacity-80 transition-colors ${theme === "dark" ? "bg-gray-700" : "bg-white"
                                                }`}
                                        >
                                            <XCircle size={14} className={theme === "dark" ? "text-gray-300" : "text-gray-600"} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input area */}
                    <div className={`p-2 sm:p-3 border-t ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>

                        <div className={`flex items-center rounded-lg border ${theme === "dark" ? "border-gray-600" : "border-gray-300"
                            } focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all`}>
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className={`p-1.5 sm:p-2 transition-colors cursor-pointer ${theme === "dark"
                                    ? "text-gray-400 hover:text-brand-400"
                                    : "text-gray-500 hover:text-brand-600"
                                    }`}
                                disabled={isLoading}
                            >
                                <ImageIcon size={16} />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                            </button>
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className={`flex-1 border-none bg-transparent px-2 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-0 ${theme === "dark" ? "text-gray-200 placeholder-gray-400" : "text-gray-800 placeholder-gray-500"
                                    }`}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || (!inputMessage.trim() && uploadedImages.length === 0)}
                                className={`p-1.5 sm:p-2 rounded-r-md transition-colors cursor-pointer ${isLoading || (!inputMessage.trim() && uploadedImages.length === 0)
                                    ? theme === "dark"
                                        ? "text-gray-600"
                                        : "text-gray-400"
                                    : theme === "dark"
                                        ? "text-brand-400 hover:text-brand-300"
                                        : "text-brand-600 hover:text-brand-500"
                                    }`}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeImagePreview}>
                    <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute -top-8 sm:-top-10 right-0 text-white hover:text-gray-300"
                            onClick={closeImagePreview}
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={selectedImage.preview}
                            alt="Preview"
                            className="max-w-full max-h-[80vh] sm:max-h-[90vh] object-contain"
                        />
                        <div className="text-white text-center mt-2 text-xs sm:text-sm">
                            {selectedImage.name}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;