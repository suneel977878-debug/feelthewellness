import React from 'react';

interface SilhouetteProps {
  type: 'wand' | 'rabbit' | 'bullet' | 'dildo' | 'butt-plug' | 'cup' | 'ring' | 'whip' | 'cuffs' | 'blindfold' | 'lube' | 'lingerie';
  color: string;
  className?: string;
  size?: number;
}

export default function ProductSilhouette({ type, color, className = '', size = 200 }: SilhouetteProps) {
  // Generate safe gradient IDs to avoid collision
  const gradId = `grad-${type}-${color.replace('#', '')}`;
  const glowId = `glow-${type}-${color.replace('#', '')}`;
  const glassGradId = `glass-${type}-${color.replace('#', '')}`;

  const renderSvg = () => {
    switch (type) {
      case 'wand':
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
                <stop offset="25%" stopColor="#ff4cb2" />
                <stop offset="65%" stopColor={color} />
                <stop offset="100%" stopColor="#150220" />
              </linearGradient>
              <linearGradient id={glassGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#ffffff" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Ambient Backlight Glow */}
            <circle cx="50" cy="50" r="32" fill={color} opacity="0.25" filter={`url(#${glowId})`} />
            
            {/* Wand Head */}
            <circle cx="50" cy="28" r="17" fill={`url(#${gradId})`} stroke="rgba(255, 42, 133, 0.4)" strokeWidth="0.5" />
            <circle cx="50" cy="28" r="17" fill="url(#glassGradId)" />
            {/* Soft head detail/groove */}
            <ellipse cx="50" cy="28" rx="14" ry="4" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
            
            {/* Neck Collar (Chrome accent) */}
            <path d="M41,41 C41,41 45,43 50,43 C55,43 59,41 59,41 L57,46 C57,46 54,48 50,48 C46,48 43,46 43,46 Z" fill="linear-gradient(90deg, #e0e0e0, #ffffff, #a0a0a0)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            <ellipse cx="50" cy="42" rx="9" ry="2" fill="#ffffff" opacity="0.8" />

            {/* Handle / Shaft */}
            <path d="M43,45 L41,83 Q41,87 50,87 Q59,87 59,83 L57,45 Z" fill={`url(#${gradId})`} />
            
            {/* Gloss Highlight Overlay on Shaft */}
            <path d="M43,45 L41,83 Q41,87 50,87 C45,87 44,75 45,45 Z" fill="#ffffff" opacity="0.18" />
            
            {/* Elegant control panel */}
            <rect x="47" y="55" width="6" height="18" rx="3" fill="#0d0413" stroke="rgba(255, 42, 133, 0.3)" strokeWidth="0.5" />
            <circle cx="50" cy="60" r="1.8" fill="#ff2a85" filter={`url(#${glowId})`} />
            <path d="M49,67 L51,67 M50,66 L50,68" stroke="#ffffff" strokeWidth="0.6" opacity="0.8" />
            <line x1="49" y1="71" x2="51" y2="71" stroke="#ffffff" strokeWidth="0.6" opacity="0.8" />
          </svg>
        );
      case 'rabbit':
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.7} />
                <stop offset="30%" stopColor="#ff2a85" />
                <stop offset="70%" stopColor={color} />
                <stop offset="100%" stopColor="#0c0211" />
              </linearGradient>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="52" r="32" fill={color} opacity="0.22" filter={`url(#${glowId})`} />
            
            {/* Shaft G-Spot curved body */}
            <path d="M43,86 C40,71 39,51 47,33 C50,23 60,17 65,22 C70,28 64,36 58,41 C53,46 49,54 51,86 Z" fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            
            {/* G-spot ribbed texture detail */}
            <path d="M50,28 C52,29 55,27 57,25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
            <path d="M48,33 C50,34 53,32 55,30" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
            <path d="M46,38 C48,39 51,37 53,35" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />

            {/* Rabbit clitoral ears */}
            <path d="M37,56 C31,54 24,46 26,38 C27,33 34,36 38,43 C41,49 42,55 37,56 Z" fill={`url(#gradId)`} opacity="0.95" />
            {/* Ear split detail */}
            <path d="M35,53 C30,51 27,45 28,40 C29,37 33,39 36,44 Z" fill="#ffb5d7" opacity="0.5" />
            <path d="M31,48 Q23,40 28,34 Q32,38 34,44" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />

            {/* Gloss highlight on body */}
            <path d="M43,86 C40,71 39,51 47,33 C44,45 42,65 46,86 Z" fill="#ffffff" opacity="0.15" />

            {/* Base collar */}
            <ellipse cx="47" cy="85" rx="10" ry="3.5" fill="#a833ff" opacity="0.9" />
          </svg>
        );
      case 'bullet':
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
                <stop offset="35%" stopColor="#ff2a85" />
                <stop offset="75%" stopColor={color} />
                <stop offset="100%" stopColor="#020005" />
              </linearGradient>
              <filter id={glowId} x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="50" r="28" fill={color} opacity="0.25" filter={`url(#${glowId})`} />
            
            {/* Bullet capsule */}
            <rect x="35" y="22" width="30" height="56" rx="15" fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            
            {/* Glass shine overlay */}
            <path d="M35,37 C35,27 42,22 50,22 C42,22 37,29 37,45 L37,70 C37,73 35,74 35,70 Z" fill="#ffffff" opacity="0.35" />

            {/* Chrome decorative rings */}
            <rect x="35" y="44" width="30" height="3" fill="rgba(255,255,255,0.4)" />
            <rect x="35" y="52" width="30" height="3" fill="rgba(255,255,255,0.4)" />
            
            {/* Cord/Wire */}
            <path d="M50,78 Q50,92 56,92 Q62,92 58,78" fill="none" stroke="#ff2a85" strokeWidth="2" strokeLinecap="round" opacity="0.75" filter={`url(#${glowId})`} />
          </svg>
        );
      case 'dildo':
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.7} />
                <stop offset="25%" stopColor="#ff4cb2" />
                <stop offset="65%" stopColor={color} />
                <stop offset="100%" stopColor="#0c0211" />
              </linearGradient>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="50" r="32" fill={color} opacity="0.2" filter={`url(#${glowId})`} />
            
            {/* Suction cup base */}
            <path d="M28,84 C34,78 66,78 72,84 C72,88 28,88 28,84 Z" fill="#a833ff" opacity="0.95" />
            <ellipse cx="50" cy="83" rx="20" ry="2.5" fill="#ffffff" opacity="0.3" />

            {/* Veined shaft realistic curve */}
            <path d="M42,83 C39,63 41,39 46,27 C49,17 60,15 65,21 C69,26 64,35 61,42 C57,50 55,66 58,83 Z" fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            
            {/* Vein lines for premium detailed texture */}
            <path d="M45,61 Q51,55 48,44" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" filter="blur(0.4px)" />
            <path d="M51,75 Q54,67 50,56" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" filter="blur(0.4px)" />
            <path d="M43,40 Q47,35 49,30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />

            {/* Bulbous tip detail */}
            <path d="M47,27 C46,21 53,17 60,21 C64,25 62,32 56,33 C52,34 49,31 47,27 Z" fill={`url(#${gradId})`} opacity="0.85" />
            <path d="M50,21 C51,21 56,22 57,27" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />

            {/* Highlight overlay */}
            <path d="M42,83 C39,63 41,39 46,27 C43,39 41,60 45,83 Z" fill="#ffffff" opacity="0.15" />
          </svg>
        );
      case 'butt-plug':
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
                <stop offset="30%" stopColor="#ff2a85" />
                <stop offset="70%" stopColor={color} />
                <stop offset="100%" stopColor="#08010f" />
              </linearGradient>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="50" r="30" fill={color} opacity="0.25" filter={`url(#${glowId})`} />
            
            {/* Base collar */}
            <ellipse cx="50" cy="78" rx="23" ry="6" fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            
            {/* Stem */}
            <path d="M43,58 L45,77 C45,77 48,79 50,79 C52,79 55,77 55,77 L57,58 Z" fill={`url(#${gradId})`} />
            <path d="M44,60 L45,75 C45,75 47,76 50,76 C47,76 46,68 46,60 Z" fill="#ffffff" opacity="0.2" />

            {/* Bulbous anchor bulb */}
            <path d="M50,14 C67,34 68,50 65,60 C65,62 35,62 35,60 C32,50 33,34 50,14 Z" fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            
            {/* Faceted jewel glow on the bottom base */}
            <polygon points="45,78 50,74 55,78 50,82" fill="#ffffff" opacity="0.85" filter={`url(#glowId)`} />
            <polygon points="47,78 50,76 53,78 50,80" fill="#ffb5d7" />

            {/* Gloss highlight on bulb */}
            <path d="M50,14 C62,28 62,42 61,54 C53,42 49,28 50,14 Z" fill="#ffffff" opacity="0.18" />
          </svg>
        );
      case 'cup':
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} />
                <stop offset="35%" stopColor="#ff4cb2" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity={0.6} />
                <stop offset="65%" stopColor="#ff4cb2" />
                <stop offset="100%" stopColor={color} />
              </linearGradient>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="50" r="30" fill={color} opacity="0.2" filter={`url(#${glowId})`} />
            
            {/* Outer sleeve body */}
            <path d="M33,18 C33,18 36,17 50,17 C64,17 67,18 67,18 L63,82 C63,82 60,84 50,84 C40,84 37,82 37,82 Z" fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            
            {/* Ergonomic grip grooves (wrapping rings) */}
            <rect x="31" y="30" width="38" height="8" rx="4" fill="rgba(255, 42, 133, 0.4)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <rect x="32" y="47" width="36" height="8" rx="4" fill="rgba(255, 42, 133, 0.4)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <rect x="33" y="64" width="34" height="8" rx="4" fill="rgba(255, 42, 133, 0.4)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            
            {/* Internal texture indicator lines (3D ribbed feel) */}
            <path d="M37,34 C44,36 56,36 63,34" fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.4" />
            <path d="M38,51 C44,53 56,53 62,51" fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.4" />
            <path d="M39,68 C44,70 56,70 61,68" fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.4" />

            {/* Entry orifice cap */}
            <ellipse cx="50" cy="18" rx="17" ry="5.5" fill="#0c0413" stroke="rgba(255, 42, 133, 0.5)" strokeWidth="0.5" />
            <ellipse cx="50" cy="18" rx="11" ry="3.5" fill="#ff4cb2" opacity="0.8" />
            <circle cx="50" cy="18" r="3" fill="#000000" />
          </svg>
        );
      case 'ring':
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="52" r="30" fill={color} opacity="0.22" filter={`url(#${glowId})`} />
            
            {/* Ring body */}
            <circle cx="50" cy="56" r="23" fill="none" stroke={color} strokeWidth="6.5" />
            <circle cx="50" cy="56" r="23" fill="none" stroke="#ff2a85" strokeWidth="3" opacity="0.8" />
            <circle cx="50" cy="56" r="23" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.4" />

            {/* Ribbed nodes inside the ring */}
            <circle cx="50" cy="79" r="2.5" fill="#ffffff" opacity="0.7" />
            <circle cx="33" cy="70" r="2.5" fill="#ffffff" opacity="0.7" />
            <circle cx="67" cy="70" r="2.5" fill="#ffffff" opacity="0.7" />
            
            {/* Clitoral vibration bullet casing */}
            <rect x="38" y="14" width="24" height="26" rx="10" fill={`linear-gradient(135deg, #ffffff, ${color})`} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <rect x="42" y="17" width="16" height="20" rx="8" fill={color} />
            <line x1="38" y1="26" x2="62" y2="26" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
            
            {/* Control button */}
            <circle cx="50" cy="27" r="2" fill="#ff2a85" filter={`url(#glowId)`} />
          </svg>
        );
      case 'whip':
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="50" r="28" fill={color} opacity="0.2" filter={`url(#${glowId})`} />
            
            {/* Whip lashes (flogger) */}
            <path d="M52,38 Q68,14 85,24" fill="none" stroke="#ff2a85" strokeWidth="2.2" strokeLinecap="round" filter={`url(#glowId)`} />
            <path d="M52,38 Q74,21 88,38" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M52,38 Q58,10 74,8" fill="none" stroke="#ffb5d7" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <path d="M52,38 Q80,11 86,18" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
            <path d="M52,38 Q67,42 88,54" fill="none" stroke="#a833ff" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M52,38 Q82,28 92,30" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />

            {/* Handle (Braided Leather texture) */}
            <rect x="18" y="72" width="46" height="6.5" rx="3.2" transform="rotate(-45, 18, 72)" fill="#1c072b" stroke={color} strokeWidth="1" />
            <path d="M22,68 L27,73 M28,62 L33,67 M34,56 L39,61 M40,50 L45,55" stroke="#ffffff" strokeWidth="0.8" opacity="0.25" />
            <path d="M23,72 L28,67 M29,66 L34,61 M35,60 L40,55 M41,54 L46,49" stroke="#ffffff" strokeWidth="0.8" opacity="0.25" />

            {/* Gold pommel cap */}
            <circle cx="18" cy="72" r="3.8" fill="linear-gradient(135deg, #d4af37, #f4e8c1)" />
            {/* Wrist loop strap */}
            <path d="M18,72 Q10,78 11,87 Q17,90 22,81" fill="none" stroke={color} strokeWidth="2" />
          </svg>
        );
      case 'cuffs':
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="50" r="30" fill={color} opacity="0.2" filter={`url(#${glowId})`} />
            
            {/* Cuff 1 (Left) */}
            <circle cx="28" cy="46" r="16" fill="none" stroke="#220e2e" strokeWidth="5.5" />
            <circle cx="28" cy="46" r="16" fill="none" stroke={color} strokeWidth="3" />
            <circle cx="28" cy="46" r="13" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.3" />
            <circle cx="28" cy="46" r="19" fill="none" stroke="#ff2a85" strokeWidth="0.8" opacity="0.6" filter={`url(#glowId)`} />

            {/* Cuff 2 (Right) */}
            <circle cx="72" cy="46" r="16" fill="none" stroke="#220e2e" strokeWidth="5.5" />
            <circle cx="72" cy="46" r="16" fill="none" stroke={color} strokeWidth="3" />
            <circle cx="72" cy="46" r="13" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.3" />
            <circle cx="72" cy="46" r="19" fill="none" stroke="#ff2a85" strokeWidth="0.8" opacity="0.6" filter={`url(#glowId)`} />

            {/* Connecting Chain Links (Gold and shiny) */}
            <path d="M44,46 L56,46" fill="none" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 4" />
            <rect x="42" y="44" width="4" height="4" rx="1" fill="#d4af37" />
            <rect x="54" y="44" width="4" height="4" rx="1" fill="#d4af37" />
          </svg>
        );
      case 'blindfold':
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="50" r="28" fill={color} opacity="0.22" filter={`url(#${glowId})`} />
            
            {/* Mask body */}
            <path d="M17,47 C23,34 45,36 50,42 C55,36 77,34 83,47 C85,56 71,63 50,57 C29,63 15,56 17,47 Z" fill={color} stroke="rgba(255, 42, 133, 0.4)" strokeWidth="0.8" />
            
            {/* Detailed stitch lines on border */}
            <path d="M19,47 C24,36 44,38 49,43" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1.5 2" opacity="0.6" />
            <path d="M81,47 C76,36 56,38 51,43" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1.5 2" opacity="0.6" />

            {/* Silk shine highlight */}
            <path d="M17,47 C23,34 45,36 50,42 C30,42 22,50 20,53 Z" fill="#ffffff" opacity="0.15" />
            
            {/* Strap details */}
            <path d="M17,47 Q10,47 7,50 M83,47 Q90,47 93,50" fill="none" stroke={color} strokeWidth="2.5" opacity="0.6" />
          </svg>
        );
      case 'lube':
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
                <stop offset="35%" stopColor="#ff2a85" />
                <stop offset="75%" stopColor={color} />
                <stop offset="100%" stopColor="#0a0112" />
              </linearGradient>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="52" r="28" fill={color} opacity="0.2" filter={`url(#${glowId})`} />
            
            {/* Bottle body */}
            <rect x="33" y="38" width="34" height="46" rx="8" fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            
            {/* Neck */}
            <rect x="43" y="29" width="14" height="9" fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            
            {/* Chrome cosmetic pump dispenser */}
            <path d="M41,29 H59 L54,20 H46 Z" fill="linear-gradient(135deg, #ffffff, #999)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            <path d="M41,23 H34 V26 H41" fill="#ff2a85" /> {/* Spout */}

            {/* Label design */}
            <rect x="36" y="47" width="28" height="26" rx="3" fill="rgba(10, 5, 13, 0.7)" stroke="rgba(255, 42, 133, 0.4)" strokeWidth="0.6" />
            <line x1="40" y1="55" x2="60" y2="55" stroke="#ff2a85" strokeWidth="1" filter={`url(#glowId)`} />
            <line x1="43" y1="62" x2="57" y2="62" stroke="#ffffff" strokeWidth="0.6" opacity="0.7" />
            <circle cx="50" cy="68" r="1.5" fill="#ff2a85" />

            {/* Shine overlay */}
            <path d="M33,48 C33,42 35,38 42,38 L42,80 C36,80 33,78 33,70 Z" fill="#ffffff" opacity="0.22" />
          </svg>
        );
      case 'lingerie':
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="50" r="30" fill={color} opacity="0.25" filter={`url(#${glowId})`} />
            
            {/* Lace bodysuit silhouette */}
            <path d="M29,20 L36,44 L32,79 L68,79 L64,44 L71,20 L58,35 L50,25 L42,35 Z" fill={color} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            
            {/* Mesh/Lace pattern paths (highly visible detailed lines) */}
            <path d="M36,44 Q50,54 64,44" fill="none" stroke="#ff2a85" strokeWidth="1.2" filter={`url(#glowId)`} />
            <path d="M34,60 Q50,68 66,60" fill="none" stroke="#ffb5d7" strokeWidth="1" opacity="0.8" />
            <path d="M33,70 Q50,78 67,70" fill="none" stroke="#ff2a85" strokeWidth="0.8" opacity="0.7" />
            
            {/* Intricate cross-lace detailing */}
            <path d="M43,48 L57,60 M57,48 L43,60" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
            <path d="M44,62 L56,74 M56,62 L44,74" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />

            {/* Shoulder straps */}
            <line x1="29" y1="20" x2="42" y2="35" stroke="#ff2a85" strokeWidth="1.5" />
            <line x1="71" y1="20" x2="58" y2="35" stroke="#ff2a85" strokeWidth="1.5" />

            {/* Center bow/heart gem */}
            <path d="M50,48 C49,46 47,46 47,48 C47,50 50,52 50,52 C50,52 53,50 53,48 C53,46 51,46 50,48 Z" fill="#ffffff" opacity="0.9" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle cx="50" cy="50" r="30" fill={color} />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`silhouette-container ${className}`} 
      style={{ 
        width: size, 
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
      }}
    >
      {renderSvg()}
    </div>
  );
}
