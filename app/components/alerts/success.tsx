type AlertType = 'success' | 'error' | 'warning' | 'info';

type AlertProps = {
  AlertTitle: string;
  AlertDescription: string;
  type?: AlertType;
};

const ALERT_ICONS: Record<AlertType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export default function Alert({
  AlertTitle,
  AlertDescription,
  type = 'info',
}: AlertProps) {
  const icon = ALERT_ICONS[type];

  return (
    <div className="w-50 h-auto absolute  p-4 bg-white rounded border text-black">
      <div className="flex items-start gap-2">
        <span className="text-lg font-bold">{icon}</span>
        <div>
          <p className="font-semibold">{AlertTitle}</p>
          <p className="text-sm">{AlertDescription}</p>
        </div>
      </div>
    </div>
  );
}