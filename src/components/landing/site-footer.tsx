import { Code2, FileText, PlayCircle } from "lucide-react";
import { Logo } from "@/components/logo";

const REPO_URL = "https://github.com/justriri/celo-stablecoin-yield-agent";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <Logo size={22} />
            <span className="text-sm font-semibold text-foreground">Ceflow</span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-muted">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Code2 size={15} />
              GitHub
            </a>
            <a
              href="#how-it-works"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <PlayCircle size={15} />
              Demo
            </a>
            <a
              href={`${REPO_URL}#readme`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <FileText size={15} />
              Documentation
            </a>
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border-subtle pt-6 text-xs text-muted-2 sm:flex-row">
          <span>© {new Date().getFullYear()} Ceflow. All transactions require your wallet signature.</span>
          <span className="rounded-full border border-border-subtle px-2.5 py-1 text-accent">
            Built for the Celo Hackathon
          </span>
        </div>
      </div>
    </footer>
  );
}
