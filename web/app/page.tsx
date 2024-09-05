import { Button } from "@/components/ui/button";
import { repoLink } from "@/configs";
import { Github } from "lucide-react";

export default function Home() {
  return (
    <div className="sm:bg-background bg-card-foreground">
      <div className="bg-card-foreground text-popover rounded-lg sm:p-12 p-4 text-center space-y-3">
        <span className="text-6xl font-bold">Blip📟</span>
        <p className="text-input opacity-80 font-semibold">
          A realtime and distributed chat app built using Nextjs and Go
        </p>
        <div className="flex w-full space-x-3 justify-evenly">
          <Button className="w-1/2" size={"lg"}>
            <a href="/joinroom">Get Started</a>
          </Button>
          <Button className="w-1/2" size={"lg"}>
            <a
              target="_blank"
              href={repoLink}
              rel="noopener noreferrer"
              className="flex"
            >
              Check out repo
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
