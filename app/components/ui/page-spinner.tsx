import { FaSpinner } from "react-icons/fa";

export default function PageSpinner() {
  return (
    <div className="flex items-center justify-center w-full py-32">
      <FaSpinner className="animate-spin text-primary text-4xl" />
    </div>
  );
}
