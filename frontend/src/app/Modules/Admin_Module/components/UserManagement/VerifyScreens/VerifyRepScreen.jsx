import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../../../auth/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import Loading from "../../../../../Components/loadingIndicator/loading";
import {
  ArrowLeft,
  Building2,
  Download,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  User2,
  UserCircle2,
} from "lucide-react";

const VerifyRepScreen = () => {
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

  // const updateUserStatus = async (status) => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.put(
  //       `${
  //         import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
  //       }/admin/update-user-status`,
  //       {
  //         email: userToVerify.email,
  //         status,
  //       }
  //     );

  //     if (response.data.message === "User status updated successfully") {
  //       // Update the local state with the new status
  //       setUser((prevUser) => ({
  //         ...prevUser,
  //         status: status, // Update the status
  //       }));
  //       toast.success("User status updated successfully");
  //     } else {
  //       throw new Error("Failed to update user status");
  //     }
  //   } catch (error) {
  //     console.error("Error updating user status:", error);
  //     toast.error("Error updating user status");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const updateUserStatus = async (status) => {
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

  

  const updateIndustryRepStatus = async (email, industryId, verified) => {
    try {
      // console.log(user);
      const response = await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/admin/update-industry-rep-status`,
        {
          email,
          industryId,
          verified,
          verifiedBy: user.email,
        }
      );

      if (
        response.data.message ===
        "Industry representative status updated successfully"
      ) {
        setUser((prevUser) => {
          const updatedIndustries =
            prevUser.industryDetails.representingIndustries.map((industry) =>
              industry.industryId === industryId
                ? { ...industry, verified }
                : industry
            );

          return {
            ...prevUser,
            industryDetails: {
              ...prevUser.industryDetails,
              representingIndustries: updatedIndustries,
            },
          };
        });

        toast.success("Industry status updated successfully");
      } else {
        throw new Error("Failed to update industry representative status");
      }
    } catch (error) {
      console.error("Error updating industry representative status:", error);
      toast.error(`Error updating industry status: ${error.message}`);
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
            Verify Industry Representative
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

          {/* Industry Details Section */}
          {userToVerify.role === "industry" && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">
                Representing Industry Details
              </h2>

              {userToVerify.industryDetails.representingIndustries.map(
                (industry, index) => (
                  <div
                    key={index}
                    className={`mb-6 border-b-2 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    {/* Industry Heading */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                      <h3 className="text-lg font-semibold mb-4 md:mb-0">
                        Industry {index + 1}
                      </h3>
                      <div className="flex flex-col">
                        <h4 className="text-lg font-semibold mb-4">
                          Update Status
                        </h4>
                        <select
                          name={`verified-${index}`}
                          value={industry.verified ? "true" : "false"}
                          onChange={async (e) => {
                            const newStatus = e.target.value === "true"; // Convert string to boolean
                            try {
                              await updateIndustryRepStatus(
                                userToVerify.email,
                                industry.industryId,
                                newStatus
                              );
                            } catch (error) {
                              toast.error(
                                `Error updating industry status: ${error.message}`
                              );
                            }
                          }}
                          className={`p-2 rounded ${
                            theme === "dark"
                              ? "bg-gray-700 text-white"
                              : "bg-gray-100 text-black"
                          }`}
                        >
                          <option value="true">Verified</option>
                          <option value="false">Not Verified</option>
                        </select>
                      </div>
                    </div>

                    {/* Industry Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Industry Name */}
                      <div className="flex items-center space-x-4">
                        <Building2 className="text-gray-500" />
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-2">
                            Industry Name
                          </label>
                          <input
                            disabled
                            type="text"
                            name={`industryName-${index}`}
                            value={industry.name || ""}
                            readOnly
                            className={`w-full p-2 rounded ${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                            } opacity-50`}
                          />
                        </div>
                      </div>

                      {/* Website */}
                      <div className="flex items-center space-x-4">
                        <Globe className="text-gray-500" />
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-2">
                            Website
                          </label>
                          <input
                            disabled
                            type="text"
                            name={`website-${index}`}
                            value={industry.website || ""}
                            readOnly
                            className={`w-full p-2 rounded ${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                            } opacity-50`}
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-center space-x-4">
                        <MapPin className="text-gray-500" />
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            name={`address-${index}`}
                            value={industry.address || ""}
                            readOnly
                            className={`w-full p-2 rounded ${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                            } opacity-50`}
                          />
                        </div>
                      </div>

                      {/* Designation */}
                      <div className="flex items-center space-x-4">
                        <UserCircle2 className="text-gray-500" />
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-2">
                            Designation
                          </label>
                          <input
                            type="text"
                            name={`designation-${index}`}
                            value={industry.designation || ""}
                            readOnly
                            className={`w-full p-2 rounded ${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                            } opacity-50`}
                          />
                        </div>
                      </div>

                      {/* Work Email */}
                      <div className="flex items-center space-x-4">
                        <Mail className="text-gray-500" />
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-2">
                            Work Email
                          </label>
                          <input
                            type="email"
                            name={`workEmail-${index}`}
                            value={industry.workEmail || ""}
                            readOnly
                            className={`w-full p-2 rounded ${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                            } opacity-50`}
                          />
                        </div>
                      </div>

                      {/* Company Contact Number */}
                      <div className="flex items-center space-x-4">
                        <Phone className="text-gray-500" />
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-2">
                            Company Contact Number
                          </label>
                          <input
                            type="text"
                            name={`companyContactNumber-${index}`}
                            value={industry.companyContactNumber || ""}
                            readOnly
                            className={`w-full p-2 rounded ${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                            } opacity-50`}
                          />
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold mb-4 px-6">
                      Verification Documents
                    </h4>

                    {/* Industry Documents */}
                    {industry.verificationDocuments?.length >= 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 px-6">
                        {industry.verificationDocuments.map((doc, index) => (
                          <div
                            key={index}
                            className={`p-4 ${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                            } rounded-lg`}
                          >
                            <p
                              className={`${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-700"
                              }`}
                            >
                              <strong>File Name:</strong> {doc.fileName}
                            </p>
                            <p
                              className={`${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-700"
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
                        ))}
                      </div>
                    ) : (
                      <p
                        className={`${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        No verification documents uploaded.
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyRepScreen;
