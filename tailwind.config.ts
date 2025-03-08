
import { join } from 'path';
import type { Config } from 'tailwindcss';

// 1. Import the Skeleton plugin
import { skeleton } from '@skeletonlabs/tw-plugin';
import { rubric_pro_theme } from './rubric_pro_theme';
import forms from '@tailwindcss/forms';

const config = {
	// 2. Opt for dark mode to be handled via the class method
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		// 3. Append the path to the Skeleton package
		join(require.resolve(
			'@skeletonlabs/skeleton'),
			'../**/*.{html,js,svelte,ts}'
		)
	],
	theme: {
		extend: {
			colors: {
				dark: {
					primary: '#E9760C', // dark orange
					secondary: '#1E1E1E', // dark grey
					tertiary: '#A47950', // light brown
					success: '#1fbd0a', // green
					error: '#ff0000', // red
					warning: '#ffcc00', // yellow
					surface: '#2d2d2d' // dark grey
				}
			}
		},
	},
	plugins: [
		forms,
		skeleton({
			themes: {
				custom: [
					rubric_pro_theme
				]
			}
		})
	]
} satisfies Config;

export default config;
						