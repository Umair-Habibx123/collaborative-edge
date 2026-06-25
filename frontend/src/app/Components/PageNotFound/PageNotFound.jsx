import { Rocket, Home, AlertTriangle } from 'lucide-react';

const PageNotFound = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 p-6 -mt-[70px] md:-mt-[90px]">
            <div className="text-center bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-500 hover:scale-105">
                {/* Rocket Icon with Animation */}
                <div className="animate-float">
                    <Rocket className="w-20 h-20 mx-auto text-brand-600 mb-4" />
                </div>

                {/* 404 Heading */}
                <h1 className="text-7xl font-bold text-gray-800 mb-4 animate-pulse">404</h1>

                {/* Main Message */}
                <p className="text-xl text-gray-600 mb-6">
                    Whoa! Looks like you’re{' '}
                    <span className="font-semibold text-brand-600">lost in space</span>!
                </p>

                {/* Sub Message */}
                <p className="text-md text-gray-500 mb-6">
                    We couldn’t find the page you were looking for. Maybe it’s off exploring other galaxies? 🌌
                </p>

                {/* Home Button */}
                <a
                    href="/"
                    className="inline-flex items-center justify-center bg-brand-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-brand-700 transition duration-300 ease-in-out shadow-lg hover:shadow-xl"
                >
                    <Home className="w-5 h-5 mr-2" /> Take me Home
                </a>

                {/* Support Section */}
                <div className="mt-8 p-6 bg-brand-50 rounded-lg">
                    <AlertTriangle className="w-10 h-10 mx-auto text-brand-600 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Still lost?</h2>
                    <p className="text-gray-500 mt-2">
                        Don’t worry, our support team is just a message away! We&apos;re happy to help you find your way. 😊
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PageNotFound;




// const PageNotFound = () => {
//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6 -mt-[70px] md:-mt-[90px]">
//             <div className="text-center bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
//                 <h1 className="text-7xl font-bold text-gray-800 mb-4 animate-bounce">🚀 404</h1>
//                 <p className="text-xl text-gray-600 mb-6">
//                     Whoa! Looks like you’re <span className="font-semibold text-brand-600">lost in space</span>!
//                 </p>
//                 <p className="text-md text-gray-500 mb-6">
//                     We couldn’t find the page you were looking for. Maybe it’s off exploring other galaxies? 🌌
//                 </p>
//                 <a
//                     href="/"
//                     className="inline-block bg-brand-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-brand-700 transition duration-300 ease-in-out shadow-xl"
//                 >
//                     Take me Home 🏠
//                 </a>
//                 <div className="mt-8">
//                     <h2 className="text-xl font-semibold text-gray-700">Still lost?</h2>
//                     <p className="text-gray-500 mt-2">
//                         Don’t worry, our support team is just a message away! We&apos;re happy to help you find your way. 😊
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PageNotFound;