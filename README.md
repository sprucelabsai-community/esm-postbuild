# resolve-path-aliases

This module ships with a script to run ES Module postbuild steps.

Add this line to your `package.json`

`"build.esm-postbuild": "esm-postbuild --target build --patterns **/*.js",`

Next run: `yarn build.esm-postbuild`
