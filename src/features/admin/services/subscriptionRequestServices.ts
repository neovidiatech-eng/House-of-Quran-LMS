import api from "../../../lib/axios";

export interface SubscriptionRequestApi {
  id: string;
  user: {
    name: string;
    phone: string;
    email: string;
  };
  plan: {
    name_ar: string;
    name_en: string;
    price: string;
    sessionsCount: number;
  };
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

export const getSubscriptionRequests = async () => {
  const response = await api.get("/subscription/requests");
  const data = response.data.data;
  console.log(data);

  return data.subscriptionRequests;
};

// delete
export const deleteSubscriptionRequest = async (id: string) => {
  try {
    const res = await api.delete(`/subscription/${id}`);
    return res.data;
  } catch (error) {
    console.error("Delete subscription failed:", error);
    throw error;
  }
};

// change status
export const changeSubscriptionRequestStatus = async (
  id: string,
  status: "approved" | "rejected",
) => {
  try {
    const res = await api.put(`/subscription/requests/change-status/${id}`, {
      status,
    });
    return res.data;
  } catch (error) {
    console.error("Change status failed:", error);
    throw error;
  }
};

// https://github.com/neovidiatech-eng/lms_front
