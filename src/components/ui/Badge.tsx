interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "yellow" | "red" | "gray" | "indigo";
}

const variants = {
  green: "bg-green-600 text-white",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-700",
  indigo: "bg-indigo-100 text-indigo-800",
};

export function Badge({ children, variant = "gray" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
