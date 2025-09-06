import useAuth from "@/utils/useAuth";

function MainComponent() {
  const { signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Sign Out</h1>
          <p className="mt-2 text-gray-600">Are you sure you want to sign out of EcoFinds?</p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full rounded-lg bg-green-600 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default MainComponent;


