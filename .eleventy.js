module.exports = eleventyConfig => {

	eleventyConfig.setUseGitIgnore(false);

	eleventyConfig.addPassthroughCopy({
		'_src/images' : '/images',
		'./_tmp/style.css' : './style.css'
	});
	eleventyConfig.addWatchTarget('_src/**/*.js');
	eleventyConfig.addWatchTarget('./_tmp/style.css');

	eleventyConfig.addShortcode('version', () => {
		return String(Date.now());
	});

	if (process.env.SSL_KEY_PATH && process.env.SSL_CRT_PATH) {
		eleventyConfig.setBrowserSyncConfig({
			https: {
				key: process.env.SSL_KEY_PATH,
				cert: process.env.SSL_CRT_PATH
			}
		});
	}

};
