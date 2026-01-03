import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../Components/Table";
import { Clock, Tag } from "lucide-react";
import { motion } from "motion/react";
import { getAllOrders } from "../../slices/orderSlice";
import toast from "react-hot-toast";
import { TableSkeleton } from "../../componets/skeleton/TableSkeleton";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      await dispatch(getAllOrders()).unwrap();
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    }
  };

  const columns = [
    {
      key: "user",
      header: "User",
      render: (o) => (
        <span className="text-white font-medium">{o.user?.name || "-"}</span>
      ),
    },

    {
      key: "plan",
      header: "Plan",
      render: (o) => {
        const planName = o.plan?.name || o.planSnapshot?.name || "Unknown Plan";

        const tier = planName.toLowerCase();

        const tierColorMap = {
          free: "bg-gray-700/30 text-gray-300 border-gray-500/30",
          basic: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          pro: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          premium: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          enterprise: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        };

        const colorClass =
          tierColorMap[tier] ||
          "bg-gray-700/30 text-gray-300 border-gray-600/30";

        return (
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-gray-500" />
            <span
              className={`px-2 py-1 text-xs font-medium rounded-md border ${colorClass}`}
            >
              {planName}
            </span>
          </div>
        );
      },
    },

    {
      key: "amount",
      header: "Amount",
      render: (o) => (
        <span className="text-emerald-300 font-mono">
          ₹{((o.amount || 0) / 100).toFixed(2)}
        </span>
      ),
    },

    {
      key: "status",
      header: "Status",
      render: (o) => {
        const status = o.status?.toLowerCase();

        const styleMap = {
          success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          failed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          refunded: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        };

        const glowDot = {
          success: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
          completed: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
          failed: "bg-rose-500 shadow-[0_0_8px_#f43f5e]",
          pending: "bg-amber-400 shadow-[0_0_8px_#f59e0b]",
          refunded: "bg-blue-400 shadow-[0_0_8px_#3b82f6]",
        };

        return (
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                glowDot[status] || "bg-gray-500"
              }`}
            />
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-md border ${
                styleMap[status] ||
                "bg-gray-700/30 text-gray-300 border-gray-600/30"
              }`}
            >
              {o.status?.toUpperCase()}
            </span>
          </div>
        );
      },
    },

    {
      key: "createdAt",
      header: "Date",
      render: (o) => {
        if (!o.createdAt) return <span className="text-gray-500">-</span>;

        const date = new Date(o.createdAt);
        const formatted = date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const time = date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock size={14} className="text-emerald-400" />
            <span className="text-slate-300">{formatted}</span>
            <span className="text-slate-500 text-xs">({time})</span>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white via-slate-200 to-slate-400 mb-3">
        Orders
      </h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <TableSkeleton columns={columns} rowCount={4} />
        ) : (
          <Table columns={columns} data={orders} isLoading={false} />
        )}

        {!loading && orders.length > 0 && (
          <div className="mt-4 px-6 py-4 border border-white/10 rounded-2xl bg-white/2 backdrop-blur-md flex justify-between items-center text-xs text-gray-500 shadow-xl shadow-black/20">
            <div>
              Total Orders: <span className="text-white">{orders.length}</span>
            </div>
            <div>
              Total Revenue:{" "}
              <span className="text-emerald-400 font-mono">
                ₹
                {(
                  orders.reduce((sum, o) => sum + (o.amount || 0), 0) / 100
                ).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Orders;
