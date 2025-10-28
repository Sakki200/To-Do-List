import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CanvaCard from "../components/CanvaCard";
import { useState, useEffect, useRef } from "react";
import apiClient from "../scripts/axio";
import cookie from "js-cookie";

export default function Lists() {
  const navigate = useNavigate();
  const [canvas, setCanvas] = useState<Array<any>>([]);
  const [show, setShow] = useState<boolean>(false);
  const [name, setName] = useState<null | string>(null);
  const [collaborative, setCollaborative] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  async function fetchLists() {
    try {
      const response = await apiClient.get("canva/user/");
      console.log(response);
      setCanvas(response.data);
    } catch (error) {}
  }

  function showForm() {
    setShow(true);
    console.log("object");
  }

  async function newList(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiClient.post("canva/create/", {
        name: name,
        is_collaborative: collaborative,
      });
    } catch (error) {}

    setName(null);
    setCollaborative(false);
    setShow(false);
    fetchLists();
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    }
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show]);

  useEffect(() => {
    fetchLists();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Header title={"Dashboard"} />
          {message && <p className="flex justify-center w-full text-white text-lg font-semibold alert alert-success rounded-none">{message}</p>}
        <main className="justify-center items-center text-center px-6 relative overflow-hidden ">
          <div className="min-h-screen bg-base-200">
            <div className="flex flex-col md:flex-row justify-start items-center gap-8 px-16 py-8 ">
              <h1 className="text-6xl font-extrabold text-primary ">
                Vos listes
              </h1>
              <button
                className="btn btn-primary mt-2 px-8 py-6 font-bold text-2xl text-white"
                onClick={showForm}
              >
                Nouvelle liste
              </button>
            </div>
            <div className="flex justify-center lg:justify-start flex-wrap gap-6 px-16">
              {canvas.map((canva: any) => (
                <CanvaCard key={canva.id} canva={canva} notify={setMessage} />
              ))}
            </div>
          </div>
        </main>

        {/* NEW LIST*/}
        {show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div
              ref={formRef}
              className="bg-base-100 p-6 rounded-xl shadow-lg w-120 h-100"
            >
              <h2 className="text-4xl font-bold mt-8 mb-16 text-center">
                Créer une liste
              </h2>
              <form onSubmit={newList} className="flex flex-col gap-8">
                <input
                  type="text"
                  placeholder="Nom de la liste"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered w-full outline-none text-2xl font-bold"
                  required
                />
                <label className="flex items-center gap-2 text-2xl font-semibold">
                  <input
                    type="checkbox"
                    checked={collaborative}
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
      </div>
    </>
  );
}
