import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./Skeleton/SidebarSkeleton";
import { Image, Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import {
  formatDate,
  formatMessageTime,
  formatWhatsAppDate,
} from "../lib/utils";
import { axiosInstance } from "../lib/axios";
import axios from "axios";

const Sidebar = () => {
  const [typingUsers, setTypingUsers] = useState({});
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    subscribeToLastMessages,
    unSubscribeFromLastMessages,
    markMessageAsRead,
    updateUnreadCount,
  } = useChatStore();

  console.log(users);

  const { onlineUsers, authUser, socket } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleTyping = ({ senderId }) => {
      setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
    };

    const handleStopTyping = ({ senderId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[senderId];
        return updated;
      });
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, markMessageAsRead]);

  useEffect(() => {
    const handleMarkAsRead = ({ senderId }) => {
      markMessageAsRead(senderId);
    };

    socket.on("markAsRead", handleMarkAsRead);

    return () => {
      socket.off("markAsRead", handleMarkAsRead);
    };
  }, [socket, markMessageAsRead]);

  useEffect(() => {
    getUsers();
    subscribeToLastMessages();

    return () => {
      unSubscribeFromLastMessages();
    };
  }, [getUsers, subscribeToLastMessages, unSubscribeFromLastMessages]);

  useEffect(() => {
    getUsers();

    const handleUnreadCountUpdate = ({ senderId, unreadCount }) => {
      updateUnreadCount(senderId, unreadCount);
    };

    socket.on("unreadCountUpdate", handleUnreadCountUpdate);

    return () => {
      socket.off("unreadCountUpdate", handleUnreadCountUpdate);
    };
  }, [getUsers, socket, updateUnreadCount]);

  // const handleConversationClick = async (user) => {
  //   setSelectedUser(user);
  //   if (user?.lastMessage?.read === false) {
  //     await useChatStore.getState().markMessageAsRead(user._id);
  //     await useChatStore.getState().getUsers();
  //   }
  // };

  const handleConversationClick = async (user) => {
    const { markMessageAsRead, getUsers, setSelectedUser, updateUnreadCount } =
      useChatStore.getState();

    // Set the selected user
    setSelectedUser(user);

    // Check if there are unread messages
    if (user?.unreadCount > 0) {
      // Mark messages as read in the backend
      await markMessageAsRead(user._id);

      // Optimistically update the unread count in the store without refreshing the entire user list
      updateUnreadCount(user._id, 0);
    }
  };

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
        <div className="border-b border-base-300 w-full p-5">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>

          <div className="mt-3 hidden lg:flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online users</span>
            </label>
            <span className="text-xs text-zinc-500">
              ({onlineUsers.length - 1} online)
            </span>
          </div>
        </div>

        <div className="overflow-y-auto w-full py-3">
          {filteredUsers.map((user) => {
            return (
              <button
                key={user._id}
                onClick={() => handleConversationClick(user)}
                className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-base-300 transition-colors 
                  ${
                    selectedUser?._id === user._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  } 
                `}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.name}
                    className="size-12 object-cover rounded-full"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span
                      className="absolute bottom-0 right-0 size-3 bg-green-500
                      rounded-full ring-2 ring-zinc-900"
                    />
                  )}
                </div>

                <div className="hidden lg:block text-left min-w-0">
                  <div
                    className={`flex items-center justify-between w-[200px] `}
                  >
                    <div
                      className={`font-${
                        user.lastMessage?.read === false &&
                        user.lastMessage?.senderId !== authUser._id
                          ? "bold"
                          : "normal"
                      }`}
                    >
                      {user.fullName}
                    </div>
                    <div
                      className={`text-xs font-${
                        user.lastMessage?.read === false &&
                        user.lastMessage?.senderId !== authUser._id
                          ? "bold"
                          : "normal"
                      } ${
                        user.lastMessage?.createdAt &&
                        formatWhatsAppDate(user.lastMessage.createdAt) ===
                          "just now" &&
                        user.lastMessage.senderId !== authUser._id
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      {user.lastMessage?.createdAt &&
                      user.lastMessage.senderId !== authUser._id
                        ? formatWhatsAppDate(user.lastMessage.createdAt)
                        : ""}
                    </div>
                  </div>
                  <div
                    className={`text-sm flex items-center justify-between text-gray-500 truncate overflow-hidden whitespace-nowrap w-[200px] mt-0.5 font-${
                      user.lastMessage?.read === false &&
                      user.lastMessage?.senderId !== authUser._id
                        ? "bold"
                        : "normal"
                    }`}
                  >
                    {typingUsers[user._id] ? (
                      <>
                        <div className="text-sm font-medium text-green-500">
                          Typing...
                        </div>
                      </>
                    ) : (user.lastMessage && user.lastMessage.text) ||
                      user.lastMessage?.image ? (
                      // Handle text/image from other user
                      user.lastMessage.senderId === authUser._id ? (
                        user.lastMessage.image ? (
                          <div className="flex items-center gap-1">
                            <span className="leading-none">You:</span>
                            <Image size={15} />
                            <span>Image</span>
                          </div>
                        ) : (
                          <div className="leading-none gap-1">
                            <span className="leading-none">You: </span>
                            <span>{user.lastMessage.text}</span>
                          </div>
                        )
                      ) : user.lastMessage.image ? (
                        <div className="flex items-center gap-1">
                          <Image size={15} />
                          <span>Image</span>
                        </div>
                      ) : user.lastMessage.text ? (
                        user.lastMessage.text
                      ) : null
                    ) : (
                      // This fallback handles the "No messages yet" case
                      "No messages yet"
                    )}
                    {user.unreadCount > 0 && (
                      <span className="flex items-center justify-center bg-green-500 text-white text-sm font-semibold rounded-full h-5 w-5">
                        {user.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4">
              No online users
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
