import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

interface CanvaProps {
  canva: {
    id: string;
    name: string;
    is_collaborative: boolean;
    created_at: string;
    updated_at: string;
  };
}

export default function CanvaCard({ canva }: CanvaProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
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
              <button className="btn btn-primary text-lg rounded-tl-lg rounded-tr-lg rounded-bl-none rounded-br-none px-4 py-2">
                Modifier
              </button>
              {canva.is_collaborative && (
                <button className="btn btn-secondary text-md rounded-none px-4 py-2">
                  Lien collaboratif
                </button>
              )}

              <button className="btn btn-error text-white text-lg px-4 py-2 rounded-bl-lg rounded-br-lg rounded-tl-none rounded-tr-none">
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
