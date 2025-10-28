import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import apiClient from "../scripts/axio";

interface Task {
  description: string;
  is_checked: boolean;
  position: number;
}

interface Block {
  id: string;
  name: string;
  x: number;
  y: number;
  tasks: Task[];
}

export default function Canva() {
  const { uuid } = useParams();
  const [canvaName, setCanvaName] = useState<string>("");
  const [blockName, setBlockName] = useState<null | string>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const updateTimeout = useRef<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragData = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  //   ZOOM and MOVE Canva  ----------------------------------------------------------------------------------------------------------
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: -2000, y: -2000 });
  const panRef = useRef<{ dragging: boolean; startX: number; startY: number }>({
    dragging: false,
    startX: 0,
    startY: 0,
  });

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(Math.max(zoom + delta, 0.2), 3);

    const mouseX = e.clientX - pan.x;
    const mouseY = e.clientY - pan.y;

    const newPanX = e.clientX - mouseX * (newZoom / zoom);
    const newPanY = e.clientY - mouseY * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }

  function startPan(e: React.MouseEvent) {
    if (
      (e.target as HTMLElement).closest(".block") ||
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("input")
    ) {
      return;
    }
    panRef.current.dragging = true;
    panRef.current.startX = e.clientX - pan.x;
    panRef.current.startY = e.clientY - pan.y;
  }

  function onPan(e: React.MouseEvent) {
    if (!panRef.current.dragging) return;
    const newX = e.clientX - panRef.current.startX;
    const newY = e.clientY - panRef.current.startY;
    setPan({ x: newX, y: newY });
  }

  function stopPan() {
    panRef.current.dragging = false;
  }

  // -------------------------------------------------------------------------------------------------------------------------

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
    if (!dragData.current) return;

    const movedBlock = blocks.find((b) => b.id === dragData.current!.id);
    if (movedBlock) {
      scheduleUpdateBlock(movedBlock);
    }

    dragData.current = null;
  }

  function scheduleUpdateBlock(block: Block) {
    if (updateTimeout.current) clearTimeout(updateTimeout.current);

    updateTimeout.current = setTimeout(() => {
      updateBlock(block);
    }, 250); // 0.25 secondes
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
        position_x: 2500,
        position_y: 2500,
      });
      getBlocks();
      setShowForm(false);
    } catch (error) {}
  }

  async function updateBlock(b: any) {
    try {
      const response = await apiClient.patch("block/user/", {
        canva_id: uuid,
        block_id: b.id,
        name: b.name,
        position_x: b.x,
        position_y: b.y,
        tasks: b.tasks,
      });
      console.log(response.data);
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

  useEffect(() => {
    getCanva();
    getBlocks();
    const preventDefault = (e: WheelEvent) => {
      e.preventDefault();
    };

    window.addEventListener("wheel", preventDefault, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventDefault);
    };
  }, []);

  return (
    <div className="fixed inset-0 min-h-screen bg-base-200 flex flex-col ">
      <div className="z-100">
        <Header title={canvaName} />
      </div>
      <main className="justify-center items-center text-center px-6 relative ">
        <button
          className="btn btn-primary absolute top-6 left-6 text-xl font-bold text-white px-8 py-6 rounded-lg z-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowForm(true);
          }}
        >
          Ajouter une tâche
        </button>
        <div
          className="w-full h-screen bg-base-200 overflow-hidden select-none cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={startPan}
          onMouseMove={(e) => {
            onPan(e);
            onDrag(e);
          }}
          onMouseUp={() => {
            stopPan();
            stopDrag();
          }}
          onMouseLeave={() => {
            stopPan();
            stopDrag();
          }}
        >
          <div className="flex flex-col md:flex-row justify-start items-center gap-8 px-16 py-8 "></div>
          <div
            className="absolute w-full h-screen bg-gray-100 overflow-hidden select-none "
            ref={canvasRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              left: 0,
              top: 0,
              width: "10000px",
              height: "10000px",
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  rgba(200, 200, 200, 0.3) 0px,
                  rgba(200, 200, 200, 0.3) 1px,
                  transparent 1px,
                  transparent 50px
                ),
                repeating-linear-gradient(
                  90deg,
                  rgba(200, 200, 200, 0.3) 0px,
                  rgba(200, 200, 200, 0.3) 1px,
                  transparent 1px,
                  transparent 50px
            )`,
            }}
          >
            {blocks.map((block) => (
              <div
                key={block.id}
                className="absolute bg-white shadow-xl rounded-2xl  p-4 w-100 border-none border-gray-300 cursor-grab active:cursor-grabbing"
                style={{ left: block.x, top: block.y }}
                onMouseDown={(e) => startDrag(e, block.id)}
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <input
                    type="text"
                    value={block.name}
                    className="flex-1 outline-none text-center font-bold text-2xl text-primary text-gray-800 mb-2"
                    onChange={(e) => {
                      const newName = e.target.value;
                      setBlocks((prev) =>
                        prev.map((b) =>
                          b.id === block.id ? { ...b, name: newName } : b
                        )
                      );
                      scheduleUpdateBlock({ ...block, name: newName });
                    }}
                    required
                  />
                  <div className="flex">
                    <button
                      className="hover:cursor-pointer "
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setBlocks((prev) =>
                          prev.map((b) =>
                            b.id === block.id
                              ? {
                                  ...b,
                                  tasks: [
                                    ...b.tasks,
                                    {
                                      description: "Nouvelle tâche",
                                      is_checked: false,
                                      position: b.tasks.length,
                                    },
                                  ],
                                }
                              : b
                          )
                        );
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        className="w-8 h-8 text-primary"
                      >
                        <path
                          fill="currentColor"
                          d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"
                        />
                      </svg>
                    </button>
                    <button
                      className="mr-4 hover:cursor-pointer "
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
                          strokeWidth="2"
                          d="M20.5 6h-17m15.333 2.5l-.46 6.9c-.177 2.654-.265 3.981-1.13 4.79s-2.196.81-4.856.81h-.774c-2.66 0-3.991 0-4.856-.81c-.865-.809-.954-2.136-1.13-4.79l-.46-6.9M9.17 4a3.001 3.001 0 0 1 5.66 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <ul className="flex flex-col w-full text-gray-700 text-sm">
                  {block.tasks.map((t, i) => (
                    <div className="flex items-center">
                      <input
                        type="text"
                        defaultValue={t.description}
                        key={t.position}
                        className={`w-4/5 outline-none font-lg text-xl ${
                          t.is_checked ? "line-through text-gray-400" : ""
                        }`}
                        onChange={(e) => {
                          const newDesc = e.target.value;

                          setBlocks((prev) =>
                            prev.map((b) =>
                              b.id === block.id
                                ? {
                                    ...b,
                                    tasks: b.tasks.map((task, idx) =>
                                      idx === i
                                        ? { ...task, description: newDesc }
                                        : task
                                    ),
                                  }
                                : b
                            )
                          );
                          scheduleUpdateBlock({
                            ...block,
                            tasks: block.tasks.map((task, idx) =>
                              idx === i
                                ? { ...task, description: newDesc }
                                : task
                            ),
                          });
                        }}
                      />
                      <input
                        type="checkbox"
                        defaultChecked={t.is_checked}
                        className="checkbox checkbox-primary"
                        onClick={() => {
                          setBlocks((prev) =>
                            prev.map((b) =>
                              b.id === block.id
                                ? {
                                    ...b,
                                    tasks: b.tasks.map((task, idx) =>
                                      idx === i
                                        ? {
                                            ...task,
                                            is_checked: !task.is_checked,
                                          }
                                        : task
                                    ),
                                  }
                                : b
                            )
                          );

                          scheduleUpdateBlock({
                            ...block,
                            tasks: block.tasks.map((task, idx) =>
                              idx === i
                                ? { ...task, is_checked: !task.is_checked }
                                : task
                            ),
                          });
                        }}
                      />
                      <button
                        className="ml-2 hover:cursor-pointer "
                        onClick={() => {
                          setBlocks((prevBlocks) => {
                            const updatedBlocks = prevBlocks.map((b) =>
                              b.id === block.id
                                ? {
                                    ...b,
                                    tasks: b.tasks.filter(
                                      (_, idx) => idx !== i
                                    ),
                                  }
                                : b
                            );

                            const updatedBlock = updatedBlocks.find(
                              (b) => b.id === block.id
                            );
                            if (updatedBlock) scheduleUpdateBlock(updatedBlock);

                            return updatedBlocks;
                          });
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
