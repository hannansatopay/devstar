export interface TimezoneClock {
	id: string;
	city: string;
	country: string;
	timezone: string;
	hour: number;
	minute: number;
	second: number;
	displayTime: string;
	displayDate: string;
	offset: number;
	offsetLabel: string;
}

export interface TimezoneOption {
	id: string;
	label: string;
	timezone: string;
	country: string;
	city: string;
}
