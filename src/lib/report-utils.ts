/**
 * Report utility functions
 * Functions for generating report periods and related utilities
 */

import type { ReportPeriod, ReportPeriodType } from "@/types";

/**
 * German month names for report labels
 */
const MONTH_NAMES_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

/**
 * Generate report periods based on the selected type
 * @param type - The type of report period (year, half-year, quarter, month)
 * @returns Array of report periods sorted by most recent first
 */
export function generateReportPeriods(type: ReportPeriodType): ReportPeriod[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const periods: ReportPeriod[] = [];

  switch (type) {
    case "year":
      for (let year = currentYear; year >= currentYear - 2; year--) {
        periods.push({
          type: "year",
          year,
          value: 1,
          label: `${year}`,
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`,
        });
      }
      break;

    case "half-year":
      for (let year = currentYear; year >= currentYear - 1; year--) {
        const maxHalf = year === currentYear ? (currentMonth <= 6 ? 1 : 2) : 2;
        for (let half = maxHalf; half >= 1; half--) {
          periods.push({
            type: "half-year",
            year,
            value: half,
            label: `H${half} ${year}`,
            startDate: `${year}-${half === 1 ? "01" : "07"}-01`,
            endDate: `${year}-${half === 1 ? "06" : "12"}-${
              half === 1 ? "30" : "31"
            }`,
          });
        }
      }
      break;

    case "quarter":
      for (let year = currentYear; year >= currentYear - 1; year--) {
        const maxQuarter =
          year === currentYear ? Math.ceil(currentMonth / 3) : 4;
        for (let quarter = maxQuarter; quarter >= 1; quarter--) {
          const startMonth = (quarter - 1) * 3 + 1;
          const endMonth = quarter * 3;
          const lastDay = new Date(year, endMonth, 0).getDate();
          periods.push({
            type: "quarter",
            year,
            value: quarter,
            label: `Q${quarter} ${year}`,
            startDate: `${year}-${String(startMonth).padStart(2, "0")}-01`,
            endDate: `${year}-${String(endMonth).padStart(2, "0")}-${lastDay}`,
          });
        }
      }
      break;

    case "month":
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const lastDay = new Date(year, month, 0).getDate();
        periods.push({
          type: "month",
          year,
          value: month,
          label: `${MONTH_NAMES_DE[month - 1]} ${year}`,
          startDate: `${year}-${String(month).padStart(2, "0")}-01`,
          endDate: `${year}-${String(month).padStart(2, "0")}-${lastDay}`,
        });
      }
      break;
  }

  return periods;
}

/**
 * Calculate the number of days in a report period
 * @param period - The report period
 * @returns Number of days in the period
 */
export function getDaysInPeriod(period: ReportPeriod): number {
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  return (
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
}
