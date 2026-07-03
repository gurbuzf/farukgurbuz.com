import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogContent({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-2" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-4 mb-2" {...props} />,
        p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
        li: ({node, ...props}) => <li className="list-disc ml-6" {...props} />,
        code: ({node, inline, className, children, ...props}) =>
          inline ? (
            <code className="bg-gray-100 px-1 py-0.5 rounded" {...props}>{children}</code>
          ) : (
            <pre className="bg-gray-900 text-white p-4 rounded mb-4 overflow-auto">
              <code {...props}>{children}</code>
            </pre>
          )
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
