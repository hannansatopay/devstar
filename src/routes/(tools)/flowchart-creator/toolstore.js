import { writable } from 'svelte/store';

export const selectedTool = writable('');

export const selectedColor = writable('#ff0000');