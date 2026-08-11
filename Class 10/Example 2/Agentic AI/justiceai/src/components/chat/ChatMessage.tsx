"use client"

import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import TypingIndicator from "./TypingIndicator"
import { UIChatMessage } from "@/hooks/useChat"

interface ChatMessageProps {
  message: UIChatMessage
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs text-indigo-200 text-right mt-1">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%] bg-[#1a1a2e] border border-[#1E1E2E] p-4 rounded-2xl rounded-tl-sm">
        {isStreaming && message.content === "" ? (
          <TypingIndicator />
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
              h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 text-white">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold mt-3 mb-2 text-white">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold mt-2 mb-1 text-indigo-300">{children}</h3>,
              p: ({ children }) => <p className="mb-3 leading-relaxed text-gray-200">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-gray-200">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
              blockquote: ({ children }) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-400 my-2">{children}</blockquote>,
              code: ({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }) => {
                const match = /language-(\w+)/.exec(className || "")
                const language = match ? match[1] : ""
                const code = String(children).replace(/\n$/, "")

                if (!inline && language) {
                  return (
                    <SyntaxHighlighter style={oneDark} language={language} PreTag="div" showLineNumbers>
                      {code}
                    </SyntaxHighlighter>
                  )
                }

                return <code className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-sm">{children}</code>
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
