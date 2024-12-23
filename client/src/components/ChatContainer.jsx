import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./Skeleton/MessageSkeleton";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils.js";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessageLoading,
    selectedUser,
    subscribeToMessages,
    unSubscribeToMessages,
    subscribeToTyping,
    unSubscribeFromTyping,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    subscribeToTyping();
    return () => unSubscribeFromTyping(); 
  }, [subscribeToTyping, unSubscribeFromTyping]);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unSubscribeToMessages();
  }, [selectedUser._id, getMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessageLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${
                message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
              ref={messageEndRef}
            >
              <div className=" chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              <div
                className={`chat-bubble ${
                  message.senderId === authUser._id
                    ? "bg-primary text-primary-content"
                    : "bg-base-200"
                } flex flex-col break-words min-w-[100px] max-w-[400px]`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && (
                  <p
                    className={`whitespace-normal break-words ${
                      message.senderId === authUser._id
                        ? "text-primary-content"
                        : "text-base-content"
                    }`}
                  >
                    {message.text}
                  </p>
                )}
                <p
                  className={`
                            text-[12px] mt-1
                           
                           ${
                             message.senderId === authUser._id
                               ? "text-right text-primary-content/70"
                               : "text-left text-base-content/70"
                           }
                            
                          `}
                >
                  {formatMessageTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <MessageInput />
      </div>
    </>
  );
};

export default ChatContainer;
