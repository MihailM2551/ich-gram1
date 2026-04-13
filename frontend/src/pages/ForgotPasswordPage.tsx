import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

export const ForgotPasswordPage = () => {
  const [identifier, setIdentifier] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#dbdbdb] bg-white">
        <div className="mx-auto flex h-[60px] w-full max-w-[1440px] items-center px-6 md:px-14">
          <Link to="/login" className="login-logo text-[38px] leading-none text-black">
            ICHGRAM
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-61px)] items-start justify-center px-4 pb-10 pt-[86px]">
        <div className="w-full max-w-[388px] overflow-hidden border border-[#dbdbdb] bg-white">
          <div className="px-11 pb-16 pt-6 text-center">
            <div className="mx-auto flex h-[96px] w-[96px] items-center justify-center rounded-full border-[2px] border-[#262626]">
              <LockKeyhole size={44} strokeWidth={1.65} className="text-[#262626]" />
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-[#262626]">
              Trouble logging in?
            </h1>

            <p className="mx-auto mt-3 max-w-[290px] text-base leading-6 text-[#737373]">
              Enter your email, phone, or username and we'll send you a link to get back into your
              account.
            </p>

            <form onSubmit={handleSubmit} className="mt-5">
              <input
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Email or Username"
                className="h-[38px] w-full rounded-[6px] border border-[#dbdbdb] bg-[#fafafa] px-3 text-sm text-[#262626] outline-none placeholder:text-[#b3b3b3] focus:border-[#a8a8a8]"
              />

              <button
                type="submit"
                className="mt-4 h-8 w-full rounded-[8px] bg-[#0095f6] text-sm font-semibold text-white transition hover:bg-[#1877f2]"
              >
                Reset your password
              </button>
            </form>

            <div className="mt-16 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#dbdbdb]" />
              <span className="text-[13px] font-semibold uppercase text-[#737373]">OR</span>
              <div className="h-px flex-1 bg-[#dbdbdb]" />
            </div>

            <Link
              to="/register"
              className="mt-6 inline-block text-[15px] font-semibold text-[#262626]"
            >
              Create new account
            </Link>
          </div>

          <div className="border-t border-[#dbdbdb] bg-[#fafafa] px-6 py-[19px] text-center">
            <Link to="/login" className="text-[15px] font-semibold text-[#262626]">
              Back to login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
