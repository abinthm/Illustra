
import React, { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, Send } from "lucide-react";
import { useChat } from "@/context/ChatContext";

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const { sendMessage, isSending, currentSession } = useChat();

  const handleSendMessage = async () => {
    if (message.trim() === "" || isSending) return;
    
    try {
      await sendMessage(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full bg-background border-t border-border p-4">
      <div className="flex items-end gap-2 chat-container">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Illustra anything..."
          className="resize-none min-h-[60px] flex-grow rounded-xl"
          disabled={isSending || !currentSession}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isSending || message.trim() === "" || !currentSession}
          className="h-[60px] w-[60px] rounded-full p-0 flex items-center justify-center"
        >
          {isSending ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      {!currentSession && (
        <p className="text-center text-sm text-gray-500 mt-2 chat-container">
          Create a new chat session to start the conversation
        </p>
      )}
    </div>
  );
};

export default ChatInput;
