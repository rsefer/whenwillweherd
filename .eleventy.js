module.exports = eleventyConfig => {

	eleventyConfig.addPassthroughCopy({
		'_src/images' : '/images'
	});
	eleventyConfig.addWatchTarget('_src/**/*.scss');
	eleventyConfig.addWatchTarget('_src/**/*.js');

	if (process.env.SSL_KEY_PATH && process.env.SSL_CRT_PATH) {
		eleventyConfig.setBrowserSyncConfig({
			https: {
				key: process.env.SSL_KEY_PATH,
				cert: process.env.SSL_CRT_PATH
			}
		});
	}

};
