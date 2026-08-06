import { cn } from "@/frontend/utils/cn";

export default function SectionHeading({ eyebrow, title, description, align = "center", className }) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <span className="block mb-2 text-sm font-semibold tracking-wide text-teal-600 uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}
