export const API_BASE_URL = "";

export const getSecurityHeaders = () => {
  const headerName = process.env.NEXT_PUBLIC_APP_HEADER_NAME || "x-client-access-id-pf";
  return {
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
    [headerName]: process.env.NEXT_PUBLIC_APP_HEADER_VALUE || ""
  };
};

export const CONTACT_INFO = {
  email: process.env.NEXT_PUBLIC_EMAIL || "",
  phoneRaw: process.env.NEXT_PUBLIC_PHONE_RAW || "",
  phoneFormatted: process.env.NEXT_PUBLIC_PHONE_FORMATTED || "",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
  github: process.env.NEXT_PUBLIC_GITHUB_URL || "",
};

export const USER_INFO = {
  name: process.env.NEXT_PUBLIC_USER_NAME || "Elamaran A",
  firstName: process.env.NEXT_PUBLIC_USER_FIRST_NAME || "Elamaran",
  lastName: process.env.NEXT_PUBLIC_USER_LAST_NAME || "A",
  rolePrimary: process.env.NEXT_PUBLIC_USER_ROLE_PRIMARY || "Full Stack Developer — MERN",
  roles: (process.env.NEXT_PUBLIC_USER_ROLES || "MERN Stack Developer,React Developer,Full Stack Engineer").split(","),
  yearsExp: process.env.NEXT_PUBLIC_YEARS_EXPERIENCE || "1+",
  projectsCount: process.env.NEXT_PUBLIC_PROJECTS_COUNT || "5+",
  clientsCount: process.env.NEXT_PUBLIC_CLIENTS_COUNT || "2+",
};

import { useAuthStore } from "../store/useAuthStore";

export const fetchWithAuth = async (url, options = {}) => {
  const token = useAuthStore.getState().token;
  
  const headers = {
    ...getSecurityHeaders(),
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If body is object and not FormData, stringify it and set Content-Type
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    useAuthStore.getState().logout();
  }

  return response;
};
