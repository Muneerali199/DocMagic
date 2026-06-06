import ReactMarkdown from 'react-markdown';
import { Letter } from '@/types/letter';

interface LetterPreviewProps {
  letter: Letter;
}

export function LetterPreview({ letter }: LetterPreviewProps) {
  if (!letter) return null;

  // Ensure letter has the expected structure to prevent "Cannot read properties of undefined" errors
  const from = letter.from || {};
  const to = letter.to || {};
  const date = letter.date || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const subject = letter.subject || "";
  const content = letter.content || "";

  return (
    <div className="p-8 max-w-[800px] mx-auto font-serif bg-white text-black">
      {/* Sender Information */}
      <div className="mb-8">
        {from.name && (
          <p className="mb-1 font-semibold">{from.name}</p>
        )}
        {from.address && (
          <p className="text-sm text-gray-700 whitespace-pre-line">{from.address}</p>
        )}
      </div>

      {/* Date */}
      <div className="mb-8">
        <p className="mb-1">{date}</p>
      </div>

      {/* Recipient Information */}
      <div className="mb-8">
        {to.name && (
          <p className="mb-1 font-semibold">{to.name}</p>
        )}
        {to.address && (
          <p className="text-sm text-gray-700 whitespace-pre-line">{to.address}</p>
        )}
      </div>

      {/* Subject Line */}
      {subject && (
        <div className="mb-6">
          <p className="font-semibold">Subject: {subject}</p>
        </div>
      )}

      {/* Letter Content */}
      <div className="text-gray-800 leading-relaxed mobile-markdown prose prose-sm max-w-none prose-headings:font-bold prose-p:mb-4 prose-ul:list-disc prose-ul:pl-4 prose-li:mb-1">
        <ReactMarkdown
          // components={{
          //   p: ({ node, ...props }) => <p className="mb-4 whitespace-pre-wrap" {...props} />
          // }}
          components={{
  p: ({ node, ...props }) => (
    <p className="mb-4 whitespace-pre-wrap leading-7" {...props} />
  ),

  ul: ({ node, ...props }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
  ),

  ol: ({ node, ...props }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
  ),

  li: ({ node, ...props }) => (
    <li className="leading-7" {...props} />
  ),

  h1: ({ node, ...props }) => (
    <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />
  ),

  h2: ({ node, ...props }) => (
    <h2 className="text-xl font-semibold mb-3 mt-5" {...props} />
  ),

  h3: ({ node, ...props }) => (
    <h3 className="text-lg font-semibold mb-2 mt-4" {...props} />
  ),
}}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}