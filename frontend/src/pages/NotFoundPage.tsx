import { Link } from "react-router-dom";
import loginPreview from "../assets/Background.png";

export const NotFoundPage = () => {
  return (
    <section className="flex min-h-[calc(100vh-120px)] items-start justify-center bg-white px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-[980px]">
        <div className="flex flex-col items-center gap-10 border border-[#dbdbdb] bg-white px-6 py-10 sm:px-10 lg:flex-row lg:items-start lg:gap-8 lg:px-16 lg:py-12">
          <div className="flex w-full justify-center lg:w-[330px] lg:shrink-0">
            <img
              src={loginPreview}
              alt="Instagram preview"
              className="h-auto w-[240px] max-w-full object-contain sm:w-[300px]"
            />
          </div>

          <div className="max-w-[470px] text-center lg:pt-12 lg:text-left">
            <h1 className="text-[34px] font-semibold leading-tight text-[#111111] sm:text-[42px]">
              Oops! Page Not Found (404 Error)
            </h1>
            <p className="mt-6 text-[18px] leading-8 text-[#737373]">
              We&apos;re sorry, but the page you&apos;re looking for doesn&apos;t seem to exist.
              If you typed the URL manually, please double-check the spelling.
              If you clicked on a link, it may be outdated or broken.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                to="/"
                className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#0095f6] px-5 text-sm font-semibold text-white transition hover:bg-[#1877f2]"
              >
                Go home
              </Link>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#efefef] px-5 text-sm font-semibold text-[#262626] transition hover:bg-[#e2e2e2]"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
