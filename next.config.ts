import type { NextConfig } from "next";

const fallbackSupabaseUrl = "https://zsbjbmhdkqkkoniucfzg.supabase.co";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallbackSupabaseUrl;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : null;

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
