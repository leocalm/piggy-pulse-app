interface Props {
  onComplete: () => void;
}
export function PeriodModelStep({ onComplete }: Props) {
  return <button onClick={onComplete}>Continue (stub)</button>;
}
