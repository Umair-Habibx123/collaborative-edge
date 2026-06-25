// text -> text

import { useEffect, useState, useRef } from "react";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    
    
    const genAI = useRef(null);
    
    useEffect(() => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (apiKey) {
            genAI.current = new GoogleGenerativeAI(apiKey);
        } else {
            console.error("API key is missing");
        }
    }, []);

    

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !genAI.current) return;
        
        const userMessage = inputMessage;
        setInputMessage("");
        
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setIsLoading(true);
        
        try {
            const model = genAI.current.getGenerativeModel({ 
                // model: "gemini-2.0-flash",
                model: "gemini-2.5-pro-exp-03-25",
            });
            
            const result = await model.generateContent(userMessage);
            const response = await result.response;
            const text = response.text();
            
            setMessages(prev => [...prev, { text, sender: 'bot' }]);
        } catch (error) {
            console.error("Error calling API:", error);
            setMessages(prev => [...prev, { 
                text: "Sorry, I encountered an error. Please try again.", 
                sender: 'bot' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="font-sans">
            {/* Chatbot Widget Container */}
            {isOpen && (
                <div className="fixed bottom-20 right-5 w-80 h-[28rem] shadow-xl rounded-xl bg-white flex flex-col border border-gray-100 overflow-hidden transform transition-all duration-300 ease-in-out">
                    {/* Chat header */}
                    <div className="bg-gradient-to-r from-brand-500 to-accent-500 text-white p-4 rounded-t-xl flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Bot size={20} className="text-white" />
                            <h3 className="font-semibold text-sm">CollaborativeEdge AI</h3>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    
                    {/* Messages container */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Bot size={48} className="text-brand-400 mb-3" />
                                <p className="text-gray-500 font-medium">How can I help you today?</p>
                                <p className="text-gray-400 text-sm mt-1">Ask me anything about CollaborativeEdge</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {messages.map((message, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-brand-100 text-brand-600 ml-2' : 'bg-brand-100 text-brand-600 mr-2'}`}>
                                                {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                                            </div>
                                            <div 
                                                className={`px-4 py-2 rounded-xl ${message.sender === 'user' 
                                                    ? 'bg-brand-600 text-white rounded-tr-none' 
                                                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'}`}
                                            >
                                                <p className="text-sm">{message.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex max-w-xs lg:max-w-md">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-100 text-brand-600 mr-2 flex items-center justify-center">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-white text-gray-800 px-4 py-2 rounded-xl rounded-tl-none border border-gray-200 shadow-sm">
                                        <div className="flex space-x-1">
                                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Input area */}
                    <div className="p-3 border-t border-gray-200 bg-white">
                        <div className="flex items-center rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 border-none bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-0"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !inputMessage.trim()}
                                className={`p-2 rounded-r-md transition-colors ${isLoading || !inputMessage.trim() 
                                    ? 'text-gray-400' 
                                    : 'text-brand-600 hover:text-brand-700'}`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Chat Icon Button */}
            <button
                className={`cursor-pointer fixed bottom-5 right-5 h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)'
                }}
            >
                <MessageCircle size={24} className="text-white" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
                    <span className="inline-block">AI</span>
                </span>
            </button>
        </div>
    );
};

export default Chatbot;