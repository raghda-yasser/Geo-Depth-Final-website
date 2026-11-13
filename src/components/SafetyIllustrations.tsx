import React from 'react';

const SVG_BASE_CLASS = 'w-full h-full block';

// Shared dark scientific blueprint grid + subtle glow backdrop
const IllustrationFrame: React.FC<{
  idPrefix: string;
  children: React.ReactNode;
}> = ({ idPrefix, children }) => (
  <svg
    viewBox="0 0 400 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={SVG_BASE_CLASS}
    role="img"
  >
    <defs>
      <radialGradient id={`${idPrefix}-glow`} cx="50%" cy="48%" r="55%">
        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.16" />
        <stop offset="70%" stopColor="#0f172a" stopOpacity="0.04" />
        <stop offset="100%" stopColor="#090d16" stopOpacity="0" />
      </radialGradient>
      <pattern id={`${idPrefix}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
        <path
          d="M 24 0 L 0 0 0 24"
          fill="none"
          stroke="#1e293b"
          strokeWidth="0.7"
          strokeOpacity="0.55"
        />
      </pattern>
    </defs>

    {/* Dark background */}
    <rect width="400" height="260" fill="#090d16" />
    <rect width="400" height="260" fill={`url(#${idPrefix}-grid)`} />
    <rect width="400" height="260" fill={`url(#${idPrefix}-glow)`} />

    {children}
  </svg>
);

// -----------------------------------------------------------------------------
// 1. DROP — Person dropping onto hands & knees beside sturdy desk + yellow arrow
// -----------------------------------------------------------------------------
export const DropIllustration: React.FC = () => (
  <IllustrationFrame idPrefix="drop">
    {/* Floor plane */}
    <line x1="24" y1="214" x2="376" y2="214" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="176" cy="216" rx="76" ry="5" fill="#020617" fillOpacity="0.85" />

    {/* Sturdy Desk on right */}
    <g>
      <rect x="242" y="114" width="124" height="12" rx="3" fill="#0f2942" stroke="#38bdf8" strokeWidth="2" />
      <rect x="252" y="126" width="10" height="88" rx="2" fill="#0c1f33" stroke="#38bdf8" strokeWidth="1.8" />
      <rect x="344" y="126" width="10" height="88" rx="2" fill="#0c1f33" stroke="#38bdf8" strokeWidth="1.8" />
      {/* Desk cross brace */}
      <rect x="262" y="130" width="82" height="6" fill="#0b1a2b" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="1" />
    </g>

    {/* Human figure dropping onto hands and knees (facing right toward desk) */}
    <g>
      {/* Back leg / shin & foot resting on floor */}
      <path
        d="M 128 176 L 106 206 L 84 210"
        stroke="#38bdf8"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 128 176 L 106 206 L 84 210"
        stroke="#0c4a6e"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Near thigh + knee + shin on floor */}
      <path
        d="M 136 164 L 122 206 L 96 211"
        stroke="#7dd3fc"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Shoe */}
      <path d="M 88 211 L 100 211 L 98 202 L 85 207 Z" fill="#22d3ee" />

      {/* Torso (horizontal/angled low in crawl posture) */}
      <path
        d="M 132 162 C 154 150, 180 148, 202 156"
        stroke="#22d3ee"
        strokeWidth="24"
        strokeLinecap="round"
      />
      <path
        d="M 135 160 C 156 149, 179 148, 199 155"
        stroke="#7dd3fc"
        strokeWidth="12"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />

      {/* Far arm */}
      <path
        d="M 192 158 L 194 206 L 204 210"
        stroke="#0284c7"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Near arm planted firmly on floor */}
      <path
        d="M 198 158 L 206 206 L 218 211"
        stroke="#7dd3fc"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="215" cy="211" rx="7" ry="3.5" fill="#22d3ee" />

      {/* Neck & Head looking forward toward shelter */}
      <circle cx="219" cy="144" r="15" fill="#7dd3fc" stroke="#22d3ee" strokeWidth="2" />
      {/* Hair / cap detail */}
      <path
        d="M 205 141 C 206 129, 224 126, 231 136 C 224 134, 213 136, 205 141 Z"
        fill="#0c4a6e"
      />
    </g>

    {/* Yellow downward directional arrow + motion lines */}
    <g>
      {/* Motion arcs above back indicating dropping down */}
      <path d="M 142 128 Q 160 122 178 128" stroke="#facc15" strokeWidth="1.8" strokeDasharray="4 4" strokeLinecap="round" />
      {/* Bold downward arrow */}
      <line x1="168" y1="54" x2="168" y2="108" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M 155 96 L 168 113 L 181 96"
        stroke="#facc15"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Directional badge */}
      <rect x="134" y="34" width="68" height="18" rx="4" fill="#422006" fillOpacity="0.85" stroke="#facc15" strokeWidth="1.2" />
      <text
        x="168"
        y="46"
        textAnchor="middle"
        fill="#facc15"
        fontSize="9"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="700"
      >
        DROP LOW
      </text>
    </g>

    {/* Crawl arrow toward desk */}
    <g opacity="0.85">
      <line x1="224" y1="184" x2="278" y2="184" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 3" />
      <path d="M 273 179 L 281 184 L 273 189" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </IllustrationFrame>
);

// -----------------------------------------------------------------------------
// 2. COVER — Person sheltered under sturdy desk, shielding head and neck
// -----------------------------------------------------------------------------
export const CoverIllustration: React.FC = () => (
  <IllustrationFrame idPrefix="cover">
    {/* Floor plane */}
    <line x1="24" y1="214" x2="376" y2="214" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="200" cy="216" rx="108" ry="5" fill="#020617" fillOpacity="0.85" />

    {/* Falling debris / hazard markers deflected above table (minimal yellow accents) */}
    <g>
      <polygon points="132,34 142,48 124,48" fill="#facc15" fillOpacity="0.85" />
      <line x1="133" y1="54" x2="133" y2="74" stroke="#facc15" strokeWidth="1.8" strokeDasharray="3 3" />
      <polygon points="256,28 267,42 247,42" fill="#facc15" fillOpacity="0.85" />
      <line x1="257" y1="48" x2="257" y2="72" stroke="#facc15" strokeWidth="1.8" strokeDasharray="3 3" />
      {/* Deflection shield arc */}
      <path
        d="M 106 78 Q 200 62 294 78"
        stroke="#facc15"
        strokeWidth="2"
        strokeDasharray="5 4"
        strokeLinecap="round"
      />
    </g>

    {/* Sturdy Desk Shelter */}
    <g>
      <rect x="86" y="88" width="228" height="14" rx="3" fill="#0f2942" stroke="#22d3ee" strokeWidth="2.2" />
      <rect x="98" y="102" width="12" height="112" rx="2" fill="#0c1f33" stroke="#38bdf8" strokeWidth="2" />
      <rect x="290" y="102" width="12" height="112" rx="2" fill="#0c1f33" stroke="#38bdf8" strokeWidth="2" />
      <rect x="110" y="102" width="180" height="7" fill="#0b1a2b" stroke="#22d3ee" strokeOpacity="0.35" strokeWidth="1" />
    </g>

    {/* Sheltered Human Figure tucked under table, arms shielding head & neck */}
    <g>
      {/* Curled knees/legs */}
      <path
        d="M 226 174 L 204 206 L 242 208"
        stroke="#38bdf8"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 218 176 L 194 206 L 234 210"
        stroke="#7dd3fc"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M 232 210 L 246 210 L 242 201 L 230 205 Z" fill="#22d3ee" />

      {/* Tucked torso */}
      <path
        d="M 222 170 C 204 148, 178 144, 158 156"
        stroke="#22d3ee"
        strokeWidth="25"
        strokeLinecap="round"
      />

      {/* Head tucked low */}
      <circle cx="150" cy="166" r="15" fill="#7dd3fc" stroke="#22d3ee" strokeWidth="2" />
      <path
        d="M 136 164 C 138 152, 156 150, 162 160 C 154 157, 144 159, 136 164 Z"
        fill="#0c4a6e"
      />

      {/* Both arms wrapped up to protect back of head & neck */}
      <path
        d="M 170 156 L 146 180 L 146 150"
        stroke="#7dd3fc"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="148" cy="149" r="5" fill="#facc15" />
    </g>

    {/* Protection callout */}
    <rect x="148" y="116" width="104" height="17" rx="4" fill="#082f49" fillOpacity="0.9" stroke="#22d3ee" strokeWidth="1" />
    <text
      x="200"
      y="128"
      textAnchor="middle"
      fill="#7dd3fc"
      fontSize="8.5"
      fontFamily="JetBrains Mono, monospace"
      fontWeight="700"
    >
      SHIELD HEAD &amp; NECK
    </text>
  </IllustrationFrame>
);

// -----------------------------------------------------------------------------
// 3. HOLD ON — Person gripping table leg with one hand & covering neck with other
// -----------------------------------------------------------------------------
export const HoldOnIllustration: React.FC = () => (
  <IllustrationFrame idPrefix="hold-on">
    {/* Floor plane */}
    <line x1="24" y1="214" x2="376" y2="214" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="200" cy="216" rx="108" ry="5" fill="#020617" fillOpacity="0.85" />

    {/* Seismic vibration accent ticks around desk corners */}
    <g stroke="#facc15" strokeWidth="2" strokeLinecap="round">
      <path d="M 74 88 L 66 94 L 74 100" />
      <path d="M 326 88 L 334 94 L 326 100" />
    </g>

    {/* Sturdy Desk */}
    <g>
      <rect x="86" y="88" width="228" height="14" rx="3" fill="#0f2942" stroke="#22d3ee" strokeWidth="2.2" />
      <rect x="98" y="102" width="13" height="112" rx="2" fill="#0c1f33" stroke="#38bdf8" strokeWidth="2" />
      <rect x="289" y="102" width="13" height="112" rx="2" fill="#0c1f33" stroke="#38bdf8" strokeWidth="2" />
    </g>

    {/* Human figure under desk facing left desk leg */}
    <g>
      {/* Kneeling legs */}
      <path
        d="M 218 176 L 194 206 L 236 209"
        stroke="#38bdf8"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 210 176 L 186 206 L 228 210"
        stroke="#7dd3fc"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M 226 210 L 240 210 L 236 202 L 224 205 Z" fill="#22d3ee" />

      {/* Torso leaned forward under shelter */}
      <path
        d="M 212 172 C 194 150, 170 146, 152 154"
        stroke="#22d3ee"
        strokeWidth="24"
        strokeLinecap="round"
      />

      {/* Head protected under table */}
      <circle cx="148" cy="160" r="14.5" fill="#7dd3fc" stroke="#22d3ee" strokeWidth="2" />
      <path
        d="M 135 156 C 138 145, 155 144, 161 154 C 153 151, 143 152, 135 156 Z"
        fill="#0c4a6e"
      />

      {/* Left arm raised behind head & neck to protect */}
      <path
        d="M 164 150 L 172 134 L 154 144"
        stroke="#38bdf8"
        strokeWidth="10.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="152" cy="144" r="4.5" fill="#7dd3fc" />

      {/* Right arm reaching out to firmly grip the sturdy desk leg */}
      <path
        d="M 156 164 L 132 162 L 106 156"
        stroke="#7dd3fc"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Highlighted yellow grip ring around desk leg */}
      <rect x="96" y="148" width="17" height="16" rx="4" fill="#facc15" fillOpacity="0.28" stroke="#facc15" strokeWidth="2" />
      <circle cx="106" cy="156" r="5" fill="#facc15" />
    </g>

    {/* Hold-on anchor annotation */}
    <path d="M 105 130 L 105 144" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
    <rect x="122" y="114" width="112" height="17" rx="4" fill="#422006" fillOpacity="0.85" stroke="#facc15" strokeWidth="1" />
    <text
      x="178"
      y="126"
      textAnchor="middle"
      fill="#facc15"
      fontSize="8.5"
      fontFamily="JetBrains Mono, monospace"
      fontWeight="700"
    >
      GRIP DESK LEG FIRMLY
    </text>
  </IllustrationFrame>
);

// -----------------------------------------------------------------------------
// 4. SITUATION 1: INSIDE A BUILDING
// -----------------------------------------------------------------------------
export const SituationBuildingIllustration: React.FC = () => (
  <IllustrationFrame idPrefix="sit-building">
    {/* Room floor & interior wall */}
    <line x1="20" y1="214" x2="380" y2="214" stroke="#334155" strokeWidth="2.5" />
    <line x1="330" y1="36" x2="330" y2="214" stroke="#38bdf8" strokeWidth="3" />

    {/* Glass Window on left with yellow hazard warning */}
    <rect x="34" y="54" width="66" height="90" rx="3" fill="#0c1f33" stroke="#38bdf8" strokeWidth="2" />
    <line x1="67" y1="54" x2="67" y2="144" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="1.5" />
    <line x1="34" y1="99" x2="100" y2="99" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="1.5" />
    {/* Crack lines */}
    <path d="M 52 72 L 62 86 L 56 96" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="34" y="152" width="66" height="16" rx="3" fill="#422006" stroke="#facc15" strokeWidth="1" />
    <text x="67" y="163" textAnchor="middle" fill="#facc15" fontSize="7.5" fontFamily="JetBrains Mono, monospace" fontWeight="700">
      AVOID GLASS
    </text>

    {/* Arrow pointing away from window toward sturdy desk */}
    <line x1="112" y1="108" x2="146" y2="108" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 140 102 L 148 108 L 140 114" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Sturdy desk + person sheltered underneath */}
    <rect x="164" y="112" width="144" height="12" rx="3" fill="#0f2942" stroke="#22d3ee" strokeWidth="2" />
    <rect x="174" y="124" width="10" height="90" fill="#0c1f33" stroke="#38bdf8" strokeWidth="1.8" />
    <rect x="288" y="124" width="10" height="90" fill="#0c1f33" stroke="#38bdf8" strokeWidth="1.8" />

    {/* Sheltered person */}
    <path d="M 262 182 L 244 208 L 274 209" stroke="#7dd3fc" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 256 178 C 242 158, 224 156, 208 164" stroke="#22d3ee" strokeWidth="20" strokeLinecap="round" />
    <circle cx="204" cy="170" r="12" fill="#7dd3fc" stroke="#22d3ee" strokeWidth="1.8" />
    <path d="M 212 162 L 194 166 L 180 162" stroke="#7dd3fc" strokeWidth="9" strokeLinecap="round" />
    <circle cx="179" cy="162" r="4" fill="#facc15" />

    <rect x="184" y="84" width="104" height="17" rx="4" fill="#082f49" stroke="#22d3ee" strokeWidth="1" />
    <text x="236" y="96" textAnchor="middle" fill="#7dd3fc" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="700">
      STAY INDOORS
    </text>
  </IllustrationFrame>
);

// -----------------------------------------------------------------------------
// 5. SITUATION 2: OUTDOORS
// -----------------------------------------------------------------------------
export const SituationOutdoorsIllustration: React.FC = () => (
  <IllustrationFrame idPrefix="sit-outdoors">
    {/* Ground */}
    <line x1="16" y1="214" x2="384" y2="214" stroke="#334155" strokeWidth="2.5" />

    {/* Building hazard on left */}
    <rect x="24" y="70" width="58" height="144" rx="2" fill="#0f172a" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1.8" />
    <rect x="36" y="88" width="12" height="16" fill="#1e293b" />
    <rect x="56" y="88" width="12" height="16" fill="#1e293b" />
    <rect x="36" y="116" width="12" height="16" fill="#1e293b" />
    <rect x="56" y="116" width="12" height="16" fill="#1e293b" />

    {/* Utility pole & power lines on right */}
    <line x1="348" y1="62" x2="348" y2="214" stroke="#38bdf8" strokeWidth="3.5" />
    <line x1="328" y1="76" x2="368" y2="76" stroke="#38bdf8" strokeWidth="2.5" />
    <path d="M 328 76 Q 305 95 294 90" stroke="#facc15" strokeWidth="1.8" strokeDasharray="3 3" />
    <circle cx="332" cy="54" r="7" fill="#422006" stroke="#facc15" strokeWidth="1.5" />
    <text x="332" y="57" textAnchor="middle" fill="#facc15" fontSize="9" fontWeight="700">!</text>

    {/* Clearance arrows pushing into safe open center */}
    <line x1="94" y1="150" x2="128" y2="150" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M 122 145 L 130 150 L 122 155" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

    <line x1="306" y1="150" x2="272" y2="150" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M 278 145 L 270 150 L 278 155" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

    {/* Safe Open Clearing zone */}
    <ellipse cx="200" cy="214" rx="56" ry="5" fill="#22d3ee" fillOpacity="0.25" />

    {/* Person crouched low in open clearing covering head */}
    <path d="M 184 182 L 168 208 L 204 209" stroke="#38bdf8" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 184 176 C 194 156, 212 154, 224 166" stroke="#22d3ee" strokeWidth="20" strokeLinecap="round" />
    <circle cx="222" cy="168" r="12" fill="#7dd3fc" stroke="#22d3ee" strokeWidth="1.8" />
    <path d="M 206 160 L 222 148 L 230 158" stroke="#7dd3fc" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />

    <rect x="140" y="96" width="120" height="18" rx="4" fill="#082f49" stroke="#22d3ee" strokeWidth="1.2" />
    <text x="200" y="108" textAnchor="middle" fill="#7dd3fc" fontSize="8.5" fontFamily="JetBrains Mono, monospace" fontWeight="700">
      OPEN CLEAR AREA
    </text>
  </IllustrationFrame>
);

// -----------------------------------------------------------------------------
// 6. SITUATION 3: WHILE DRIVING
// -----------------------------------------------------------------------------
export const SituationDrivingIllustration: React.FC = () => (
  <IllustrationFrame idPrefix="sit-driving">
    {/* Roadway */}
    <rect x="16" y="196" width="368" height="22" fill="#0f172a" />
    <line x1="16" y1="196" x2="384" y2="196" stroke="#334155" strokeWidth="2" />
    <line x1="24" y1="207" x2="376" y2="207" stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="12 10" />

    {/* Highway Overpass Hazard in background right */}
    <rect x="278" y="88" width="106" height="14" rx="2" fill="#1e293b" stroke="#facc15" strokeWidth="1.6" />
    <rect x="304" y="102" width="14" height="94" fill="#0f172a" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="1.5" />
    <rect x="274" y="64" width="100" height="16" rx="3" fill="#422006" stroke="#facc15" strokeWidth="1" />
    <text x="324" y="75" textAnchor="middle" fill="#facc15" fontSize="7.5" fontFamily="JetBrains Mono, monospace" fontWeight="700">
      CLEAR OVERPASSES
    </text>

    {/* Pull-over arrow */}
    <line x1="252" y1="158" x2="218" y2="158" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 224 152 L 216 158 L 224 164" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Modern Sedan Car stopped safely away from bridge */}
    <g>
      {/* Car body */}
      <path
        d="M 52 178 L 62 152 L 94 128 L 154 128 L 184 150 L 204 156 L 204 182 L 52 182 Z"
        fill="#0f2942"
        stroke="#22d3ee"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Windows */}
      <path
        d="M 96 134 L 150 134 L 174 150 L 76 150 Z"
        fill="#082f49"
        stroke="#7dd3fc"
        strokeWidth="1.5"
      />
      {/* Driver silhouette safely inside with seatbelt */}
      <circle cx="132" cy="141" r="7" fill="#7dd3fc" />
      <path d="M 124 150 C 128 144, 138 144, 142 150" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" />
      {/* Hazard lights */}
      <circle cx="55" cy="164" r="4" fill="#facc15" />
      <circle cx="201" cy="165" r="4" fill="#facc15" />
      {/* Wheels */}
      <circle cx="86" cy="184" r="14" fill="#090d16" stroke="#7dd3fc" strokeWidth="3" />
      <circle cx="86" cy="184" r="5" fill="#22d3ee" />
      <circle cx="170" cy="184" r="14" fill="#090d16" stroke="#7dd3fc" strokeWidth="3" />
      <circle cx="170" cy="184" r="5" fill="#22d3ee" />
    </g>

    <rect x="64" y="88" width="132" height="18" rx="4" fill="#082f49" stroke="#22d3ee" strokeWidth="1.2" />
    <text x="130" y="100" textAnchor="middle" fill="#7dd3fc" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="700">
      PULL OVER · STAY INSIDE
    </text>
  </IllustrationFrame>
);

// -----------------------------------------------------------------------------
// 7. SITUATION 4: AT SCHOOL
// -----------------------------------------------------------------------------
export const SituationSchoolIllustration: React.FC = () => (
  <IllustrationFrame idPrefix="sit-school">
    {/* Classroom floor */}
    <line x1="20" y1="214" x2="380" y2="214" stroke="#334155" strokeWidth="2.5" />

    {/* Classroom chalkboard in background */}
    <rect x="88" y="34" width="224" height="64" rx="4" fill="#0c1f33" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="2" />
    <line x1="112" y1="56" x2="188" y2="56" stroke="#22d3ee" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
    <line x1="112" y1="70" x2="246" y2="70" stroke="#7dd3fc" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />

    {/* Two student desks side-by-side */}
    {[72, 218].map((deskX, i) => (
      <g key={i}>
        <rect x={deskX} y="118" width="110" height="11" rx="3" fill="#0f2942" stroke="#22d3ee" strokeWidth="2" />
        <rect x={deskX + 8} y="129" width="8" height="85" fill="#0c1f33" stroke="#38bdf8" strokeWidth="1.6" />
        <rect x={deskX + 94} y="129" width="8" height="85" fill="#0c1f33" stroke="#38bdf8" strokeWidth="1.6" />

        {/* Student crouched under classroom desk */}
        <path
          d={`M ${deskX + 76} 184 L ${deskX + 62} 208 L ${deskX + 86} 209`}
          stroke="#38bdf8"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M ${deskX + 72} 180 C ${deskX + 60} 162, ${deskX + 44} 160, ${deskX + 34} 166`}
          stroke="#22d3ee"
          strokeWidth="17"
          strokeLinecap="round"
        />
        <circle cx={deskX + 32} cy="168" r="10.5" fill="#7dd3fc" stroke="#22d3ee" strokeWidth="1.5" />
        {/* Gripping desk leg */}
        <path
          d={`M ${deskX + 34} 170 L ${deskX + 14} 166`}
          stroke="#7dd3fc"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx={deskX + 12} cy="166" r="4" fill="#facc15" />
        {/* Other arm protecting neck */}
        <path
          d={`M ${deskX + 46} 162 L ${deskX + 34} 154`}
          stroke="#38bdf8"
          strokeWidth="7.5"
          strokeLinecap="round"
        />
      </g>
    ))}
  </IllustrationFrame>
);

// -----------------------------------------------------------------------------
// 8. SITUATION 5: AT WORK
// -----------------------------------------------------------------------------
export const SituationWorkIllustration: React.FC = () => (
  <IllustrationFrame idPrefix="sit-work">
    {/* Office floor */}
    <line x1="20" y1="214" x2="380" y2="214" stroke="#334155" strokeWidth="2.5" />

    {/* Tall office cabinet / server rack anchored on right with yellow restraint */}
    <rect x="294" y="64" width="66" height="150" rx="3" fill="#0f172a" stroke="#38bdf8" strokeOpacity="0.65" strokeWidth="2" />
    <line x1="304" y1="96" x2="350" y2="96" stroke="#334155" strokeWidth="2" />
    <line x1="304" y1="128" x2="350" y2="128" stroke="#334155" strokeWidth="2" />
    <line x1="304" y1="160" x2="350" y2="160" stroke="#334155" strokeWidth="2" />
    {/* Wall anchor strap accent */}
    <path d="M 358 72 L 372 72" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />

    {/* Office workstation desk + monitor */}
    <rect x="64" y="114" width="166" height="12" rx="3" fill="#0f2942" stroke="#22d3ee" strokeWidth="2" />
    <rect x="76" y="126" width="10" height="88" fill="#0c1f33" stroke="#38bdf8" strokeWidth="1.8" />
    <rect x="208" y="126" width="10" height="88" fill="#0c1f33" stroke="#38bdf8" strokeWidth="1.8" />
    {/* Monitor on desk */}
    <rect x="114" y="70" width="54" height="34" rx="3" fill="#082f49" stroke="#38bdf8" strokeWidth="1.8" />
    <line x1="141" y1="104" x2="141" y2="114" stroke="#38bdf8" strokeWidth="4" />

    {/* Employee under workstation desk */}
    <path d="M 184 182 L 166 208 L 196 209" stroke="#38bdf8" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 178 178 C 164 158, 144 156, 128 164" stroke="#22d3ee" strokeWidth="20" strokeLinecap="round" />
    <circle cx="124" cy="170" r="12" fill="#7dd3fc" stroke="#22d3ee" strokeWidth="1.8" />
    <path d="M 134 162 L 116 156" stroke="#38bdf8" strokeWidth="8.5" strokeLinecap="round" />
    <path d="M 124 170 L 86 164" stroke="#7dd3fc" strokeWidth="9" strokeLinecap="round" />
    <circle cx="84" cy="164" r="4.5" fill="#facc15" />

    {/* Stairs exit sign (never elevator) */}
    <rect x="24" y="42" width="76" height="22" rx="4" fill="#082f49" stroke="#facc15" strokeWidth="1.2" />
    <text x="62" y="56" textAnchor="middle" fill="#facc15" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="700">
      USE STAIRS
    </text>
  </IllustrationFrame>
);
