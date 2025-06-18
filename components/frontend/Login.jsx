// import logo from '../public/logo.png'; // Adjust path as needed

export default function Login() {
  return (
    <div className="min-h-screen bg-[#fff8ed] relative flex flex-col items-center justify-center">
      {/* Top right links */}
      <div className="absolute top-6 right-10 flex gap-6 text-black font-medium text-lg">
        <a href="#" className="hover:underline">FEEDBACK</a>
        <a href="#" className="hover:underline">ABOUT US</a>
      </div>

      {/* Logo */}
      <div className="mt-8 mb-4">
        <img src="/logo.png" alt="3Doodle Logo" className="w-[350px] h-auto mx-auto" />
      </div>

      {/* Centered Login Box */}
      <div className="bg-white rounded-2xl shadow-lg px-12 py-10 flex flex-col items-center min-w-[350px]">
        {/* Tabs */}
        <div className="flex w-full justify-center mb-6">
          <button className="px-6 py-1 text-xl font-semibold rounded-t-xl border border-b-0 border-black bg-white text-black">SIGN-UP</button>
          <button className="px-6 py-1 text-xl font-semibold rounded-t-xl bg-teal-400 text-white border border-b-0 border-black -ml-px">LOGIN</button>
          <button className="px-6 py-1 text-xl font-semibold rounded-t-xl border border-b-0 border-black bg-white text-black -ml-px">GUEST</button>
        </div>
        {/* Form */}
        <form className="flex flex-col gap-4 w-full items-center">
          <input
            type="text"
            placeholder="Username or email"
            className="w-64 px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:border-teal-400 bg-[#faf9f6]"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-64 px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:border-teal-400 bg-[#faf9f6]"
          />
          <button
            type="submit"
            className="mt-2 w-44 py-2 bg-teal-400 text-white rounded-lg text-lg font-medium hover:bg-teal-600 transition"
          >
            Login
          </button>
        </form>
      </div>

      {/* Grid background */}
      <img
      src="/bg.png"
      alt="background"
      className="fixed inset-0 w-full h-full object-cover z-[-1]"
    />
    </div>
  );
}