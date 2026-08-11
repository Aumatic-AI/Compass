"use client";

import { useEffect, useState } from "react";
import BroadcastUpload, { Recipient } from "@/components/BroadcastUpload";

interface Segment {
  label: string;
  active: boolean;
}

interface BroadcastPanelProps {
  broadcastLabel: string;
  template: string;
  segments: Segment[];
  recipientCount: number;
  feePerRecipient: number;
}

type Tab = "send" | "create" | "status";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "inherit",
  fontSize: 14,
};

const tabBarStyle: React.CSSProperties = {
  display: "flex",
  gap: 4,
  marginBottom: 20,
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  paddingBottom: 0,
};

function tabButtonStyle(active: boolean): React.CSSProperties {
  return {
    padding: "10px 16px",
    background: "transparent",
    border: "none",
    borderBottom: active ? "2px solid #3b82f6" : "2px solid transparent",
    color: active ? "#fff" : "rgba(255,255,255,0.55)",
    fontWeight: active ? 600 : 400,
    fontSize: 14,
    cursor: "pointer",
  };
}

export default function BroadcastPanel({
  broadcastLabel,
  template,
  segments,
  recipientCount,
  feePerRecipient,
}: BroadcastPanelProps) {
  const [tab, setTab] = useState<Tab>("send");

  const [sendMode, setSendMode] = useState<"preset" | "upload">("preset");
  const [customRecipients, setCustomRecipients] = useState<Recipient[]>([]);
  const [templateName, setTemplateName] = useState(template);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const effectiveCount = sendMode === "upload" ? customRecipients.length : recipientCount;
  const estimatedCost = Math.round(effectiveCount * feePerRecipient);

  const handleSend = async () => {
    if (sendMode === "upload" && customRecipients.length === 0) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/broadcast/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: sendMode === "upload" ? customRecipients : [],
          templateName,
          languageCode: "en_US",
        }),
      });
      const data = await res.json();
      setSendResult({ sent: data.sent ?? 0, failed: data.failed ?? 0, total: data.total ?? 0 });
    } catch {
      setSendResult({ sent: 0, failed: effectiveCount, total: effectiveCount });
    } finally {
      setSending(false);
    }
  };

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("MARKETING");
  const [newLanguage, setNewLanguage] = useState("en_US");
  const [newBody, setNewBody] = useState("");
  const [createStatus, setCreateStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  const submitTemplate = async () => {
    if (!newName || !newBody) {
      setCreateStatus({ type: "error", message: "Template name and body text are required." });
      return;
    }
    setCreateStatus({ type: "loading", message: "Submitting to Meta for approval..." });
    try {
      const res = await fetch("/api/templates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, category: newCategory, language: newLanguage, bodyText: newBody }),
      });
      const data = await res.json();
      if (data.error) {
  setCreateStatus({ type: "error", message: data.error.message || JSON.stringify(data.error) });
} else if (data.status === "REJECTED") {
  setCreateStatus({
    type: "error",
    message: `Rejected by Meta. Template ID: ${data.id}. Reason: ${
      data.rejected_reason || data.reason || "Not provided by Meta at creation time — check Template Status tab in a few minutes for details."
    }`,
  });
} else {
        setCreateStatus({
          type: "success",
          message: `Submitted. Template ID: ${data.id}. Status: ${data.status}. Approval usually takes minutes to 48 hours.`,
        });
        setNewName("");
        setNewBody("");
      }
    } catch (err: any) {
      setCreateStatus({ type: "error", message: err.message });
    }
  };

  const [templates, setTemplates] = useState<any[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  const fetchTemplates = async () => {
    setStatusLoading(true);
    setStatusError("");
    try {
      const res = await fetch("/api/templates/status");
      const data = await res.json();
      if (data.error) setStatusError(data.error.message || JSON.stringify(data.error));
      else setTemplates(data.templates || []);
    } catch (err: any) {
      setStatusError(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "status") fetchTemplates();
  }, [tab]);

  const statusColor: Record<string, string> = {
    APPROVED: "#4ade80",
    PENDING: "#facc15",
    REJECTED: "#f87171",
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">{broadcastLabel}</div>
          <div className="panel-sub">
            {tab === "send" && "Estimated cost shown before you send"}
            {tab === "create" && "Submit a new template directly to Meta for approval"}
            {tab === "status" && "Check approval status of all your templates"}
          </div>
        </div>
      </div>

      <div style={tabBarStyle}>
        <button style={tabButtonStyle(tab === "send")} onClick={() => setTab("send")}>
          Send Broadcast
        </button>
        <button style={tabButtonStyle(tab === "create")} onClick={() => setTab("create")}>
          Create Template
        </button>
        <button style={tabButtonStyle(tab === "status")} onClick={() => setTab("status")}>
          Template Status
        </button>
      </div>

      {tab === "send" && (
        <div className="bc-body">
          <div>
            <div className="field-label" style={{ marginBottom: 6 }}>
              Message template
            </div>
            <input style={inputStyle} value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: 6 }}>
              Send to
            </div>
            <div className="chip-row">
              <div
                className={`chip${sendMode === "preset" ? " on" : ""}`}
                onClick={() => setSendMode("preset")}
                style={{ cursor: "pointer" }}
              >
                Existing Segments
              </div>
              <div
                className={`chip${sendMode === "upload" ? " on" : ""}`}
                onClick={() => setSendMode("upload")}
                style={{ cursor: "pointer" }}
              >
                Upload Excel/CSV
              </div>
            </div>
          </div>

          {sendMode === "preset" && (
            <div className="chip-row">
              {segments.map((s) => (
                <div key={s.label} className={`chip${s.active ? " on" : ""}`}>
                  {s.label}
                </div>
              ))}
            </div>
          )}

          {sendMode === "upload" && <BroadcastUpload onParsed={(data) => setCustomRecipients(data)} />}

          <div className="cost-row">
            <span>
              {effectiveCount} recipients × ₹{feePerRecipient.toFixed(2)} template fee
            </span>
            <strong>≈ ₹{estimatedCost}</strong>
          </div>

          <button className="send-btn" onClick={handleSend} disabled={sending || effectiveCount === 0}>
            {sending ? "Sending..." : "Send Broadcast"}
          </button>

          {sendResult && (
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              Sent: {sendResult.sent} · Failed: {sendResult.failed} · Total: {sendResult.total}
            </div>
          )}
        </div>
      )}

      {tab === "create" && (
        <div className="bc-body">
          <div>
            <div className="field-label" style={{ marginBottom: 6 }}>
              Template name
            </div>
            <input
              style={inputStyle}
              placeholder="festival_offer_2026"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
              Lowercase letters, numbers, and underscores only.
            </div>
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: 6 }}>
              Category
            </div>
            <div>
  <div className="field-label" style={{ marginBottom: 6 }}>
    Category
  </div>
  <select
    style={{ ...inputStyle, background: "#1e2530", color: "#fff" }}
    value={newCategory}
    onChange={(e) => setNewCategory(e.target.value)}
  >
    <option value="MARKETING" style={{ background: "#1e2530", color: "#fff" }}>
      Marketing
    </option>
    <option value="UTILITY" style={{ background: "#1e2530", color: "#fff" }}>
      Utility
    </option>
    <option value="AUTHENTICATION" style={{ background: "#1e2530", color: "#fff" }}>
      Authentication
    </option>
  </select>
</div>
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: 6 }}>
              Language code
            </div>
            <input style={inputStyle} value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} />
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: 6 }}>
              Message body
            </div>
            <textarea
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              placeholder="Hi {{1}}, enjoy 15% off on {{2}} this festival!"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
            />
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
              Use {"{{1}}"}, {"{{2}}"} for variables. Don&apos;t start or end the text with a variable.
            </div>
          </div>

          <button className="send-btn" onClick={submitTemplate} disabled={createStatus.type === "loading"}>
            {createStatus.type === "loading" ? "Submitting..." : "Submit for Approval"}
          </button>

          {createStatus.message && (
            <div
              style={{
                fontSize: 13,
                color:
                  createStatus.type === "error" ? "#f87171" : createStatus.type === "success" ? "#4ade80" : "inherit",
              }}
            >
              {createStatus.message}
            </div>
          )}
        </div>
      )}

      {tab === "status" && (
        <div className="bc-body">
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="chip" onClick={fetchTemplates} style={{ cursor: "pointer" }}>
              Refresh
            </button>
          </div>

          {statusLoading && <div style={{ opacity: 0.7 }}>Loading templates...</div>}
          {statusError && <div style={{ color: "#f87171" }}>{statusError}</div>}
          {!statusLoading && !statusError && templates.length === 0 && (
            <div style={{ opacity: 0.7 }}>No templates found yet. Create one to get started.</div>
          )}

          <div>
            {templates.map((t) => (
              <div
                key={t.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>
                    {t.category} · {t.language}
                  </div>
                  {t.status === "REJECTED" && t.rejected_reason && (
                    <div style={{ fontSize: 12, color: "#f87171", marginTop: 4 }}>
                      Reason: {t.rejected_reason}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  <span style={{ color: statusColor[t.status] ?? "inherit", fontWeight: 600, fontSize: 13 }}>
    {t.status}
  </span>
  {t.status === "REJECTED" && (
    <button
      className="chip"
      style={{ cursor: "pointer", fontSize: 12, padding: "4px 10px" }}
      onClick={async () => {
        if (!confirm(`Delete rejected template "${t.name}"?`)) return;
        await fetch("/api/templates/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: t.name }),
        });
        fetchTemplates();
      }}
    >
      Delete
    </button>
  )}
</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}