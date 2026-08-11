"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export interface Recipient {
  phone: string;
  name?: string;
}

interface BroadcastUploadProps {
  onParsed: (data: Recipient[]) => void;
}

export default function BroadcastUpload({ onParsed }: BroadcastUploadProps) {
  const [fileName, setFileName] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError("");
    setCount(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

      const recipients: Recipient[] = rows
        .map((row) => {
          const phoneRaw =
            row["phone"] ||
            row["Phone"] ||
            row["phone_number"] ||
            row["Phone Number"] ||
            row["PHONE"];
          const name = row["name"] || row["Name"] || row["NAME"];

          if (!phoneRaw) return null;

          // Normalize: strip spaces, dashes, plus signs, parentheses
          const phone = String(phoneRaw).replace(/[\s\-()+]/g, "");

          // Basic validation: must be 10-15 digits (country code + number)
          if (!/^\d{10,15}$/.test(phone)) return null;

          return { phone, name: name ? String(name) : undefined };
        })
        .filter((r): r is Recipient => r !== null);

      if (recipients.length === 0) {
        setError(
          "No valid rows found. Make sure your file has a 'phone' column with country code (e.g. 919876543210)."
        );
        return;
      }

      setCount(recipients.length);
      onParsed(recipients);
    } catch (err) {
      setError("Could not read this file. Please upload a valid .xlsx, .xls, or .csv file.");
    }
  };

  return (
    <div className="border border-dashed border-gray-600 rounded-lg p-4 space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Upload recipient list (Excel or CSV)
      </label>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFile}
        className="text-sm text-gray-400"
      />
      {fileName && (
        <p className="text-sm text-gray-400">
          Loaded: <span className="font-medium">{fileName}</span>
        </p>
      )}
      {count !== null && (
        <p className="text-sm text-green-400">
          {count} valid recipient{count === 1 ? "" : "s"} found.
        </p>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <p className="text-xs text-gray-500">
        Expected columns: <code>phone</code> (required, with country code, no + or spaces),{" "}
        <code>name</code> (optional).
      </p>
    </div>
  );
}
