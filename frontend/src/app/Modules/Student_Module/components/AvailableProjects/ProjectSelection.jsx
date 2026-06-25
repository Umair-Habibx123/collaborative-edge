import { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../../../../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import { motion, useScroll } from "framer-motion";
import JoinGroupModal from "./Modal/JoinGroupModal.jsx";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../../Components/loadingIndicator/loading.jsx";
import { Lock, ArrowLeft, LogIn } from "lucide-react";
import {
  CheckCircle,
  Users,
  PlusCircle,
  Loader2,
  Download,
  AlertCircle
} from "lucide-react";

const ProjectSelection = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(null);
  const [project, setProject] = useState(null);
  const [invalidProjectSearch, setInvalidProjectSearch] = useState(false);
  const [status, setStatus] = useState(null);
  const { user, isAuthLoading } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isUserInProject, setIsUserInProject] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [alreadyClaimedBySameUniversity, setAlreadyClaimedBySameUniversity] =
    useState(false);
  const [claimedByInfo, setClaimedByInfo] = useState(null);
  const [previousSelections, setPreviousSelections] = useState([]);
  const [hasPendingSelections, setHasPendingSelections] = useState(false);

  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const checkUniversityClaim = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/check-university?docId=${id}&university=${
          user.studentDetails.university
        }`
      );
      const data = await response.json();

      if (data.isClaimedByUniversity) {
        setAlreadyClaimedBySameUniversity(true);

        setClaimedByInfo({
          message:
            "This project has already been claimed by someone from your university.",
        });
      }
    } catch (error) {
      console.error("Error checking university claim:", error);
    }
  };

  const checkPreviousSelections = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/check-previous-selection/${user.email}`
      );
      const data = await response.json();

      if (!data.success) {
        console.error("Failed to check previous selections:", data.message);
        return;
      }

      if (data.hasPreviousSelection) {
        setHasPendingSelections(!data.isCompleted);

        setPreviousSelections({
          total: data.totalSelections,
          completed: data.completedCount,
          allCompleted: data.isCompleted,
        });
      } else {
        setHasPendingSelections(false);
        setPreviousSelections(null);
      }
    } catch (error) {
      console.error("Error checking previous selections:", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setInvalidProjectSearch(false);

        const projectResponse = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/api/fetchProjectDetailById/${id}`
        );
        const projectData = await projectResponse.json();

        if (projectData.message === "Project not found") {
          setProject(null);
          setInvalidProjectSearch(true);
          return;
        }

        setProject(projectData);

        if (user?.email) {
          const userInProjectResponse = await fetch(
            `${
              import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
            }/api/CheckUserInProject?projectId=${id}&userEmail=${user.email}`
          );
          const userInProjectData = await userInProjectResponse.json();
          setIsUserInProject(
            userInProjectData.message === "User is in the project"
          );
        }

        if (user?.studentDetails?.university) {
          const approvalResponse = await fetch(
            `${
              import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
            }/api/approval-status/${id}/${user.studentDetails.university}`
          );
          const approvalData = await approvalResponse.json();

          if (approvalData?.data?.length > 0) {
            setStatus(approvalData.data[0].status);
          } else {
            setStatus("not_found");
            setInvalidProjectSearch(true);
          }
        }

        await checkUniversityClaim();

          await checkPreviousSelections();
          
      } catch (err) {
        console.error("Error in combined data fetching:", err);
        setInvalidProjectSearch(true);
      } finally {
        setLoading(false);
        setIsCheckingUser(false);
      }
    };

    fetchAllData();
  }, [id, user]);

  const handleJoinExistingGroup = async (selectionId) => {
    setIsJoiningGroup(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/JoinExistingGroupforProject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: id,
            selectionId: selectionId,
            userEmail: user.email,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setIsUserInProject(true);
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      toast.error("Failed to join existing group");
      console.error("Error joining existing group:", error);
      return { success: false, error: "Failed to join existing group" };
    } finally {
      setIsJoiningGroup(false);
    }
  };

  const handleSelectProjectAsNewGroup = async () => {
    setIsCreatingNewGroup(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/SelectProjectAsNewGroup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: id,
            userEmail: user.email,
            userUniversity: user.studentDetails.university,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setIsUserInProject(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to create new group");
      console.error("Error creating new group:", error);
    } finally {
      setIsCreatingNewGroup(false);
    }
  };

  const isProjectExpired = (endDate) => {
    if (!endDate) return false;
    const today = new Date();
    const projectEndDate = new Date(endDate);
    return today > projectEndDate;
  };

  if (loading || isAuthLoading || isCheckingUser || !user) {
    return <Loading />;
  }

  if (!user || !user.email) {
    return (
      <div
        className={`-mt-[70px] md:-mt-[90px] min-h-screen flex items-center justify-center p-6 ${
          theme === "dark"
            ? "bg-gray-900 text-gray-300"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        <div
          className={`${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800 to-gray-900"
              : "bg-gradient-to-br from-gray-100 to-gray-200"
          } p-8 md:p-12 rounded-2xl shadow-2xl max-w-lg w-full text-center transition-all duration-300`}
        >
          <div className="flex items-center justify-center mb-6">
            {/* Icon or Image */}
            <Lock className="w-16 h-16 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4">Access Restricted</h2>
          <p className="text-lg mb-6">
            You must be logged in to view this content.
          </p>
          <button
            onClick={() => navigate("/login")}
            className={`px-6 py-3 ${
              theme === "dark"
                ? "bg-gradient-to-r from-brand-600 to-brand-700"
                : "bg-gradient-to-r from-brand-500 to-brand-600"
            } text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-all duration-300 shadow-lg font-semibold flex items-center justify-center mx-auto`}
          >
            <LogIn className="w-5 h-5 mr-2" />
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (
    !project ||
    invalidProjectSearch ||
    status === "not_found" ||
    user.role !== "student"
  ) {
    return (
      <div
        className={`-mt-[70px] md:-mt-[90px] min-h-screen flex items-center justify-center p-6 ${
          theme === "dark"
            ? "bg-gray-900 text-gray-300"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white dark:from-gray-900 dark:to-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl max-w-lg w-full text-center transition-all duration-300">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-16 h-16 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4">Access Denied</h2>
          <p className="text-lg mb-6">
            You do not have permission to view this project.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg font-semibold  flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative -mt-[70px] md:-mt-[90px]">
      <ToastContainer />
      {/* Header Section - Fixed at Top */}
      <motion.div
        className={`border-2 sticky top-0 z-50 p-4 sm:p-8 w-full transition-all duration-300 drop-shadow-xl
${
  theme === "dark"
    ? "bg-gray-900 text-gray-100 border-gray-700"
    : "bg-white text-gray-900 border-gray-300"
}`}
      >
        {/* Scroll Indicator - Positioned at the bottom of the header */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-500 via-brand-500 to-pink-500 rounded-full"
          style={{ scaleX: scrollYProgress }}
        />

        {/* Header Content */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          {/* Back Button */}
          <div className="w-full sm:w-2/12 mb-6 sm:mb-0">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <ArrowLeft />
              <span>Back</span>
            </button>
          </div>

          {/* Project Title */}
          <div className="w-full sm:w-10/12 text-center mb-6 sm:mb-0">
            <h2
              className={`text-3xl sm:text-4xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {project.title}
            </h2>
          </div>
        </div>
      </motion.div>

      {alreadyClaimedBySameUniversity && !isUserInProject && (
        <div
          className={`m-4 p-4 rounded-lg ${
            theme === "dark"
              ? "bg-yellow-900 text-yellow-200"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="font-bold">Project Claimed</h3>
          </div>
          <p className="mt-2">
            {claimedByInfo?.message ||
              "This project has already been claimed by another group from your university."}
          </p>
          <p className="mt-1 text-sm">
            You can only join existing groups for this project if invited.
          </p>
        </div>
      )}

      {isProjectExpired(project.duration.endDate) && (
        <div
          className={`m-4 p-4 rounded-lg text-center ${
            theme === "dark"
              ? "bg-gray-800 text-gray-300"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          <p className="font-semibold">
            This project has expired and can no longer take actions.
          </p>
          <p>
            The end date was{" "}
            {new Date(project.duration.endDate).toLocaleDateString()}.
          </p>
        </div>
      )}

      {/* Content Section - Scrollable */}
      <motion.div
        ref={containerRef}
        className={`p-4 sm:p-8 w-full transition-all duration-300 ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        <motion.div className="space-y-8">
          {isUserInProject && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center space-x-3 ${
                theme === "dark"
                  ? "bg-green-900 text-green-300"
                  : "bg-green-100 text-green-900"
              }`}
            >
              <CheckCircle className="w-6 h-6" />
              <span>
                You have already selected this project and are part of a
                selection group.
              </span>
            </div>
          )}

          {/* Project Description */}
          <p
            className={`text-lg ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            } transition-colors duration-300`}
          >
            {project.description}
          </p>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className={`${
                theme === "dark"
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-50 text-gray-900"
              } p-6 rounded-xl shadow-lg transition-all duration-300`}
            >
              <p>
                <strong>Project Type:</strong> {project.projectType}
              </p>
              <p>
                <strong>Difficulty Level:</strong> {project.difficultyLevel}
              </p>
            </div>
            <div
              className={`${
                theme === "dark"
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-50 text-gray-900"
              } p-6 rounded-xl shadow-lg transition-all duration-300`}
            >
              <p>
                <strong>Duration:</strong>{" "}
                {new Date(project.duration.startDate).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}{" "}
                to{" "}
                {new Date(project.duration.endDate).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
          </div>

          {/* Additional Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className={`${
                theme === "dark"
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-50 text-gray-900"
              } p-6 rounded-xl shadow-lg transition-all duration-300`}
            >
              <p>
                <strong>Maximum Groups Allowed:</strong> {project.maxGroups}
              </p>
              <p>
                <strong>Belongs to Which Industry:</strong>{" "}
                {project.industryName}
              </p>
            </div>
            <div
              className={`${
                theme === "dark"
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-50 text-gray-900"
              } p-6 rounded-xl shadow-lg transition-all duration-300`}
            >
              <p>
                <strong>Maximum Students Per Groups:</strong>{" "}
                {project.maxStudentsPerGroup}
              </p>
            </div>
          </div>

          {/* Required Skills */}
          <div
            className={`${
              theme === "dark"
                ? "bg-gray-800 text-gray-100"
                : "bg-gray-50 text-gray-900"
            } p-6 rounded-xl shadow-lg transition-all duration-300`}
          >
            <p className="font-semibold mb-4">Required Skills:</p>
            <ul className="list-disc list-inside">
              {project.requiredSkills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>

          {/* Additional Info */}
          {project.additionalInfo && (
            <div
              className={`${
                theme === "dark"
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-50 text-gray-900"
              } p-6 rounded-xl shadow-lg transition-all duration-300`}
            >
              <p className="font-semibold mb-4">Additional Info:</p>
              <p>{project.additionalInfo}</p>
            </div>
          )}

          {/* Attachments */}
          {project.attachments && project.attachments.length > 0 && (
            <div
              className={`${
                theme === "dark"
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-50 text-gray-900"
              } p-6 rounded-xl shadow-lg transition-all duration-300`}
            >
              <p className="font-semibold mb-4">Attachments:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {project.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className={`flex flex-col p-4 rounded-xl ${
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-white hover:bg-gray-100"
                    } transition-all duration-300 transform hover:scale-105`}
                  >
                    <div className="flex items-center mb-3">
                      <i
                        className={`fas fa-file ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        } text-xl mr-3`}
                      ></i>
                      <span
                        className={`${
                          theme === "dark" ? "text-gray-300" : "text-gray-900"
                        } truncate`}
                        title={attachment.fileName}
                      >
                        {attachment.fileName}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      } mb-3`}
                    >
                      Uploaded at:{" "}
                      {new Date(attachment.uploadedAt).toLocaleDateString()}
                    </p>
                    <a
                      href={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${
                        attachment.fileUrl
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`self-end ${
                        theme === "dark"
                          ? "text-gray-300 hover:text-gray-100"
                          : "text-gray-500 hover:text-gray-700"
                      } transition-colors duration-300`}
                    >
                      <i className="text-lg">
                        <Download size={20} />
                      </i>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isUserInProject && !isProjectExpired(project.duration.endDate) && (
            <div className="max-w-6xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
              {hasPendingSelections ? (
                <div
                  className={`p-4 rounded-lg ${
                    theme === "dark"
                      ? "bg-red-900 text-red-200"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>
                      You have pending project selections that need to be
                      completed before selecting a new project.
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(-1)}
                    className="mt-2 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
                  >
                    View My Projects
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  {/* Join Existing Group Button */}
                  {alreadyClaimedBySameUniversity && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className={`w-full px-6 py-3 ${
                        isUserInProject || isCreatingNewGroup
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700"
                      } text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2`}
                      disabled={isUserInProject || isCreatingNewGroup}
                    >
                      {isJoiningGroup ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Users className="w-5 h-5" />
                          <span>JOIN EXISTING GROUP FOR THIS PROJECT</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Join Group Modal */}
                  <JoinGroupModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onJoin={handleJoinExistingGroup}
                    user={user}
                    theme={theme}
                    projectId={id}
                  />

                  {/* Select Project as New Group Button */}
                  {!alreadyClaimedBySameUniversity && (
                    <button
                      onClick={handleSelectProjectAsNewGroup}
                      className={`w-full px-6 py-3 ${
                        isUserInProject || isJoiningGroup
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      } text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2`}
                      disabled={isUserInProject || isJoiningGroup}
                    >
                      {isCreatingNewGroup ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <PlusCircle className="w-5 h-5" />
                          <span>SELECT PROJECT AS NEW GROUP</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

ProjectSelection.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default ProjectSelection;
