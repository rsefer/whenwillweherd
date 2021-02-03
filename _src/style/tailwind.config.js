module.exports = {
	purge: {
		mode: 'all',
		preserveHtmlElements: false,
		content: ['_site/**/*.html']
	},
	darkMode: 'media',
	variants: {
		extend: {
			padding: ['dark']
		}
	}
};
