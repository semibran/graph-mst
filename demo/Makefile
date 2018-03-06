# GNU Make 3.8.2 and above

PATH := $(PATH):node_modules/.bin
SHELL := /bin/bash

.ONESHELL:
.SILENT:

all: clean
	make html js css
	babel dist/script.js --presets=env | uglifyjs -o dist/script.js -c -m
	postcss dist/style.css -u autoprefixer -o dist/style.css -m
	cleancss dist/style.css -o dist/style.css --source-map --source-map-inline-sources
	html-minifier --collapse-whitespace dist/index.html -o dist/index.html
	rm dist/script.js.map dist/style.css.map

clean:
	rm -rf dist
	mkdir dist

html:
	cp src/index.html dist/index.html

js:
	rollup src/script.js -o dist/script.js -f iife -c -m

css:
	node-sass src/style.scss -o dist --source-map true --source-map-contents

deploy: all
	gh-pages -d dist -m "updates"
