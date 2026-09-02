import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  User,
} from "lucide-react";

import type {
  ChatMessage as ChatMessageType,
} from "../types";

interface Props {

  message:
    ChatMessageType;

}


export default function ChatMessage({
  message,
}: Props) {

  const isUser =
    message.role === "user";


  return (
    <div
      className={`message-row ${
        isUser
          ? "message-row-user"
          : "message-row-assistant"
      }`}
    >

      {!isUser && (

        <div className="message-avatar assistant-avatar">
          <Bot size={17} />
        </div>

      )}


      <div
        className={`message-bubble ${
          isUser
            ? "message-user"
            : "message-assistant"
        }`}
      >

        {message.role === "assistant" ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
            </ReactMarkdown>
        ) : (
            <div>{message.content}</div>
        )}

      </div>


      {isUser && (

        <div className="message-avatar user-avatar">
          <User size={16} />
        </div>

      )}

    </div>
  );
}
