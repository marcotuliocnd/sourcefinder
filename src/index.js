const { program } = require('commander')
const { version } = require('../package.json')
const { javascriptExtractor } = require('./javascript-extractor')
const { sourcemapDetector } = require('./sourcemap-detector')

const asciiArt = `
                                 __ _           _           
   ___  ___  _   _ _ __ ___ ___ / _(_)_ __   __| | ___ _ __ 
  / __|/ _ \\| | | | '__/ __/ _ \\ |_| | '_ \\ / _\` |/ _ \\ '__|
  \\__ \\ (_) | |_| | | | (_|  __/  _| | | | | (_| |  __/ |   
  |___/\\___/ \\__,_|_|  \\___\\___|_| |_|_| |_|\\__,_|\\___|_|   
`

console.log(asciiArt)

program
  .name('sourcefinder')
  .description('Command-line tool for checking if applications have JavaScript sourcemaps enabled.')
  .version(version)
  .option('-u, --url <url>', 'Specify the target URL to check for sourcemaps')
  .option('-f, --file <file>', 'Provide a file with a list of URLs to check')
  .option('-H, --header [headers...]', 'Use custom request headers')

program.on('--help', () => {
  console.log('\nExamples:')
  console.log('  $ sourcefinder -u https://example.com')
  console.log('  $ sourcefinder -f urls.txt -H "User-Agent: any-user-agent"')
})


const main = async () => {
  program.parse(process.argv)

  const options = program.opts()

  if (!Object.keys(options).length) {
    program.help()
  }

  const urls = []

  if (options.url) {
    urls.push(options.url)
  }

  if (!urls.length) {
    console.log('No targets provided!')
  }

  let hasFoundAny = false

  for (const url of urls) {
    const scripts = await javascriptExtractor(url, options.header)
    for (const script of scripts) {
      const isEnabled = await sourcemapDetector(script, options.header)
      if (isEnabled) {
        hasFoundAny = true
        const message = `[\x1b[32msourcemap-enabled\x1b[0m] ${url}`
        console.log(message)
        break
      }
    }
  }

  if (!hasFoundAny) {
    console.log('No results found! Better luck next time')
  }
}

main()

