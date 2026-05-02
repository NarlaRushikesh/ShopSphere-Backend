import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Package, ExternalLink, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { fetchOrders } from "../store/orderSlice";
import { format } from "date-fns";

const OrderHistory = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchOrders(user.id));
    }
  }, [dispatch, user]);

  const getStatusConfig = (status) => {
    switch ((status || "").toUpperCase()) {
      case "DELIVERED":
        return { icon: <CheckCircle className="h-4 w-4" />, classes: "bg-green-500/10 text-green-500 border-green-500/30" };
      case "SHIPPED":
        return { icon: <Truck className="h-4 w-4" />, classes: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
      case "CANCELLED":
        return { icon: <XCircle className="h-4 w-4" />, classes: "bg-red-500/10 text-red-400 border-red-500/30" };
      case "PAID":
        return { icon: <CheckCircle className="h-4 w-4" />, classes: "bg-primary/10 text-primary border-primary/30" };
      default:
        return { icon: <Clock className="h-4 w-4" />, classes: "bg-orange-500/10 text-orange-400 border-orange-500/30" };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        <div className="h-8 w-48 bg-secondary rounded animate-pulse"></div>
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-card p-6 rounded-2xl border border-border animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="h-6 w-32 bg-secondary rounded"></div>
              <div className="h-6 w-24 bg-secondary rounded"></div>
            </div>
            <div className="h-20 bg-secondary rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => user && dispatch(fetchOrders(user.id))}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 px-4">
      <h1 className="text-3xl font-bold text-foreground mb-8">My Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-sm">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-muted" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No orders yet</h2>
          <p className="text-muted mb-6">You haven't placed any orders yet. Start shopping!</p>
          <Link to="/products" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium inline-block hover:opacity-90 transition-opacity">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            return (
              <div key={order.orderId} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-secondary/40 p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                    <div>
                      <p className="text-muted uppercase font-semibold text-xs mb-1">Order Placed</p>
                      <p className="font-medium text-foreground">
                        {order.createdAt ? format(new Date(order.createdAt), "MMM dd, yyyy") : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted uppercase font-semibold text-xs mb-1">Total</p>
                      <p className="font-bold text-foreground">₹{order.totalAmount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted uppercase font-semibold text-xs mb-1">Order #</p>
                      <p className="font-medium font-mono text-foreground">{order.orderId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-border pt-4 sm:pt-0">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig.classes}`}>
                      {statusConfig.icon}
                      {order.status || "PENDING"}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 sm:p-6 divide-y divide-border">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      <div className="w-14 h-14 bg-secondary rounded-xl border border-border flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 text-muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 block"
                        >
                          {item.productName || `Product #${item.productId}`}
                        </Link>
                        <p className="text-sm text-muted mt-0.5">
                          Qty: {item.quantity} &nbsp;·&nbsp; ₹{item.price?.toFixed(2)} each
                        </p>
                      </div>
                      <div className="font-bold text-foreground whitespace-nowrap">
                        ₹{(item.price * item.quantity)?.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
