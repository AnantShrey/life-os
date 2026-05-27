import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="w-full h-[70vh] flex flex-col items-center justify-center gap-4 text-center p-6">
      <div className="w-20 h-20 bg-muted text-muted-foreground rounded-[20px] flex items-center justify-center mb-2">
        <Search className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-bold">404 - Page Not Found</h2>
      <p className="text-muted-foreground max-w-md text-lg">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <Link 
        href="/dashboard"
        className="mt-6 inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-[12px] font-medium hover:brightness-110 transition-all shadow-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
