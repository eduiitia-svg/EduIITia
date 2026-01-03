import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import StatsCard from "../Components/StatsCard";
import Chart from "../Components/Chart";
import { Loader2 } from "lucide-react";
import { getRevenueStats } from "../../slices/orderSlice";
import toast from "react-hot-toast";
import DashboardSkeleton from "../../componets/skeleton/DashboardSkeleton";

const Dashboard = () => {
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
      toast.error("Failed to fetch dashboard stats");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-300">
        Super Admin Dashboard
      </h1>

      {loading || !stats ? (
      <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Revenue"
              value={`₹${((stats.totalRevenue || 0) / 100).toLocaleString()}`}
              subtitle="+12.5% vs last month"
            />
            <StatsCard
              title="Weekly Revenue"
              value={`₹${((stats.weeklyRevenue || 0) / 100).toLocaleString()}`}
              subtitle="+3.2% vs last week"
            />
            <StatsCard
              title="Total Users"
              value={(stats.totalUsers || 0).toLocaleString()}
              subtitle="Active students"
            />
            <StatsCard
              title="Total Admins"
              value={(stats.totalAdmins || 0).toLocaleString()}
              subtitle="System administrators"
            />
          </div>

          <div className="mt-8 p-6 bg-[#0f172a] rounded-xl border border-white/10 shadow-xl">
            <Chart monthlyData={stats.monthlyRevenue || {}} />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#0f172a] rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">
                Order Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Orders:</span>
                  <span className="text-white font-semibold">
                    {stats.totalOrders || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Avg. Order Value:</span>
                  <span className="text-emerald-400 font-mono">
                    ₹
                    {stats.totalOrders > 0
                      ? (stats.totalRevenue / stats.totalOrders / 100).toFixed(
                          2
                        )
                      : "0.00"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#0f172a] rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">
                User Growth
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Students:</span>
                  <span className="text-white font-semibold">
                    {stats.totalUsers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Admins:</span>
                  <span className="text-cyan-400 font-semibold">
                    {stats.totalAdmins || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
