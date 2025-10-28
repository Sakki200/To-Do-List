import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import apiClient from "../scripts/axio";

export default function Canva() {
  const { uuid } = useParams();
  const [canvaName, setCanvaName] = useState<string>("");
  const [blockName, setBlockName] = useState<null | string>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [blocks, setBlocks] = useState([]);
  const formRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragData = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  function startDrag(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    dragData.current = {
      id,
      offsetX: e.clientX - block.x,
      offsetY: e.clientY - block.y,
    };
  }

  function onDrag(e: React.MouseEvent) {
    if (!dragData.current) return;
    const { id, offsetX, offsetY } = dragData.current;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, x: e.clientX - offsetX, y: e.clientY - offsetY }
          : b
      )
    );
  }

  function stopDrag() {
    dragData.current = null;
  }

  async function getCanva() {
    try {
      const response = await apiClient.get("canva/user/", {
        params: {
          id: uuid,
        },
      });
      setCanvaName(response.data.name);
    } catch (error) {}
  }

  async function getBlocks() {
    try {
      const response = await apiClient.get("block/user/", {
        params: {
          canva_id: uuid,
        },
      });
      const updatedBlocks = response.data.map((data: any) => ({
        id: data.id,
        name: data.name,
        x: data.position_x,
        y: data.position_y,
        tasks: Array.isArray(data.tasks) ? [...data.tasks] : [data.tasks],
      }));

      setBlocks(updatedBlocks);
    } catch (error) {}
  }

  async function newBlock(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await apiClient.post("block/create/", {
        canva: uuid,
        name: blockName,
        position_x: 150,
        position_y: 150,
      });
      console.log(response);
    } catch (error) {}
  }

  async function deleteBlock(id: string) {
    try {
      const response = await apiClient.delete("block/user/", {
        data: { canva_id: uuid, block_id: id },
      });
      console.log(response);
    } catch (error) {}
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowForm(false);
      }
    }
    if (showForm) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showForm]);

  getCanva();

  useEffect(() => {
    getBlocks();
  }, []);

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Header title={canvaName} />
      <main className="justify-center items-center text-center px-6 relative overflow-hidden ">
        <button
          className="btn btn-primary absolute top-6 left-6 text-xl font-bold text-white px-8 py-6 rounded-lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowForm(true);
          }}
        >
          Ajouter une tâche
        </button>
        <div className="min-h-screen bg-base-200">
          <div className="flex flex-col md:flex-row justify-start items-center gap-8 px-16 py-8 "></div>
          <div
            className="w-full h-screen bg-gray-100 overflow-hidden select-none "
            ref={canvasRef}
            onMouseMove={onDrag}
            onMouseUp={stopDrag}
          >
            {blocks.map((block) => (
              <div
                key={block.id}
                className="absolute bg-white shadow-xl rounded-2xl p-4 w-100 border border-gray-300 cursor-grab active:cursor-grabbing"
                style={{ left: block.x, top: block.y }}
                onMouseDown={(e) => startDrag(e, block.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <input
                    type="text"
                    defaultValue={block.name}
                    className="flex-1 outline-none text-center font-bold text-2xl text-primary text-gray-800 mb-2"
                    required
                  />
                  <button
                    className="ml-2 hover:cursor-pointer "
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteBlock(block.id);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      className="w-8 h-8 fill-current text-error"
                    >
                      <path
                        fill="white"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M20.5 6h-17m15.333 2.5l-.46 6.9c-.177 2.654-.265 3.981-1.13 4.79s-2.196.81-4.856.81h-.774c-2.66 0-3.991 0-4.856-.81c-.865-.809-.954-2.136-1.13-4.79l-.46-6.9M9.17 4a3.001 3.001 0 0 1 5.66 0"
                      />
                    </svg>
                  </button>
                </div>

                <ul className="flex flex-col w-full text-gray-700 text-sm">
                  {block.tasks.map((t, i) => (
                    <div>
                      <input
                        type="text"
                        defaultValue={t.description}
                        key={t.position}
                        className={`w-4/5 outline-none font-semibold text-xl ${
                          t.is_checked ? "line-through text-gray-400" : ""
                        }`}
                      />
                      <input
                        type="checkbox"
                        defaultChecked={t.is_checked}
                        className="checkbox checkbox-primary"
                      />
                    </div>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            ref={formRef}
            className="bg-base-100 p-6 rounded-xl shadow-lg w-120 h-100"
          >
            <h2 className="text-4xl font-bold mt-8 mb-16 text-center">
              Créer un groupe
            </h2>
            <form onSubmit={newBlock} className="flex flex-col gap-8">
              <input
                type="text"
                placeholder="Nom de votre groupe"
                onChange={(e) => setBlockName(e.target.value)}
                className="input input-bordered w-full outline-none text-2xl font-bold"
                required
              />
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
  );
}
