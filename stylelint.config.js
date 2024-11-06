const defaultConfig = require('@wordpress/stylelint-config');

module.exports = {
	...defaultConfig,
	rules: {
		...defaultConfig.rules,
		'at-rule-no-unknown': null,
	},
};
