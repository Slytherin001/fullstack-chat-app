import { format } from "date-fns";

export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date) {
  const ordinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th"; // 4th - 20th
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear().toString().slice(-2);

  return `${day}${ordinalSuffix(day)} ${month} ${year}`;
}

export const formatWhatsAppDate = (dateString) => {
  const messageDate = new Date(dateString);
  const now = new Date();
  const timeDifferenceInMinutes = Math.floor((now - messageDate) / 60000); 

  if (timeDifferenceInMinutes < 1) {
    return "just now";
  }

  const isToday =
    messageDate.getDate() === now.getDate() &&
    messageDate.getMonth() === now.getMonth() &&
    messageDate.getFullYear() === now.getFullYear();

  const isYesterday =
    messageDate.getDate() === now.getDate() - 1 &&
    messageDate.getMonth() === now.getMonth() &&
    messageDate.getFullYear() === now.getFullYear();

  if (isToday) {
    return format(messageDate, "hh:mm a"); 
  }

  if (isYesterday) {
    return "Yesterday";
  }

  return format(messageDate, "MMM d, yyyy"); 
};