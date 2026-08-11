"use client"

import { useState, useRef, useEffect } from "react"

interface ChatInputProps {
  onSend: (message: string) => void
  onStop: () => void
  isLoading: boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, onStop, isLoading, disabled, placeholder = "Ask a question..." }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const scrollH = textareaRef.current.scrollHeight
      const maxH = 6 * 24
      textareaRef.current.style.height = Math.min(scrollH, maxH) + "px"
    }
  }, [value])

  function handleSend() {
    if (!value.trim() || value.length > 10000) return
    onSend(value)
    setValue("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-[#1E1E2E] bg-[#111118] p-4">
      <div className="flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={10000}
          rows={2}
          className="w-full bg-[#0A0A0F] border border-[#1E1E2E] focus:border-indigo-500 focus:outline-none text-gray-100 placeholder-gray-600 rounded-xl p-3 resize-none font-mono text-sm"
        />
        <div className="flex justify-between items-center">
          <span className={`text-xs ${value.length > 9000 ? "text-red-400" : "text-gray-500"}`}>
            {value.length}/10000
          </span>
          <div>
            {isLoading ? (
              <button onClick={onStop} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                ⏹ Stop
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!value.trim() || value.length > 10000 || disabled}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Send ↑
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
