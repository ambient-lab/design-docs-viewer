import MarkdownContent from '@/components/MarkdownContent';
import { getHomeContent } from '@/lib/docs';

export default async function Home() {
  const contentHtml = await getHomeContent();

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📘 設計書ドキュメント
        </h1>
        <p className="text-gray-600">
          Spring Sample Projectの設計書をMarkdown形式で閲覧できます。
          左側のメニューから各ドキュメントを選択してください。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="text-3xl mb-3">📚</div>
          <h3 className="font-bold text-lg text-blue-800 mb-2">共通</h3>
          <p className="text-sm text-blue-600">
            開発標準、コード設計書、ドメイン定義書、セキュリティ対応表
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="text-3xl mb-3">🖥️</div>
          <h3 className="font-bold text-lg text-green-800 mb-2">
            A1 プロジェクト管理システム
          </h3>
          <p className="text-sm text-green-600">
            画面設計、バッチ設計、帳票設計、ファイルIF、メッセージ設計
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="text-3xl mb-3">🔗</div>
          <h3 className="font-bold text-lg text-purple-800 mb-2">
            B1 顧客管理システム
          </h3>
          <p className="text-sm text-purple-600">
            API設計書、メッセージ設計書、データモデル設計書、テスト仕様書
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <MarkdownContent html={contentHtml} />
      </div>
    </div>
  );
}
