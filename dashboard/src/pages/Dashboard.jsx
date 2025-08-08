import { useEffect, useState } from "react";
import { getLogs } from "../services/api";
import { Search, Filter } from 'lucide-react';
import StatsCards from "../components/StatsCards";
import LogTable from "../components/LogTable";
import ExportButton from "../components/ExportButton";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('all');

  useEffect(() => {
    getLogs()
      .then((res) => setLogs(res.data))
      .catch(console.error);
  }, []);

  const stats = logs.reduce(
    (acc, log) => {
      acc.total++;
      acc[log.result] = (acc[log.result] || 0) + 1;
      return acc;
    },
    { safe: 0, malicious: 0, unknown: 0, total: 0 }
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Overview</h1>
        <p className="text-gray-600">Monitor and analyze your SafeLink scan results</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Logs Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Scan Logs</h2>
            <p className="text-gray-600">Recent URL security scans and their results</p>
          </div>
          <ExportButton logs={logs} />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search URLs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Results</option>
              <option value="safe">Safe</option>
              <option value="malicious">Malicious</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>

        <LogTable logs={logs} searchTerm={searchTerm} filterResult={filterResult} />
      </div>
    </div>
  );
}