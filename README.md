#Bookmark manager

A real-time, private bookmark manager built with:

    Next.js (App Router)
    
    Supabase (Google OAuth, Postgres, Realtime)
    
    Tailwind CSS
    
    Vercel (Deployment)
    
    Users can sign in with Google, add bookmarks, see real-time updates across tabs/devices, and manage their own private data securely.

🚀 Features

    🔐 Google OAuth only (no email/password)
    
    👤 Private bookmarks per user
    
    ➕ Add bookmark (title + URL)
    
    🗑 Delete own bookmarks
    
    ⚡ Real-time sync across tabs/devices
    
    🛡 Row Level Security (RLS)
    
🧱 Tech Stack

    Layer	        Technology
    Frontend	    Next.js (App Router)
    Styling	        Tailwind CSS
    Auth	        Supabase Google OAuth
    Database	    Supabase Postgres
    Realtime	    Supabase Realtime
    Hosting	        Vercel
    
🔐 Authentication Flow

    User clicks Continue with Google
    
    Supabase handles OAuth
    
    User is redirected to /dashboard
    
    Session stored in cookies
    
    Middleware protects private routes
