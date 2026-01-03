import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Chart from "../Components/Chart";
import StatsCard from "../Components/StatsCard";
import {
  Loader2,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";
import { getRevenueStats } from "../../slices/orderSlice";
import toast from "react-hot-toast";
import DashboardSkeleton from "../../componets/skeleton/DashboardSkeleton";

const Analytics = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      await dispatch(getRevenueStats()).unwrap();
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch analytics");
    }
  };

  if (loading || !stats) {
    return (
     <DashboardSkeleton />
    );
  }

  const weeklyGrowth =
    stats.weeklyRevenue && stats.totalRevenue
      ? ((stats.weeklyRevenue / (stats.totalRevenue / 52)) * 100 - 100).toFixed(
          1
        )
      : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-300 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-slate-400">
          Comprehensive insights into your platform's performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={`₹${((stats.totalRevenue || 0) / 100).toLocaleString()}`}
          subtitle="All-time earnings"
          icon={<DollarSign className="text-emerald-400" size={24} />}
        />
        <StatsCard
          title="Weekly Revenue"
          value={`₹${((stats.weeklyRevenue || 0) / 100).toLocaleString()}`}
          subtitle={`${weeklyGrowth > 0 ? "+" : ""}${weeklyGrowth}% vs avg`}
          icon={<TrendingUp className="text-cyan-400" size={24} />}
        />
        <StatsCard
          title="Total Orders"
          value={(stats.totalOrders || 0).toLocaleString()}
          subtitle="Completed transactions"
          icon={<ShoppingCart className="text-purple-400" size={24} />}
        />
        <StatsCard
          title="Active Users"
          value={(stats.totalUsers || 0).toLocaleString()}
          subtitle={`${stats.totalAdmins || 0} admins`}
          icon={<Users className="text-orange-400" size={24} />}
        />
      </div>

      <div className="mb-8 p-6 bg-[#0f172a] rounded-xl border border-white/10 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-400" />
          Monthly Revenue Trend
        </h2>
        <Chart monthlyData={stats.monthlyRevenue || {}} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#0f172a] rounded-xl border border-white/10">
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            Average Order Value
          </h3>
          <p className="text-2xl font-bold text-emerald-400">
            ₹
            {stats.totalOrders > 0
              ? (stats.totalRevenue / stats.totalOrders / 100).toFixed(2)
              : "0.00"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Per transaction</p>
        </div>

        <div className="p-6 bg-[#0f172a] rounded-xl border border-white/10">
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            Order Completion Rate
          </h3>
          <p className="text-2xl font-bold text-cyan-400">
            {stats.totalUsers > 0
              ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1)
              : "0"}
            %
          </p>
          <p className="text-xs text-slate-500 mt-1">Orders per user</p>
        </div>

        <div className="p-6 bg-[#0f172a] rounded-xl border border-white/10">
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            Revenue per User
          </h3>
          <p className="text-2xl font-bold text-purple-400">
            ₹
            {stats.totalUsers > 0
              ? (stats.totalRevenue / stats.totalUsers / 100).toFixed(2)
              : "0.00"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Average LTV</p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-[#0f172a] rounded-xl border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">
          Monthly Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Month
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.monthlyRevenue || {}).map(
                ([month, revenue], index, arr) => {
                  const prevRevenue = index > 0 ? arr[index - 1][1] : revenue;
                  const growth = prevRevenue
                    ? (((revenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
                    : 0;

                  return (
                    <tr
                      key={month}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-white">{month}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-mono">
                        ₹{(revenue / 100).toLocaleString()}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          growth >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {growth >= 0 ? "+" : ""}
                        {growth}%
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
