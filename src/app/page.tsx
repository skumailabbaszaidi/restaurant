import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6">
        <div className="bg-orange-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-orange-600">
            <QrCode className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Scan to Order</h1>
        <p className="text-gray-500 text-lg">
          Please scan the QR code on your table to view the menu and place your order.
        </p>
        
        <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-400 mb-4">Development Link</p>
            <Link href="/demo-grill/order">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Go to Demo Restaurant
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
}
