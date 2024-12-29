import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import { formatDate, formatMessageTime } from "../lib/utils";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  console.log(authUser);
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState(authUser?.fullName || "");

  const handleImageUpload = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      // await updateProfile({ profilePic: base64Image });
    };
  };

  const handleProfileUpdate = async () => {
    const payload = {};
    if (selectedImage) payload.profilePic = selectedImage;
    if (name !== authUser.fullName) payload.fullName = name;

    await updateProfile(payload);
  };

  return (
    <>
      <div className="h-[100%] pt-20 pb-20">
        <div className="max-w-2xl mx-auto p-4 py-8">
          <div className="bg-base-300 rounded-xl p-6 space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">Profile</h1>
              <p className="mt-2">Your profile information</p>
            </div>
            {/* Avatar Upload Section */}

            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={selectedImage || authUser.profilePic || "/avatar.png"}
                  alt="profile"
                  className="size-32 rounded-full object-cover border-4"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                    isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }`}
                >
                  <Camera className="size-5 text-base-200" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              <p className="text-sm text-zinc-400">
                {isUpdatingProfile
                  ? "Uploading..."
                  : "Click the camera icon to upload your photo"}
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <User className="size-4" />
                  Full Name
                </div>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-2.5 bg-base-200 rounded-lg border-b w-full"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Mail className="size-4" />
                  Email Address
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border-b">
                  {authUser?.email}
                </p>
              </div>
            </div>
            <div className="mt-6 bg-base-300 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                  <span>Member Since</span>
                  <div className="flex flex-col min-w-[100px]">
                    <span className="text-right text-[14px]">
                      {formatDate(authUser?.createdAt)}
                    </span>
                    <span className="text-right text-[11px]">
                      {formatMessageTime(authUser?.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                  <span>Last updated profile</span>
                  <div className="flex flex-col min-w-[100px]">
                    <span className="text-right text-[14px]">
                      {formatDate(authUser?.updatedAt)}
                    </span>
                    <span className="text-right text-[11px]">
                      {formatMessageTime(authUser?.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Account Status</span>
                  <div class="flex items-center justify-center">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2 align-middle"></span>
                    <span class="text-green-500">Active</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleProfileUpdate}
              className="btn btn-primary w-full"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
