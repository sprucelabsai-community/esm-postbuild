import { exec } from 'child_process'
import os from 'os'
import pathUtil from 'path'
import AbstractSpruceTest, { test, assert } from '@sprucelabs/test'
import fsUtil from 'fs-extra'
import {
    loadSubstitueWrite,
    processesByGlob,
    substituteImports,
} from '../../esm-postbuild'

export default class UpdatingImportsTest extends AbstractSpruceTest {
    @test('Passthru String1', 'commando pumpkins')
    @test('Passthru String2', 'Snakes\nLizards\nCobras\nSquirrels')
    @test('Passthru String3', 'I import food for a living')
    @test('Passthru String4', 'I export food for a living')
    @test('Passthru String5', 'I require imports of food')
    protected static canPassthruContentWithFixImports(stringIn: string) {
        assert.isEqual(substituteImports(stringIn), stringIn)
    }

    @test(
        'Passed import 1',
        "import { panda } from 'squirrel'",
        "import { panda } from 'squirrel'"
    )
    @test(
        'Passed import 2',
        "import { panda } from './squirrel'",
        "import { panda } from './squirrel.js'"
    )
    @test(
        'Passed import 3',
        "import { panda } from 'lodash/map'",
        "import { panda } from 'lodash/map.js'"
    )
    @test(
        'Passed import 4',
        "import { panda } from '@sprucelabs/test'",
        "import { panda } from '@sprucelabs/test'"
    )
    @test(
        'Passed import 5',
        "import { panda } from '@sprucelabs/test/something'",
        "import { panda } from '@sprucelabs/test/something.js'"
    )
    @test(
        'Passed import 6',
        "import { panda } from '..'",
        "import { panda } from '../index.js'",
        pathUtil.join(__dirname, '..', 'testDirsAndFiles/banana/index.js')
    )
    @test(
        'Passed import 7',
        "import { panda } from '.'",
        "import { panda } from './index.js'",
        pathUtil.join(__dirname, '..', 'testDirsAndFiles/banana/index.js')
    )
    @test(
        'Passed import 8',
        "import { FieldDefinitions } from '../fields'",
        "import { FieldDefinitions } from '../fields/index.js'",
        pathUtil.join(__dirname, '..', 'testDirsAndFiles/banana/index.js')
    )
    @test(
        'Passed import 9',
        "import { FieldDefinitions } from '../notfields'",
        "import { FieldDefinitions } from '../notfields.js'",
        pathUtil.join(__dirname, '..', 'testDirsAndFiles/banana/index.js')
    )
    @test(
        'Passed export 10',
        "export * from '../.spruce/schemas/fields/fields.types';",
        "export * from '../.spruce/schemas/fields/fields.types.js';",
        pathUtil.join(__dirname, '..', 'testDirsAndFiles/banana/index.js')
    )
    protected static replacesPassedContentWithProperImports(
        stringIn: string,
        expected: string,
        path?: string
    ) {
        assert.isEqual(substituteImports(stringIn, path), expected)
    }

    @test()
    protected static async updatesSingleFileOnDisk() {
        const source = pathUtil.join(
            __dirname,
            '..',
            'testDirsAndFiles/flatFileIn'
        )

        const destinationDir = await fsUtil.mkdtemp(
            pathUtil.join(os.tmpdir(), 'flatFile')
        )
        fsUtil.mkdirSync(pathUtil.join(destinationDir, 'fields'))

        const destinationFile = pathUtil.join(destinationDir, 'file1')
        fsUtil.copySync(source, destinationFile)

        loadSubstitueWrite(destinationFile)
        const modified = fsUtil.readFileSync(destinationFile).toString()

        const expected = fsUtil
            .readFileSync(
                pathUtil.join(__dirname, '..', 'testDirsAndFiles/flatFileRes')
            )
            .toString()
        assert.isEqual(modified, expected)
    }

    @test()
    protected static async processesEntireDirectory() {
        const sourceDir = pathUtil.join(
            __dirname,
            '..',
            'testDirsAndFiles/fullFolder'
        )

        const sourceResDir = pathUtil.join(
            __dirname,
            '..',
            'testDirsAndFiles/fullFolderRes'
        )

        const destinationDir = await fsUtil.mkdtemp(
            pathUtil.join(os.tmpdir(), 'fullFolder')
        )
        fsUtil.copySync(sourceDir, destinationDir)

        processesByGlob(destinationDir, ['**/*.js'])

        const checkfiles = [
            'index.js',
            'fields/AbstractField.js',
            'fields/index.js',
            'singletons/SchemaRegistry.js',
        ]
        checkfiles.forEach((file) => {
            const validFile = fsUtil
                .readFileSync(pathUtil.join(sourceResDir, file))
                .toString()
            const processedFile = fsUtil
                .readFileSync(pathUtil.join(destinationDir, file))
                .toString()

            assert.isEqual(validFile, processedFile)
        })
    }

    @test()
    protected static async canRunfromCommandLine() {
        const sourceDir = pathUtil.join(
            __dirname,
            '..',
            'testDirsAndFiles/fullFolder'
        )

        const sourceResDir = pathUtil.join(
            __dirname,
            '..',
            'testDirsAndFiles/fullFolderRes'
        )

        const destinationDir = await fsUtil.mkdtemp(
            pathUtil.join(os.tmpdir(), 'fullFolder')
        )
        fsUtil.copySync(sourceDir, destinationDir)

        const command = this.resolvePath('build', 'esm-postbuild.js')

        await this.executeCommand(
            process.cwd(),
            `node ${command} --target=${destinationDir}`
        )

        const checkfiles = [
            'index.js',
            'fields/AbstractField.js',
            'fields/index.js',
            'singletons/SchemaRegistry.js',
        ]
        checkfiles.forEach((file) => {
            const validFile = fsUtil
                .readFileSync(pathUtil.join(sourceResDir, file))
                .toString()
            const processedFile = fsUtil
                .readFileSync(pathUtil.join(destinationDir, file))
                .toString()

            assert.isEqual(validFile, processedFile)
        })
    }

    private static async executeCommand(cwd: string, command: string) {
        await new Promise((resolve, reject) => {
            exec(
                command,
                {
                    cwd,
                    env: {
                        PATH: process.env.PATH,
                    },
                },
                (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(undefined)
                    }
                }
            )
        })
    }
}
