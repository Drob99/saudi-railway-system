import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/use_user";

const Login = () => {
  const { login, error, loading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("Passenger");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const u = await login(email, password, accountType);
      // alert("Login successful!");
      navigate(`/${u.hiredate ? "staff-booking" : ""}`);
      window.location.reload();
    } catch (err) {
      // alert(err.message);
    }
  };

  return (
    <div className="min-h-screen my-20 w-full max-w-7xl rounded-md flex justify-center items-center motion-preset-slide-up-sm">
      <div className="bg-white w-1/2 shadow-md rounded-md px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-primary-700">Login</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="e.g. example@example.com"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="*********"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Account Type
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="Passenger">Passenger</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
        <p className="text-gray-600 text-sm mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary-700 font-bold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
