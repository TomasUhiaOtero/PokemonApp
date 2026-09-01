import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Hero } from '../features/Hero';
import { nearestLoaded } from '../../hooks/useFrameSequence';

const mocks = vi.hoisted(() => ({ reduce: false }));

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return { ...actual, useReducedMotion: () => mocks.reduce };
});

afterEach(() => {
  cleanup();
  mocks.reduce = false;
});

describe('nearestLoaded', () => {
  const img = (id: number) => ({ id }) as unknown as HTMLImageElement;

  it('devuelve el frame pedido cuando ya está cargado', () => {
    const frames = [img(0), img(1), img(2)];
    expect(nearestLoaded(frames, 1)).toBe(frames[1]);
  });

  it('cae al vecino más cercano cuando el frame pedido falta', () => {
    const frames = [img(0), undefined, undefined, img(3)];
    // Desde el 2 hay uno a distancia 1 por delante y otro a distancia 2 por
    // detrás: gana el más cercano.
    expect(nearestLoaded(frames, 2)).toBe(frames[3]);
  });

  it('prefiere el frame anterior cuando hay empate', () => {
    // Un frame ya visto encaja mejor que adelantarse a uno que aún no toca.
    const frames = [img(0), undefined, img(2)];
    expect(nearestLoaded(frames, 1)).toBe(frames[0]);
  });

  it('devuelve null mientras no haya ningún frame cargado', () => {
    expect(nearestLoaded([undefined, undefined], 0)).toBeNull();
  });
});

describe('Hero', () => {
  it('hace scrub con canvas cuando no se pide movimiento reducido', () => {
    const { container } = render(<Hero />);

    expect(container.querySelector('canvas')).not.toBeNull();
    expect(container.querySelector('#top')?.className).toContain('h-[300vh]');
  });

  it('con movimiento reducido muestra el póster estático y no monta el canvas', () => {
    mocks.reduce = true;
    const { container } = render(<Hero />);

    expect(container.querySelector('canvas')).toBeNull();
    // Sin pin: la sección ocupa una pantalla, no tres.
    expect(container.querySelector('#top')?.className).not.toContain('h-[300vh]');

    const poster = screen.getByRole('img', { name: /Pikachu/i });
    expect(poster).toHaveAttribute('src', '/hero/poster-open.jpg');
  });

  it('mantiene el ancla #top que usa el menú de navegación', () => {
    const { container } = render(<Hero />);
    expect(container.querySelector('#top')).not.toBeNull();
  });
});
