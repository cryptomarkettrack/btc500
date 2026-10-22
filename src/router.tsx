import { QueryClient, dehydrate, hydrate, type DehydratedState } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

interface RouterDehydratedState {
  query: DehydratedState;
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  // Ship the SSR query cache with the HTML and hydrate it before the first
  // client render. Without this the browser started with the deterministic
  // halving estimate and refetched the live snapshot during hydration,
  // changing 44 → 38 and throwing a React hydration mismatch.
  //
  // Assigned after createRouter because the router's serializability type
  // rejects React Query's `unknown` payload fields even though the values are
  // plain JSON at runtime.
  Object.assign(router.options, {
    dehydrate: (): RouterDehydratedState => ({ query: dehydrate(queryClient) }),
    hydrate: (data: RouterDehydratedState) => {
      if (data?.query) hydrate(queryClient, data.query);
    },
  });

  return router;
};
