import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 px-4 py-12">
      <div className="mx-auto max-w-lg text-center">
        <div className="text-3xl font-semibold text-white">404</div>
        <div className="mt-2 text-slate-400">That page doesn’t exist.</div>
        <div className="mt-6">
          <Link to="/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

