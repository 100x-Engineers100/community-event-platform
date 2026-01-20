import type { Config } from "tailwindcss"

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
				mono: ['var(--font-jetbrains-mono)', 'monospace']
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				'100x': {
					'bg-primary': '#0A0A0A',
					'bg-secondary': '#141414',
					'bg-tertiary': '#1A1A1A',
					'accent-primary': '#FF6B35',
					'accent-light': '#FFEEE9',
					'accent-glow': 'rgba(249, 104, 70, 0.3)',
					'text-primary': '#FFFFFF',
					'text-secondary': '#A0A0A0',
					'text-muted': '#666666',
					'border-default': '#2A2A2A',
					'border-accent': '#F96846'
				}
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'spotlight': {
					'0%': { opacity: '0', transform: 'translate(-72%, -62%) scale(0.5)' },
					'100%': { opacity: '1', transform: 'translate(-50%, -40%) scale(1)' }
				},
				'shimmer': {
					'from': { opacity: '0' },
					'50%': { opacity: '1' },
					'to': { opacity: '0' }
				},
				'shimmer-slide': {
					'to': { transform: 'translate(calc(100cqw - 100%), 0)' }
				},
				'spin-around': {
					'0%': { transform: 'translateZ(0) rotate(0)' },
					'15%': { transform: 'translateZ(0) rotate(0)' },
					'20%': { transform: 'translateZ(0) rotate(180deg)' },
					'25%': { transform: 'translateZ(0) rotate(360deg)' },
					'100%': { transform: 'translateZ(0) rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'spotlight': 'spotlight 2s ease .75s 1 forwards',
				'shimmer': 'shimmer 2s linear infinite',
				'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
				'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
export default config
