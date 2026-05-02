import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { CreditCard, Truck, CheckCircle, ArrowLeft } from "lucide-react";
import { createOrder, placeOrderFromCart } from "../store/orderSlice";
import { clearCart } from "../store/cartSlice";
import { toast } from "react-toastify";
import api from "../services/api";

const Checkout = () => {
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.orders);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cvv: "",
    nameOnCard: "",
  });

  const [paymentErrors, setPaymentErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [upiId, setUpiId] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (name === "expiryDate") {
      formattedValue = formatExpiryDate(value);
    } else if (name === "cvv") {
      formattedValue = value.replace(/[^0-9]/gi, "").substring(0, 4);
    }
    
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    
    if (paymentErrors[name]) {
      setPaymentErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePayment = () => {
    if (paymentMethod === "CREDIT_CARD") {
      const errors = {};
      if (formData.cardNumber.replace(/\s+/g, "").length !== 16) {
        errors.cardNumber = "Card number must be 16 digits";
      }
      if (formData.expiryDate.length !== 5) {
        errors.expiryDate = "Invalid expiry date";
      }
      if (formData.cvv.length < 3) {
        errors.cvv = "CVV must be 3 or 4 digits";
      }
      if (!formData.nameOnCard || formData.nameOnCard.trim() === "") {
        errors.nameOnCard = "Name on card is required";
      }
      setPaymentErrors(errors);
      return Object.keys(errors).length === 0;
    } else if (paymentMethod === "UPI") {
      if (!upiId || !upiId.includes("@")) {
        setPaymentErrors({ upiId: "Invalid UPI ID" });
        return false;
      }
    } else if (paymentMethod === "CRYPTO") {
      if (!cryptoAddress || cryptoAddress.length < 10) {
        setPaymentErrors({ cryptoAddress: "Invalid Wallet Address" });
        return false;
      }
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validatePayment()) return;
    if (!user) return;

    setIsProcessing(true);
    try {
      // Use POST /orders/place â€” reads directly from the server-side cart.
      // This avoids any item-mapping issues and is the correct industry approach.
      const createdOrder = await dispatch(placeOrderFromCart()).unwrap();
      const orderId = createdOrder.orderId;

      if (paymentMethod === "RAZORPAY") {
        const res = await loadRazorpay();
        if (!res) {
          toast.error("Razorpay SDK failed to load. Are you online?");
          setIsProcessing(false);
          return;
        }
        
        const rzpResponse = await api.post(`/orders/${orderId}/razorpay/create`);
        const { razorpayOrderId, amount, currency, key } = rzpResponse.data;
        // amount from backend is in rupees; Razorpay expects paise (* 100)
        const amountInPaise = Math.round(amount * 100);

        const options = {
          key: key,
          amount: amountInPaise,
          currency: currency,
          name: "ShopSphere",
          description: "Test Transaction",
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              await api.post(`/orders/${orderId}/razorpay/verify`, {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              dispatch(clearCart());
              setStep(3);
              toast.success("Order placed successfully via Razorpay!");
            } catch (err) {
              toast.error("Payment Verification Failed");
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: user.email,
          },
          theme: {
            color: "#374F52",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response){
          toast.error("Payment Failed: " + response.error.description);
        });
        rzp1.open();
      } else if (paymentMethod === 'COD') {
        dispatch(clearCart());
        setStep(3);
        toast.success("Order placed successfully. Pay later on delivery!");
      } else {
        await api.post('/orders/payment', {
           paymentMethod: paymentMethod,
           orderId: orderId,
           cardNumber: paymentMethod === 'CREDIT_CARD' ? formData.cardNumber : null
        });
        dispatch(clearCart());
        setStep(3);
        toast.success("Order placed successfully!");
      }
    } catch (error) {
      const status = error?.status || error?.response?.status;
      if (status === 401) {
        toast.error("Your session has expired. Please log out and log back in.");
      } else {
        toast.error(error?.response?.data?.message || error?.message || "Failed to place order. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (items.length === 0 && step !== 3) {
      navigate("/cart");
    }
  }, [items.length, step, navigate]);

  if (items.length === 0 && step !== 3) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {step !== 3 && (
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/cart"
            className="flex items-center gap-2 text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Link>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-12 flex items-center justify-center max-w-2xl mx-auto">
        <div
          className={`flex flex-col items-center ${step >= 1 ? "text-primary" : "text-muted"}`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 font-bold ${step >= 1 ? "border-primary bg-primary/10" : "border-border"}`}
          >
            1
          </div>
          <span className="text-sm font-medium">Shipping</span>
        </div>
        <div
          className={`h-1 w-24 mx-4 rounded ${step >= 2 ? "bg-primary" : "bg-border"}`}
        ></div>
        <div
          className={`flex flex-col items-center ${step >= 2 ? "text-primary" : "text-muted"}`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 font-bold ${step >= 2 ? "border-primary bg-primary/10" : "border-border"}`}
          >
            2
          </div>
          <span className="text-sm font-medium">Payment</span>
        </div>
        <div
          className={`h-1 w-24 mx-4 rounded ${step >= 3 ? "bg-primary" : "bg-border"}`}
        ></div>
        <div
          className={`flex flex-col items-center ${step >= 3 ? "text-primary" : "text-muted"}`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 font-bold ${step >= 3 ? "border-primary bg-primary/10" : "border-border"}`}
          >
            <CheckCircle className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">Complete</span>
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Shipping Details
              </h2>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">
                      First Name
                    </label>
                    <input
                      required
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">
                      Last Name
                    </label>
                    <input
                      required
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Street Address
                  </label>
                  <input
                    required
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-foreground/80 mb-1">
                      City
                    </label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-foreground/80 mb-1">
                      Postal Code
                    </label>
                    <input
                      required
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-foreground/80 mb-1">
                      Country
                    </label>
                    <input
                      required
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-card p-6 rounded-2xl border border-border h-fit shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-foreground">Order Summary</h3>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-foreground font-medium truncate pr-4">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-bold text-foreground">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  ₹{(totalAmount * 1.08).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Payment Method
              </h2>
              <form onSubmit={handlePaymentSubmit} className="space-y-5">
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {['CREDIT_CARD', 'RAZORPAY', 'UPI', 'CRYPTO', 'COD'].map(method => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => { setPaymentMethod(method); setPaymentErrors({}); }}
                      className={`px-4 py-2 rounded-lg font-bold text-sm border whitespace-nowrap transition-colors ${paymentMethod === method ? 'bg-primary text-white border-primary' : 'bg-card text-foreground/70 border-border hover:bg-secondary'}`}
                    >
                      {method.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'CREDIT_CARD' && (
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-border">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground/80 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleCardInputChange}
                          placeholder="0000 0000 0000 0000"
                          className={`w-full px-4 py-3 bg-card border ${paymentErrors.cardNumber ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-primary'} rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 font-mono text-lg`}
                        />
                        {paymentErrors.cardNumber && <p className="text-red-500 text-xs mt-1 font-medium">{paymentErrors.cardNumber}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground/80 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleCardInputChange}
                            placeholder="MM/YY"
                            className={`w-full px-4 py-3 bg-card border ${paymentErrors.expiryDate ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-primary'} rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 font-mono text-lg`}
                          />
                          {paymentErrors.expiryDate && <p className="text-red-500 text-xs mt-1 font-medium">{paymentErrors.expiryDate}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground/80 mb-1">
                            CVV
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleCardInputChange}
                            placeholder="123"
                            className={`w-full px-4 py-3 bg-card border ${paymentErrors.cvv ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-primary'} rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 font-mono text-lg`}
                          />
                          {paymentErrors.cvv && <p className="text-red-500 text-xs mt-1 font-medium">{paymentErrors.cvv}</p>}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-foreground/80 mb-1">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          name="nameOnCard"
                          value={formData.nameOnCard}
                          onChange={handleCardInputChange}
                          placeholder="John Doe"
                          className={`w-full px-4 py-3 bg-card border ${paymentErrors.nameOnCard ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-primary'} rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 text-lg`}
                        />
                        {paymentErrors.nameOnCard && <p className="text-red-500 text-xs mt-1 font-medium">{paymentErrors.nameOnCard}</p>}
                      </div>
                    </div>
                  </div>
                )}
                {paymentMethod === 'UPI' && (
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-border">
                     <label className="block text-sm font-semibold text-foreground/80 mb-1">UPI ID</label>
                     <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="user@upi" className={`w-full px-4 py-3 bg-card border ${paymentErrors.upiId ? 'border-red-500' : 'border-border'} rounded-xl shadow-sm`} />
                     {paymentErrors.upiId && <p className="text-red-500 text-xs mt-1 font-medium">{paymentErrors.upiId}</p>}
                  </div>
                )}
                {paymentMethod === 'CRYPTO' && (
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-border">
                     <label className="block text-sm font-semibold text-foreground/80 mb-1">Wallet Address</label>
                     <input type="text" value={cryptoAddress} onChange={e => setCryptoAddress(e.target.value)} placeholder="0x..." className={`w-full px-4 py-3 bg-card border ${paymentErrors.cryptoAddress ? 'border-red-500' : 'border-border'} rounded-xl shadow-sm`} />
                     {paymentErrors.cryptoAddress && <p className="text-red-500 text-xs mt-1 font-medium">{paymentErrors.cryptoAddress}</p>}
                  </div>
                )}
                {(paymentMethod === 'COD' || paymentMethod === 'RAZORPAY') && (
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-border text-center text-muted font-medium">
                    {paymentMethod === 'COD' ? "You will pay when the items are delivered to your address." : "You will be redirected to the secure Razorpay payment gateway to complete your transaction."}
                  </div>
                )}

                <div className="pt-6 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 text-muted hover:text-foreground/90 font-semibold transition-colors"
                  >
                    Return to Shipping
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || loading}
                    className="px-10 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-70 text-lg"
                  >
                    {(isProcessing || loading) ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      paymentMethod === 'RAZORPAY'
                        ? "Pay with Razorpay"
                        : paymentMethod === 'COD'
                        ? "Pay Later"
                        : "Pay Now"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-card p-6 rounded-2xl border border-border h-fit shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-foreground">Order Summary</h3>
            <div className="border-t border-border pt-4 mb-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total to Pay</span>
                <span className="text-primary">
                  ₹{(totalAmount * 1.08).toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted text-center">
              Payments are secure and encrypted.
            </p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center max-w-lg mx-auto py-16 bg-card p-8 rounded-3xl border border-border shadow-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Order Confirmed!
          </h1>
          <p className="text-foreground/70 mb-8 leading-relaxed">
            Thank you for your purchase. Your order has been placed
            successfully. We'll send you an email confirmation shortly with
            tracking details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/orders"
              className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              View Order History
            </Link>
            <Link
              to="/products"
              className="px-6 py-3 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors border border-border"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

