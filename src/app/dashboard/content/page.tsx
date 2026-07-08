export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">内容管理</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">管理文章、页面等内容</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 flex flex-col items-center justify-center text-center">
        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 font-medium">内容管理模块</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          连接数据库后，这里将显示内容列表及管理功能
        </p>
      </div>
    </div>
  );
}
