import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import InfinityParticles from '../components/InfinityParticles';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Temp auth logic
    if (email.includes("admin")) navigate("/admin");
    else if (email.includes("manager")) navigate("/manager");
    else navigate("/dashboard");
  };

  return (
    <div className="relative h-screen flex items-center justify-center text-white">
      <InfinityParticles />

      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-10 w-full max-w-md shadow-xl z-10">
        <h2 className="text-3xl font-bold text-center mb-6 text-cyan-400">
          Employee Portal
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition"
          >
            Log In →
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-white/70">
          Don’t have an account?{" "}
          <span
            className="text-cyan-400 hover:underline cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
