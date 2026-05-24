import axios from "axios";
import { baseURL } from "../consts";
import i18n from "../../i18n";
import { message, Modal } from "antd";

const api = axios.create({
  baseURL: baseURL,
  timeout: 300000,
  headers: {

  }
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers ??= {};
      config.headers["Accept-Language"] = i18n.language;
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    let errorMessage = "An unknown error occurred. Please try again.";

    if (data) {
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.message) {
        errorMessage = data.message;
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = `${data.message}: ${data.errors.join(' | ')}`;
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    const isPendingSubscription = errorMessage === "You already have a pending subscription request, please wait for the admin to approve it";

    if (isPendingSubscription) {
      Modal.warning({
        title: i18n.language === "ar" ? "طلب الاشتراك قيد الانتظار" : "Subscription Request Pending",
        content: i18n.language === "ar" 
          ? "لديك بالفعل طلب اشتراك قيد الانتظار، يرجى الانتظار حتى يوافق المسؤول عليه." 
          : "You already have a pending subscription request, please wait for the admin to approve it.",
        okText: i18n.language === "ar" ? "حسناً" : "OK",
        centered: true,
        maskClosable: false,
        keyboard: false,
      });
    } else {
      if (status === 401) {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (token) {
          // If token exists but we get 401, treat it as a role/permission issue
          message.error(i18n.t("unauthorizedRoleError") || errorMessage);
        } else {
          // Handle truly unauthorized (no token) - clear storage and redirect
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");

          const publicPages = ["/login", "/register"];
          if (!publicPages.includes(window.location.pathname)) {
            window.location.href = "/login";
            message.error(i18n.t("sessionExpiredError") || errorMessage);
          }
        }
      } else if (status === 403) {
        message.error(errorMessage || "You do not have permission to perform this action.");
      } else if (status === 404) {
        message.error(errorMessage || "The requested resource was not found.");
      } else if (status >= 500) {
        message.error(errorMessage || "A server error occurred. Please try again later.");
      } else if (status) {
        message.error(errorMessage);
      } else {
        // Network error or other issues
        console.error("API Error:", error);
        message.error(errorMessage);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

