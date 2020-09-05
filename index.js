#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const getopt = require('node-getopt');

const opt = getopt.create([
    ['d', 'dir=DIR', 'input directory'],
    ['f', 'find=REGEX', 'filename pattern ; example : \'^(.*?)\\(BD 1920x1080p AVC FLAC\\)\.mkv\$$\''],
    ['r', 'replace-with=STR', 'replace filename this string (for argument matching use $1, $2, ... $<name>) ; example : \'$1.mkv\''],
    ['x', 'delete-str=STR+', 'remove this string in each filename'],
    ['p', 'preview', 'print results without executing'],
    ['o', 'output=OUTPUT_FORMAT', 'should be either : "csv", "tsv", or "mv" (list of mv commands)'],
]).bindHelp().parseSystem();


const accepted_outputs = ['csv', 'tsv', 'mv'];
if (typeof opt.options.output !== 'undefined' && ! accepted_outputs.includes(opt.options.output)) {
    console.warn('ERROR : expecting --output to be either :', accepted_outputs.join(', '),'\n');
    opt.showHelp();
    process.exit(1);
}

let mode = 'search-and-replace';
let remove_strs = [];
let find;
let replace;
let match_count = 0;

if (opt.options['delete-str']) {
    mode = 'delete';
    remove_strs = opt.options['delete-str'];
}

else {
    mode = 'search-and-replace';
    find = opt.options.find;

    if (! find) { 
        console.warn('ERROR : missing argument : --find=REGEX\n');
        opt.showHelp();
        process.exit(1);
    }

    find = new RegExp(find);

    replace = opt.options['replace-with'];

    if (! replace) {
        console.warn('ERROR : missing argument : --replace-with=STR\n');
        opt.showHelp();
        process.exit(1);
    }
}

let dir = opt.options.dir ? opt.options.dir : process.cwd();

function trim_name(filename) {
    let mat =  filename.match(/^(.*?)\.([^\.]+)$/);
    if (mat) {
        let nom = mat[1].trim();
        let ext = mat[2].trim();
        return `${nom}.${ext}`;
    }
    else {
        return filename;
    }
}

function do_rename(dir, old_name, new_name) {
    if (opt.options.preview) {
        console.warn(`# rename : ${old_name} ==> ${new_name}`);
    }
    else if (opt.options.output) {
        switch (opt.options.output) {
            case 'mv':
                console.log(`mv '${dir}/${old_name}' '${dir}/${new_name}'`);
                break;
            case 'tsv':
            case 'csv':
                let sep = opt.options.output == 'tsv' ? '\t': ',';
                console.log(`${old_name}${sep}${new_name}`);
                break;
        }
    }
    else {
        console.warn(`# rename : ${old_name} ==> ${new_name}`);
        // do rename via fs.rename
        let old_path = `${dir}/${old_name}`;
        let new_path = `${dir}/${new_name}`;
        fs.renameSync(old_path, new_path);
    }
}

let on_each_file;

if (mode == 'search-and-replace') {
    on_each_file = file => {
        let mat = file.match(find);
        if (mat) {
            let new_name = file.replace(find, replace);
            new_name = trim_name(new_name);
            if (new_name !== file) {
                match_count++;
                do_rename(dir, file, new_name);
            }
        }
    };
}
else if (mode == 'delete') {
    on_each_file = file => {
        let new_name = file;
        remove_strs.forEach(rs => {
            new_name = new_name.replace(rs, '');
        });
        new_name = trim_name(new_name);
        if (new_name !== file) {
            match_count++;
            do_rename(dir, file, new_name);
        }
    };
}

fs.readdir(dir, (err, files) => {
    files.forEach(on_each_file);
});

if (! match_count) {
    console.warn('nothing matched');
}
