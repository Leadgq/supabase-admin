export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">数据分析</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">查看系统运行数据和统计</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 图表占位 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">用户增长趋势</h3>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400">连接数据库后将显示图表</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">访问量统计</h3>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400">连接数据库后将显示图表</p>
          </div>
        </div>
      </div>
    </div>
  );
}
