all: dist.js

buble-opts = --yes dangerousForOf,dangerousTaggedTemplateString

dist.js: index.js
	node_modules/.bin/buble $(buble-opts) $< -o $@

run: index.js test.js
	node test.js
