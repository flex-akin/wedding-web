interface NameFieldsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  required?: boolean;
  stack?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function joinName(firstName: string, lastName: string) {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

export function NameFields({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  required = true,
  stack = false,
  autoFocus = false,
  className = "",
}: NameFieldsProps) {
  return (
    <div className={`flex gap-3 ${stack ? "flex-col" : ""} ${className}`}>
      <input
        autoFocus={autoFocus}
        value={firstName}
        onChange={(e) => onFirstNameChange(e.target.value)}
        placeholder="First name"
        required={required}
        className="flex-1 rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
      />
      <input
        value={lastName}
        onChange={(e) => onLastNameChange(e.target.value)}
        placeholder="Last name"
        required={required}
        className="flex-1 rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
      />
    </div>
  );
}
