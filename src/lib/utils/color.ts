export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function normalizeHex(input: string): string {
	if (!input) return "#000000";
	let hex = input.trim().replace(/[^0-9a-f]/gi, "");
	if (hex.length === 3) {
		hex = hex
			.split("")
			.map((c) => c + c)
			.join("");
	}
	if (hex.length !== 6) {
		return "#000000";
	}
	return `#${hex.toLowerCase()}`;
}

export function hexToRgb(hex: string): RGB {
	const normalized = normalizeHex(hex).replace("#", "");
	const bigint = Number.parseInt(normalized, 16);
	return {
		r: (bigint >> 16) & 255,
		g: (bigint >> 8) & 255,
		b: bigint & 255
	};
}

export function rgbToHex({ r, g, b }: RGB): string {
	const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;

	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case rn:
				h = (gn - bn) / d + (gn < bn ? 6 : 0);
				break;
			case gn:
				h = (bn - rn) / d + 2;
				break;
			default:
				h = (rn - gn) / d + 4;
				break;
		}

		h /= 6;
	}

	return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
	const hn = clamp(h, 0, 360) / 360;
	const sn = clamp(s, 0, 100) / 100;
	const ln = clamp(l, 0, 100) / 100;

	if (sn === 0) {
		const value = Math.round(ln * 255);
		return { r: value, g: value, b: value };
	}

	const hueToRgb = (p: number, q: number, t: number) => {
		let temp = t;
		if (temp < 0) temp += 1;
		if (temp > 1) temp -= 1;
		if (temp < 1 / 6) return p + (q - p) * 6 * temp;
		if (temp < 1 / 2) return q;
		if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
		return p;
	};

	const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
	const p = 2 * ln - q;

	return {
		r: Math.round(hueToRgb(p, q, hn + 1 / 3) * 255),
		g: Math.round(hueToRgb(p, q, hn) * 255),
		b: Math.round(hueToRgb(p, q, hn - 1 / 3) * 255)
	};
}

export function adjustLightness(hex: string, delta: number): string {
	const hsl = rgbToHsl(hexToRgb(hex));
	hsl.l = clamp(hsl.l + delta, 0, 100);
	return rgbToHex(hslToRgb(hsl));
}

export function rotateHue(hex: string, delta: number): string {
	const hsl = rgbToHsl(hexToRgb(hex));
	hsl.h = (hsl.h + delta + 360) % 360;
	return rgbToHex(hslToRgb(hsl));
}

export function blend(hexA: string, hexB: string, ratio: number): string {
	const a = hexToRgb(hexA);
	const b = hexToRgb(hexB);
	const mix = (channelA: number, channelB: number) => channelA * (1 - ratio) + channelB * ratio;
	return rgbToHex({
		r: mix(a.r, b.r),
		g: mix(a.g, b.g),
		b: mix(a.b, b.b)
	});
}

export function toCssRgb(hex: string): string {
	const { r, g, b } = hexToRgb(hex);
	return `rgb(${r}, ${g}, ${b})`;
}

export function toCssHsl(hex: string): string {
	const { h, s, l } = rgbToHsl(hexToRgb(hex));
	return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}
