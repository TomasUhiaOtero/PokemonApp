import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import App from '../../App'

// Sin mock, el hook golpea PokeAPI de verdad: lento y dependiente de la red.
vi.mock('../../services/pokemonApi', () => ({
  pokemonApi: {
    getAllPokemonBasic: vi.fn().mockResolvedValue([]),
    getGenerationSpecies: vi.fn().mockResolvedValue([]),
    getPokemonBatch: vi.fn().mockResolvedValue([]),
    getVarietiesForSpeciesList: vi.fn().mockResolvedValue([]),
    getVarietyPokemonBatch: vi.fn().mockResolvedValue([]),
    getPokemonDetailFull: vi.fn().mockResolvedValue(null),
    clearCache: vi.fn(),
  },
  pokemonCache: {
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
    invalidate: vi.fn(),
    getCacheAge: vi.fn().mockReturnValue(null),
  },
}))

describe('App', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeDefined()
  })

  it('renders the main page sections', () => {
    const { container } = render(<App />)
    expect(container.querySelector('#features')).not.toBeNull()
    expect(container.querySelector('#pokemons')).not.toBeNull()
    expect(container.querySelector('#cta')).not.toBeNull()
  })
})
