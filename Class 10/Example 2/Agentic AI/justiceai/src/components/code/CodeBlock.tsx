"use client"

import { useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg overflow-hidden border border-[#1E1E2E] my-3">
      {filename && <div className="bg-[#0D0D14] px-4 py-1 text-xs text-gray-500 border-b border-[#1E1E2E]">{filename}</div>}
      <div className="flex justify-between items-center px-4 py-2 bg-[#0D0D14]">
        <span className="text-xs font-mono text-indigo-400 uppercase">{language || "code"}</span>
        <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-white transition-colors">
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || "text"}
        PreTag="div"
        showLineNumbers
        customStyle={{ margin: 0, borderRadius: 0 }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
