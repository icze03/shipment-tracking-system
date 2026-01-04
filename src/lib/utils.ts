import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPhilippineTimeISO(): string {
  const now = new Date();
  // Options to format the date in PH time and get all parts
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Manila',
  };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
  const partMap = parts.reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {} as Record<string, string>);
  
  // Construct the ISO-like string for PH time
  return `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}:${partMap.minute}:${partMap.second}.000+08:00`;
}

export function formatDate(date: string | Date | undefined | null) {
  if (!date) return "N/A";
  
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "Pending";
  }

  // Since the stored date string is now already in PH time, we can format it directly.
  return dateObj.toLocaleString("en-US", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
