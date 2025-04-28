
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface Diagram {
  url: string;
  caption: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  diagram?: Diagram;
  timestamp: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  diagram,
  timestamp,
}) => {
  const isUser = role === "user";
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Enhanced function to format text with markdown-like syntax
  const formatText = (text: string) => {
    // Handle cases where there might be multiple * or ** in the same text
    // This regex captures: 
    // - Bold text (**text**)
    // - Italic text (*text*)
    // - Regular text (everything else)
    const parts = [];
    let lastIndex = 0;
    
    // Process bold text first (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let boldMatch;
    
    while ((boldMatch = boldRegex.exec(text)) !== null) {
      // Add any text before the match
      if (boldMatch.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, boldMatch.index) });
      }
      
      // Add the bold text
      parts.push({ type: 'bold', content: boldMatch[1] });
      
      lastIndex = boldMatch.index + boldMatch[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      
      // Process italic text (*text*) in the remaining text
      const italicParts = [];
      let italicLastIndex = 0;
      const italicRegex = /\*(.*?)\*/g;
      let italicMatch;
      
      while ((italicMatch = italicRegex.exec(remainingText)) !== null) {
        // Add any text before the match
        if (italicMatch.index > italicLastIndex) {
          italicParts.push({ type: 'text', content: remainingText.substring(italicLastIndex, italicMatch.index) });
        }
        
        // Add the italic text
        italicParts.push({ type: 'italic', content: italicMatch[1] });
        
        italicLastIndex = italicMatch.index + italicMatch[0].length;
      }
      
      // Add any remaining text
      if (italicLastIndex < remainingText.length) {
        italicParts.push({ type: 'text', content: remainingText.substring(italicLastIndex) });
      }
      
      // If we processed italic parts, add them; otherwise, add the whole remaining text
      if (italicParts.length > 0) {
        parts.push(...italicParts);
      } else {
        parts.push({ type: 'text', content: remainingText });
      }
    }
    
    // Render the parts
    return parts.map((part, index) => {
      if (part.type === 'bold') {
        return <strong key={index}>{part.content}</strong>;
      } else if (part.type === 'italic') {
        return <em key={index}>{part.content}</em>;
      } else {
        return <span key={index}>{part.content}</span>;
      }
    });
  };

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%]", isUser ? "flex-row-reverse" : "flex-row")}>
        <Avatar 
          className={cn(
            "h-8 w-8 mt-1", 
            isUser ? "ml-3" : "mr-3"
          )}
        >
          <AvatarFallback className={isUser ? "bg-accent" : "bg-primary text-white"}>
            {isUser ? <User className="h-4 w-4 text-accent-foreground" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <div
            className={cn(
              "px-4 py-3",
              isUser ? "chat-message-user" : "chat-message-assistant"
            )}
          >
            <div className="whitespace-pre-wrap">{formatText(content)}</div>
            
            {diagram && (
              <div className="mt-4">
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={diagram.url} 
                    alt={diagram.caption || "Illustration"} 
                    className="w-full object-contain max-h-[300px]" 
                  />
                </div>
                {diagram.caption && (
                  <p className="text-sm mt-2 text-gray-600">
                    {diagram.caption}
                  </p>
                )}
              </div>
            )}
          </div>
          <span className={cn("text-xs text-gray-500 mt-1", isUser ? "text-right mr-1" : "ml-1")}>
            {time}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
