import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import apiClient from "../scripts/axio";

interface CanvaProps {
  canva: {
    id: string;
    name: string;
    is_collaborative: boolean;
    created_at: string;
    updated_at: string;
  };
  notify: (msg: string | null) => void;
}

export default function CanvaCard({ canva, notify }: CanvaProps) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [name, setName] = useState<string>(canva.name);
  const [collaborative, setCollaborative] = useState<boolean>(
    canva.is_collaborative
  );
  const formRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  async function modifList(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiClient.patch("canva/user/", {
        id: canva.id,
        name: name,
        is_collaborative: collaborative,
      });
    } catch (error) {}

    navigate(0);
  }

  async function collaborativeLink() {
    try {
      const response = await apiClient.post(
        "collaboration/invitation/create/",
        {
          canva_id: canva.id,
        }
      );
      console.log(response.data.invitation_link);
      navigator.clipboard.writeText(response.data.invitation_link).then(() => {
        notify("✅ Lien collaboratif copié dans le presse-papier !");
        setShowMenu(false);
      });
    } catch (error) {}
  }

  async function deleteCanva() {
    try {
      await apiClient.delete("canva/user/", {
        data: { id: canva.id },
      });
      navigate(0);
    } catch (error) {}
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    }
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show]);

  return (
    <>
      <Link to={`/lists/${canva.id}`}>
        <div
          className={`"relative card bg-white shadow-md p-3 mb-3 border-l-8 rounded-2xl w-80 h-60 ${
            canva.is_collaborative ? "border-secondary" : "border-primary"
          }`}
        >
          <div className="flex flex-col m-auto w-full">
            <button
              className={`w-8 rounded-full mb-8 self-end ${
                canva.is_collaborative ? "bg-secondary" : "bg-primary"
              } hover:cursor-pointer`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleMenu();
              }}
            >
              <svg
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                className="fill-current text-white"
              >
                <g id="dots">
                  <circle className="cls-1" cx="16" cy="16" r="3"></circle>
                  <circle className="cls-1" cx="16" cy="8" r="3"></circle>
                  <circle className="cls-1" cx="16" cy="24" r="3"></circle>
                  <path className="cls-2" d="M16,13v6a3,3,0,0,0,0-6Z"></path>
                  <path className="cls-2" d="M16,5v6a3,3,0,0,0,0-6Z"></path>
                  <path className="cls-2" d="M16,21v6a3,3,0,0,0,0-6Z"></path>
                </g>
              </svg>
            </button>
            <p
              className={`text-center font-extrabold text-4xl mb-16 overflow-hidden whitespace-nowrap truncate ${
                canva.is_collaborative ? "text-secondary" : "text-primary"
              }`}
            >
              {canva.name}
            </p>
            <p className="font-semibold">
              Dernière modification :<br />
              {new Date(canva.updated_at).toLocaleString("fr-FR")}
            </p>
            {showMenu && (
              <div
                ref={menuRef}
                className="absolute top-11 right-0 w-40 bg-base-100 shadow-md rounded-lg flex flex-col"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShow(true);
                  }}
                  className="btn btn-primary text-lg rounded-tl-lg rounded-tr-lg rounded-bl-none rounded-br-none px-4 py-2"
                >
                  Modifier
                </button>
                {canva.is_collaborative && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      collaborativeLink();
                    }}
                    className="btn btn-secondary text-md rounded-none px-4 py-2"
                  >
                    Lien collaboratif
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteCanva();
                  }}
                  className="btn btn-error text-white text-lg px-4 py-2 rounded-bl-lg rounded-br-lg rounded-tl-none rounded-tr-none"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>
      {/* MODIFICATION LIST*/}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            ref={formRef}
            className="bg-base-100 p-6 rounded-xl shadow-lg w-120 h-100"
          >
            <h2 className="text-4xl font-bold mt-8 mb-16 text-center">
              Modification de la liste
            </h2>
            <form onSubmit={modifList} className="flex flex-col gap-8">
              <input
                type="text"
                defaultValue={canva.name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full outline-none text-2xl font-bold"
                required
              />
              <label className="flex items-center gap-2 text-2xl font-semibold">
                <input
                  type="checkbox"
                  defaultChecked={canva.is_collaborative}
                  onChange={(e) => setCollaborative(e.target.checked)}
                  className="checkbox checkbox-primary"
                />
                Collaboratif
              </label>
              <button
                type="submit"
                className="btn btn-primary text-white mt-4 text-2xl font-bold py-6"
              >
                Valider
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
