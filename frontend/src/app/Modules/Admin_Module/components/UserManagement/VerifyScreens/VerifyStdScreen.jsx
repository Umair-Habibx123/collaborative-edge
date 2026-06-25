import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../../../../../auth/AuthContext";
import Loading from "../../../../../Components/loadingIndicator/loading";
import {
  ArrowLeft,
  Building2,
  Download,
  Globe,
  Mail,
  MapPin,
  Shield,
  User,
  User2,
} from "lucide-react";

const VerifyStdScreen = () => {
  const { userId } = useParams();
  const { user, isAuthLoading } = useAuth();
  const [userToVerify, setUser] = useState(null);
  const [userstatusLoading, setUserstatusLoading] = useState(false);
  const [userTeacherLoading, setuserTeacherLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/admin/fetchEachUserFullDetails`,
          {
            params: { email: userId },
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [userId]);

  const updateUserStatus = async (status) => {
    setUserstatusLoading(true);
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/admin/update-user-status`,
        {
          email: userToVerify.email,
          status,
          password: userToVerify.password,
        }
      );

      if (response.data.message === "User status updated successfully") {
        setUser((prevUser) => ({
          ...prevUser,
          status: status,
        }));
        toast.success("User status updated successfully");

        // Optional: Show additional message if user was verified
        if (status === "verified") {
          toast.info("Verification email sent to user");
        }
      } else {
        throw new Error("Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Error updating user status");
    } finally {
      setUserstatusLoading(false);
    }
  };

  const updateTeacherStatus = async (email, verified) => {
    setuserTeacherLoading(true);

    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/admin/update-student-status`,
        {
          email,
          verified,
          verifiedBy: user.email,
        }
      );

      console.log("Backend Response:", response.data); // Log the response

      if (response.data.message === "Student status updated successfully") {
        toast.success("Student status updated successfully");
      } else {
        throw new Error("Failed to update Student status");
      }
    } catch (error) {
      console.error("Error updating Student status:", error);
      toast.error(`Error updating Student status: ${error.message}`);
    } finally {
      setuserTeacherLoading(false);
    }
  };

  if (!userToVerify || isAuthLoading || !user) {
    return <Loading />;
  }

  return (
    <div
      className={`min-h-screen -mt-[70px] md:-mt-[90px] p-6 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <ToastContainer />
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div
          className={`flex flex-col sm:flex-row justify-start items-start sm:items-center border-b pb-4 mb-4 ${
            theme === "dark" ? "border-gray-700" : "border-gray-300"
          }`}
        >
          <button
            onClick={() => window.history.back()}
            className={`w-full sm:w-auto mb-4 sm:mb-0 flex items-center  justify-center border-2 space-x-2 px-4 py-2 rounded-lg transition-all duration-300 
                  ${
                    theme === "dark"
                      ? "border-gray-600 text-white hover:bg-gray-700"
                      : "border-gray-300 text-gray-900 hover:bg-gray-200"
                  }`}
          >
            <ArrowLeft />
            <span>Back</span>
          </button>
          <h1 className="w-full sm:w-10/12 text-center mb-4 sm:mb-0 p-4 text-3xl font-bold text-gradient bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
            Verify Students
          </h1>
        </div>

        {/* Description */}
        <p
          className={`mb-8 text-lg text-center ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Verify and read{" "}
          <span className="font-semibold">details carefully</span> and update
          the status to allow the user to access the portal through the
          dashboard.
        </p>
        <div
          className={`rounded-lg shadow-lg p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Basic Information Section */}

          <div
            className={`p-6 mb-6 border-b-2 shadow-lg rounded-xl ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <h1
                className={`text-2xl md:text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Basic Information
              </h1>
              <div className="mt-4 md:mt-0">
                <h4
                  className={`text-lg font-semibold mb-2 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Update Status
                </h4>
                <select
                  name="status"
                  value={userToVerify.status || ""}
                  onChange={(e) => updateUserStatus(e.target.value)}
                  className={`p-2 rounded-md w-full md:w-auto ${
                    theme === "dark"
                      ? "bg-gray-700 text-white border border-gray-600"
                      : "bg-gray-100 text-black border border-gray-300"
                  }`}
                  disabled={userstatusLoading}
                >
                  <option value="verified">Verified</option>
                  <option value="banned">Banned</option>
                  <option value="pending">Pending</option>
                </select>
                {userstatusLoading && (
                  <p className="text-brand-500 mt-2">Updating status...</p>
                )}
              </div>
            </div>

            {/* User Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Profile Picture & Username */}
              <div className="flex items-center space-x-4">
                {userToVerify.profilePic ? (
                  <img
                    src={userToVerify.profilePic}
                    alt="Profile"
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 ${
                      theme === "dark" ? "border-gray-600" : "border-gray-400"
                    }`}
                  />
                ) : (
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                    }`}
                  >
                    <User2
                      className={`text-xl ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    value={userToVerify.username || ""}
                    disabled
                    className={`w-full p-2 rounded-md cursor-not-allowed ${
                      theme === "dark"
                        ? "bg-gray-700 text-gray-100"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4">
                <Mail
                  className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                />
                <div className="flex-1">
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={userToVerify.email || ""}
                    disabled
                    className={`w-full p-2 rounded-md cursor-not-allowed ${
                      theme === "dark"
                        ? "bg-gray-700 text-gray-100"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center space-x-4">
                <Shield
                  className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                />
                <div className="flex-1">
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Role
                  </label>
                  <input
                    type="text"
                    value={userToVerify.role || ""}
                    disabled
                    className={`w-full p-2 rounded-md cursor-not-allowed ${
                      theme === "dark"
                        ? "bg-gray-700 text-gray-100"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {userToVerify.role === "student" && (
            <div className="mt-6">
              {/* Header and Status Update Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-xl font-semibold mb-4 md:mb-0">
                  Educational Details
                </h2>
                <div className="flex flex-col">
                  <h4 className="text-lg font-semibold mb-4">Update Status</h4>
                  <select
                    name="status"
                    value={
                      userToVerify.studentDetails?.verified?.toString() ||
                      "false"
                    }
                    onChange={async (e) => {
                      const newStatus = e.target.value === "true";
                      try {
                        await updateTeacherStatus(
                          userToVerify.email,
                          newStatus
                        );
                        setUser((prevUser) => ({
                          ...prevUser,
                          studentDetails: {
                            ...prevUser.studentDetails,
                            verified: newStatus,
                          },
                        }));
                      } catch (error) {
                        toast.error(
                          `Error updating student status: ${error.message}`
                        );
                      }
                    }}
                    className={`p-2 rounded ${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-black"
                    }`}
                    disabled={userTeacherLoading}
                  >
                    <option value="true">Verified</option>
                    <option value="false">Not Verified</option>
                  </select>
                  {userTeacherLoading && (
                    <p className="text-brand-500 mt-2">Updating status...</p>
                  )}
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Student ID */}
                <div className="flex items-center space-x-4">
                  <Building2 className="text-gray-500" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Student ID
                    </label>
                    <input
                      disabled
                      type="text"
                      name="studentId"
                      value={userToVerify.studentDetails.studentId || ""}
                      readOnly
                      className={`w-full p-2 rounded ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                      } opacity-50`}
                    />
                  </div>
                </div>

                {/* Year of Study */}
                <div className="flex items-center space-x-4">
                  <Globe className="text-gray-500" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Year of Study
                    </label>
                    <input
                      disabled
                      type="text"
                      name="yearOfStudy"
                      value={userToVerify.studentDetails.yearOfStudy || ""}
                      readOnly
                      className={`w-full p-2 rounded ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                      } opacity-50`}
                    />
                  </div>
                </div>

                {/* Degree/Program */}
                <div className="flex items-center space-x-4">
                  <MapPin className="text-gray-500" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Degree/Program
                    </label>
                    <input
                      type="text"
                      name="degreeOrProgram"
                      value={userToVerify.studentDetails.degreeOrProgram || ""}
                      readOnly
                      className={`w-full p-2 rounded ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                      } opacity-50`}
                    />
                  </div>
                </div>

                {/* University */}
                <div className="flex items-center space-x-4">
                  <User className="text-gray-500" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      University
                    </label>
                    <input
                      type="text"
                      name="university"
                      value={userToVerify.studentDetails.university || ""}
                      readOnly
                      className={`w-full p-2 rounded ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                      } opacity-50`}
                    />
                  </div>
                </div>
              </div>

              {/* Verification Documents Section */}
              <h4 className="text-lg font-semibold mb-4 px-6">
                Verification Documents
              </h4>
              {userToVerify.studentDetails.verificationDocuments?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 px-6">
                  {userToVerify.studentDetails.verificationDocuments.map(
                    (doc, index) => (
                      <div
                        key={index}
                        className={`p-4 ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                        } rounded-lg`}
                      >
                        <p
                          className={`${
                            theme === "dark" ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          <strong>File Name:</strong> {doc.fileName}
                        </p>
                        <p
                          className={`${
                            theme === "dark" ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          <strong>Uploaded At:</strong>{" "}
                          {new Date(doc.uploadedAt).toLocaleString()}
                        </p>
                        <a
                          href={`${
                            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
                          }${doc.fileUrl}`}
                          target="_blank"
                          download
                          className={`mt-2 inline-block ${
                            theme === "dark"
                              ? "text-brand-400 hover:underline"
                              : "text-brand-600 hover:underline"
                          }`}
                        >
                          <i className="text-lg">
                            <Download size={20} />
                          </i>
                        </a>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p
                  className={`px-6 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No verification documents uploaded.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyStdScreen;
