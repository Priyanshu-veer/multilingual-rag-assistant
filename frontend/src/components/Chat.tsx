import {Send,Loader2,MessageCircle,} from "lucide-react";
import {useEffect,useRef,useState,} from "react";
import ChatMessage from "./ChatMessage";
import {streamChat,} from "../api";
import type {ChatMessage as ChatMessageType,DocumentState,} from "../types";

interface ChatProps {

  documentState:
    DocumentState;

}

export default function Chat({
  documentState,
}: ChatProps) {

  const [
    messages,
    setMessages,
  ] = useState<ChatMessageType[]>([

    {
      id: "welcome",

      role: "assistant",

      content:
        "👋 Welcome! I’m your Assistant. How can I help you today?",
    },

  ]);


  const [
    input,
    setInput,
  ] = useState("");


  const [
    streaming,
    setStreaming,
  ] = useState(false);


  const bottomRef =
    useRef<HTMLDivElement>(null);


  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);


  const documentProcessing =
    documentState.status ===
    "processing";


  async function sendMessage() {

    const query =
      input.trim();

    if (
      !query ||
      streaming ||
      documentProcessing
    ) {
      return;
    }


    setInput("");


    const userMessage: ChatMessageType = {

      id:
        crypto.randomUUID(),

      role: "user",

      content: query,

    };


    const assistantId =
      crypto.randomUUID();


    const assistantMessage:
      ChatMessageType = {

      id: assistantId,

      role: "assistant",

      content: "",

    };


    setMessages(
      previous => [

        ...previous,

        userMessage,

        assistantMessage,

      ]
    );


    setStreaming(true);


    try {

      let fullResponse = "";


      await streamChat(
        query,

        (chunk) => {

          console.log(
            "FRONTEND CHUNK:",
            JSON.stringify(chunk)
          );

          fullResponse += chunk;

          setMessages(previous =>
            previous.map(message =>
              message.id === assistantId
                ? {
                    ...message,
                    content: fullResponse,
                  }
                : message
            )
          );

        }
      );


    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";


      setMessages(
        previous =>

          previous.map(
            item =>

              item.id ===
              assistantId

                ? {
                    ...item,
                    content:
                      `❌ ${message}`,
                  }

                : item
          )
      );


    } finally {

      setStreaming(false);

    }
  }


  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }
  }


  return (
    <main className="chat-area">

      <div className="chat-header">

        <div className="chat-header-icon">
          <MessageCircle size={19} />
        </div>

        <div>

          <div className="chat-title">
            Multilingual Assistant
          </div>

          <div className="chat-status">

            <span className="online-dot" />

            AI assistant

          </div>

        </div>

      </div>


      <div className="messages-container">

        <div className="messages-inner">

          {messages.map(
            message => (

              <ChatMessage
                key={message.id}
                message={message}
              />

            )
          )}


          {streaming &&
            messages[
              messages.length - 1
            ]?.content === "" && (

              <div className="typing-indicator">

                <span />
                <span />
                <span />

              </div>

            )}


          <div
            ref={bottomRef}
          />

        </div>

      </div>


      <div className="chat-input-wrapper">

        <div
          className={`chat-input-box ${
            documentProcessing
              ? "chat-input-disabled"
              : ""
          }`}
        >

          <textarea
            value={input}
            onChange={event =>
              setInput(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            disabled={
              documentProcessing ||
              streaming
            }
            placeholder={
              documentProcessing
                ? "Please wait while your document is processing..."
                : "Ask anything about your documents..."
            }
            rows={1}
          />


          <button
            className="send-button"
            disabled={
              !input.trim() ||
              documentProcessing ||
              streaming
            }
            onClick={sendMessage}
          >

            {streaming ? (

              <Loader2
                size={18}
                className="spin"
              />

            ) : (

              <Send size={18} />

            )}

          </button>

        </div>


        <div className="input-hint">

          Press Enter to send · Shift + Enter for new line

        </div>

      </div>

    </main>
  );
}
