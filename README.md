# batch-rename

Renames all files in current directory (or any directory specified).
For each file, matches with a pattern then perform replacement.
Alternatively, remove a list of strings from each file.

## installation

`git clone 'https://github.com/cocoabox/batch-rename' && pushd batch-rename && npm i && popd`

## usage

```
node index.js -f [FILENAME_PATTERN] -r [REPLACEMENT_STR] 
# match each filename with a pattern then perform replacement

node index.js -x [STRING_TO_REMOVE] -x [ANOTHER_STRING_TO_REMOVE] ...
# removes specific strings from each filename
```

other useful options:

- `-d` : input directory
- `-p` : previews changes
- `-o FORMAT` : output rename operations instead of executing them. FORMAT must be `tsv` or `csv` or `mv` (a list of "mv" commands)
