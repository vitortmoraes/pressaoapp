export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#2a2a2a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <p className="text-white text-base font-semibold text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-white/10 text-white/60 rounded-xl py-2.5 text-sm font-medium hover:bg-white/5 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white font-bold rounded-xl py-2.5 text-sm hover:bg-red-600 transition-colors">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
