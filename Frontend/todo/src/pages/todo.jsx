import React, { useEffect, useState, useRef } from "react";
import api from "../components/axios";
import { useDispatch, useSelector } from "react-redux";
import { setTodos, addTodo, deleteTodo } from "../store/todoSlice";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTrash } from "react-icons/fa";
import { logout } from "../store/authSlice";

const MAX_CHARS = 300;

/* ---------- custom scrollbar styles injected once ---------- */
const scrollbarStyle = `
  .slim-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .slim-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .slim-scroll::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.12);
    border-radius: 999px;
    transition: background 0.2s;
  }
  .slim-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.28);
  }
  .slim-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.12) transparent;
  }
`;

function Todo() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const todos = useSelector((state) => state.todos.todos);

  const [content, setContent] = useState("");
  const [type, setType] = useState("todo");
  const [remindAt, setRemindAt] = useState("");
  const [modal, setModal] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const alertedRef = useRef(new Set());

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await api.get("/todos");
        dispatch(setTodos(res.data));
      } catch (err) {
        console.error("Failed to fetch todos", err);
      }
    };
    fetchTodos();
  }, []);

  /* ---------------- ADD ---------------- */
  const handleAdd = async () => {
    if (!content.trim()) return;
    if (content.length > MAX_CHARS) return;

    const res = await api.post("/todos", {
      content,
      type,
      remindAt: type === "reminder" ? remindAt : null,
    });

    dispatch(addTodo(res.data));
    setContent("");
    setRemindAt("");
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    await api.delete(`/todos/${id}`);
    dispatch(deleteTodo(id));
    alertedRef.current.delete(id);
  };

  /* ---------------- COMPLETE ---------------- */
  const handleComplete = async (id) => {
    await api.patch(`/todos/${id}/complete`);
    dispatch(deleteTodo(id));
    alertedRef.current.delete(id);
  };

  /* ---------------- REMINDER ENGINE ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      todos.forEach((todo) => {
        if (
          todo.type === "reminder" &&
          todo.remindAt &&
          !alertedRef.current.has(todo._id) &&
          new Date(todo.remindAt) <= now
        ) {
          alertedRef.current.add(todo._id);
          alert(`⏰ Reminder: ${todo.content}`);
          handleComplete(todo._id);
        }
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [todos]);

  /* ---------------- FILTERS ---------------- */
  const filteredTodos = todos.filter((t) => {
    if (activeFilter === "todo") return t.type === "todo";
    if (activeFilter === "grocery") return t.type === "grocery";
    if (activeFilter === "reminder") return t.type === "reminder";
    return true;
  });

  const reminders = todos.filter((t) => t.type === "reminder");
  const groceries = todos.filter((t) => t.type === "grocery");

  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = content.length > MAX_CHARS;

  /* ---------------- TRUNCATE HELPER ---------------- */
  const truncate = (text, limit = 80) =>
    text.length > limit ? text.slice(0, limit) + "…" : text;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black text-white flex">
      <style>{scrollbarStyle}</style>
      {/* LEFT PANEL */}
      <div className="w-[65%] h-full p-8 border-r border-white/10 flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Task Studio</h1>
            <p className="text-gray-400 text-sm">Manage everything in one place</p>
          </div>
          <button
            onClick={async () => {
              await api.get("/logout");
              dispatch(logout());
              navigate("/");
            }}
            className="px-5 py-2.5 bg-red-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition"
          >
            Logout
          </button>
        </div>

        {/* FILTER */}
        <div className="flex gap-3 mb-8">
          {[
            { key: "all", label: "All", icon: "📋" },
            { key: "todo", label: "Tasks", icon: "✔" },
            { key: "grocery", label: "Groceries", icon: "🛒" },
            { key: "reminder", label: "Reminders", icon: "⏰" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-5 py-2 rounded-xl border transition ${
                activeFilter === f.key
                  ? "bg-blue-600 border-blue-400"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* CREATE */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {/* INPUT WRAPPER with counter */}
            <div className="flex-1 relative min-w-[200px]">
              <input
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setContent(e.target.value);
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Write something... (max 300 chars)"
                maxLength={MAX_CHARS}
                className={`w-full p-3 pr-16 rounded-lg bg-black/40 border transition ${
                  isOverLimit
                    ? "border-red-500/60 focus:border-red-500"
                    : content.length > 250
                    ? "border-yellow-500/40"
                    : "border-white/10"
                }`}
              />
              {/* Character counter */}
              <span
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono ${
                  isOverLimit
                    ? "text-red-400"
                    : content.length > 250
                    ? "text-yellow-400"
                    : "text-gray-500"
                }`}
              >
                {charsLeft}
              </span>
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-3 rounded-lg bg-black/40 border border-white/10"
            >
              <option value="todo">Todo</option>
              <option value="grocery">Grocery</option>
              <option value="reminder">Reminder</option>
            </select>

            {type === "reminder" && (
              <input
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                className="p-3 rounded-lg bg-black/40 border border-white/10"
              />
            )}

            <button
              onClick={handleAdd}
              disabled={isOverLimit || !content.trim()}
              className="px-5 py-3 bg-blue-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* TASK LIST */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 slim-scroll">
          {filteredTodos.length === 0 && (
            <div className="text-center mt-12 text-gray-500">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">No tasks here yet</p>
            </div>
          )}
          {filteredTodos.map((t) => {
            const isExpanded = expandedId === t._id;
            const isLong = t.content.length > 80;

            return (
              <div
                key={t._id}
                className="flex justify-between bg-white/5 border border-white/10 p-4 rounded-xl gap-3"
              >
                {/* TEXT AREA */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`break-words whitespace-pre-wrap text-sm leading-relaxed ${
                      !isExpanded && isLong ? "line-clamp-2" : ""
                    }`}
                  >
                    {t.content}
                  </p>

                  {/* Show more / less */}
                  {isLong && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : t._id)}
                      className="text-xs text-blue-400 hover:text-blue-300 mt-1 transition"
                    >
                      {isExpanded ? "Show less" : "Show more"}
                    </button>
                  )}

                  {t.type === "reminder" && t.remindAt && (
                    <p className="text-xs text-blue-400 mt-1">
                      ⏰{" "}
                      {new Date(t.remindAt).toLocaleString("en-PK", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 uppercase mt-1">{t.type}</p>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 flex-shrink-0 items-start pt-1">
                  <button
                    onClick={() => handleComplete(t._id)}
                    className="w-[38px] h-[32px] rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 transition flex items-center justify-center"
                  >
                    <FaCheck size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="w-[38px] h-[32px] rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 transition flex items-center justify-center"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[35%] h-full sticky top-0 p-6 flex flex-col gap-6">
        {/* REMINDERS */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-lg flex flex-col flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              ⏰ Reminders
              <span className="text-xs bg-blue-600/30 px-2 py-0.5 rounded-lg">
                {reminders.length}
              </span>
            </h2>
            <button
              onClick={() => setModal("reminders")}
              className="text-blue-400 text-sm hover:text-blue-300 transition"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-1 slim-scroll">
            {reminders.slice(0, 10).map((r, index) => (
              <div
                key={r._id}
                className={`p-3 rounded-xl transition ${
                  index === 0
                    ? "bg-blue-600/10 border border-blue-400/20"
                    : "bg-black/30 hover:bg-black/40"
                }`}
              >
                {/* Truncated in sidebar */}
                <p className="text-sm font-medium break-words line-clamp-2">
                  {r.content}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.remindAt).toLocaleString("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                {index === 0 && (
                  <p className="text-xs text-blue-400 mt-1">Upcoming</p>
                )}
              </div>
            ))}
            {reminders.length === 0 && (
              <div className="text-center mt-6 text-gray-500">
                <p className="text-2xl">⏰</p>
                <p className="text-sm mt-1">No reminders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* GROCERIES */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-lg flex flex-col flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              🛒 Groceries
              <span className="text-xs bg-green-600/30 px-2 py-0.5 rounded-lg">
                {groceries.length}
              </span>
            </h2>
            <button
              onClick={() => setModal("grocery")}
              className="text-blue-400 text-sm hover:text-blue-300 transition"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-1 slim-scroll">
            {groceries.slice(0, 10).map((g) => (
              <div
                key={g._id}
                className="bg-black/30 hover:bg-black/40 transition p-3 rounded-xl flex items-start gap-2"
              >
                <span className="text-base flex-shrink-0 mt-0.5">🛒</span>
                <p className="text-sm break-words line-clamp-2">{g.content}</p>
              </div>
            ))}
            {groceries.length === 0 && (
              <div className="text-center mt-6 text-gray-500">
                <p className="text-2xl">🛒</p>
                <p className="text-sm mt-1">No groceries yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL — properly scrollable with full text */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="bg-gray-900 border border-white/10 w-full max-w-lg rounded-2xl flex flex-col max-h-[80vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-white/10 flex-shrink-0">
              <h2 className="text-lg font-semibold">
                {modal === "reminders" ? "⏰ All Reminders" : "🛒 All Groceries"}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-white transition text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body — scrollable */}
            <div className="overflow-y-auto flex-1 p-5 space-y-3 slim-scroll">
              {(modal === "reminders" ? reminders : groceries).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-3xl mb-2">{modal === "reminders" ? "⏰" : "🛒"}</p>
                  <p className="text-sm">Nothing here yet</p>
                </div>
              )}

              {(modal === "reminders" ? reminders : groceries).map((t, index) => (
                <div
                  key={t._id}
                  className={`p-4 rounded-xl border ${
                    modal === "reminders" && index === 0
                      ? "bg-blue-600/10 border-blue-400/20"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  {/* Full text, no truncation in modal */}
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {t.content}
                  </p>

                  {t.remindAt && (
                    <p className="text-xs text-blue-400 mt-2">
                      ⏰{" "}
                      {new Date(t.remindAt).toLocaleString("en-PK", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  )}

                  {modal === "reminders" && index === 0 && (
                    <span className="inline-block text-xs text-blue-400 bg-blue-600/20 px-2 py-0.5 rounded-lg mt-2">
                      Upcoming
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex-shrink-0">
              <button
                onClick={() => setModal(null)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Todo;