import BlipLogo from "@/components/blip-logo";
import Container from "@/components/container";
import { repoLink } from "@/configs";
import Image from "next/image";

export default function Home() {
  return (
    <Container className="max-w-3xl w-full animate-in fade-in-0 duration-2000 ease-in-out">
      <div className="flex flex-col justify-center items-center space-y-6">
        <section>
          <div className="text-popover rounded-lg text-center space-y-6">
            <BlipLogo />
            <p className="text-slate-200 opacity-80 font-semibold sm:text-base text-sm">
              A realtime and distributed chat app built using Nextjs and Go
            </p>
            <div className="flex w-full sm:space-x-6 space-x-3 justify-evenly">
              <a
                href="/joinroom"
                className="w-1/2 sm:w-full text-lg p-2 bg-neutral-100 text-neutral-900 hover:bg-neutral-300 transition-colors ease-in-out duration-200 flex items-center justify-center rounded-lg font-semibold"
              >
                Get Started
              </a>
              <a
                target="_blank"
                href={repoLink}
                rel="noopener noreferrer"
                className="w-1/2 sm:w-full text-lg p-2 bg-neutral-100 text-neutral-900 hover:bg-neutral-300 transition-colors ease-in-out duration-200 flex items-center justify-center rounded-lg font-semibold"
              >
                Check out repo
              </a>
            </div>
          </div>
        </section>
        <hr className="h-[1px] bg-white w-full" />
        <section className="flex flex-col items-center justify-center md:space-y-4 space-y-2">
          <h1 className="text-white text-lg md:text-3xl font-semibold text-center font-mono">
            Here is how all the magic happens!
          </h1>
          <div className="w-full max-w-2xl md:p-2 p-1">
            <Image
              src="/system-diagram.svg"
              alt="System Diagram"
              height={800}
              width={800}
              className="w-full"
            />
          </div>
        </section>
      </div>
    </Container>
  );
}
