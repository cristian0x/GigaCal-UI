import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/utils/authOptions";
import { redirect } from "next/navigation";
import SignOutButton from "./components/SignOutButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <main>
      <div className="h-full flex flex-row min-h-screen justify-center items-center">
        <SignOutButton />
      </div>
    </main>
  );
}
