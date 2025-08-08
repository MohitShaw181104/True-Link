import { Download } from 'lucide-react';

export default function ExportButton({ logs }) {
  const exportToCSV = () => {
    const headers = ["URL", "Timestamp", "Result", "User ID"];
    const rows = logs.map(log => [log.url, log.timestamp, log.result, log.userId]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scan_logs.csv';
    a.click();
  };

  return (
    <button 
      onClick={exportToCSV}
      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      <Download className="h-4 w-4 mr-2" />
      Export Logs
    </button>
  );
}