"use client";

import Link from "next/link";
import { MemoryControls } from "./MemoryControls";

export function Header() {
  return (
    <header className="flex items-center justify-between h-16 border-b border-line px-5 md:px-8 lg:px-12" role="banner">
      <Link href="/" className="font-display-bold text-xl text-text hover:opacity-80 transition-opacity focus-ring" aria-label="SkillPath home">
        SkillPath
      </Link>
      <nav className="flex items-center gap-4" aria-label="Main navigation">
        <Link href="/" className="text-sm text-muted hover:text-text transition-colors focus-ring rounded-[6px] px-2 py-1" aria-current="page">Planner</Link>
        <Link href="/how-it-works" className="text-sm text-muted hover:text-text transition-colors focus-ring rounded-[6px] px-2 py-1">How it works</Link>
        <MemoryControls />
      </nav>
    </header>
  );
}