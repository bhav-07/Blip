import { Button } from "@/components/ui/button";
import { repoLink } from "@/configs";

export default function Home() {
  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded drop-shadow-lg">
      <div className="text-popover rounded-lg sm:p-16 p-4 m-2 sm:m-0 text-center space-y-4">
        <span className="sm:text-7xl text-3xl font-bold text-white">
          Blip📟
        </span>
        <p className="text-slate-200 opacity-80 font-semibold sm:text-base text-sm">
          A realtime and distributed chat app built using Nextjs and Go
        </p>
        <div className="flex w-full space-x-3 justify-evenly">
          <Button className="w-1/2 text-lg p-5">
            <a href="/joinroom">Get Started</a>
          </Button>
          <Button className="w-1/2 text-lg p-5">
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
