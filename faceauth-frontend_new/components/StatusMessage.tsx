type StatusMessageProps = {
  kind: "success" | "error";
  message: string;
};

export default function StatusMessage({ kind, message }: StatusMessageProps) {
  const isSuccess = kind === "success";
  return (
    <div
      role="status"
      className={`rounded-card border px-4 py-3 text-sm ${
        isSuccess
          ? "border-signal/40 bg-signal/10 text-signal"
          : "border-rust/40 bg-rust/10 text-rust"
      }`}
    >
      {message}
    </div>
  );
}
