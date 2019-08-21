module.exports = function(wallaby) {
    return {
        files: [
            'tsconfig.json',
            'tsconfig.spec.json',
            'jest.config.js',
            'apps/**/*.+(ts|html|json|snap|css|less|sass|scss|jpg|jpeg|gif|png|svg)',
            '!apps/**/*.spec.ts',
            '!apps/**/*.stories.ts',
            '!apps/**/main.ts',
            'libs/**/*.+(ts|html|json|snap|css|less|sass|scss|jpg|jpeg|gif|png|svg)',
            '!libs/**/*.spec.ts',
            '!libs/**/*.stories.ts',
            '!libs/**/environment.*.ts',
            '!libs/**/environment.ts',
            '!apps/legacy-restyle/**/*.*',
        ],

        tests: [
            './apps/**/*.spec.ts',
            './libs/**/*.spec.ts',
            '!apps/pluto-e2e/**/*.spec.ts',
            '!apps/product-stamp-e2e/**/*.spec.ts',
        ],

        env: {
            type: 'node',
            runner: 'node',
            params: {
                runner: '--max-old-space-size=12288',
            },
        },

        debug: true,

        testFramework: 'jest',

        compilers: {
            '**/*.ts?(x)': wallaby.compilers.typeScript({
                module: 'commonjs',
                getCustomTransformers: () => {
                    return {
                        before: [
                            require('jest-preset-angular/InlineHtmlStripStylesTransformer').factory(
                                { compilerModule: require('typescript') }
                            ),
                        ],
                    };
                },
            }),
            '**/*.html': file => ({
                code: require('ts-jest').process(file.content, file.path, {
                    globals: {
                        'ts-jest': {
                            stringifyContentPathRegex: '\\.html$',
                        },
                    },
                }),
                map: { version: 3, sources: [], names: [], mappings: [] },
                ranges: [],
            }),
        },

        preprocessors: {
            '**/*.js': file =>
                require('@babel/core').transform(file.content, {
                    sourceMap: true,
                    compact: false,
                    filename: file.path,
                    presets: [require('babel-preset-jest')],
                }),
        },

        setup: function(wallaby) {
            let jestConfig = require('./jest.config');
            delete jestConfig.preset;
            jestConfig = Object.assign(
                require('jest-preset-angular/jest-preset'),
                jestConfig
            );
            jestConfig.transformIgnorePatterns.push('instrumented.*.(jsx?|html)$');
            jestConfig.rootDir = './';
            jestConfig.setupFilesAfterEnv = ['./apps/pluto/src/test-setup.ts'];

            jestConfig.transform = { '^.+\\.(ts)$': 'ts-jest' };

            wallaby.testFramework.configure(jestConfig);
        },
    };
};
