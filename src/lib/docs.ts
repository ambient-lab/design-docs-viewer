import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

const docsDirectory = path.join(process.cwd(), 'docs');

export interface DocCategory {
  id: string;
  name: string;
  docs: DocMeta[];
}

export interface DocMeta {
  slug: string[];
  title: string;
  category: string;
  order: number;
}

export interface DocContent extends DocMeta {
  contentHtml: string;
}

// ドキュメント構造の定義
export const docStructure = [
  {
    id: 'common',
    name: '共通',
    path: '共通',
    docs: [
      { file: '開発標準.md', title: '開発標準', order: 1 },
      { file: 'コード設計書.md', title: 'コード設計書', order: 2 },
      { file: 'ドメイン定義書.md', title: 'ドメイン定義書', order: 3 },
      { file: 'セキュリティ対応表.md', title: 'セキュリティ対応表', order: 4 },
    ],
  },
  {
    id: 'a1',
    name: 'A1_プロジェクト管理システム',
    path: 'A1_プロジェクト管理システム',
    docs: [
      { file: 'README.md', title: 'システム概要', order: 0 },
      { file: '01_画面設計書.md', title: '画面設計書', order: 1 },
      { file: '02_バッチ設計書.md', title: 'バッチ設計書', order: 2 },
      { file: '03_帳票設計書.md', title: '帳票設計書', order: 3 },
      { file: '04_ファイルIF設計書.md', title: 'ファイルIF設計書', order: 4 },
      { file: '05_メッセージ設計書.md', title: 'メッセージ設計書', order: 5 },
      { file: '06_データモデル設計書.md', title: 'データモデル設計書', order: 6 },
      { file: '07_ジョブフロー設計書.md', title: 'ジョブフロー設計書', order: 7 },
      { file: '08_テスト仕様書.md', title: 'テスト仕様書', order: 8 },
    ],
  },
  {
    id: 'b1',
    name: 'B1_顧客管理システム',
    path: 'B1_顧客管理システム',
    docs: [
      { file: 'README.md', title: 'システム概要', order: 0 },
      { file: '01_API設計書.md', title: 'API設計書', order: 1 },
      { file: '02_メッセージ設計書.md', title: 'メッセージ設計書', order: 2 },
      { file: '03_データモデル設計書.md', title: 'データモデル設計書', order: 3 },
      { file: '04_テスト仕様書.md', title: 'テスト仕様書', order: 4 },
    ],
  },
  {
    id: 'auto-generated',
    name: 'ソースコード自動生成',
    path: 'ソースコード自動生成',
    docs: [
      { file: 'README.md', title: '自動生成について', order: 0 },
      { file: '01_システム概要.md', title: 'システム概要', order: 1 },
      { file: '02_画面設計書.md', title: '画面設計書', order: 2 },
      { file: '03_API設計書.md', title: 'API設計書', order: 3 },
      { file: '04_バッチ設計書.md', title: 'バッチ設計書', order: 4 },
      { file: '05_データモデル設計書.md', title: 'データモデル設計書', order: 5 },
      { file: '06_バリデーション設計書.md', title: 'バリデーション設計書', order: 6 },
    ],
  },
  {
    id: 'diff-analysis',
    name: '差分分析',
    path: '差分分析',
    docs: [
      { file: 'README.md', title: '差分分析について', order: 0 },
      { file: '01_差分サマリー.md', title: '差分サマリー', order: 1 },
      { file: '02_抽出可能項目.md', title: '抽出可能項目', order: 2 },
      { file: '03_抽出不可項目.md', title: '抽出不可項目', order: 3 },
      { file: '04_精度評価.md', title: '精度評価', order: 4 },
    ],
  },
];

export function getAllDocSlugs(): { params: { slug: string[] } }[] {
  const slugs: { params: { slug: string[] } }[] = [];

  for (const category of docStructure) {
    for (const doc of category.docs) {
      const fileName = doc.file.replace(/\.md$/, '');
      slugs.push({
        params: {
          slug: [category.id, fileName],
        },
      });
    }
  }

  return slugs;
}

export function getDocCategories(): DocCategory[] {
  return docStructure.map((category) => ({
    id: category.id,
    name: category.name,
    docs: category.docs.map((doc) => ({
      slug: [category.id, doc.file.replace(/\.md$/, '')],
      title: doc.title,
      category: category.name,
      order: doc.order,
    })),
  }));
}

export async function getDocBySlug(slug: string[]): Promise<DocContent | null> {
  // URLデコード処理
  const decodedSlug = slug.map((s) => decodeURIComponent(s));
  const [categoryId, fileName] = decodedSlug;

  const category = docStructure.find((c) => c.id === categoryId);
  if (!category) return null;

  const docMeta = category.docs.find(
    (d) => d.file.replace(/\.md$/, '') === fileName
  );
  if (!docMeta) return null;

  const fullPath = path.join(docsDirectory, category.path, docMeta.file);

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { content } = matter(fileContents);

    const processedContent = await remark()
      .use(gfm)
      .use(html, { sanitize: false })
      .process(content);

    const contentHtml = processedContent.toString();

    return {
      slug: decodedSlug,
      title: docMeta.title,
      category: category.name,
      order: docMeta.order,
      contentHtml,
    };
  } catch {
    return null;
  }
}

export async function getHomeContent(): Promise<string> {
  const fullPath = path.join(docsDirectory, 'README.md');

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { content } = matter(fileContents);

    const processedContent = await remark()
      .use(gfm)
      .use(html, { sanitize: false })
      .process(content);

    return processedContent.toString();
  } catch {
    return '<p>ドキュメントが見つかりません。</p>';
  }
}
