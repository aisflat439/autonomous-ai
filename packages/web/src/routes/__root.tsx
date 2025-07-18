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
        <Link to="/customers" className="[&.active]:font-bold">
          Customers
        </Link>
        <Link to="/model-selector" className="[&.active]:font-bold">
          Model Selectors
        </Link>
        <Link to="/tickets" className="[&.active]:font-bold">
          Support Tickets
        </Link>
        <Link to="/agents" className="[&.active]:font-bold">
          Agents
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
