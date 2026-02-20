'use client'
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function RegistrationSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="pt-10 pb-8 px-8">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-700" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-green-600 mb-2">
              Thank You for Registering
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your agent profile has been successfully submitted and is currently under review.
            </p>
          </div>

          <Separator className="mb-6" />

          {/* Status block */}
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6">
            <Clock className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">Pending Approval</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Our admin team will verify your details and contact you within 1–2 business days to proceed further.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/')}
            >
              Back to Home
            </Button>
            {/* <Button
              variant="ghost"
              className="w-full text-gray-400 hover:text-gray-600 text-sm"
              onClick={() => router.push('/properties')}
            >
              Browse Properties
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button> */}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}