// https://eslint.org/docs/latest/use/configure/
export default [
	{
		env: {
			browser: true,
			jest: true,
		},
		extends: [
			'airbnb',
			'airbnb/hooks',
		],
		parserOptions: { ecmaVersion: 2020, },
		ignores: ['./dist/*'],
		rules: {
			'@typescript-eslint/consistent-type-imports': [
				2,
				{ fixStyle: 'separate-type-imports' }
			],
			'@typescript-eslint/no-restricted-imports': [
				2,
				{
					paths: [
						{
							name: 'react-redux',
							importNames: ['useSelector', 'useStore', 'useDispatch'],
							message: 'Please use pre-typed versions from `src/app/hooks.ts` instead.'
						}
					]
				}
			]
		},
	}
];