import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(false);

    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/validate-token/${token}`);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Invalid token");
                }
                setIsTokenValid(true);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Invalid or expired token";
                setMessage({ type: "error", text: errorMessage });
                toast.error(errorMessage + " Redirecting...");
                setIsTokenValid(false);
                setTimeout(() => navigate("/"), 3000);
            }
        };

        if (token) {
            validateToken();
        } else {
            const errorMessage = "Missing token";
            setMessage({ type: "error", text: errorMessage });
            toast.error(errorMessage + " Redirecting...");
            setTimeout(() => navigate("/"), 3000);
        }
    }, [token, navigate]);

    const handleReset = async () => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/;
        if (!passwordRegex.test(password)) {
            const errorMessage = "Password must be 6-12 chars, including a letter, number & special character.";
            toast.error(errorMessage);
            setMessage({ type: "error", text: errorMessage });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const result = await response.json();

            if (response.ok) {
                const successMessage = "Password reset successful!";
                toast.success(successMessage + " Redirecting...");
                setMessage({ type: "success", text: successMessage });
                setTimeout(() => navigate("/login"), 2000);
            } else {
                const errorMessage = result.error || "Failed to reset password";
                setMessage({ type: "error", text: errorMessage });
                toast.error(errorMessage);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Something went wrong. Try again.";
            setMessage({ type: "error", text: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center -mt-[70px] md:-mt-[90px] min-h-screen bg-gradient-to-br from-brand-600 to-brand-500 p-4">
            <ToastContainer />
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center text-gray-900">Reset Password</h2>
                <p className="text-gray-500 text-center text-sm mt-2">Enter a new password to secure your account.</p>
                {message && <p className={`mt-3 text-sm text-center ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>{message.text}</p>}

                <div className="mt-6">
                    <input
                        type="password"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-brand-400 focus:outline-none transition"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={!isTokenValid}
                    />
                </div>

                <button
                    onClick={handleReset}
                    disabled={loading || !token || !isTokenValid}
                    className="w-full mt-4 py-3 bg-brand-600 text-white rounded-lg shadow-lg hover:bg-brand-700 transition disabled:bg-gray-400 text-lg font-semibold"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </div>
        </div>
    );
};

export default ResetPassword;