import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { apiClient, setAccessToken } from "../../lib/api/client.ts";

export type UserRole = "Doctor" | "Patient" | "Pharmacist" | "Admin";

export type AuthProfile = {
  id: string;
  name: string;
  department?: string;
  specialization?: string;
  consultationDuration?: number;
  availability?: Array<{ day: string; startTime: string; endTime: string }>;
  age?: number | null;
  gender?: string | null;
  bloodGroup?: string | null;
  fourKeySummary?: {
    chronicConditions?: string;
    allergies?: string;
    currentMedications?: string;
    vitals?: string;
  };
} | null;

export type CurrentUser = {
  id: string;
  role: UserRole;
  email?: string;
  phone?: string;
  profile: AuthProfile;
} | null;

type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
  mode: "demo" | "server";
  currentUser: CurrentUser;
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
  currentUser: null,
};

function mapCurrentUser(user: {
  _id: string;
  role: UserRole;
  email?: string;
  phone?: string;
  profile?: AuthProfile;
}): CurrentUser {
  return {
    id: user._id,
    role: user.role,
    email: user.email,
    phone: user.phone,
    profile: user.profile ?? null,
  };
}

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
        currentUser: mapCurrentUser(meResponse.data.user),
      };
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Unable to login with the server credentials.";
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const signupWithServer = createAsyncThunk(
  "auth/signupWithServer",
  async (
    payload: {
      role: Exclude<UserRole, "Admin">;
      name: string;
      phone: string;
      email?: string;
      password: string;
      specialization?: string;
      department?: string;
    },
    thunkApi,
  ) => {
    try {
      await apiClient.post("/auth/register", {
        role: payload.role,
        phone: payload.phone,
        email: payload.email || undefined,
        password: payload.password,
        profile: {
          name: payload.name,
          specialization: payload.role === "Doctor" ? payload.specialization || undefined : undefined,
          department: payload.role === "Doctor" ? payload.department || undefined : undefined,
        },
      });

      const loginBody = payload.email
        ? { email: payload.email, password: payload.password }
        : { phone: payload.phone, password: payload.password };

      const loginResponse = await apiClient.post("/auth/login", loginBody);
      const accessToken = loginResponse.data.accessToken as string;
      setAccessToken(accessToken);
      const meResponse = await apiClient.get("/auth/me");

      return {
        accessToken,
        role: meResponse.data.user.role as UserRole,
        currentUser: mapCurrentUser(meResponse.data.user),
      };
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Unable to create account with the provided details.";
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const bootstrapServerSession = createAsyncThunk("auth/bootstrapServerSession", async (_payload, thunkApi) => {
  try {
    const refreshResponse = await apiClient.post("/auth/refresh");
    const accessToken = refreshResponse.data.accessToken as string;
    setAccessToken(accessToken);
    const meResponse = await apiClient.get("/auth/me");
    return {
      accessToken,
      role: meResponse.data.user.role as UserRole,
      currentUser: mapCurrentUser(meResponse.data.user),
    };
  } catch {
    return thunkApi.rejectWithValue("Unable to restore server session.");
  }
});

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
      state.currentUser = null;
      persistAuth(action.payload, "demo");
    },
    logout(state) {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.role = null;
      state.status = "idle";
      state.error = null;
      state.mode = "demo";
      state.currentUser = null;
      setAccessToken(null);
      clearPersistedAuth();
    },
    updateCurrentUserProfile(state, action: PayloadAction<NonNullable<CurrentUser>["profile"]>) {
      if (state.currentUser) {
        state.currentUser.profile = action.payload;
      }
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
        state.currentUser = action.payload.currentUser;
        persistAuth(action.payload.role, "server");
      })
      .addCase(loginWithServer.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unable to login";
      })
      .addCase(signupWithServer.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signupWithServer.fulfilled, (state, action) => {
        state.status = "idle";
        state.accessToken = action.payload.accessToken;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.mode = "server";
        state.currentUser = action.payload.currentUser;
        persistAuth(action.payload.role, "server");
      })
      .addCase(signupWithServer.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unable to sign up";
      })
      .addCase(bootstrapServerSession.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(bootstrapServerSession.fulfilled, (state, action) => {
        state.status = "idle";
        state.accessToken = action.payload.accessToken;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.mode = "server";
        state.currentUser = action.payload.currentUser;
        persistAuth(action.payload.role, "server");
      })
      .addCase(bootstrapServerSession.rejected, (state) => {
        state.accessToken = null;
        state.isAuthenticated = false;
        state.role = null;
        state.status = "idle";
        state.error = null;
        state.mode = "demo";
        state.currentUser = null;
        setAccessToken(null);
        clearPersistedAuth();
      });
  },
});

export const { loginAsDemo, logout, updateCurrentUserProfile } = authSlice.actions;
export const authReducer = authSlice.reducer;
