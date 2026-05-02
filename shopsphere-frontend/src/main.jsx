import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import AppRoutes from "./AppRoutes";
import { store } from "./store/store";

createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <AppRoutes />
      <ToastContainer position="bottom-right" theme="colored" />
    </Provider>
);
