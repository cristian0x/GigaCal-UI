import { redirect } from "next/navigation";
import SignOutButton from "./components/SignOutButton";

export default async function Home() {
  return (
    <main>
      <div className="h-full flex flex-row min-h-screen justify-center items-center">
        <SignOutButton />
      </div>
    </main>
  );
}
