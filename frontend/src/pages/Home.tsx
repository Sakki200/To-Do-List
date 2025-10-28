import { Link, useNavigate } from "react-router-dom";
import apiClient from "../scripts/axio";

export default function Home() {
  const navigate = useNavigate();

  async function isConnected() {
    try {
      const response = await apiClient.get("auth/");
      if (response.data && response.data.token) {
        navigate("/lists");
      }
    } catch (error) {
      // Not connected
    }
  }
  isConnected();

  return (
    <>
      <div className="min-h-screen bg-base-200 flex flex-col">
        <nav className="navbar bg-base-100 shadow-sm">
          <div className="flex-1">
            <Link
              to="/"
              className="normal-case text-4xl font-extrabold text-primary "
            >
              <img src="/logo.svg" alt="logo" className="w-16 ml-4" />
            </Link>
          </div>
          <div className="flex-none">
            <Link
              to="/connection"
              className="btn btn-secondary btn-outline text-xl"
            >
              Connexion
            </Link>
          </div>
        </nav>

        <main className="flex-1 flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-base-100 animate-gradientBlur" />
          <div className="relative z-10">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-4 md:mb-12">
              Organise ta journée avec
              <br />
              <span className="text-primary">To-Do List</span>
            </h1>

            <p className="text-md md:text-xl lg:text-2xl text-base-content/70 mb-4">
              Gère tes tâches, planifie tes priorités et garde le contrôle sur
              ton quotidien — tout en un seul endroit.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/connection" className="btn btn-primary btn-lg">
                Commencer maintenant
              </Link>
              <Link to="/connection" className="btn btn-outline btn-lg">
                Déjà un compte ? Se connecter
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
