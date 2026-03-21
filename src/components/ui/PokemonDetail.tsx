import React, { memo, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { TYPE_COLORS } from '../../lib/constants';
import type { PokemonDetail } from '../../lib/types';
import './PokemonDetail.css';

interface PokemonDetailViewProps {
  pokemon: PokemonDetail;
  onClose: () => void;
  onBack: () => void;
}

const DEFAULT_TYPE_COLOR = '#6b7280';

function getStatBarColor(value: number, maxValue: number = 255): string {
  const percentage = (value / maxValue) * 100;
  if (percentage >= 80) return '#22c55e';
  if (percentage >= 60) return '#84cc17';
  if (percentage >= 40) return '#eab308';
  if (percentage >= 20) return '#f97316';
  return '#ef4444';
}

export const PokemonDetailView = memo(function PokemonDetailView({ 
  pokemon, 
  onClose,
  onBack 
}: PokemonDetailViewProps) {
  const primaryType = pokemon.types[0];
  const primaryColor = TYPE_COLORS[primaryType] || DEFAULT_TYPE_COLOR;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const playCry = useCallback(() => {
    if (!pokemon.cryUrl || isPlaying) return;
    
    setHasError(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    const audio = new Audio(pokemon.cryUrl);
    audio.volume = 0.5; // 60% del volumen
    audioRef.current = audio;
    
    audio.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setHasError(true);
        setIsPlaying(false);
      });
    
    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };
    
    audio.onerror = () => {
      setHasError(true);
      setIsPlaying(false);
      audioRef.current = null;
    };
  }, [pokemon.cryUrl, isPlaying]);
  
  const stopCry = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return (
    <motion.div
      className="pokemon-detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="pokemon-detail-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="pokemon-detail-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="pokemon-detail-grid">
          <div 
            className="pokemon-detail-left"
            style={{ 
              background: `linear-gradient(180deg, ${primaryColor}10, transparent)`
            }}
          >
            <div className="pokemon-detail-card">
              <div 
                className="pokemon-detail-image-wrapper"
                style={{ background: `${primaryColor}20` }}
              >
                {pokemon.cryUrl && (
                  <button
                    className={`pokemon-detail-sound-btn ${isPlaying ? 'playing' : ''} ${hasError ? 'error' : ''}`}
                    onClick={isPlaying ? stopCry : playCry}
                    aria-label={isPlaying ? 'Stop cry' : 'Play cry'}
                    style={{ '--btn-color': primaryColor } as React.CSSProperties}
                  >
                    {hasError ? (
                      <VolumeX size={20} />
                    ) : (
                      <Volume2 size={20} />
                    )}
                    {isPlaying && (
                      <span className="pokemon-detail-sound-waves">
                        <span className="wave wave-1"></span>
                        <span className="wave wave-2"></span>
                        <span className="wave wave-3"></span>
                      </span>
                    )}
                  </button>
                )}
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                  alt={pokemon.name}
                  className="pokemon-detail-image"
                />
              </div>

              <span className="pokemon-detail-number">
                #{String(pokemon.number).padStart(3, '0')}
              </span>
              <h2 className="pokemon-detail-name">{pokemon.name}</h2>

              <div className="pokemon-detail-types">
                {pokemon.types.map((type) => {
                  const typeColor = TYPE_COLORS[type] || DEFAULT_TYPE_COLOR;
                  return (
                    <span
                      key={type}
                      className="pokemon-detail-type-badge"
                      style={{
                        background: `linear-gradient(135deg, ${typeColor}, ${typeColor}dd)`,
                        boxShadow: `0 2px 8px ${typeColor}50`,
                      }}
                    >
                      {type}
                    </span>
                  );
                })}
              </div>
            </div>

            {pokemon.evolutionChain.length > 1 && (
              <div className="pokemon-detail-evolution">
                <p className="pokemon-detail-evolution-title">Evolution</p>
                <div className="pokemon-detail-evolution-chain">
                  {pokemon.evolutionChain.map((stage, index) => (
                    <div key={`${stage.id}-${index}`} style={{ display: 'contents' }}>
                      {index > 0 && (
                        <div className="pokemon-detail-evolution-arrow">
                          <ChevronRight size={20} />
                          <span className="pokemon-detail-evolution-level">
                            {stage.evolutionLevel || stage.evolutionCondition}
                          </span>
                        </div>
                      )}
                      <div className="pokemon-detail-evolution-stage">
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${stage.id}.png`}
                          alt={stage.name}
                          className="pokemon-detail-evolution-img"
                        />
                        <span className="pokemon-detail-evolution-name">
                          {stage.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pokemon-detail-right">
            <div 
              className="pokemon-detail-right-scroll"
              style={{ 
                '--scrollbar-thumb-color': primaryColor,
                '--scrollbar-track-color': 'rgba(255, 255, 255, 0.08)',
              } as React.CSSProperties}
            >
              <div className="pokemon-detail-info-list">
              <div className="pokemon-detail-info-item">
                <span className="pokemon-detail-info-label">generation</span>
                <span className="pokemon-detail-info-value capitalize">
                  {pokemon.generation}
                </span>
              </div>

              <div className="pokemon-detail-info-item">
                <span className="pokemon-detail-info-label">height</span>
                <span className="pokemon-detail-info-value">
                  {pokemon.height}m
                </span>
              </div>

              <div className="pokemon-detail-info-item">
                <span className="pokemon-detail-info-label">weight</span>
                <span className="pokemon-detail-info-value">
                  {pokemon.weight}kg
                </span>
              </div>

              <div className="pokemon-detail-info-item">
                <span className="pokemon-detail-info-label">abilities</span>
                <div className="pokemon-detail-info-value multiple">
                  {pokemon.abilities.map((ability, index) => (
                    <span
                      key={index}
                      className={`pokemon-detail-ability-badge ${ability.isHidden ? 'hidden' : ''}`}
                    >
                      {ability.name}
                      {ability.isHidden && ' (hidden)'}
                    </span>
                  ))}
                </div>
              </div>

              {pokemon.description && (
                <div className="pokemon-detail-info-item">
                  <span className="pokemon-detail-info-label">description</span>
                  <span className="pokemon-detail-info-value" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                    {pokemon.description}
                  </span>
                </div>
              )}

              <div className="pokemon-detail-info-item">
                <span className="pokemon-detail-info-label">stats</span>
                <div className="pokemon-detail-stats">
                  {pokemon.stats.map((stat, index) => (
                    <div key={index} className="pokemon-detail-stat-row">
                      <span className="pokemon-detail-stat-name">{stat.name}</span>
                      <div className="pokemon-detail-stat-bar-container">
                        <motion.div
                          className="pokemon-detail-stat-bar"
                          initial={{ width: 0 }}
                          animate={{ width: `${(stat.value / stat.maxValue) * 100}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          style={{ background: getStatBarColor(stat.value, stat.maxValue) }}
                        />
                      </div>
                      <span className="pokemon-detail-stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});


