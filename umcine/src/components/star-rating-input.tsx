import { cn } from "@/utils/cn";

const SCORES = [1, 2, 3, 4, 5];

interface StarRatingInputProps {
  value: number;
  onChange: (score: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({ value, onChange, disabled }: StarRatingInputProps) {
  return (
    <div role="group" aria-label="별점" className="flex items-center gap-1">
      {SCORES.map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          disabled={disabled}
          aria-label={`${score}점`}
          aria-pressed={score === value}
          className={cn(
            "transition-colors disabled:cursor-not-allowed",
            score <= value ? "text-yellow-400" : "text-white/30 hover:text-white/60",
          )}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
