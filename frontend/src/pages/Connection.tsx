import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import apiClient from "../scripts/axio";
import cookie from "js-cookie";

export default function Connection() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [validation, setValidation] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);

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

  async function handleConnection(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const response = await apiClient.post("auth/", {
        email: email,
        password: password,
      });
      console.log(response);

      if (response.data.token) {
        cookie.set("token", response.data.token, { path: "/" });
        navigate("/lists");
      } else if (response.data.message && !response.data.token) {
        setValidation(
          "Un mail de vérification a été envoyé à votre adresse email."
        );
        setError(null);
      } else {
        setError("Identifiants invalides.");
        setValidation(null);
      }
    } catch (err: any) {
      setError("Échec de la connexion. Vérifie ton email ou mot de passe.");
      setValidation(null);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-base-200 flex flex-col">
        <nav className="navbar bg-base-100 shadow-sm">
          <div className="flex-1">
            <Link
              to="/"
              className="normal-case text-4xl font-extrabold text-primary m-4"
            >
              To-Do List
            </Link>
          </div>
        </nav>

        {error && (
          <p className="m-auto text-error text-2xl font-bold py-4">{error}</p>
        )}
        {validation && (
          <p className="m-auto text-success text-2xl font-bold py-4">
            {validation}
          </p>
        )}
        <main className="flex-1 flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-base-100 animate-gradientBlur" />
          <div className="relative z-10 w-full max-w-md bg-base-100 p-8 rounded-2xl shadow-lg">
            <h1 className="text-4xl font-bold mb-6 text-primary">
              Connexion <br /> Inscription
            </h1>
            <form onSubmit={handleConnection} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-semibold">
                    Email
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className="input input-bordered w-full text-lg font-semibold outline-none"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-semibold">
                    Mot de passe
                  </span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input input-bordered w-full text-lg font-semibold outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary text-white text-2xl w-full mt-4"
              >
                Connexion
              </button>
            </form>
            <p className="mt-6 text-base-content/70">
              <Link to="/" className="text-secondary font-semibold">
                Retour à l’accueil
              </Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
