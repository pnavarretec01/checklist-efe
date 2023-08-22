module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{css,js,png,svg,ico,html}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/,
		/^y/
	]
};
