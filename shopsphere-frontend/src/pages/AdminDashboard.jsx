import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  Users,
  PackageSearch,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, sub, iconBg, iconColor }) => (
  <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
      <Icon className={`h-6 w-6 ${iconColor}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-foreground/60">{label}</p>
      <h3 className="text-2xl font-bold text-foreground">{value}</h3>
      <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
        <TrendingUp className="h-3 w-3" /> {sub}
      </p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/dashboard");
      setMetrics(response.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to fetch dashboard metrics", err);
      setError("Could not load dashboard data. Check that all services are running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const formatRevenue = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
          {lastUpdated && (
            <p className="text-sm text-foreground/50 mt-1">Last updated: {lastUpdated}</p>
          )}
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={loading ? "..." : formatRevenue(metrics.totalRevenue)}
          sub="From paid orders"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={loading ? "..." : metrics.totalOrders}
          sub="All time orders"
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
        />
        <StatCard
          icon={PackageSearch}
          label="Active Products"
          value={loading ? "..." : metrics.totalProducts}
          sub="In catalog"
          iconBg="bg-green-500/10"
          iconColor="text-green-400"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={loading ? "..." : metrics.totalUsers}
          sub="Registered accounts"
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
        />
      </div>

      {/* Lower Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/admin/products"
              className="p-4 border border-border rounded-xl hover:bg-secondary transition-colors flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <PackageSearch className="h-5 w-5" />
                </div>
                <ArrowRight className="h-5 w-5 text-foreground/30 group-hover:text-primary transition-colors" />
              </div>
              <span className="font-medium text-foreground">Manage Products</span>
            </Link>
            
            <Link
              to="/admin/orders"
              className="p-4 border border-border rounded-xl hover:bg-secondary transition-colors flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <ArrowRight className="h-5 w-5 text-foreground/30 group-hover:text-primary transition-colors" />
              </div>
              <span className="font-medium text-foreground">View Orders</span>
            </Link>

            <Link
              to="/admin/users"
              className="p-4 border border-border rounded-xl hover:bg-secondary transition-colors flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <ArrowRight className="h-5 w-5 text-foreground/30 group-hover:text-primary transition-colors" />
              </div>
              <span className="font-medium text-foreground">Manage Users</span>
            </Link>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Quick Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-foreground/70 text-sm">Avg. Order Value</span>
              <span className="font-bold text-foreground">
                {loading || metrics.totalOrders === 0
                  ? "N/A"
                  : formatRevenue(metrics.totalRevenue / metrics.totalOrders)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-foreground/70 text-sm">Revenue per User</span>
              <span className="font-bold text-foreground">
                {loading || metrics.totalUsers === 0
                  ? "N/A"
                  : formatRevenue(metrics.totalRevenue / metrics.totalUsers)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-foreground/70 text-sm">Products in Catalog</span>
              <span className="font-bold text-foreground">{loading ? "..." : metrics.totalProducts}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
