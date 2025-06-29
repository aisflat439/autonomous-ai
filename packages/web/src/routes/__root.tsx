import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="h-screen flex flex-col">
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/knowledge-base" className="[&.active]:font-bold">
          Knowledge Base
        </Link>
        <Link to="/model-selector" className="[&.active]:font-bold">
          Model Selectors
        </Link>
      </div>
      <hr />
      <div className="flex-1 p-6 w-full bg-white rounded-xl shadow-md overflow-auto">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </div>
  ),
});
