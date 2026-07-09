import { Hero } from "@/components/sections/Hero";
import { Solutions } from "@/components/sections/Solutions";
import { Process } from "@/components/sections/Process";
import { Stats } from "@/components/sections/Stats";
import { BigCTA } from "@/components/sections/BigCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Solutions />
      <Process />
      <Stats />
      <BigCTA />
    </>
  );
}
