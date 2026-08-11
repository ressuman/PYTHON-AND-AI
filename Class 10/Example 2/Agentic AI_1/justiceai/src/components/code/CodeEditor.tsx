"use client";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target as HTMLTextAreaElement;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newValue = value.slice(0, start) + "  " + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#1E1E2E]">
      <div className="flex items-center justify-between bg-[#111118] px-4 py-2">
        <span className="text-xs font-medium text-gray-400">
          {language || "code"}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste your code here..."
        spellCheck={false}
        className="w-full min-h-[300px] resize-y bg-[#0D0D14] p-4 font-mono text-sm leading-6 text-gray-100 placeholder:text-gray-600 outline-none"
        style={{ fontFamily: "var(--font-mono), monospace" }}
      />
      <div className="flex items-center justify-end border-t border-[#1E1E2E] bg-[#111118] px-4 py-1.5">
        <span className="text-xs text-gray-500">
          {value.length.toLocaleString()} characters
        </span>
      </div>
    </div>
  );
}
