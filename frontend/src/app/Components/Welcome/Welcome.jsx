//motion div and transitions for moving and beautiful effects, dont change logics. effects not only 
//first time, but every time when scrolled to div or div show on screen


import { motion } from 'framer-motion';
import image1 from '../../../assets/images/root.png';
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="lg:h-screen -mt-[70px] md:-mt-[90px] flex flex-col md:flex-row w-full">
      {/* Left Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:w-2/3 p-6 md:p-12 justify-center items-center bg-gradient-to-br from-white to-gray-50 w-full"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center items-center mb-8 w-full"
        >
          <img
            src={image1}
            alt="Team Working"
            className="w-full max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl h-auto rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 text-center md:text-left leading-tight"
        >
          Welcome to <span className="text-brand-600">Collaborative Edge</span> <br /> FYP Collaboration System
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-gray-600 text-base md:text-lg text-center md:text-left max-w-2xl"
        >
          Collaborative Edge is a web-based portal connecting industry
          representatives, students, and teachers for final year projects
          (FYP). Industry representatives submit project ideas for teachers to
          review and approve. Approved projects are available for students to
          select and manage.
        </motion.p>
      </motion.div>

      {/* Right Section */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="md:w-1/3 p-6 md:p-12 flex md:flex-col flex-col-reverse justify-center bg-gradient-to-br from-brand-600 to-brand-700 items-center w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login", { replace: true })}
            className="cursor-pointer w-full py-3 font-bold bg-white text-brand-600 rounded-lg shadow-lg hover:bg-gray-50 hover:text-brand-700 transition-all"
          >
            LOGIN
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/roleSelection", { replace: true })}
            className="cursor-pointer w-full py-3 mt-4 font-bold bg-transparent border-2 border-white text-white rounded-lg shadow-lg hover:bg-white hover:text-brand-600 transition-all"
          >
            DON&apos;T HAVE AN ACCOUNT?
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="md:mt-8 mb-8 text-center text-white text-sm"
        >
          Join us to streamline your FYP experience!
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Welcome;
