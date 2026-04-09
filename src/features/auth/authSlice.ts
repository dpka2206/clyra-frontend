import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { apiClient, setAccessToken } from "../../lib/api/client.ts";

export type UserRole = "Doctor" | "Patient" | "Pharmacist" | "Admin";

type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
  mode: "demo" | "server";
};

const storageKey = "medicnct-auth";

function loadPersistedAuth(): Pick<AuthState, "isAuthenticated" | "role" | "mode"> {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, role: null, mode: "demo" };
  }

  const rawValue = window.localStorage.getItem(storageKey);

  if (!rawValue) {
    return { isAuthenticated: false, role: null, mode: "demo" };
  }

  try {
    const parsed = JSON.parse(rawValue) as { role: UserRole; mode: "demo" | "server" };
    return {
      isAuthenticated: true,
      role: parsed.role,
      mode: parsed.mode,
    };
  } catch {
    return { isAuthenticated: false, role: null, mode: "demo" };
  }
}

function persistAuth(role: UserRole, mode: "demo" | "server") {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify({ role, mode }));
  }
}

function clearPersistedAuth() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(storageKey);
  }
}

const persistedAuth = loadPersistedAuth();

const initialState: AuthState = {
  accessToken: null,
  isAuthenticated: persistedAuth.isAuthenticated,
  role: persistedAuth.role,
  status: "idle",
  error: null,
  mode: persistedAuth.mode,
};

export const loginWithServer = createAsyncThunk(
  "auth/loginWithServer",
  async (payload: { emailOrPhone: string; password: string }, thunkApi) => {
    try {
      const body = payload.emailOrPhone.includes("@")
        ? { email: payload.emailOrPhone, password: payload.password }
        : { phone: payload.emailOrPhone, password: payload.password };
      const loginResponse = await apiClient.post("/auth/login", body);
      const accessToken = loginResponse.data.accessToken as string;
      setAccessToken(accessToken);
      const meResponse = await apiClient.get("/auth/me");
      return {
        accessToken,
        role: meResponse.data.user.role as UserRole,
      };
    } catch {
      return thunkApi.rejectWithValue("Unable to login with the server credentials.");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginAsDemo(state, action: PayloadAction<UserRole>) {
      state.role = action.payload;
      state.isAuthenticated = true;
      state.accessToken = "demo-session";
      state.error = null;
      state.mode = "demo";
      persistAuth(action.payload, "demo");
    },
    logout(state) {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.role = null;
      state.status = "idle";
      state.error = null;
      state.mode = "demo";
      setAccessToken(null);
      clearPersistedAuth();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithServer.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginWithServer.fulfilled, (state, action) => {
        state.status = "idle";
        state.accessToken = action.payload.accessToken;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.mode = "server";
        persistAuth(action.payload.role, "server");
      })
      .addCase(loginWithServer.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unable to login";
      });
  },
});

export const { loginAsDemo, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
