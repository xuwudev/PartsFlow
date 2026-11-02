/**
 * Type representing the event data needed to add a task to a calendar.
 */
export interface CalendarEvent {
	title: string;
	description?: string | null;
	location?: string | null;
	dueDate: string | null; // ISO datetime or YYYY-MM-DD
}

/**
 * Safely parses a task's due_date string to get the start and end Date objects in local time.
 * If the task is date-only (like "2026-05-26" or ending in "T00:00:00.000Z"), it schedules
 * the event for 9:00 AM - 10:00 AM local time on that day to prevent date shifts when exported as UTC.
 */
export function parseTaskDates(dueDateStr: string): { start: Date; end: Date } {
	// Check if it has a specific time component other than midnight (00:00)
	const hasTime =
		dueDateStr.includes("T") &&
		!dueDateStr.endsWith("T00:00:00.000Z") &&
		!dueDateStr.endsWith("T00:00:00Z");

	if (hasTime) {
		const start = new Date(dueDateStr);
		const end = new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour duration
		return { start, end };
	} else {
		// Extract date part only (YYYY-MM-DD)
		const datePart = dueDateStr.split("T")[0];
		const parts = datePart.split("-");

		if (parts.length === 3) {
			const year = parseInt(parts[0], 10);
			const month = parseInt(parts[1], 10) - 1; // 0-indexed month
			const day = parseInt(parts[2], 10);

			// Default to 09:00 - 10:00 AM local time on that day
			const start = new Date(year, month, day, 9, 0, 0);
			const end = new Date(year, month, day, 10, 0, 0);
			return { start, end };
		} else {
			// Fallback if parsing fails
			const start = new Date(dueDateStr);
			const end = new Date(start.getTime() + 60 * 60 * 1000);
			return { start, end };
		}
	}
}

/**
 * Formats a Date object to the standard UTC string format used by calendars: YYYYMMDDTHHMMSSZ.
 */
export function formatDateToUtcString(date: Date): string {
	return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/**
 * Escapes characters for iCalendar (ICS) values (RFC 5545).
 * Backslashes, commas, semicolons, and newlines must be escaped.
 */
export function escapeIcsText(text: string): string {
	if (!text) return "";
	return text
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "");
}

/**
 * Folds iCalendar lines to ensure they do not exceed 75 characters (RFC 5545).
 * Folded lines start with a space.
 */
export function foldIcsLine(line: string): string {
	if (line.length <= 70) return line;

	const chunks: string[] = [];
	chunks.push(line.substring(0, 70));
	let index = 70;
	while (index < line.length) {
		chunks.push(` ${line.substring(index, index + 69)}`);
		index += 69;
	}
	return chunks.join("\r\n");
}

/**
 * Generates a Google Calendar event creation URL.
 * Uses template URL format. Does not require API keys or OAuth.
 */
export function buildGoogleCalendarUrl(event: CalendarEvent): string {
	if (!event.dueDate) return "";

	const { start, end } = parseTaskDates(event.dueDate);
	const dates = `${formatDateToUtcString(start)}/${formatDateToUtcString(end)}`;

	const params = new URLSearchParams({
		action: "TEMPLATE",
		text: event.title,
		details: event.description || "",
		location: event.location || "",
		dates: dates,
		ctz: "Europe/Los Angeles, CA", // Polish CRM timezone context
	});

	return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates the iCalendar (.ics) string for a task.
 */
export function generateIcsContent(event: CalendarEvent): string {
	if (!event.dueDate) return "";

	const { start, end } = parseTaskDates(event.dueDate);
	const dtstamp = formatDateToUtcString(new Date());
	const dtstart = formatDateToUtcString(start);
	const dtend = formatDateToUtcString(end);
	const uid = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}@partsflow_crm`;

	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//PARTSFLOW CRM//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"BEGIN:VEVENT",
		`UID:${uid}`,
		`DTSTAMP:${dtstamp}`,
		`DTSTART:${dtstart}`,
		`DTEND:${dtend}`,
		foldIcsLine(`SUMMARY:${escapeIcsText(event.title)}`),
		foldIcsLine(`DESCRIPTION:${escapeIcsText(event.description || "")}`),
		foldIcsLine(`LOCATION:${escapeIcsText(event.location || "")}`),
		"END:VEVENT",
		"END:VCALENDAR",
	];

	return lines.join("\r\n");
}

/**
 * Triggers a browser download of the generated .ics file.
 */
export function downloadIcsFile(filename: string, content: string): void {
	const blob = new Blob([content], { type: "text/calendar;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", filename);

	// Append to body, trigger click, and cleanup
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
