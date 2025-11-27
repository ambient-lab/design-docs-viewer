import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownContent from '@/components/MarkdownContent';
import { getDocBySlug, getAllDocSlugs, getDocCategories } from '@/lib/docs';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.map((s) => s.params);
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    return {
      title: 'ドキュメントが見つかりません',
    };
  }

  return {
    title: `${doc.title} | ${doc.category} | 設計書ビューア`,
    description: `${doc.category}の${doc.title}を閲覧できます`,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const categories = getDocCategories();
  const currentCategory = categories.find((c) => c.id === slug[0]);

  // 前後のドキュメントを取得
  const allDocs = currentCategory?.docs || [];
  const currentIndex = allDocs.findIndex(
    (d) => d.slug.join('/') === slug.join('/')
  );
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc =
    currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  return (
    <div className="p-8 max-w-5xl">
      {/* パンくずリスト */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500">
          <li>
            <Link href="/" className="hover:text-blue-600 transition-colors">
              ホーム
            </Link>
          </li>
          <li className="text-gray-300">/</li>
          <li className="text-gray-700">{doc.category}</li>
          <li className="text-gray-300">/</li>
          <li className="text-blue-600 font-medium">{doc.title}</li>
        </ol>
      </nav>

      {/* ドキュメントヘッダー */}
      <header className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            {doc.category}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">{doc.title}</h1>
      </header>

      {/* ドキュメント本文 */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <MarkdownContent html={doc.contentHtml} />
      </div>

      {/* ナビゲーション */}
      <nav className="flex justify-between items-center pt-6 border-t border-gray-200">
        {prevDoc ? (
          <Link
            href={`/docs/${prevDoc.slug.join('/')}`}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm">
              <span className="block text-xs text-gray-400">前へ</span>
              {prevDoc.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextDoc ? (
          <Link
            href={`/docs/${nextDoc.slug.join('/')}`}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group text-right"
          >
            <span className="text-sm">
              <span className="block text-xs text-gray-400">次へ</span>
              {nextDoc.title}
            </span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}
