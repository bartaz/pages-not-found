mkdir -p tmp

# build the JS
echo "!function(){"       > tmp/build.js
echo "var PAGES = "      >> tmp/build.js
npx js-yaml src/book.yml >> tmp/build.js
cat src/book.js          >> tmp/build.js
echo "}();"              >> tmp/build.js

cat tmp/build.js | npx uglifyjs --compress --mangle > tmp/build.min.js
mv tmp/build.min.js tmp/build.js

# build the CSS
npx postcss -u cssnano --no-map -- src/book.css > tmp/build.css

# build the HTML
cat src/pre.html   > index.html

echo "<style>"    >> index.html
cat tmp/build.css >> index.html
echo "</style>"   >> index.html

echo "<body>"     >> index.html
cat src/body.html >> index.html

echo "<script>"   >> index.html
cat tmp/build.js  >> index.html
echo "</script>"  >> index.html
echo "</body>"    >> index.html

# clean up
rm -rf tmp
