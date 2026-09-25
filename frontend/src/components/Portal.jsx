import { createPortal } from "react-dom";

// Renders children straight into <body> so fixed overlays (drawers, sheets, modals)
// are never trapped inside a transformed / blurred parent.
const Portal = ({ children }) => (typeof document === "undefined" ? null : createPortal(children, document.body));

export default Portal;
