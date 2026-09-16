import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, History, LogOut, MapPin, Phone, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { api, ApiError } from "@/api/client";
import { formatNPR, formatDate } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/constants";
import { Spinner } from "@/components/Feedback";
import type { Order } from "@/types";

interface DriverStats {
  assignedToday: number;
  active: number;
  completedToday: number;
  cashCollectedToday: number;
}

const NEXT_ACTION: Record<string, { label: string; endpoint: string; style: string }> = {
  pending: { label: "Accept Order", endpoint: "accept", style: "bg-emerald-600 hover:bg-emerald-700" },
  confirmed: { label: "Pick Up Order", endpoint: "pickup", style: "bg-blue-600 hover:bg-blue-700" },
  packing: { label: "Mark Out for Delivery", endpoint: "out-for-delivery", style: "bg-amber-600 hover:bg-amber-700" },
};

function SignaturePad({ onDone }: { onDone: (dataUrl: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(2, 2);
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#111827";
    }
  }, []);

  const pos = (e: React.PointerEvent) => {
    const canvas = ref.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div>
      <canvas
        ref={ref}
        className="h-28 w-full touch-none rounded-lg border border-gray-300 bg-white"
        onPointerDown={(e) => {
          drawing.current = true;
          const ctx = ref.current?.getContext("2d");
          const { x, y } = pos(e);
          ctx?.beginPath();
          ctx?.moveTo(x, y);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = ref.current?.getContext("2d");
          const { x, y } = pos(e);
          ctx?.lineTo(x, y);
          ctx?.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => {
            const canvas = ref.current;
            const ctx = canvas?.getContext("2d");
            if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          }}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            const url = ref.current?.toDataURL("image/png");
            if (url) onDone(url);
          }}
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Use signature
        </button>
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const [online, setOnline] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [completeTarget, setCompleteTarget] = useState<Order | null>(null);
  const [failTarget, setFailTarget] = useState<Order | null>(null);
  const [otp, setOtp] = useState("");
  const [notes, setNotes] = useState("");
  const [proof, setProof] = useState("");
  const [proofMode, setProofMode] = useState<"photo" | "signature">("photo");
  const [failReason, setFailReason] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalBusy, setModalBusy] = useState(false);

  const statsQuery = useAsync<DriverStats>(() => api.get("/api/driver/stats"));
  const ordersQuery = useAsync<Order[]>(() => api.get("/api/driver/orders"));
  const reasonsQuery = useAsync<string[]>(() => api.get("/api/driver/fail-reasons"));

  const refresh = () => {
    statsQuery.reload();
    ordersQuery.reload();
  };

  const toggleOnline = async () => {
    const next = !online;
    setOnline(next);
    try {
      await api.post("/api/driver/online", { online: next });
    } catch {
      setOnline(!next);
    }
  };

  const runTransition = async (order: Order, endpoint: string) => {
    setBusyId(order.id);
    setActionError("");
    try {
      await api.post(`/api/driver/orders/${order.id}/${endpoint}`);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  const openComplete = (order: Order) => {
    setCompleteTarget(order);
    setOtp("");
    setNotes("");
    setProof("");
    setModalError("");
  };

  const submitComplete = async () => {
    if (!completeTarget) return;
    if (otp.trim().length < 4) {
      setModalError("Enter the 4-digit OTP from the customer.");
      return;
    }
    setModalBusy(true);
    setModalError("");
    try {
      await api.post(`/api/driver/orders/${completeTarget.id}/complete`, {
        otp: otp.trim(),
        notes: notes.trim() || undefined,
        proofImage: proof || undefined,
      });
      setCompleteTarget(null);
      refresh();
    } catch (err) {
      setModalError(err instanceof ApiError ? err.message : "Could not complete delivery.");
    } finally {
      setModalBusy(false);
    }
  };

  const submitFail = async () => {
    if (!failTarget || !failReason) {
      setModalError("Choose a reason.");
      return;
    }
    setModalBusy(true);
    setModalError("");
    try {
      await api.post(`/api/driver/orders/${failTarget.id}/fail`, { reason: failReason });
      setFailTarget(null);
      setFailReason("");
      refresh();
    } catch (err) {
      setModalError(err instanceof ApiError ? err.message : "Could not update order.");
    } finally {
      setModalBusy(false);
    }
  };

  const onPhoto = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setModalError("Photo must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProof(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const stats = statsQuery.data;
  const orders = ordersQuery.data ?? [];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 bg-gray-900 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs text-gray-400">Driver</p>
            <p className="font-bold">{user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleOnline}
              className={`relative h-7 w-14 rounded-full transition-colors ${online ? "bg-emerald-500" : "bg-gray-600"}`}
              title={online ? "Go offline" : "Go online"}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${online ? "left-8" : "left-1"}`}
              />
            </button>
            <span className={`text-xs font-bold ${online ? "text-emerald-400" : "text-gray-400"}`}>
              {online ? "ONLINE" : "OFFLINE"}
            </span>
            <Link to="/driver/history" className="rounded-lg bg-gray-800 p-2 hover:bg-gray-700" title="History">
              <History className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg bg-gray-800 p-2 hover:bg-gray-700"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-4">
        {statsQuery.loading ? (
          <Spinner label="Loading dashboard..." />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Assigned today", value: stats?.assignedToday ?? 0 },
              { label: "Active", value: stats?.active ?? 0 },
              { label: "Completed today", value: stats?.completedToday ?? 0 },
              { label: "Cash collected", value: formatNPR(stats?.cashCollectedToday ?? 0) },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold uppercase text-gray-400">{c.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900">{c.value}</p>
              </div>
            ))}
          </div>
        )}

        {actionError && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{actionError}</div>
        )}

        <h2 className="text-base font-bold text-gray-900">Active orders ({orders.length})</h2>

        {ordersQuery.loading ? (
          <Spinner label="Loading orders..." />
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-sm font-medium text-gray-500">No active deliveries. You're all caught up.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const action = NEXT_ACTION[o.status];
              const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${o.addressLine} ${o.landmark ?? ""} Birgunj`)}`;
              return (
                <article key={o.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900">{o.orderNumber}</p>
                      <p className="text-xs text-gray-400">{formatDate(o.createdAt)}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                      {o.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm">
                    <p className="flex items-center gap-2 font-semibold text-gray-800">
                      {o.customerName}
                      <a href={`tel:${o.customerPhone}`} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                        <Phone className="h-3.5 w-3.5" /> {o.customerPhone}
                      </a>
                    </p>
                    <p className="flex items-start gap-2 text-gray-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <span>
                        {o.addressLine}
                        {o.landmark ? ` (near ${o.landmark})` : ""}
                      </span>
                    </p>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700"
                    >
                      Navigate on Google Maps
                    </a>
                  </div>

                  <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                    {(o.items ?? []).map((i) => (
                      <p key={i.id}>
                        {i.productName} <span className="text-gray-400">× {i.qty}</span>
                      </p>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-sm">
                      <span className="font-bold text-gray-900">{formatNPR(o.total)}</span>
                      <span className={`font-bold ${o.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                        {o.paymentStatus === "paid" ? "PAID" : PAYMENT_METHODS[o.paymentMethod] === "Cash on Delivery" ? "COLLECT CASH" : `${PAYMENT_METHODS[o.paymentMethod] ?? o.paymentMethod} · PENDING`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {o.status === "out_for_delivery" ? (
                      <button
                        type="button"
                        disabled={busyId === o.id}
                        onClick={() => openComplete(o)}
                        className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Complete Delivery
                      </button>
                    ) : (
                      action && (
                        <button
                          type="button"
                          disabled={busyId === o.id}
                          onClick={() => runTransition(o, action.endpoint)}
                          className={`flex-1 rounded-lg py-2.5 text-sm font-bold text-white disabled:opacity-60 ${action.style}`}
                        >
                          {busyId === o.id ? "Working..." : action.label}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setFailTarget(o);
                        setFailReason("");
                        setModalError("");
                      }}
                      className="rounded-lg border border-red-200 px-3 py-2.5 text-sm font-bold text-red-600"
                      title="Report failed delivery"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {completeTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setCompleteTarget(null)}>
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Complete {completeTarget.orderNumber}</h3>
            <p className="text-xs text-gray-500">Enter the 4-digit OTP shared by the customer.</p>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder="••••"
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-emerald-600"
            />

            <div className="mt-4">
              <div className="flex gap-2">
                {(["photo", "signature"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setProofMode(m)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-bold ${proofMode === m ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-500"}`}
                  >
                    {m === "photo" ? "Delivery photo" : "Customer signature"}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                {proofMode === "photo" ? (
                  <label className="block cursor-pointer rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm font-medium text-gray-500">
                    {proof ? "Photo attached ✓ — tap to change" : "Tap to take / upload a photo (optional)"}
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
                  </label>
                ) : (
                  <SignaturePad onDone={(url) => setProof(url)} />
                )}
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Delivery notes (optional)"
              rows={2}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />

            {modalError && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{modalError}</p>}

            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setCompleteTarget(null)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-bold text-gray-600">
                Cancel
              </button>
              <button
                type="button"
                disabled={modalBusy}
                onClick={submitComplete}
                className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {modalBusy ? "Verifying..." : "Mark delivered"}
              </button>
            </div>
          </div>
        </div>
      )}

      {failTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setFailTarget(null)}>
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Delivery failed?</h3>
            <p className="text-xs text-gray-500">Choose what went wrong with {failTarget.orderNumber}.</p>
            <select
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            >
              <option value="">Select a reason...</option>
              {(reasonsQuery.data ?? []).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {modalError && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{modalError}</p>}

            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setFailTarget(null)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-bold text-gray-600">
                Back
              </button>
              <button
                type="button"
                disabled={modalBusy}
                onClick={submitFail}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {modalBusy ? "Saving..." : "Confirm failure"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}