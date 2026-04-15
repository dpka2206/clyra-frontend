import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Provider } from "react-redux";

import { bootstrapServerSession } from "../features/auth/authSlice.ts";
import { useAppDispatch, useAppSelector } from "../lib/hooks/index.ts";
import { store } from "./store.ts";

function SessionBootstrap() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (auth.mode !== "server" || !auth.isAuthenticated || auth.accessToken || auth.status === "loading") {
      return;
    }

    void dispatch(bootstrapServerSession());
  }, [auth.accessToken, auth.isAuthenticated, auth.mode, auth.status, dispatch]);

  return null;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <SessionBootstrap />
      {children}
    </Provider>
  );
}
