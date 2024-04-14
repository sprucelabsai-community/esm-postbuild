#!/usr/bin/env node

import fs from 'fs'
import pathUtil from 'path'
import chalk from 'chalk'
import globby from 'globby'
import yargs from 'yargs'

if (require.main === module) {
    const argv = yargs.options({
        target: {
            desc: "Where I'll look to begin mapping paths. Defaults to cwd.",
        },
        patterns: {
            desc: 'Comma separated list of globby patterns, default to **/*.js',
        },
    }).argv

    const { patterns, target } = argv as {
        patterns?: string
        target?: string
    }

    const targetDir = target ? target : 'build/esm'

    const pattern = patterns ? patterns.split(',') : ['**/*.js']

    console.log(chalk.green(`Updating ${targetDir}`))
    const results = processesByGlob(targetDir, pattern)
    console.log(chalk.green.bold(`Done! Processed ${results} files.`))
}

function isDir(path: string) {
    try {
        const stat = fs.lstatSync(path)
        return stat.isDirectory()
    } catch (e) {
        return false
    }
}

export function postbuild() {
    console.log('yup')
}

export function substituteImports(stringIn: string, filepath?: string) {
    const result = `${stringIn}`.replace(
        /(from |require\()['"]((.*?))['"]/gi,
        (_, requireOrImport, moduleOrPath) => {
            // if it starts with a . its a locaal path
            if (moduleOrPath[0] == '.') {
                if (filepath) {
                    const targetDir = pathUtil.join(
                        pathUtil.dirname(filepath),
                        moduleOrPath
                    )

                    // if it is a directory use the index file inside it
                    if (isDir(targetDir)) {
                        let relativePath = pathUtil.join(
                            moduleOrPath,
                            'index.js'
                        )
                        // join is eating the ./ that is needed
                        if (relativePath[0] != '.') {
                            relativePath = './' + relativePath
                        }

                        return `${requireOrImport}'${relativePath}'`
                    }
                }
                return `${requireOrImport}'${moduleOrPath}.js'`
            } else {
                // if it has a / it may be a sub path in a module
                const numSlashes = moduleOrPath.split('/').length - 1

                if (numSlashes > 0) {
                    // if it starts with an @ there must be at least two slashes
                    if (moduleOrPath[0] != '@' || numSlashes > 1) {
                        return `${requireOrImport}'${moduleOrPath}.js'`
                    }
                }
            }

            return `${requireOrImport}'${moduleOrPath}'`
        }
    )

    return result
}

export function loadSubstitueWrite(file: string) {
    const contents = fs.readFileSync(file).toString()
    const results = substituteImports(contents, file)

    if (contents != results) {
        fs.writeFileSync(file, results)
    }
}

export function processesByGlob(destination: string, patterns: string[]) {
    const files = globby.sync(
        patterns.map((pattern) => pathUtil.join(destination, '/', pattern)),
        {
            dot: true,
        }
    )

    let fileCount = 0

    files.forEach((file) => {
        loadSubstitueWrite(file)
        fileCount++
    })

    return fileCount
}
