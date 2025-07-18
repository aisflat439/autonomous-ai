import { Outlet } from "@tanstack/react-router";

export const Route = createFileRoute({
  component: AgentsLayout,
});

function AgentsLayout() {
  return (
    <div className="max-w-6xl mx-auto">
      <Outlet />
    </div>
  );
}
