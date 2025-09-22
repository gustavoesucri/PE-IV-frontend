import { useState, useEffect } from "react";

// Mude para exportação padrão
const useMenu = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleNotifications = () => setNotificationsOpen(prev => !prev);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (sidebarOpen) setNotificationsOpen(false);
  }, [sidebarOpen]);

  return {
    sidebarOpen,
    notificationsOpen,
    toggleSidebar,
    toggleNotifications,
    closeSidebar,
    setNotificationsOpen
  };
};

// Exportação padrão
export default useMenu;