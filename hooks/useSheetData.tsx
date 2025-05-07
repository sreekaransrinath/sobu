"use client";
import { useEffect, useState } from "react";
import { fetchSheetRows } from "@/lib/googleSheets";
import type { Transaction } from "@/lib/transactionsLoader";

export default function useSheetData() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchSheetRows()
      .then((rows) => {
        console.log("Raw rows from sheet:", rows);
        
        const transactions: Transaction[] = rows.map((row) => {
          console.log("Processing row:", row);
          const dateStr = String(row.Date || "");
          let date: Date | null = null;
          let isFixedExpense = false;
          
          // First check if it's a fixed expense (empty date)
          if (!dateStr || dateStr.trim() === "") {
            isFixedExpense = true;
          } else {
            // Try to parse date from various formats
            try {
              if (dateStr.includes("/")) {
                // MM/DD/YYYY format
                const [month, day, year] = dateStr.split("/").map(Number);
                const fullYear = year < 100 ? 2000 + year : year; // Add 2000 to 2-digit years
                // Create date at noon to avoid timezone issues (fix the -1 day offset)
                date = new Date(Date.UTC(fullYear, month - 1, day, 12, 0, 0))
              } else if (dateStr.startsWith("May ")) {
                // Handle "May X" format
                const day = parseInt(dateStr.replace("May ", ""));
                // Use UTC with noon time to avoid timezone issues
                date = new Date(Date.UTC(2025, 4, day, 12, 0, 0)); // May is month 4 (0-indexed)
              } else {
                // ISO or other format - try to parse with UTC
                try {
                  // Try to create a UTC date
                  const parsedDate = new Date(dateStr);
                  date = new Date(Date.UTC(
                    parsedDate.getFullYear(),
                    parsedDate.getMonth(),
                    parsedDate.getDate(),
                    12, 0, 0
                  ));
                } catch (e) {
                  date = new Date(dateStr);
                }
              }
              
              // Validate date is valid
              if (isNaN(date.getTime())) {
                console.warn(`Invalid date format: ${dateStr}, treating as fixed expense`);
                date = null;
                isFixedExpense = true;
              }
            } catch (e) {
              console.warn(`Error parsing date: ${dateStr}, treating as fixed expense`, e);
              date = null;
              isFixedExpense = true;
            }
          }

          const amountRaw = String(row.Amount || "0");
          const amount = parseFloat(amountRaw.replace(/[^0-9.]/g, "")) || 0;

          const transaction = {
            date,
            description: String(row.Description || ""),
            category: String(row.Category || ""),
            amount,
            isFixedExpense,
          };
          
          console.log("Processed transaction:", transaction);
          return transaction;
        });
        
        console.log("Final transactions:", transactions);
        setData(transactions);
      })
      .catch((err) => {
        console.error("useSheetData error:", err);
        setError(err as Error);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
