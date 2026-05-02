import { useEffect, useState } from "react";
import { Search, Eye, Filter } from "lucide-react";
import api from "../services/api";
import { toast } from "react-toastify";
import { format } from "date-fns";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // NOTE: Assuming the backend has an endpoint to get all orders for admin.
      // Using a generic `/orders` here. If it doesn't exist, this might need an update in order-service.
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (error) {
      toast.error(
        "Failed to fetch orders. Endpoint might not exist on backend yet.",
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.orderId && order.orderId.toString().includes(searchQuery)) ||
      (order.userId && order.userId.toString().includes(searchQuery));
    const matchesStatus =
      statusFilter === "ALL" || (order.status || "PENDING").toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            placeholder="Search by order ID or User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-secondary/50"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none flex items-center gap-2 pl-10 pr-8 py-2 bg-card border border-border text-foreground/80 rounded-lg hover:bg-secondary transition-colors font-medium focus:ring-primary focus:border-primary cursor-pointer outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CREATED">Created</option>
            <option value="PAID">Paid</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border text-sm font-semibold text-muted uppercase tracking-wider">
                <th className="p-4 pl-6">Order ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4 pl-6 font-mono text-sm">#{order.orderId}</td>
                    <td className="p-4 text-sm text-foreground/70">
                      {order.createdAt
                        ? format(
                            new Date(order.createdAt),
                            "MMM dd, yyyy HH:mm",
                          )
                        : "N/A"}
                    </td>
                    <td className="p-4 text-sm font-medium">{order.userId}</td>
                    <td className="p-4 text-sm">
                      {order.items?.length || 0} items
                    </td>
                    <td className="p-4 font-bold">
                      ₹{order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}
                      >
                        {order.status || "PENDING"}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-primary hover:bg-primary/10 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Order Details #{selectedOrder.orderId}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-muted hover:text-foreground/80 font-bold text-xl"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/30 p-4 rounded-xl border border-border">
                <div>
                  <p className="text-muted mb-1">Date</p>
                  <p className="font-medium">
                    {selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted mb-1">User</p>
                  <p className="font-medium">{selectedOrder.userId}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">Status</p>
                  <p className="font-medium mt-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-muted mb-1">Total Amount</p>
                  <p className="font-bold text-primary text-base">₹{selectedOrder.totalAmount?.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Items Purchased</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                      <div>
                        <p className="font-semibold text-foreground">Product #{item.productId}</p>
                        <p className="text-sm text-muted">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

