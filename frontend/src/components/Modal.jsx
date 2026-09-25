import { useEffect } from "react";
import { X } from "lucide-react";
import Portal from "./Portal";

const Modal = ({ title, onClose, children, wide }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center justify-center sm:p-4 animate-fadeIn"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className={`bg-cream rounded-t-3xl sm:rounded-2xl shadow-soft w-full ${
            wide ? "sm:max-w-2xl" : "sm:max-w-lg"
          } max-h-[92vh] overflow-y-auto animate-sheetUp sm:animate-popIn`}
        >
          <div className="flex items-center justify-between p-5 border-b border-plum/10 sticky top-0 bg-cream z-10">
            <h3 className="font-display text-xl text-plum font-semibold">{title}</h3>
            <button onClick={onClose} aria-label="Close" className="text-plum-dark/50 hover:text-plum">
              <X size={22} />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
