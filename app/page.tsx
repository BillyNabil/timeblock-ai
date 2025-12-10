import TimeBlockingApp from "@/components/TimeBlockingApp";

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden p-3 sm:p-5 lg:p-7 bg-yellow-200 text-foreground flex flex-col">
      <div className="flex-1 overflow-hidden w-full mx-auto flex flex-col relative z-20">
        <TimeBlockingApp />
      </div>
    </main>
  );
}
