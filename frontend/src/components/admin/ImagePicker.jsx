import { useEffect, useMemo } from "react";
import { ImagePlus, X } from "lucide-react";

/**
 * Photo chooser with previews.
 *  - existing: images already saved  [{ url, publicId }]
 *  - files:    newly chosen File objects
 *  - max=1 behaves as "replace the picture"; max>1 lets you build a small gallery
 */
const ImagePicker = ({ existing = [], onRemoveExisting, files, onFilesChange, max = 1, label = "Image", hint }) => {
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const single = max === 1;
  const shownExisting = single && files.length ? [] : existing;
  const slots = max - shownExisting.length - files.length;

  const onPick = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (!picked.length) return;
    onFilesChange(single ? [picked[0]] : [...files, ...picked.slice(0, Math.max(slots, 0))]);
  };

  const showAddTile = single ? shownExisting.length === 0 && files.length === 0 : slots > 0;
  const tile = "relative w-24 h-24 rounded-xl overflow-hidden border border-plum/15 bg-white shrink-0";
  const removeBtn = "absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors";

  return (
    <div>
      <p className="text-sm font-medium text-plum-dark mb-1.5">
        {label} {!single && <span className="text-plum-dark/40 font-normal">(up to {max})</span>}
      </p>
      <div className="flex flex-wrap gap-3">
        {shownExisting.map((img) => (
          <div key={img.publicId || img.url} className={tile}>
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onRemoveExisting?.(img)} aria-label="Remove image" className={removeBtn}>
              <X size={14} />
            </button>
          </div>
        ))}
        {previews.map((p, i) => (
          <div key={p.url} className={`${tile} ring-2 ring-terracotta/60`}>
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-terracotta text-white text-[10px] text-center py-0.5">New</span>
            <button type="button" onClick={() => onFilesChange(files.filter((_, idx) => idx !== i))} aria-label="Remove new image" className={removeBtn}>
              <X size={14} />
            </button>
          </div>
        ))}
        {showAddTile && (
          <label className="w-24 h-24 rounded-xl border-2 border-dashed border-terracotta/50 text-terracotta flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-terracotta/5 transition-colors shrink-0 text-xs">
            <ImagePlus size={22} />
            Add
            <input type="file" accept="image/*" multiple={!single} onChange={onPick} className="sr-only" />
          </label>
        )}
        {single && !showAddTile && (
          <label className="self-center text-sm text-terracotta font-medium cursor-pointer hover:underline">
            Change photo
            <input type="file" accept="image/*" onChange={onPick} className="sr-only" />
          </label>
        )}
      </div>
      {hint && <p className="text-xs text-plum-dark/50 mt-2">{hint}</p>}
    </div>
  );
};

export default ImagePicker;
