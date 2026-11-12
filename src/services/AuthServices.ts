import api from "../lib/axios"
import { LoginInput } from "../lib/schemas/LoginSchema";
import { RegisterInput } from "../lib/schemas/RegisterSchema";

export const login = async (data: LoginInput) => {
    const response = await api.post("/auth/sign-in", data);
    return response.data;
}

export const googleLogin = async (data: { idToken: string, provider: string }) => {
    const response = await api.post("/auth/google-login", data);
    return response.data;
}
export const googleRegister = async (data: { idToken: string }) => {
    const response = await api.post("/auth/google-signup", data);
    return response.data;
}

export const register = async (data: Omit<RegisterInput, 'age'> & { age?: number }) => {
    const response = await api.post("/auth/sign-up", data);
    return response.data;
}

export const registerTeacher = async (data: any) => {
    const response = await api.post("/auth/sign-up-teacher", data);
    return response.data;
}

export const verifyAccount = async (data: { email: string, otp: string }) => {
    const response = await api.post("/auth/verify-account", data);
    return response.data;
}

export const forgetPassword = async (data: { email: string }) => {
    const response = await api.post("/auth/forget-password", data);
    return response.data;
}

export const resetPassword = async (data: { email: string, password: string, otp: string, confirm: string }) => {
    const response = await api.patch("/auth/reset-password", data);
    return response.data;
}
export const resendCode = async (data: { email: string }) => {
    const response = await api.post("/auth/resend-otp", data);
    return response.data;
}

export const saveFcmToken = async (fcmToken: string) => {
    const response = await api.patch("/auth/save-fcm", { fcmToken });
    return response.data;
}

