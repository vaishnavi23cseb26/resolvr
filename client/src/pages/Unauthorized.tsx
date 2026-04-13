import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-900 px-4 py-12">
      <div className="mx-auto max-w-lg text-center">
        <div className="text-2xl font-semibold text-white">Unauthorized</div>
        <div className="mt-2 text-slate-400">You don’t have access to this page.</div>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/dashboard">
            <Button>Dashboard</Button>
          </Link>
          <Link to="/tickets">
            <Button variant="secondary">Tickets</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

