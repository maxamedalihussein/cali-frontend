import type { Config } from "tailwindcss";

export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{js,ts,jsx,tsx}',
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				background: '#fff',
				card: '#fff',
				sidebar: '#f8fafc',
				accent: '#4e8cff',
				text: '#22223b',
				border: '#e5e7eb',
				darkBg: '#0f172a',         // Deep navy background
				darkCard: '#1e293b',       // Card background
				darkBorder: '#334155',     // Border
				darkText: '#e2e8f0',       // Light text
				darkAccent: '#3b82f6',     // Blue accent
				darkHover: '#1d4ed8',      // Hover blue
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [],
} satisfies Config;
