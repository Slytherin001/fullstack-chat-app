import React, { useRef, useState, useEffect } from "react";
import { Image, Send, Smile, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import Picker from "emoji-picker-react";
import "./messageInput.css"

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const { selectedUser } = useChatStore();
  const { socket, authUser } = useAuthStore();
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    let typingTimeout;
    if (text.trim()) {
      socket.emit("typing", {
        senderId: authUser._id,
        receiverId: selectedUser._id,
      });

      typingTimeout = setTimeout(() => {
        socket.emit("stopTyping", {
          senderId: authUser._id,
          receiverId: selectedUser._id,
        });
      }, 2000);
    } else {
      socket.emit("stopTyping", {
        senderId: authUser._id,
        receiverId: selectedUser._id,
      });
    }

    return () => clearTimeout(typingTimeout);
  }, [text, authUser, socket, selectedUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    try {
      setImagePreview(false);
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      //clear form
      setText("");
      setImagePreview(null);
      setShowEmoji(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };


  
  

  return (
    <>
      <div className="p-4 w-full">
        {imagePreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}
        {showEmoji && (
          <div className={`absolute bottom-[15%] right-[19%] `}>
            <Picker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <form onSubmit={handleSendMessage}>
          <div className="form-control">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  className={`absolute inset-y-5 left-0 pl-3 flex items-center 
            ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
                  onClick={() => fileInputRef.current.click()}
                >
                  <Image className="size-5 mb-1" />
                </button>
              </div>

              <textarea
                type="text"
                className="input input-bordered w-full pl-14 pr-24 resize-none overflow-y-auto"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                style={{
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  lineHeight: "20px",
                }}
              />

              <button
                type="button"
                onClick={() => setShowEmoji(!showEmoji)}
                className="absolute inset-y-0 right-0 pr-20 hidden sm:block"
              >
                <Smile className="size-5 mb-2" />
              </button>

              <button
                type="submit"
                className={`absolute inset-y-0 right-0 pr-5 flex items-center mb-2 text-primary rounded-lg `}
                disabled={!text.trim() && !imagePreview}
              >
                <Send className="size-5 send-icon" />
              </button>
            </div>
          </div>
        </form>

        {/* <div className="flex-1 flex items-center gap-2">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <button
                  type="button"
                  className={` sm:flex  btn btn-circle sm:text-sm
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
                  onClick={() => fileInputRef.current.click()}
                >
                  <Image size={20} />
                </button>
              </div>
              <input
                type="text"
                className="input input-bordered w-full pl-10"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="hidden sm:flex btn btn-circle text-zinc-400"
            >
              <Smile size={20} />
            </button>
          </div>
          <button
            type="submit"
            className={`btn btn-primary h-10 min-h-0 rounded-sm hidden `}
            disabled={!text.trim() && !imagePreview}
          >
            <Send size={22} />
          </button> */}
      </div>
    </>
  );
};

export default MessageInput;
