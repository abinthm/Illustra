
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { Menu, Sparkles } from "lucide-react";
import { useChat } from "@/context/ChatContext";

const ChatPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentSession } = useChat();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar isMobileOpen={isSidebarOpen} onToggleMobile={toggleSidebar} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-background border-b border-border p-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-4 lg:hidden"
          >
            <Menu size={20} />
          </Button>
          <div className="flex items-center">
            <Sparkles className="text-primary mr-2 hidden sm:block" size={20} />
            <h1 className="text-xl font-semibold truncate">
              {currentSession ? currentSession.title : "Illustra"}
            </h1>
          </div>
        </header>
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatMessages />
          <ChatInput />
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
