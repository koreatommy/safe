import "./toast.css";

type ToastProps = {
  message: string | null;
};

export function Toast({ message }: ToastProps) {
  return (
    <div className="toast" role="status" hidden={!message}>
      {message}
    </div>
  );
}
