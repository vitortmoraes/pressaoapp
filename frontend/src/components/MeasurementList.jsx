import { useState } from "react";
import api from "../api/client";
import EditMeasurementModal from "./EditMeasurementModal";
import ConfirmModal from "./ConfirmModal";

const COLOR_MAP = {
  green:   { bg: "bg-green-500/20",  border: "border-green-500/30",  text: "text-green-300" },
  yellow:  { bg: "bg-yellow-500/20", border: "border-yellow-500/30", text: "text-yellow-300" },
  orange:  { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-300" },
  red:     { bg: "bg-red-500/20",    border: "border-red-500/30",    text: "text-red-300" },
  darkred: { bg: "bg-red-800/30",    border: "border-red-700/40",    text: "text-red-200" },
};

const COLOR_MAP_LIGHT = {
  green:   { bg: "bg-green-100",    border: "border-green-300",   text: "text-green-800" },
  yellow:  { bg: "bg-yellow-100",   border: "border-yellow-300",  text: "text-yellow-800" },
  orange:  { bg: "bg-orange-100",   border: "border-orange-300",  text: "text-orange-800" },
  red:     { bg: "bg-red-100",      border: "border-red-300",     text: "text-red-800" },
  darkred: { bg: "bg-red-200",      border: "border-red-500",     text: "text-red-900" },
};

function toUtc(iso) {
  return iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
}

function formatDate(iso) {
  return new Date(toUtc(iso)).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function MeasurementList({ measurements, onDelete, onEdit, dark = false }) {
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const map = dark ? COLOR_MAP : COLOR_MAP_LIGHT;

  if (measurements.length === 0) {
    return (
      <div className={`rounded-2xl p-8 text-center ${dark ? "bg-white/5 text-white/60" : "bg-white shadow-md text-gray-500"}`}>
        Nenhuma medição registrada ainda.
      </div>
    );
  }

  async function handleDelete(id) {
    await api.delete(`/measurements/${id}`);
    setConfirmId(null);
    onDelete?.();
  }

  return (
    <>
      {confirmId && (
        <ConfirmModal
          message="Deseja excluir esta medição?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
      {editing && (
        <EditMeasurementModal
          measurement={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); onEdit?.(); }}
        />
      )}

      <div className={`rounded-2xl p-5 ${dark ? "bg-white/5" : "bg-white shadow-md"}`}>
        <h2 className={`text-base font-bold mb-4 ${dark ? "text-white" : "text-gray-800"}`}>Histórico</h2>
        <div className="space-y-2">
          {measurements.map((m) => {
            const c = map[m.color] ?? map.green;
            return (
              <div key={m.id}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${c.bg} ${c.border}`}>
                <div className="flex items-center gap-3">
                  <div className="min-w-[64px] text-center">
                    <p className={`text-xl font-extrabold ${c.text}`}>{m.systolic}/{m.diastolic}</p>
                    <p className={`text-xs ${dark ? "text-white/55" : "text-gray-400"}`}>mmHg</p>
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wide ${c.text}`}>{m.classification}</p>
                    <p className={`text-xs ${dark ? "text-white/60" : "text-gray-500"}`}>{formatDate(m.measured_at)}</p>
                    <div className={`flex gap-2 text-xs mt-0.5 ${dark ? "text-white/60" : "text-gray-500"}`}>
                      {m.heart_rate && <span>{m.heart_rate} bpm</span>}
                      {m.arm_used && <span>· {m.arm_used}</span>}
                      {m.feeling && <span>· {m.feeling}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(m)} className="text-white/50 hover:text-brand-orange transition-colors px-1">✏️</button>
                  <button onClick={() => setConfirmId(m.id)} className="text-white/50 hover:text-red-400 transition-colors text-lg leading-none px-1">×</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
