"use client";

import { useGoogleLogin } from '@react-oauth/google';
import { Calendar } from "lucide-react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ConnectCalendarPrompt() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/calendar/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeResponse.code }),
        });
        
        if (res.ok) {
          router.refresh();
        } else {
          alert('Failed to connect Google Calendar.');
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    },
    onError: errorResponse => console.error(errorResponse),
  });

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6">
        <Calendar className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Connect Google Calendar</h2>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        Sync your tasks and habits directly to your calendar, and manage your events right from Life OS.
      </p>
      
      <button 
        onClick={() => login()}
        disabled={isLoading}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium text-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {isLoading ? "Connecting..." : "Connect with Google"}
      </button>
    </div>
  );
}
