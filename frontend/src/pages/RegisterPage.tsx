import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    username: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      await register(form);
      navigate("/");
    } catch {
      setError("Your account could not be created. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-white px-4 pb-10 pt-8">
      <div className="w-full max-w-[350px]">
        <div className="border border-[#dbdbdb] bg-white px-[41px] pb-6 pt-[26px]">
          <h1 className="login-logo text-center text-[64px] leading-none text-black">ICHGRAM</h1>

          <p className="mx-auto mt-4 max-w-[270px] text-center text-[17px] font-semibold leading-[22px] text-[#737373]">
            Sign up to see photos and videos from your friends.
          </p>

          <form onSubmit={handleSubmit} className="mt-9">
            <div className="space-y-[6px]">
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email"
                required
                className="h-[38px] w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-2.5 text-xs text-[#262626] outline-none placeholder:text-[#8e8e8e] focus:border-[#a8a8a8]"
              />
              <input
                type="text"
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                placeholder="Full Name"
                required
                className="h-[38px] w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-2.5 text-xs text-[#262626] outline-none placeholder:text-[#8e8e8e] focus:border-[#a8a8a8]"
              />
              <input
                type="text"
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="Username"
                required
                className="h-[38px] w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-2.5 text-xs text-[#262626] outline-none placeholder:text-[#8e8e8e] focus:border-[#a8a8a8]"
              />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Password"
                required
                className="h-[38px] w-full rounded-[3px] border border-[#dbdbdb] bg-[#fafafa] px-2.5 text-xs text-[#262626] outline-none placeholder:text-[#8e8e8e] focus:border-[#a8a8a8]"
              />
            </div>

            <div className="mt-6 space-y-4 text-center text-xs leading-[16px] text-[#737373]">
              <p>
                People who use our service may have uploaded your contact information to Instagram.{" "}
                <a href="#" className="font-semibold text-[#00376b]">
                  Learn More
                </a>
              </p>
              <p>
                By signing up, you agree to our{" "}
                <a href="#" className="font-semibold text-[#00376b]">
                  Terms
                </a>
                ,{" "}
                <a href="#" className="font-semibold text-[#00376b]">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="#" className="font-semibold text-[#00376b]">
                  Cookies Policy
                </a>
                .
              </p>
            </div>

            {error ? <p className="mt-4 text-center text-xs font-medium text-[#ed4956]">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 h-8 w-full rounded-[8px] bg-[#0095f6] text-sm font-semibold text-white transition hover:bg-[#1877f2] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Signing up..." : "Sign up"}
            </button>
          </form>
        </div>

        <div className="mt-[10px] border border-[#dbdbdb] bg-white px-5 py-6 text-center">
          <p className="text-sm text-[#262626]">
            Have an account?{" "}
            <Link to="/login" className="font-semibold text-[#0095f6]">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
