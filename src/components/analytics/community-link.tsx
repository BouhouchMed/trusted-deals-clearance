"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { trackJoinFacebookCommunity } from "@/lib/meta-pixel";

export function CommunityLink({ href, location }: { href: string; location: string }) {
  return (
    <Link className="button" href={href} target="_blank" rel="noreferrer" onClick={() => trackJoinFacebookCommunity(location)}>
      <Users size={18} /> Join the Community
    </Link>
  );
}
