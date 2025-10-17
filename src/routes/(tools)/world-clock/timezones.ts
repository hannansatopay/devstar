import type { TimezoneOption } from './types';

const rawTimezones: Array<[string, string]> = [
	['Abidjan, Ivory Coast', 'Africa/Abidjan'],
	['Accra, Ghana', 'Africa/Accra'],
	['Addis Ababa, Ethiopia', 'Africa/Addis_Ababa'],
	['Adelaide, Australia', 'Australia/Adelaide'],
	['Algiers, Algeria', 'Africa/Algiers'],
	['Amsterdam, Netherlands', 'Europe/Amsterdam'],
	['Anchorage, United States', 'America/Anchorage'],
	['Ankara, Turkey', 'Europe/Istanbul'],
	['Auckland, New Zealand', 'Pacific/Auckland'],
	['Bangkok, Thailand', 'Asia/Bangkok'],
	['Barcelona, Spain', 'Europe/Madrid'],
	['Beijing, China', 'Asia/Shanghai'],
	['Berlin, Germany', 'Europe/Berlin'],
	['Bogotá, Colombia', 'America/Bogota'],
	['Brisbane, Australia', 'Australia/Brisbane'],
	['Brussels, Belgium', 'Europe/Brussels'],
	['Bucharest, Romania', 'Europe/Bucharest'],
	['Budapest, Hungary', 'Europe/Budapest'],
	['Buenos Aires, Argentina', 'America/Argentina/Buenos_Aires'],
	['Cairo, Egypt', 'Africa/Cairo'],
	['Calgary, Canada', 'America/Edmonton'],
	['Cape Town, South Africa', 'Africa/Johannesburg'],
	['Chicago, United States', 'America/Chicago'],
	['Copenhagen, Denmark', 'Europe/Copenhagen'],
	['Dallas, United States', 'America/Chicago'],
	['Denver, United States', 'America/Denver'],
	['Dubai, United Arab Emirates', 'Asia/Dubai'],
	['Dublin, Ireland', 'Europe/Dublin'],
	['Frankfurt, Germany', 'Europe/Berlin'],
	['Geneva, Switzerland', 'Europe/Zurich'],
	['Hong Kong, Hong Kong SAR', 'Asia/Hong_Kong'],
	['Honolulu, United States', 'Pacific/Honolulu'],
	['Istanbul, Turkey', 'Europe/Istanbul'],
	['Jakarta, Indonesia', 'Asia/Jakarta'],
	['Johannesburg, South Africa', 'Africa/Johannesburg'],
	['Kolkata, India', 'Asia/Kolkata'],
	['Kuala Lumpur, Malaysia', 'Asia/Kuala_Lumpur'],
	['Lisbon, Portugal', 'Europe/Lisbon'],
	['London, United Kingdom', 'Europe/London'],
	['Los Angeles, United States', 'America/Los_Angeles'],
	['Madrid, Spain', 'Europe/Madrid'],
	['Manila, Philippines', 'Asia/Manila'],
	['Melbourne, Australia', 'Australia/Melbourne'],
	['Mexico City, Mexico', 'America/Mexico_City'],
	['Miami, United States', 'America/New_York'],
	['Milan, Italy', 'Europe/Rome'],
	['Montreal, Canada', 'America/Toronto'],
	['Moscow, Russia', 'Europe/Moscow'],
	['Mumbai, India', 'Asia/Kolkata'],
	['Munich, Germany', 'Europe/Berlin'],
	['Nairobi, Kenya', 'Africa/Nairobi'],
	['New Delhi, India', 'Asia/Kolkata'],
	['New York, United States', 'America/New_York'],
	['Osaka, Japan', 'Asia/Tokyo'],
	['Oslo, Norway', 'Europe/Oslo'],
	['Paris, France', 'Europe/Paris'],
	['Perth, Australia', 'Australia/Perth'],
	['Prague, Czech Republic', 'Europe/Prague'],
	['Quebec City, Canada', 'America/Toronto'],
	['Riyadh, Saudi Arabia', 'Asia/Riyadh'],
	['Rome, Italy', 'Europe/Rome'],
	['San Francisco, United States', 'America/Los_Angeles'],
	['São Paulo, Brazil', 'America/Sao_Paulo'],
	['Seattle, United States', 'America/Los_Angeles'],
	['Seoul, South Korea', 'Asia/Seoul'],
	['Shanghai, China', 'Asia/Shanghai'],
	['Singapore, Singapore', 'Asia/Singapore'],
	['Stockholm, Sweden', 'Europe/Stockholm'],
	['Sydney, Australia', 'Australia/Sydney'],
	['Taipei, Taiwan', 'Asia/Taipei'],
	['Tel Aviv, Israel', 'Asia/Jerusalem'],
	['Tokyo, Japan', 'Asia/Tokyo'],
	['Toronto, Canada', 'America/Toronto'],
	['Vancouver, Canada', 'America/Vancouver'],
	['Vienna, Austria', 'Europe/Vienna'],
	['Warsaw, Poland', 'Europe/Warsaw'],
	['Washington, D.C., United States', 'America/New_York'],
	['Zurich, Switzerland', 'Europe/Zurich']
];

function splitLocation(label: string) {
	const parts = label.split(',').map((part) => part.trim());
	const city = parts[0] ?? label;
	const country = parts.slice(1).join(', ').trim() || parts[0] || label;
	return { city, country };
}

export const popular: TimezoneOption[] = [
	['New York, United States', 'America/New_York'],
	['London, United Kingdom', 'Europe/London'],
	['Tokyo, Japan', 'Asia/Tokyo'],
	['Sydney, Australia', 'Australia/Sydney'],
	['Singapore, Singapore', 'Asia/Singapore'],
	['Dubai, United Arab Emirates', 'Asia/Dubai'],
	['Kolkata, India', 'Asia/Kolkata'],
	['São Paulo, Brazil', 'America/Sao_Paulo'],
	['Los Angeles, United States', 'America/Los_Angeles'],
	['Paris, France', 'Europe/Paris']
].map(([label, timezone]) => {
	const { city, country } = splitLocation(label);
	const id = timezone.replace(/\//g, '-');
	return {
		id,
		label,
		timezone,
		city,
		country
	};
});

export const allTimezones: TimezoneOption[] = rawTimezones.map(([label, timezone]) => {
	const { city, country } = splitLocation(label);
	return {
		id: timezone.replace(/\//g, '-'),
		label,
		timezone,
		city,
		country
	};
});
