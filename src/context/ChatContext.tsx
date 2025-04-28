import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { API_CONFIG } from "@/config/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  diagram?: {
    url: string;
    caption: string;
  };
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: Message[];
  isSending: boolean;
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  sendMessage: (content: string) => Promise<void>;
  createSession: (title: string) => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Storage keys for local persistence
const STORAGE_KEY_SESSION = "last_selected_session";
const STORAGE_KEY_SESSIONS = "chat_sessions";
const STORAGE_KEY_MESSAGES_PREFIX = "chat_messages_";

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const API_URL = API_CONFIG.baseURL;

  // Load sessions when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      refreshSessions();
    }
  }, [isAuthenticated, token]);

  // Load sessions from localStorage when offline or API fails
  useEffect(() => {
    if (!sessions.length) {
      const storedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (storedSessions) {
        try {
          const parsedSessions = JSON.parse(storedSessions);
          if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
            console.log("Loaded sessions from localStorage:", parsedSessions);
            setSessions(parsedSessions);
          }
        } catch (error) {
          console.error("Error parsing stored sessions:", error);
        }
      }
    }
  }, []);

  // Attempt to restore the last selected session
  useEffect(() => {
    const restoreLastSession = async () => {
      if (sessions.length > 0) {
        const lastSessionId = localStorage.getItem(STORAGE_KEY_SESSION);
        
        // If there's a stored session ID, try to select it
        if (lastSessionId) {
          const sessionExists = sessions.some(s => s.id === lastSessionId);
          if (sessionExists) {
            await selectSession(lastSessionId);
            return;
          }
        }
        
        // Default to first session if no stored session or stored session not found
        setCurrentSession(sessions[0]);
        localStorage.setItem(STORAGE_KEY_SESSION, sessions[0].id);
        await loadMessages(sessions[0].id);
      }
    };

    if (sessions.length > 0 && !currentSession) {
      restoreLastSession();
    }
  }, [sessions]);

  // Store sessions in localStorage when they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    }
  }, [sessions]);

  const refreshSessions = async () => {
    if (!token) return;
    
    setIsLoadingSessions(true);
    try {
      const response = await fetch(`${API_URL}/chat/sessions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        console.log("Received HTML response instead of JSON");
        toast.error("API connection issue. Using locally stored data.");
        setIsLoadingSessions(false);
        return;
      }

      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load chat sessions. Using locally stored data.");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const createSession = async (title: string) => {
    if (!token) return;
    
    try {
      // Create a temporary local session while waiting for API
      const tempId = `temp-${Date.now()}`;
      const tempSession: ChatSession = {
        id: tempId,
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setSessions(prev => [tempSession, ...prev]);
      setCurrentSession(tempSession);
      localStorage.setItem(STORAGE_KEY_SESSION, tempId);
      setMessages([]);
      
      const response = await fetch(`${API_URL}/chat/sessions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        console.log("Received HTML response instead of JSON");
        toast.info("Working in offline mode. Session will be synced when connection is restored.");
        return;
      }

      const newSession = await response.json();
      
      // Replace temp session with real one
      setSessions(prev => [
        newSession, 
        ...prev.filter(s => s.id !== tempId)
      ]);
      
      // Set as current session and save to localStorage
      setCurrentSession(newSession);
      localStorage.setItem(STORAGE_KEY_SESSION, newSession.id);
      
      toast.success("New chat session created");
    } catch (error) {
      console.error("Error creating session:", error);
      toast.info("Session created in offline mode.");
    }
  };

  const selectSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      // Save the selected session ID to localStorage
      localStorage.setItem(STORAGE_KEY_SESSION, sessionId);
      await loadMessages(sessionId);
    }
  };

  const loadMessages = async (sessionId: string) => {
    setIsLoadingMessages(true);
    
    // First try to load from localStorage
    const storageKey = `${STORAGE_KEY_MESSAGES_PREFIX}${sessionId}`;
    const storedMessages = localStorage.getItem(storageKey);
    
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          console.log("Loaded messages from localStorage:", parsedMessages);
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error("Error parsing stored messages:", error);
      }
    }
    
    // Then try to load from API
    if (!token) {
      setIsLoadingMessages(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/chat/history/${sessionId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch message history");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        console.log("Received HTML response instead of JSON");
        toast.info("Using locally stored messages.");
        setIsLoadingMessages(false);
        return;
      }

      const data = await response.json();
      
      // Ensure data is an array and all messages have required fields
      const validMessages = Array.isArray(data) 
        ? data.filter(msg => msg && msg.role && msg.content)
        : [];
        
      setMessages(validMessages);
      
      // Store messages in localStorage
      localStorage.setItem(storageKey, JSON.stringify(validMessages));
      
      // Debug logging
      console.log("Loaded messages for session:", sessionId, validMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.info("Using locally stored messages.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!token || !currentSession) {
      if (!currentSession) {
        await createSession("New Conversation");
        return sendMessage(content);
      }
      return;
    }

    setIsSending(true);
    
    const tempId = `temp-${Date.now()}`;
    const tempUserMessage: Message = {
      id: tempId,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    
    // Add message to state
    const newMessages = [...messages, tempUserMessage];
    setMessages(newMessages);
    
    // Store in localStorage even before API response
    const storageKey = `${STORAGE_KEY_MESSAGES_PREFIX}${currentSession.id}`;
    localStorage.setItem(storageKey, JSON.stringify(newMessages));

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: currentSession.id,
          prompt: content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        console.log("Received HTML response instead of JSON");
        toast.info("Message saved locally. Will sync when connection is restored.");
        
        // Keep the temp message but mark as synced
        const updatedUserMessage = {
          ...tempUserMessage,
          id: `user-${Date.now()}`
        };
        
        setMessages(prev => 
          prev.map(msg => msg.id === tempId ? updatedUserMessage : msg)
        );
        
        // Update localStorage
        const updatedMessages = messages.map(msg => 
          msg.id === tempId ? updatedUserMessage : msg
        );
        localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
        
        setIsSending(false);
        return;
      }

      const data = await response.json();
      console.log("Received chat response:", data);
      
      if (data.user_message || data.assistant_message) {
        const userMessage = data.user_message || null;
        const assistantMessage = data.assistant_message || null;
        
        const updatedMessages = messages.filter(msg => msg.id !== tempId);
        if (userMessage) updatedMessages.push(userMessage);
        if (assistantMessage) updatedMessages.push(assistantMessage);
        
        setMessages(updatedMessages);
        localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
      } else if (data.response) {
        const assistantMessage: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.response,
          timestamp: new Date().toISOString(),
          ...(data.diagram_path && {
            diagram: {
              url: data.diagram_path,
              caption: data.diagram_path.split('/').pop() || "Diagram"
            }
          })
        };
        
        const updatedUserMessage = {
          ...tempUserMessage,
          id: `user-${Date.now()}`
        };
        
        const updatedMessages = [
          ...messages.filter(msg => msg.id !== tempId),
          updatedUserMessage,
          assistantMessage
        ];
        
        setMessages(updatedMessages);
        localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
      }
      
      refreshSessions();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Message saved locally.");
      
      // Keep the temp message but mark as local-only
      const updatedUserMessage = {
        ...tempUserMessage,
        id: `local-user-${Date.now()}`
      };
      
      const updatedMessages = messages.map(msg => 
        msg.id === tempId ? updatedUserMessage : msg
      );
      
      setMessages(updatedMessages);
      localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSession,
        messages,
        isSending,
        isLoadingSessions,
        isLoadingMessages,
        sendMessage,
        createSession,
        selectSession,
        refreshSessions,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
