import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "../../server/routers";
import { getSessionToken } from "./session";
const apiUrl = "https://financemgr-5wcippfv.manus.space";

export const trpc = createTRPCReact<AppRouter>();
export const trpcLink = httpBatchLink({
  url: `${apiUrl}/api/trpc`,
  transformer: superjson,
  async fetch(url, options) {
    const token = await getSessionToken();
    const headers = new Headers(options?.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...options, headers, credentials: "include" });
  },
});
