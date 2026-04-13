import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import loginPreview from "../assets/Background.png";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      await login({ identifier, email: identifier, password });
      const fallback = typeof location.state?.from === "string" ? location.state.from : "/";
      navigate(fallback);
    } catch {
      setError("Your username, email, or password is incorrect.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8">
      <div className="flex w-full max-w-[935px] items-center justify-center gap-8 xl:gap-10">
        <div className="hidden lg:flex lg:w-[440px] lg:items-center lg:justify-center">
          <img
            src={loginPreview}
            alt="Instagram preview"
            className="h-auto w-[381px] max-w-full object-contain"
          />
        </div>

        <div className="w-full max-w-[350px]">
          <div className="border border-[#dbdbdb] bg-white px-10 pb-6 pt-7">
            <h1 className="login-logo text-center text-[64px] leading-none text-black">ICHGRAM</h1>

            <form onSubmit={handleSubmit} className="mt-10">
              <div className="space-y-[6px]">
                <input
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Username, or email"
                  required
                  className="h-[38px] w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-2.5 text-xs text-[#262626] outline-none placeholder:text-[#8e8e8e] focus:border-[#a8a8a8]"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  required
                  className="h-[38px] w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-2.5 text-xs text-[#262626] outline-none placeholder:text-[#8e8e8e] focus:border-[#a8a8a8]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-[14px] h-8 w-full rounded-[8px] bg-[#0095f6] text-sm font-semibold text-white transition hover:bg-[#1877f2] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Logging in..." : "Log in"}
              </button>

              {error ? (
                <p className="mt-3 text-center text-xs font-medium text-[#ed4956]">{error}</p>
              ) : null}

              <div className="mb-[26px] mt-[18px] flex items-center gap-[18px]">
                <div className="h-px flex-1 bg-[#dbdbdb]" />
                <span className="text-[13px] font-semibold uppercase text-[#737373]">OR</span>
                <div className="h-px flex-1 bg-[#dbdbdb]" />
              </div>

              <Link
                to="/forgot-password"
                className="block text-center text-xs font-normal text-[#00376b]"
              >
                Forgot password?
              </Link>
            </form>
          </div>

          <div className="mt-[10px] border border-[#dbdbdb] bg-white px-5 py-6 text-center">
            <p className="text-sm text-[#262626]">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-[#0095f6]">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
