'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { DocCategory } from '@/lib/docs';

interface SidebarProps {
  categories: DocCategory[];
}

export default function Sidebar({ categories }: SidebarProps) {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<string[]>(
    categories.map((c) => c.id)
  );

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <aside className="w-72 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto fixed left-0 top-0">
      <div className="p-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="font-bold text-lg text-gray-800">設計書ビューア</span>
        </Link>
      </div>

      <nav className="p-4">
        <Link
          href="/"
          className={`block px-3 py-2 rounded-md mb-4 transition-colors ${
            pathname === '/'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🏠 ホーム
        </Link>

        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex items-center justify-between w-full px-3 py-2 text-left font-semibold text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="flex items-center gap-2">
                {category.id === 'common' && '📚'}
                {category.id === 'a1' && '🖥️'}
                {category.id === 'b1' && '🔗'}
                <span className="text-sm">{category.name}</span>
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  openCategories.includes(category.id) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openCategories.includes(category.id) && (
              <ul className="mt-1 ml-4 border-l border-gray-200">
                {category.docs.map((doc) => {
                  const href = `/docs/${doc.slug.join('/')}`;
                  const isActive = pathname === href;

                  return (
                    <li key={doc.slug.join('/')}>
                      <Link
                        href={href}
                        className={`block px-3 py-1.5 text-sm transition-colors ${
                          isActive
                            ? 'text-blue-700 font-medium bg-blue-50 border-l-2 border-blue-500 -ml-px'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {doc.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
