
import React, { useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import ChatMessage from "./ChatMessage";
import { Skeleton } from "@/components/ui/skeleton";

const ChatMessages: React.FC = () => {
  const { messages, isLoadingMessages, currentSession } = useChat();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Debug messages in development
  useEffect(() => {
    console.log("Current messages state:", messages);
  }, [messages]);

  if (isLoadingMessages) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-container">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <h3 className="text-xl font-medium text-gray-700">No conversation selected</h3>
          <p className="text-sm text-gray-500">
            Select or create a chat session to start the conversation.
          </p>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <h3 className="text-xl font-medium text-gray-700">Start a New Conversation</h3>
          <p className="text-sm text-gray-500">
            Ask me anything and I'll create beautiful illustrations for you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-6 px-4 md:px-0">
      <div className="chat-container space-y-6">
        {messages
          .filter(message => message && message.role && message.content)
          .map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              diagram={message.diagram}
              timestamp={message.timestamp}
            />
          ))}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
