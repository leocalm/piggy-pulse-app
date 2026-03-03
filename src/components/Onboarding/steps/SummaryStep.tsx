interface Props {
  onEnter: () => void;
  onBack: () => void;
}
export function SummaryStep({ onEnter, onBack }: Props) {
  return (
    <div>
      <button onClick={onBack}>Back</button>
      <button onClick={onEnter}>Enter PiggyPulse (stub)</button>
    </div>
  );
}
