const fs = require('fs')
const {join} = require('path')

const delay = require('delay')
const Koa = require('koa')
const Router = require('@koa/router')

const app = new Koa()

const router = new Router()

const html = fs.readFileSync(join(__dirname, 'page.html')).toString()

class Logger {
  constructor () {
    this._pages = Object.create(null)
  }

  track (page, id) {
    const counts = this._pages[page] || (
      this._pages[page] = Object.create(null)
    )

    if (id in counts) {
      counts[id] += 1
      return
    }

    counts[id] = 1
  }

  report (page) {
    console.log(this._pages)
  }
}

const logger = new Logger()

const wait = async ctx => {
  const d = parseInt(ctx.params.delay, 10) || 0

  if (d) {
    await delay(d)
  }
}

router.get('/page/:delay/(.*)', async ctx => {
  await wait(ctx)

  const {path} = ctx

  logger.report()
  logger.track(path, 'pv')

  ctx.body = html.replace('{{link}}', `${path}?r=${Math.random()}`)
})

router.get('/gif/:delay', async ctx => {
  await wait(ctx)
  const {path} = ctx.query

  logger.track(path, ctx.path)

  ctx.headers = {
    'Content-Type': 'image/gif'
  }
  ctx.body = fs.createReadStream(join(__dirname, 'clear.gif'))
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(8000)
