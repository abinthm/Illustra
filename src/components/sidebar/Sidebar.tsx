
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, Plus, Menu, X, MessageCircle, Sparkles } from "lucide-react";

interface SidebarProps {
  isMobileOpen: boolean;
  onToggleMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onToggleMobile }) => {
  const { sessions, createSession, selectSession, currentSession, isLoadingSessions } = useChat();
  const { user, logout } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");

  const handleCreateSession = async () => {
    const title = newSessionTitle.trim() || "New Conversation";
    await createSession(title);
    setNewSessionTitle("");
    setIsCreateDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden ${
          isMobileOpen ? "block" : "hidden"
        }`}
        onClick={onToggleMobile}
      />
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-sidebar-border p-4">
            <div className="flex items-center">
              <Sparkles className="text-primary mr-2" size={24} />
              <h2 className="text-xl font-semibold text-sidebar-foreground">Illustra</h2>
            </div>
            <button
              onClick={onToggleMobile}
              className="rounded-md p-1 hover:bg-sidebar-accent lg:hidden"
            >
              <X size={20} className="text-sidebar-foreground" />
            </button>
          </div>

          <div className="p-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus size={18} className="mr-2" /> New Chat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Chat</DialogTitle>
                </DialogHeader>
                <Input
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  placeholder="Enter chat title (optional)"
                  className="my-4"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSession}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="flex-1 px-4 py-2">
            {isLoadingSessions ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-md bg-sidebar-accent animate-pulse"></div>
                ))}
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => {
                      selectSession(session.id);
                      if (isMobileOpen) onToggleMobile();
                    }}
                    className={`w-full rounded-md p-3 text-left transition-colors ${
                      currentSession?.id === session.id
                        ? "bg-primary/20 text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle size={18} />
                      <div className="flex-1 truncate">
                        <div className="font-medium truncate">{session.title}</div>
                        <div className="text-xs opacity-70">
                          {formatDate(session.updated_at)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-sidebar-foreground/60 py-8">
                No chat sessions yet
              </div>
            )}
          </ScrollArea>

          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="truncate">
                <p className="font-medium truncate text-sidebar-foreground">{user?.username}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="text-sidebar-foreground">
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
