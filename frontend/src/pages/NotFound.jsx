import { Link } from "react-router-dom";
import { Scissors } from "lucide-react";

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <Scissors className="text-plum/20 mb-4" size={48} />
    <h1 className="font-display text-3xl text-plum font-semibold mb-2">Page Not Found</h1>
    <p className="text-plum-dark/60 mb-6">This thread seems to have come loose. Let's get you back on track.</p>
    <Link to="/" className="btn-primary">Back to Home</Link>
  </div>
);

export default NotFound;
