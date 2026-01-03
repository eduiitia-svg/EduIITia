import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider><App /></ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  </Provider>
);