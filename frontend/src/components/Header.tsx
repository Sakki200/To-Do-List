import { Link, useNavigate } from "react-router-dom";
import apiClient from "../scripts/axio";
import cookie from "js-cookie";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const navigate = useNavigate();

  async function isConnected() {
    try {
      const response = await apiClient.get("auth/");
      if (response.data && response.data.token) {
      }
    } catch (error) {
      navigate("/connection");
      navigate(0);
    }
  }
  isConnected();

  function disconnect() {
    cookie.remove("token", { path: "/" });
    navigate(0);
  }

  isConnected();
  return (
    <>
      <header>
        <nav className="navbar bg-base-100 shadow-sm">
          <div className="flex  flex-1 items-center gap-16">
            <div>
              <Link
                to="/"
                className="normal-case text-4xl font-extrabold text-primary "
              >
                <img src="/logo.svg" alt="logo" className="w-16 ml-4" />
              </Link>
            </div>
            <div className="text-xl md:text-4xl font-bold">
              <p>{title}</p>
            </div>
          </div>
          <div className="flex-none">
            <button
              className="rounded-full btn btn-error btn-outline border-2 text-xl mr-4"
              onClick={disconnect}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="w-8 h-8 fill-current text-error hover:text-white"
              >
                <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                  <path
                    d="M 45 53.126 c -2.761 0 -5 -2.238 -5 -5 V 5 c 0 -2.761 2.239 -5 5 -5 c 2.762 0 5 2.239 5 5 v 43.126 C 50 50.888 47.762 53.126 45 53.126 z"
                    fill="currentColor"
                  />
                  <path
                    d="M 45 90 C 21.832 90 2.983 71.151 2.983 47.983 c 0 -16.176 9.039 -30.643 23.588 -37.755 c 2.481 -1.213 5.476 -0.184 6.688 2.296 c 1.212 2.481 0.185 5.475 -2.296 6.688 c -11.09 5.421 -17.979 16.445 -17.979 28.771 C 12.983 65.638 27.346 80 45 80 c 17.654 0 32.017 -14.362 32.017 -32.017 c 0 -12.326 -6.89 -23.35 -17.979 -28.771 c -2.481 -1.213 -3.51 -4.207 -2.297 -6.688 c 1.213 -2.48 4.21 -3.506 6.688 -2.296 c 14.551 7.112 23.589 21.579 23.589 37.755 C 87.017 71.151 68.168 90 45 90 z"
                    fill="currentColor"
                  />
                </g>
              </svg>
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}
