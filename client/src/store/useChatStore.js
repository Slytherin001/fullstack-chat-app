import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,
  setTyping: (isTyping) => set({ isTyping }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const resp = await axiosInstance.get("/messages/users");
      set({ users: resp.data.usersWithLastMessage || [] });
    } catch (error) {
      toast.error(error.response?.data?.message);
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },
  updateUnreadCount: (senderId, unreadCount) => {
    set((state) => ({
      users: state.users.map((user) =>
        user._id === senderId ? { ...user, unreadCount } : user
      ),
    }));
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const resp = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: resp.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages,users } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({
        messages: [...messages, res.data],
        users: users.map((user) =>
          user._id === selectedUser._id
            ? { ...user, lastMessage: res.data }
            : user
        ),
      });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unSubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  subscribeToTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    socket.on("typing", (senderId) => {
      if (senderId === selectedUser._id) {
        set({ isTyping: true });
      }
    });

    socket.on("stopTyping", (senderId) => {
      if (senderId === selectedUser._id) {
        set({ isTyping: false });
      }
    });
  },
  unSubscribeFromTyping: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("typing");
    socket.off("stopTyping");
  },

  subscribeToLastMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("updateLastMessage", ({ senderId, receiverId, newMessage }) => {
      const { users,selectedUser } = get();
      const loggedInUserId = useAuthStore.getState().authUser._id;

      const updatedUsers = users.map((user) => {
        if (user._id === senderId || user._id === receiverId) {
          return {
            ...user,
            lastMessage: newMessage,
            unreadCount:
              senderId === user._id && selectedUser?._id !== user._id
                ? (user.unreadCount || 0) + 1
                : user.unreadCount,
          };
        }
        return user;
      });

      // Sort users by lastMessage.createdAt
      updatedUsers.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt || 0;
        const dateB = b.lastMessage?.createdAt || 0;
        return new Date(dateB) - new Date(dateA);
      });

      set({ users: updatedUsers });
    });
    socket.on("newMessage", (message) => {
      const { senderId } = message;
      set((state) => {
        const updatedUsers = state.users.map((user) => {
          if (user._id === senderId) {
            return {
              ...user,
              unreadCount: (user.unreadCount || 0) + 1,
              lastMessage: message,
            };
          }
          return user;
        });

        return { users: updatedUsers };
      });
    });
  },

  unSubscribeFromLastMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("updateLastMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    get().markMessageAsRead(selectedUser._id); // Reset unread count
  },
  markMessageAsRead: async (userId) => {
    try {
      await axiosInstance.post(`/messages/markAsRead/${userId}`);

      // Update state only after marking message as read on the backend
      set((state) => ({
        users: state.users.map((user) =>
          user._id === userId
            ? { ...user, lastMessage: { ...user.lastMessage, read: true } }
            : user
        ),
      }));
    } catch (error) {
      console.error("Error in marking message as read:", error);
    }
  },
}));
