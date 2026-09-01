import { test, expect } from '@playwright/test'

// El servidor de desarrollo elige otro puerto si 5173 está ocupado.
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5173'

// Estos tests esperan a que se descarguen los 96 frames del Hero. Con la suite
// en paralelo, varios navegadores se reparten el mismo servidor de desarrollo y
// eso no cabe en los 30 s que Playwright da por defecto a cada test.
test.describe.configure({ timeout: 150_000 })

/**
 * Muestrea el canvas reducido a una rejilla fija. La reducción evita mover
 * megabytes por el puente de Playwright y basta de sobra para distinguir un
 * frame de otro. Toda comparación usa esta misma rejilla: mezclar resoluciones
 * hace que una espera dé por asentado algo que la otra aún ve moverse.
 */
const GRID = { width: 32, height: 18 }

async function sampleCanvas(page) {
  return page.evaluate((grid) => {
    const source = document.querySelector('#top canvas')
    if (!source) return null
    const small = document.createElement('canvas')
    small.width = grid.width
    small.height = grid.height
    const ctx = small.getContext('2d')
    ctx.drawImage(source, 0, 0, small.width, small.height)
    return [...ctx.getImageData(0, 0, small.width, small.height).data]
  }, GRID)
}

/** Coloca el scroll en una fracción del recorrido del pin y espera al repintado. */
async function scrubTo(page, progress) {
  const target = await page.evaluate((p) => {
    // La app declara `scroll-behavior: smooth`, que en Chromium sigue animando
    // los saltos programáticos y haría medir a mitad del trayecto.
    document.documentElement.style.scrollBehavior = 'auto'
    const section = document.querySelector('#top')
    const pin = section.getBoundingClientRect().height - window.innerHeight
    const top = Math.round(pin * p)
    window.scrollTo(0, top)
    return top
  }, progress)

  await page.waitForFunction((t) => Math.abs(window.scrollY - t) <= 1, target)
  await waitForSettled(page)
}

/**
 * El frame mostrado persigue al objetivo con amortiguación, así que tras mover
 * el scroll el canvas sigue cambiando durante unos fotogramas. Se exigen tres
 * muestras seguidas idénticas: con dos bastaba para que coincidieran dos pasos
 * ya imperceptibles con el bucle todavía en marcha.
 */
async function waitForSettled(page) {
  // El contador se reinicia en cada espera: si arrastrase el de la anterior, un
  // primer sondeo que llegase antes de que el Hero repintase vería la muestra
  // vieja repetida y daría por asentado el estado que acabamos de abandonar.
  await page.evaluate(() => {
    window.__heroSample = null
    window.__heroStable = 0
  })

  await page.waitForFunction(
    (grid) => {
      const cv = document.querySelector('#top canvas')
      if (!cv) return false
      const small = document.createElement('canvas')
      small.width = grid.width
      small.height = grid.height
      const ctx = small.getContext('2d')
      ctx.drawImage(cv, 0, 0, small.width, small.height)
      const sample = [...ctx.getImageData(0, 0, small.width, small.height).data].join(',')

      window.__heroStable = window.__heroSample === sample ? (window.__heroStable ?? 0) + 1 : 0
      window.__heroSample = sample
      return window.__heroStable >= 3
    },
    GRID,
    // La amortiguación tarda unos 50 fotogramas en asentar tras un salto largo.
    // Con la suite en paralelo los `requestAnimationFrame` se espacian mucho, y
    // con 20 s el margen se agotaba justo: 60 s cubre el caso degradado sin
    // enmascarar un canvas que de verdad no pare de cambiar.
    { polling: 'raf', timeout: 60_000 }
  )
}

/**
 * Dos frames son el mismo si ningún canal se separa más de `tolerance`. La
 * amortiguación se detiene a una fracción de frame del objetivo, así que volver
 * a la misma posición puede dejar diferencias de una unidad en 8 bits, que no
 * son un frame distinto.
 */
function expectSameFrame(actual, expected, tolerance = 4) {
  expect(actual).not.toBeNull()
  expect(actual.length).toBe(expected.length)
  const worst = actual.reduce((max, v, i) => Math.max(max, Math.abs(v - expected[i])), 0)
  expect(worst).toBeLessThanOrEqual(tolerance)
}

/**
 * El Hero no depende de PokeAPI, pero `App` sí: si la API falla y no hay
 * pokémon, sustituye la página entera por su vista de error y el Hero
 * desaparece con ella. Estos tests devuelven una respuesta vacía y válida para
 * que la app pase de su pantalla de carga sin tocar la red.
 */
async function stubPokeApi(page) {
  await page.route('**/pokeapi.co/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [], varieties: [], pokemon_species: [] }),
    })
  )
}
/**
 * Espera a que el Hero esté montado y con la secuencia cargada.
 *
 * El canvas se comprueba primero y por separado: mientras la app trae los datos
 * de PokeAPI muestra su pantalla de carga, que no tiene ni Hero ni barra de
 * progreso, así que esperar solo a que no haya barra se cumplía de inmediato y
 * los tests seguían contra una página sin `#top`.
 */
async function waitForHero(page) {
  await expect(page.locator('#top canvas')).toBeVisible({ timeout: 120_000 })
  // El margen es amplio a propósito: con la suite en paralelo, varios
  // navegadores se reparten el mismo servidor de desarrollo y los 96 frames
  // tardan bastante más que en una ejecución aislada.
  await expect(page.getByRole('progressbar')).toHaveCount(0, { timeout: 120_000 })
}

test.describe('Hero — scrub con scroll', () => {
  test.beforeEach(async ({ page }) => {
    await stubPokeApi(page)
    await page.goto(BASE_URL)
    await page.waitForLoadState('load')
    await waitForHero(page)
  })

  test('la sección ocupa 300vh y el canvas queda fijado arriba', async ({ page }) => {
    const layout = await page.evaluate(() => {
      const section = document.querySelector('#top')
      return {
        sectionHeight: section.getBoundingClientRect().height,
        viewport: window.innerHeight,
        stickyPosition: getComputedStyle(section.firstElementChild).position,
      }
    })

    expect(layout.sectionHeight).toBeCloseTo(layout.viewport * 3, 0)
    expect(layout.stickyPosition).toBe('sticky')

    await scrubTo(page, 0.5)
    const rect = await page.locator('#top canvas').boundingBox()
    expect(rect.y).toBe(0)
    expect(rect.height).toBeCloseTo(layout.viewport, 0)
  })

  test('cada tramo de scroll pinta un frame distinto', async ({ page }) => {
    const stops = [0, 0.25, 0.5, 0.75, 1]
    const signatures = []

    for (const progress of stops) {
      await scrubTo(page, progress)
      signatures.push((await sampleCanvas(page)).join(','))
    }

    // Sin scrub todas las firmas serían idénticas: eso es justo lo que falla si
    // el scroll deja de estar conectado al índice de frame.
    expect(new Set(signatures).size).toBe(stops.length)
  })

  test('el frame persigue al scroll en vez de saltar', async ({ page }) => {
    await scrubTo(page, 0)

    // Un salto brusco de un extremo a otro. Con amortiguación, el fotograma
    // inmediatamente posterior aún va por el camino; sin ella sería ya el
    // destino y esta comprobación fallaría.
    const enTransito = await page.evaluate(async () => {
      const section = document.querySelector('#top')
      const pin = section.getBoundingClientRect().height - window.innerHeight
      window.scrollTo(0, pin)
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      const cv = document.querySelector('#top canvas')
      const small = document.createElement('canvas')
      small.width = 32
      small.height = 18
      const ctx = small.getContext('2d')
      ctx.drawImage(cv, 0, 0, small.width, small.height)
      return [...ctx.getImageData(0, 0, small.width, small.height).data].join(',')
    })

    await waitForSettled(page)
    const asentado = (await sampleCanvas(page)).join(',')
    expect(enTransito).not.toBe(asentado)
  })

  test('el scrub es reversible', async ({ page }) => {
    await scrubTo(page, 0)
    const atStart = await sampleCanvas(page)

    await scrubTo(page, 1)
    const atEnd = await sampleCanvas(page)
    expect(atEnd.join(',')).not.toBe(atStart.join(','))

    await scrubTo(page, 0)
    expectSameFrame(await sampleCanvas(page), atStart)
  })

  test('en vertical sirve el tier de 640', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload()
    await waitForHero(page)

    const tier = await page.evaluate(
      () =>
        performance
          .getEntriesByType('resource')
          .find((e) => e.name.includes('/hero/frames/'))
          ?.name.match(/frames\/(\d+)\//)?.[1]
    )
    expect(tier).toBe('640')
  })

  test('no amplía la escena por encima de su tamaño nativo', async ({ page }) => {
    // Más ancho y más alto que los 1280x720 de la secuencia: si se estirase
    // para llenar, las esquinas tendrían imagen en vez de fondo.
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()
    await waitForHero(page)
    await scrubTo(page, 1)

    const { corners, center } = await page.evaluate(() => {
      const cv = document.querySelector('#top canvas')
      const ctx = cv.getContext('2d')
      const at = (x, y) => [...ctx.getImageData(x, y, 1, 1).data].slice(0, 3)
      return {
        corners: [
          at(2, 2),
          at(cv.width - 3, 2),
          at(2, cv.height - 3),
          at(cv.width - 3, cv.height - 3),
        ],
        center: at(Math.floor(cv.width / 2), Math.floor(cv.height / 2)),
      }
    })

    // #0f172a, el mismo `--color-pokemon-dark` que usa el resto de la página.
    for (const corner of corners) expect(corner).toEqual([15, 23, 42])
    expect(center).not.toEqual([15, 23, 42])
  })

  test('el título deja paso a la salida a lo largo del recorrido', async ({ page }) => {
    const opacityOf = (selector) =>
      page.evaluate((sel) => {
        const el = document.querySelector(sel)
        return el ? Number(getComputedStyle(el.closest('div')).opacity) : null
      }, selector)

    await scrubTo(page, 0)
    expect(await opacityOf('#top h1')).toBeGreaterThan(0.9)
    // El botón de salida no debe existir todavía: invisible pero enfocable sería
    // una trampa para quien navega con el tabulador.
    await expect(page.getByRole('button', { name: /características/i })).toHaveCount(0)

    await scrubTo(page, 0.5)
    expect(await opacityOf('#top h1')).toBeLessThan(0.05)

    await scrubTo(page, 1)
    await expect(page.getByRole('button', { name: /características/i })).toBeVisible()
  })
})

test.describe('Hero — movimiento reducido', () => {
  test('muestra el póster abierto, sin pin ni secuencia de frames', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await stubPokeApi(page)

    const frameRequests = []
    page.on('request', (r) => {
      if (r.url().includes('/hero/frames/')) frameRequests.push(r.url())
    })

    await page.goto(BASE_URL)
    await page.waitForLoadState('load')
    // Aquí no hay canvas que esperar, así que el ancla es el póster estático.
    await expect(page.getByRole('img', { name: /Pikachu/i })).toBeVisible({ timeout: 120_000 })
    await page.waitForTimeout(2000)

    await expect(page.locator('#top canvas')).toHaveCount(0)
    await expect(page.getByRole('img', { name: /Pikachu/i })).toBeVisible()

    // No basta con ocultar el scrub: no debe descargarse la secuencia siquiera.
    expect(frameRequests).toEqual([])

    const { sectionHeight, viewport } = await page.evaluate(() => ({
      sectionHeight: document.querySelector('#top').getBoundingClientRect().height,
      viewport: window.innerHeight,
    }))
    expect(sectionHeight).toBeCloseTo(viewport, 0)
  })
})
