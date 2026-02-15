import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6">
        <div className="bg-red-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-red-600">
            <CopyX className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Not Found</h1>
        <p className="text-gray-500 text-lg">
          The restaurant you are looking for does not exist or the link is incorrect.
        </p>
        
        <div className="pt-4 border-t border-gray-100">
            <Link href="/">
                <Button variant="outline" className="w-full">
                    Go Home
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
}
