import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ClipboardCheck, Users, Award, Star, ArrowLeft, ExternalLink, Github, ChevronRight, Calendar, Gauge, Code, FileText, ShieldCheck, Building2, UserRound, Link, BadgeCheck } from 'lucide-react';
import { useEffect, useState } from "react";
import axios from "axios";
import image1 from "../../../../../assets/images/seven.webp";
import image2 from "../../../../../assets/images/eight.webp";
import image3 from "../../../../../assets/images/nine.webp";
import Loading from "../../../../Components/loadingIndicator/loading";

const SuccessStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/success-stories`);
        setStories(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching success stories:", error);
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const getRandomImage = () => {
    const images = [image1, image2, image3];
    return images[Math.floor(Math.random() * images.length)];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackClick = () => {
    setSelectedProject(null);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Project Detail View */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            <div className="flex justify-start items-center w-full mb-4">
              <button
                onClick={handleBackClick}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-brand-100 hover:text-brand-700 rounded-full shadow-sm transition duration-200"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">Back to Success Stories</span>
              </button>
               
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {selectedProject.project.title}
                        </h1>
                        {selectedProject.reviews?.averageRating >= 4.5 && (
                          <span className="flex items-center bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-full">
                            <BadgeCheck className="w-3 h-3 mr-1" />
                            Featured
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center bg-brand-50 text-brand-700 text-sm px-3 py-1 rounded-full">
                        {selectedProject.project.projectType}
                      </span>
                    </div>
                    {/* <div className="flex items-center gap-2">
                      <span className="flex items-center bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
                        <Star className="w-4 h-4 mr-1 fill-amber-400" />
                        {selectedProject.reviews?.averageRating?.toFixed(1) || '5.0'}
                      </span>
                    </div> */}
                  </div>

                  <div className="prose max-w-none text-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-brand-500" />
                      Project Description
                    </h2>
                    <p className="leading-relaxed">
                      {selectedProject.project.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
                    <div className="bg-brand-50 p-2 rounded-lg text-gray-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Duration</h3>
                      <p className="text-gray-600 text-sm">
                        {formatDate(selectedProject.project.duration.startDate)} -{' '}
                        {formatDate(selectedProject.project.duration.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
                    <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Difficulty</h3>
                      <p className="text-gray-600 text-sm capitalize">
                        {selectedProject.project.difficultyLevel}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
                    <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Completion</h3>
                      <p className="text-gray-600 text-sm">
                        {formatDate(selectedProject.studentGroup.completedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
                    <div className="bg-brand-50 p-2 rounded-lg text-brand-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Team Size</h3>
                      <p className="text-gray-600 text-sm">
                        {selectedProject.studentGroup.members.length} members
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-500" />
                    Team Members
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedProject.studentGroup.members.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-brand-200 transition-colors"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mr-4 overflow-hidden">
                            {member.profilePic ? (
                              <img
                                src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${member.profilePic}`}
                                alt={member.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-gray-600 font-medium text-lg">
                                {member.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{member.username}</h4>
                          <p className="text-xs text-gray-500">
                            {member.studentId} • {member.university}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-500" />
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.project.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-gray-50 px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200 hover:bg-brand-50 hover:border-brand-100 hover:text-brand-700 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UserRound className="w-5 h-5 text-brand-500" />
                    Supervisor
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                        {selectedProject.supervisor.profilePic ? (
                          <img
                            src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${selectedProject.supervisor.profilePic}`}
                            alt={selectedProject.supervisor.username}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-gray-600 font-medium text-xl">
                            {selectedProject.supervisor.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {selectedProject.supervisor.fullName || selectedProject.supervisor.username}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedProject.supervisor.designation}, {selectedProject.supervisor.department}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedProject.supervisor.university}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand-500" />
                    Industry Partner
                  </h3>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                        {selectedProject.representative.profilePic ? (
                          <img
                            src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${selectedProject.representative.profilePic}`}
                            alt={selectedProject.representative.username}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-gray-600 font-medium text-xl">
                            {selectedProject.representative.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {selectedProject.representative.username}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedProject.industry.designation}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 mt-0.5">
                        <Link className="w-4 h-4" />
                      </span>
                      <span>
                        <span className="font-medium">Company:</span> {selectedProject.industry.name}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 mt-0.5">
                        <ExternalLink className="w-4 h-4" />
                      </span>
                      <span>
                        <span className="font-medium">Website:</span>{' '}
                        <a
                          href={`https://${selectedProject.industry.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline"
                        >
                          {selectedProject.industry.website}
                        </a>
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 mt-0.5">
                        <Award className="w-4 h-4" />
                      </span>
                      <span>
                        <span className="font-medium">Address:</span> {selectedProject.industry.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-brand-500" />
                    Project Resources
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="#"
                      className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors group"
                    >
                      <div className="flex items-center">
                        <Github className="w-5 h-5 text-gray-700 mr-3 group-hover:text-gray-600" />
                        <span className="font-medium text-gray-800 group-hover:text-brand-700">Source Code</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                      href="#"
                      className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors group"
                    >
                      <div className="flex items-center">
                        <ExternalLink className="w-5 h-5 text-gray-700 mr-3 group-hover:text-gray-600" />
                        <span className="font-medium text-gray-800 group-hover:text-brand-700">Live Demo</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                      href="#"
                      className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors group"
                    >
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-700 mr-3 group-hover:text-gray-600" />
                        <span className="font-medium text-gray-800 group-hover:text-brand-700">Documentation</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content (shown when no project is selected) */}
      {!selectedProject && (
        <>
          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                    <Award className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Success Stories</span>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Inspiring <span className="text-gray-600">Projects</span> That Made an Impact
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  Discover how students, educators, and industry professionals collaborate to create impactful Final Year Projects. These success stories showcase the power of our platform in bridging academia and industry.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center bg-brand-50 text-brand-700 text-sm px-3 py-1 rounded-full">
                    <Users className="w-4 h-4 mr-1" />
                    {stories.reduce((acc, story) => acc + story.studentGroup.members.length, 0)} Students
                  </span>
                  <span className="inline-flex items-center bg-amber-50 text-amber-700 text-sm px-3 py-1 rounded-full">
                    <Lightbulb className="w-4 h-4 mr-1" />
                    {stories.length} Projects
                  </span>
                  <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-sm px-3 py-1 rounded-full">
                    <Building2 className="w-4 h-4 mr-1" />
                    {new Set(stories.map(story => story.industry.name)).size} Companies
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-brand-50 to-white p-8 rounded-3xl shadow-sm border border-gray-100 relative z-10">
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                    Celebrating Academic Excellence
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Each project represents months of dedication, collaboration, and innovation. See how our platform helps turn ideas into reality with real-world impact.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {stories.slice(0, 5).map((story, i) => (
                        <div key={i} className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white flex items-center justify-center overflow-hidden">
                            {story.studentGroup.members[0]?.profilePic ? (
                              <img
                                src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${story.studentGroup.members[0].profilePic}`}
                                alt={story.studentGroup.members[0].username.charAt(0).toUpperCase()}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-gray-600">
                                {story.studentGroup.members[0]?.username.charAt(0).toUpperCase() || 'A'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">+{stories.length * 3} participants</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-brand-100 rounded-2xl -z-0"></div>
              </div>
            </motion.div>
          </div>

          {/* Success Stories Grid */}
          <div className="bg-gradient-to-b from-gray-50 to-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm mb-4"
                >
                  <Star className="w-4 h-4 mr-1 fill-green-300" />
                  Featured Projects
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Our <span className="text-gray-600">Success</span> Stories
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Browse through our collection of successfully completed projects
                </p>
              </motion.div>

              {stories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto">
                    <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-500 mb-2">No success stories yet</p>
                    <p className="text-gray-500">Check back later for inspiring projects</p>
                  </div>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  {stories.map((story, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100 cursor-pointer group"
                      onClick={() => handleProjectClick(story)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={getRandomImage()}
                          alt={story.project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
                        {/* <div className="absolute bottom-4 left-4">
                          <div className="flex items-center bg-white/90 px-3 py-1 rounded-full shadow-xs">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                            <span className="text-sm font-medium text-gray-800">
                              {story.reviews?.averageRating?.toFixed(1) || '5.0'}
                            </span>
                          </div>
                        </div> */}
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded-full">
                            {story.project.projectType}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {story.project.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {story.project.description}
                        </p>

                        <div className="border-t border-gray-100 pt-4 mt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {story.studentGroup.members.slice(0, 3).map((member, i) => (
                                  <div key={i} className="relative">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white flex items-center justify-center overflow-hidden">
                                      {member.profilePic ? (
                                        <img
                                          src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${member.profilePic}`}
                                          alt={member.username.charAt(0).toUpperCase()}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-xs text-gray-600">
                                          {member.username.charAt(0).toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {story.studentGroup.members.length > 3 ? `+${story.studentGroup.members.length - 3} more` : ''}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Completed</p>
                              <p className="text-sm font-medium text-gray-700">
                                {formatDate(story.studentGroup.completedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuccessStories;