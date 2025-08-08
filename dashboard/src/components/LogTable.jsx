import { Search, CheckCircle, AlertTriangle, HelpCircle, Clock, Users } from 'lucide-react';

export default function LogTable({ logs, searchTerm, filterResult }) {
  
  const getResultBadge = (result) => {
    const badges = {
      safe: 'bg-green-100 text-green-800 border-green-200',
      malicious: 'bg-red-100 text-red-800 border-red-200',
      unknown: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    const icons = {
      safe: CheckCircle,
      malicious: AlertTriangle,
      unknown: HelpCircle
    };
    
    const Icon = icons[result];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badges[result]}`}>
        <Icon className="h-3 w-3 mr-1" />
        {result.charAt(0).toUpperCase() + result.slice(1)}
      </span>
    );
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterResult === 'all' || log.result === filterResult;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Result
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={log.url}>
                    {log.url}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getResultBadge(log.result)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {log.userId}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No logs found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}