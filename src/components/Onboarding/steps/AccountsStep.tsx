interface Props {
  onComplete: () => void;
  onBack: () => void;
}
export function AccountsStep({ onComplete, onBack }: Props) {
  return (
    <div>
      <button onClick={onBack}>Back</button>
      <button onClick={onComplete}>Continue (stub)</button>
    </div>
  );
}
