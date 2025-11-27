interface MarkdownContentProps {
  html: string;
}

export default function MarkdownContent({ html }: MarkdownContentProps) {
  return (
    <article
      className="prose prose-slate max-w-none
        prose-headings:font-bold prose-headings:text-gray-800
        prose-h1:text-3xl prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-4 prose-h1:mb-6
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-blue-800
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-gray-700
        prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2
        prose-p:text-gray-600 prose-p:leading-relaxed
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-pink-600 prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:overflow-x-auto
        prose-table:border-collapse prose-table:w-full
        prose-th:bg-gray-100 prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
        prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2
        prose-tr:even:bg-gray-50
        prose-ul:list-disc prose-ul:pl-6
        prose-ol:list-decimal prose-ol:pl-6
        prose-li:my-1
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic
        prose-hr:border-gray-200 prose-hr:my-8
        prose-img:rounded-lg prose-img:shadow-md
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
