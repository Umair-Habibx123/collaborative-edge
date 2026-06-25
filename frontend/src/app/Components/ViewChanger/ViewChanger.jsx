import { useState, useEffect } from 'react';
import DesktopIcon from '../src/assets/images/desktop.svg';
import MobileIcon from '../src/assets/images/mobile.svg';

const ViewChanger = () => {

    const [isDesktopView, setIsDesktopView] = useState(true);

    const updateView = () => {
        const width = window.innerWidth;
        setIsDesktopView(width > 768);
    };




    useEffect(() => {
        updateView();
        window.addEventListener("resize", updateView);
        return () => {
            window.removeEventListener("resize", updateView);
        };
    }, []);


    return (
        <div
            id="SwitchView"
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-between w-32 h-12 rounded-xl border-2 border-brand-500 bg-black p-2 cursor-pointer"
        >
            <div
                className={`flex items-center justify-center w-1/2 h-full ${isDesktopView ? "opacity-100" : "opacity-50"
                    }`}
            >
                <img src={DesktopIcon} alt="Desktop Icon" className="w-6 h-6" />
            </div>
            <div className="w-px h-full bg-white"></div>
            <div
                className={`flex items-center justify-center w-1/2 h-full ${!isDesktopView ? "opacity-100" : "opacity-50"
                    }`}
            >
                <img src={MobileIcon} alt="Desktop Icon" className="w-6 h-6" />
            </div>
        </div>
    )
}

export default ViewChanger