import { CheckCircle, AlertTriangle, HelpCircle, Activity, TrendingUp } from 'lucide-react';

function StatsCard({ title, value, icon: Icon, color, trend, trendValue }) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {trend && (
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`h-4 w-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
              <span className="text-sm font-medium">{trendValue}</span>
            </div>
            <p className="text-xs text-gray-500">vs last week</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Safe URLs"
        value={stats.safe}
        icon={CheckCircle}
        color="green"
        trend="up"
        trendValue="+12%"
      />
      <StatsCard
        title="Malicious URLs"
        value={stats.malicious}
        icon={AlertTriangle}
        color="red"
        trend="down"
        trendValue="-5%"
      />
      <StatsCard
        title="Unknown URLs"
        value={stats.unknown}
        icon={HelpCircle}
        color="yellow"
        trend="up"
        trendValue="+3%"
      />
      <StatsCard
        title="Total Scans"
        value={stats.total}
        icon={Activity}
        color="blue"
        trend="up"
        trendValue="+8%"
      />
    </div>
  );
}