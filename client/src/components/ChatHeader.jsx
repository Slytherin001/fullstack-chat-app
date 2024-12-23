import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const ChatHeader = () => {
  const [isTyping, setIsTyping] = useState(false);
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, socket } = useAuthStore();

  useEffect(() => {
    const handleTyping = ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, selectedUser]);

  return (
    <>
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}

            <div className="relative mx-auto lg:mx-0">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(selectedUser?._id) ? (
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 
               rounded-full ring-2 ring-zinc-900"
                />
              ) : (
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 bg-gray-800 
               rounded-full ring-2 ring-zinc-900 flex items-center justify-center"
                >
                  <span className="text-gray-400 text-[8px] font-bold leading-none">
                    <X className="size-3"/>
                  </span>
                </span>
              )}
            </div>

            {/* User info */}
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className={`text-sm ${onlineUsers.includes(selectedUser._id)?"text-green-500":"text-base"}`}>
                {isTyping
                  ? "Typing..."
                  : onlineUsers.includes(selectedUser._id)
                  ? "Online"
                  : "Offline"}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
