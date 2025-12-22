import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
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
  			// LMTD Design System Colors
  			'ltd-primary': 'var(--ltd-primary)',
  			'ltd-primary-hover': 'var(--ltd-primary-hover)',
  			'ltd-primary-active': 'var(--ltd-primary-active)',
  			'ltd-primary-text': 'var(--ltd-primary-text)',
  			'ltd-brand-accent': 'var(--ltd-brand-accent)',
  			'ltd-brand-accent-hover': 'var(--ltd-brand-accent-hover)',
  			'ltd-brand-accent-secondary': 'var(--ltd-brand-accent-secondary)',
  			'ltd-brand-accent-tertiary': 'var(--ltd-brand-accent-tertiary)',
  			'ltd-surface-1': 'var(--ltd-surface-1)',
  			'ltd-surface-2': 'var(--ltd-surface-2)',
  			'ltd-surface-3': 'var(--ltd-surface-3)',
  			'ltd-surface-overlay': 'var(--ltd-surface-overlay)',
  			'ltd-text-1': 'var(--ltd-text-1)',
  			'ltd-text-2': 'var(--ltd-text-2)',
  			'ltd-text-3': 'var(--ltd-text-3)',
  			'ltd-border-1': 'var(--ltd-border-1)',
  			'ltd-border-2': 'var(--ltd-border-2)',
  			'ltd-border-focus': 'var(--ltd-border-focus)',
  			'ltd-ring-focus': 'var(--ltd-ring-focus)',
  			'ltd-state-success': 'var(--ltd-state-success)',
  			'ltd-state-warning': 'var(--ltd-state-warning)',
  			'ltd-state-error': 'var(--ltd-state-error)',
  			'ltd-state-info': 'var(--ltd-state-info)',
  			'ltd-success': 'var(--ltd-success)',
  			'ltd-success-bg': 'var(--ltd-success-bg)',
  			'ltd-warning': 'var(--ltd-warning)',
  			'ltd-warning-bg': 'var(--ltd-warning-bg)',
  			'ltd-error': 'var(--ltd-error)',
  			'ltd-error-bg': 'var(--ltd-error-bg)',
  			'ltd-info': 'var(--ltd-info)',
  			'ltd-info-bg': 'var(--ltd-info-bg)',
  			'ltd-table-header': 'var(--ltd-table-header)',
  			'ltd-table-border': 'var(--ltd-table-border)',
  			'ltd-table-row-hover': 'var(--ltd-table-row-hover)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
