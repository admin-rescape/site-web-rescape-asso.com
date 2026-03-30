import { clsx } from "clsx";

/**
 * Badge « OUVERT À TOUS »
 *
 * Typographie : Incorporée via les classes Tailwind `font-sans uppercase tracking-[0.08em]`,
 *               dans la couleur de la charte (#C85A1E).
 *
 * Icône : Le symbole universel de recyclage EXACT (arrondi et plié).
 *         - Construit à partir du tracé ISO d'origine (Wikipedia/ISO 7000-1135).
 *         - Palette autour du vert naturel de la charte (#5A8A4A).
 *         - Les plis sont créés visuellement via le strokeColor pour délimiter les flèches.
 */
export const Badge = ({ className }: { className?: string }) => {
    return (
        <div
            className={clsx("aspect-square animate-spin-slow", className)}
            style={{ display: "block" }}
        >
            <svg
                viewBox="0 0 100 100"
                width="100%"
                height="100%"
                style={{ display: "block" }}
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Badge recyclage – Ouvert à tous"
                role="img"
            >
                <defs>
                    <path
                        id="circlePath"
                        d="M 50,50 m -30,0 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0"
                    />

                    {/* Cercle central blanc cassé */}
                    <radialGradient id="cw" cx="45%" cy="35%" r="70%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#f3eee3" />
                    </radialGradient>

                    <filter id="sh" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="1.2" stdDeviation="1.5"
                            floodColor="#2c1a0e" floodOpacity="0.15" />
                    </filter>

                    <filter id="iconShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0.8" stdDeviation="1"
                            floodColor="#234218" floodOpacity="0.25" />
                    </filter>

                    {/* Dégradé Naturel pour le symbole de recyclage */}
                    <linearGradient id="gRecycle" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#78AA65" />
                        <stop offset="100%" stopColor="#457337" />
                    </linearGradient>
                </defs>

                {/* --- Cercle central blanc --- */}
                <circle cx="50" cy="50" r="23" fill="url(#cw)" filter="url(#sh)" />

                {/*
                 * ══════════════════════════════════════════════════════════════
                 *  SIGLE RECYCLAGE ♻ — Classique / Arrondi (ISO 7000-1135)
                 *
                 *  Symbole universel "Chasing Arrows", avec bords ronds.
                 *  Importé depuis le standard (Wikipedia Commons Recycle001.svg).
                 *  Les plis sont mis en évidence par un `stroke` de la couleur du fond.
                 *  Fill : Palette de la charte (#5A8A4A / vert naturel).
                 * ══════════════════════════════════════════════════════════════
                 */}
                <svg
                    x="35" y="35" width="30" height="30"
                    viewBox="0 0 800 800"
                    fill="url(#gRecycle)"
                    stroke="#ffffff"
                    strokeWidth="15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#iconShadow)"
                >
                    <g transform="translate(15, 30)">
                        {/* Pli 1 (Haut-gauche) */}
                        <path d="M280 272 C134 187 134 187 134 187 C210 54 210 54 210 54 C231 17 309 16 336 48 C373 110 373 110 373 110z" />
                        {/* Flèche 1 (Bas-gauche) */}
                        <path d="M162 475 C84 475 84 475 84 475 C54 471.75 4 410 34 354 C68 297 68 297 68 297 C15 266 15 266 15 266 C183 266 183 266 183 266 C268 412 268 412 268 412 C215 383 215 383 215 383z" />
                        {/* Pli 2 (Bas) */}
                        <path d="M363 496 C363 667 363 667 363 667 C176 667 176 667 176 667 C165 668 157 657 151 648 C63 492 64 493 60 488 C64.75 492 70 496 85 496z" />
                        {/* Flèche 2 (Droite) */}
                        <path d="M687 496 C706 494 709 489 714 486 C620 652 620 652 620 652 C616 660 608 667 596 667 C492 667 492 667 492 667 C492 728 492 728 492 728 C407 583 407 583 407 583 C492 437 492 437 492 437 C492 496 492 496 492 496z" />
                        {/* Pli 3 (Droite) */}
                        <path d="M519 315 C666 231 666 231 666 231 C743 362 743 362 743 362 C771 416 723 468 691 474 C612 474 612 474 612 474z" />
                        {/* Flèche 3 (Haut) */}
                        <path d="M357 35 C351 27 339 17 328 15 C525 15 525 15 525 15 C536 15 546 19 551 28 C602 118 602 118 602 118 C653 89 653 89 653 89 C570 233 570 233 570 233 C404 233 404 233 404 233 C454 203 454 203 454 203z" />
                    </g>
                </svg>

                {/* --- Texte Circulaire avec charte typographique --- */}
                {/* font-sans hérite de la typo body et tracking donne un côté premium */}
                <text
                    className="font-sans uppercase tracking-[0.08em]"
                    fontSize="8.5"
                    fontWeight="800"
                    fill="#C85A1E"
                >
                    <textPath
                        href="#circlePath"
                        startOffset="50%"
                        textAnchor="middle"
                        lengthAdjust="spacing"
                    >
                        Ouvert à tous • Ouvert à tous •
                    </textPath>
                </text>
            </svg>
        </div>
    );
};
