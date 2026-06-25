import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../../../auth/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import Loading from "../../../../../Components/loadingIndicator/loading";
import { ArrowLeft, Mail, Shield, User2 } from "lucide-react";

const VerifyAdmScreen = () => {
  const { userId } = useParams();
  const { user, isAuthLoading } = useAuth();
  const [userToVerify, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
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
        // setFormData(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [userId]);

  const updateUserStatus = async (status) => {
    if (userToVerify?.email === "admin1@gmail.com") {
      toast.error("This admin's status cannot be updated. This Is Super Admin");
      return;
    }

    if (user?.email === userToVerify?.email) {
      toast.error("Cannot update your own status");
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  if (!userToVerify || isAuthLoading) {
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
            className={`w-full sm:w-auto mb-4 sm:mb-0 flex items-center justify-center border-2 space-x-2 px-4 py-2 rounded-lg transition-all duration-300 
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
            Verify Admins
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
                  disabled={loading}
                >
                  <option value="verified">Verified</option>
                  <option value="banned">Banned</option>
                  <option value="pending">Pending</option>
                </select>
                {loading && (
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
        </div>
      </div>
    </div>
  );
};

export default VerifyAdmScreen;
