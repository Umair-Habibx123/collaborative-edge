import { useState, useEffect } from "react";
import Modal from "react-modal";
import PropTypes from "prop-types";
import { CircleX, Mail } from "lucide-react" 

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(null);

    // External functions
    const clearCooldown = () => {
        localStorage.removeItem("passwordResetCooldown");
        return null;
    };

    const checkStoredCooldown = () => {
        const storedCooldown = localStorage.getItem("passwordResetCooldown");
        if (storedCooldown) {
            const remainingTime = Math.max(0, parseInt(storedCooldown) - Date.now());
            return remainingTime > 0 ? remainingTime : clearCooldown();
        }
        return null;
    };

    const handleCooldownTimer = (cooldown, setCooldown) => {
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1000) {
                    clearInterval(timer);
                    return clearCooldown();
                }
                return prev - 1000;
            });
        }, 1000);
        return () => clearInterval(timer);
    };

    // Combined useEffect
    useEffect(() => {
        if (isOpen) {
            setEmail("");
            setMessage(null);
            const remainingTime = checkStoredCooldown();
            if (remainingTime) {
                setCooldown(remainingTime);
            }
        }

        if (cooldown > 0) {
            return handleCooldownTimer(cooldown, setCooldown);
        }
    }, [isOpen, cooldown]);

    const handlePasswordReset = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: "Password reset link sent to your email!" });
                const cooldownTime = Date.now() + 1 * 60 * 1000;
                localStorage.setItem("passwordResetCooldown", cooldownTime);
                setCooldown(1 * 60 * 1000);
            } else {
                setMessage({ type: "error", text: result.error || "Failed to send reset link." });
            }
        } catch (error) {
            setMessage({ type: "error", text: error || "Something went wrong. Try again." });
        } finally {
            setLoading(false);
        }
    };

    const formatCooldownTime = () => {
        const minutes = Math.floor(cooldown / 60000);
        const seconds = Math.floor((cooldown % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto mt-20 relative"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                <CircleX size={20} />
            </button>
            <h2 className="text-2xl font-semibold text-gray-800 text-center">Reset Password</h2>
            <p className="text-sm text-gray-500 text-center mt-1">Enter your email to receive a reset link.</p>

            <div className="mt-4 flex items-center border rounded-md p-2 shadow-sm focus-within:ring-2 focus-within:ring-brand-500">
                <Mail className="text-gray-400" size={20} />
                <input
                    type="email"
                    className="w-full p-2 outline-none ml-2"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {message && (
                <p className={`mt-3 text-sm text-center ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
                    {message.text}
                </p>
            )}

            <button
                onClick={handlePasswordReset}
                disabled={loading || cooldown > 0}
                className="w-full mt-4 py-2 bg-brand-600 text-white rounded-md shadow-md hover:bg-brand-700 transition disabled:bg-brand-400"
            >
                {cooldown > 0 ? `Send another after ${formatCooldownTime()}` : loading ? "Sending..." : "Send Reset Link"}
            </button>
        </Modal>
    );
};


ForgotPasswordModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};


export default ForgotPasswordModal;
