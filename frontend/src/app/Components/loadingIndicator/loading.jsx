// import { ClipLoader } from "react-spinners";
// import { useState } from "react";

// const Loading = () => {
//     const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    
//     return (
//         <div className={`fixed inset-0 flex items-center justify-center ${theme === "dark" ? "bg-gray-900 bg-opacity-75" : "bg-white bg-opacity-75"}`}>
//             <div className="text-center">
//                 <ClipLoader color={theme === "dark" ? "#36d7b7" : "#36d7b7"} size={50} /> {/* Spinner */}
//                 <p className={`mt-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Loading...</p>
//             </div>
//         </div>

//     );

// };
// export default Loading;

import { ClipLoader } from "react-spinners";
import { useState } from "react";

const Loading = () => {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    
    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm ${theme === "dark" ? "bg-gray-900/90" : "bg-white/90"}`}>
            <div className="text-center p-8 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105">
                <ClipLoader 
                    color={theme === "dark" ? "#3B82F6" : "#2563EB"} 
                    size={60}
                    speedMultiplier={0.8}
                    className="mx-auto"
                />
                <p className={`mt-6 text-xl font-medium tracking-wide ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                    Loading<span className="animate-pulse">...</span>
                </p>
                <div className={`mt-4 h-1 w-24 mx-auto rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div className={`h-full w-1/3 rounded-full animate-[loading_1.5s_infinite] ${theme === "dark" ? "bg-brand-400" : "bg-brand-600"}`}></div>
                </div>
            </div>
        </div>
    );
};

export default Loading;