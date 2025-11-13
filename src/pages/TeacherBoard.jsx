import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import AiPanel from "../components/AiPanel";
import FormulaPanel from "../components/FormulaPanel";
import GamesPanel from "../components/GamesPanel";
import QRJoin from "../components/QRJoin";
import socket from "../socketClient"; // если есть сервер — он подключится, но компонент работает локально и без него

export default function TeacherBoard() {
  const [roomId] = useState(() => "room-" + Math.random().toString(36).slice(2, 8));
  const [boards, setBoards] = useState({});
  const [currentBoard, setCurrentBoard] = useState(null);
  const [activeTab, setActiveTab] = useState("Игры");
  const canvasRef = useRef(null);

  // init one board
  useEffect(() => {
    const id = "board-" + uuidv4().slice(0, 6);
    const initial = { title: "Главная", elements: [] };
    setBoards({ [id]: initial });
    setCurrentBoard(id);

    // optional: join socket room
    try {
      socket.emit("create-board", { roomId, boardId: id });
    } catch (e) {}
  }, []);

  // helper add element
  const addElement = (payload) => {
    if (!currentBoard) return;
    const el = {
      id: payload.id || uuidv4(),
      type: payload.type || "text",
      text: payload.text || "",
      x: payload.x || 20,
      y: payload.y || 20,
      w: payload.w || 200,
      h: payload.h || "auto",
      style: payload.style || {},
    };
    setBoards((prev) => {
      const nb = { ...prev };
      nb[currentBoard] = {
        ...nb[currentBoard],
        elements: [...(nb[currentBoard].elements || []), el],
      };
      // emit socket if available
      try {
        socket.emit("board:update", { roomId, boardId: currentBoard, data: { elements: nb[currentBoard].elements } });
      } catch (e) {}
      return nb;
    });
  };

  // add sample image / card quick buttons
  const addImageCard = () => {
    addElement({ type: "image", text: "https://via.placeholder.com/220x120.png?text=Image", w: 220, h: 120 });
  };

  // board creation
  const createBoard = () => {
    const id = "board-" + uuidv4().slice(0, 6);
    setBoards((b) => ({ ...b, [id]: { title: "Новая доска", elements: [] } }));
    setCurrentBoard(id);
    try { socket.emit("create-board", { roomId, boardId: id }); } catch (e) {}
  };

  // element drag handlers (simple)
  const onMouseDown = (e, el) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const initX = el.x;
    const initY = el.y;

    const onMove = (me) => {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      setBoards((prev) => {
        const nb = { ...prev };
        const list = nb[currentBoard].elements.map((it) => (it.id === el.id ? { ...it, x: initX + dx, y: initY + dy } : it));
        nb[currentBoard] = { ...nb[currentBoard], elements: list };
        try { socket.emit("board:update", { roomId, boardId: currentBoard, data: { elements: list } }); } catch (err) {}
        return nb;
      });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // delete element
  const removeElement = (id) => {
    setBoards((prev) => {
      const nb = { ...prev };
      nb[currentBoard] = { ...nb[currentBoard], elements: (nb[currentBoard].elements || []).filter((x) => x.id !== id) };
      try { socket.emit("board:update", { roomId, boardId: currentBoard, data: { elements: nb[currentBoard].elements } }); } catch (err) {}
      return nb;
    });
  };

  // switch tab helper
  const renderTabContent = () => {
    if (activeTab === "Игры") return <GamesPanel onAdd={(p) => addElement({ text: p.text, type: "game" })} />;
    if (activeTab === "Формулы") return <FormulaPanel onInsert={(p) => addElement({ text: p.text, type: "formula" })} />;
    if (activeTab === "Картинки")
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="button" onClick={addImageCard}>
            Добавить заглушку картинки
          </button>
          <div style={{ marginTop: 8 }}>
            <input id="img-url" placeholder="URL изображения" style={{ width: "100%" }} />
            <button
              className="button"
              style={{ marginTop: 6 }}
              onClick={() => {
                const url = document.getElementById("img-url").value;
                if (url) addElement({ type: "image", text: url, w: 220, h: 120 });
              }}
            >
              Вставить картинку
            </button>
          </div>
        </div>
      );
    if (activeTab === "Видео")
      return (
        <div>
          <input id="yt" placeholder="Вставь ссылку YouTube" style={{ width: "100%" }} />
          <button
            className="button"
            onClick={() => {
              const v = document.getElementById("yt").value;
              if (!v) return;
              addElement({ type: "video", text: v, w: 340, h: 200 });
            }}
          >
            Вставить видео
          </button>
        </div>
      );
    if (activeTab === "Рефлексия")
      return (
        <div>
          <textarea id="ref-text" placeholder="Вопрос для рефлексии..." style={{ width: "100%" }} />
          <button
            className="button"
            onClick={() => {
              const t = document.getElementById("ref-text").value;
              if (t) addElement({ type: "reflection", text: t, w: 380 });
            }}
          >
            Добавить вопрос
          </button>
        </div>
      );
    if (activeTab === "AI помощник") return <AiPanel onInsert={(p) => addElement({ text: p.text || p, type: "ai" })} />;
    return null;
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="icon active">🏫</div>
        <div className="icon" title="Новая доска" onClick={createBoard}>
          ➕
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: "#777" }}>Room: {roomId}</div>
      </aside>

      <main className="main">
        <div className="header">
          <div>
            <h3>SmartBoard.AI — Главная доска</h3>
            <div className="small">Интерактивная доска для урока — вкладки, AI, игры, формулы</div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <QRJoin roomId={roomId} />
          </div>
        </div>

        <div className="board-area">
          <div className="canvas" ref={canvasRef}>
            {/* Tabs bar */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {["Картинки", "Игры", "Формулы", "Видео", "Рефлексия", "AI помощник"].map((t) => (
                <div
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: activeTab === t ? "linear-gradient(135deg,#7a73ff,#57c6ff)" : "#ffffff",
                    color: activeTab === t ? "#fff" : "#222",
                    boxShadow: activeTab === t ? "0 6px 18px rgba(90,120,255,0.18)" : "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>

            {/* tab content area */}
            <div style={{ marginBottom: 14, padding: 8, background: "rgba(255,255,255,0.6)", borderRadius: 10 }}>
              {renderTabContent()}
            </div>

            {/* canvas elements */}
            <div style={{ position: "relative", minHeight: 360, borderRadius: 10 }}>
              {(boards[currentBoard]?.elements || []).map((el) => {
                const style = {
                  position: "absolute",
                  left: el.x,
                  top: el.y,
                  width: el.w,
                  padding: 8,
                  borderRadius: 8,
                  background: "#f6fbff",
                  border: "1px solid rgba(0,0,0,0.06)",
                  cursor: "grab",
                };
                if (el.type === "image")
                  return (
                    <div key={el.id} style={style} onMouseDown={(e) => onMouseDown(e, el)}>
                      <img src={el.text} alt="" style={{ width: "100%", height: "auto", display: "block", borderRadius: 6 }} />
                      <div style={{ textAlign: "right", marginTop: 6 }}>
                        <button onClick={() => removeElement(el.id)}>Удалить</button>
                      </div>
                    </div>
                  );
                if (el.type === "video")
                  return (
                    <div key={el.id} style={style} onMouseDown={(e) => onMouseDown(e, el)}>
                      <iframe
                        title={el.id}
                        src={el.text.includes("youtube") ? el.text.replace("watch?v=", "embed/") : el.text}
                        width={el.w}
                        height={el.h}
                      />
                      <div style={{ textAlign: "right" }}>
                        <button onClick={() => removeElement(el.id)}>Удалить</button>
                      </div>
                    </div>
                  );
                // default text/ai/formula/reflection/game
                return (
                  <div key={el.id} style={style} onMouseDown={(e) => onMouseDown(e, el)}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{el.type}</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{el.text}</div>
                    <div style={{ textAlign: "right", marginTop: 6 }}>
                      <button onClick={() => removeElement(el.id)}>Удалить</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="sidepanel">
            <div className="card">
              <h4>Ученик / Баллы</h4>
              <div className="small">Тут будет список учеников и их очки</div>
              <div style={{ marginTop: 8 }}>
                <div style={{ padding: 8, background: "#fff", borderRadius: 8, marginBottom: 6 }}>Айдана — ⭐ 5</div>
                <div style={{ padding: 8, background: "#fff", borderRadius: 8, marginBottom: 6 }}>Марат — ⭐ 3</div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <h4>Быстрые действия</h4>
              <button className="button" onClick={() => addElement({ type: "text", text: "Новое задание: Напишите кратко..." })}>
                Добавить текст
              </button>
              <div style={{ height: 8 }} />
              <button className="button" onClick={() => addImageCard()}>
                Добавить картинку
              </button>
              <div style={{ height: 8 }} />
              <button className="button" onClick={() => setActiveTab("AI помощник")}>Открыть AI</button>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <h4>Boards</h4>
              <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                {Object.keys(boards).map((id) => (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ cursor: "pointer", color: id === currentBoard ? "#7a73ff" : "#222" }} onClick={() => setCurrentBoard(id)}>
                      {boards[id].title}
                    </div>
                    <div>
                      <button onClick={() => setBoards((b) => ({ ...b, [id]: { ...b[id], title: prompt("Название доски:", b[id].title) || b[id].title } }))}>✏️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
