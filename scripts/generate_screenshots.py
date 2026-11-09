import os
import subprocess

OUT_DIR = os.path.abspath('docs/screenshots')
os.makedirs(OUT_DIR, exist_ok=True)

FONT = "DejaVu Sans, sans-serif"

def window_frame(w, h, title_url):
    return f"""
    <!-- Window chrome -->
    <rect width="{w}" height="{h}" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
    <rect width="{w}" height="38" rx="12" fill="#1e293b"/>
    <rect y="26" width="{w}" height="12" fill="#1e293b"/>
    <circle cx="22" cy="19" r="6" fill="#ef4444"/>
    <circle cx="40" cy="19" r="6" fill="#f59e0b"/>
    <circle cx="58" cy="19" r="6" fill="#10b981"/>
    <!-- URL bar -->
    <rect x="180" y="8" width="{w-360}" height="22" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1"/>
    <text x="{w/2}" y="23" fill="#94a3b8" font-family="{FONT}" font-size="11" text-anchor="middle">🔒 {title_url}</text>
    <!-- App area -->
    <rect y="38" width="{w}" height="{h-38}" rx="0" fill="#f8fafc"/>
    """

def navbar(w, active_tab="Explorar", role="Turista"):
    role_color = "#2563eb" if role == "Turista" else "#10b981" if role == "Guia" else "#8b5cf6"
    return f"""
    <!-- Navbar -->
    <rect y="38" width="{w}" height="54" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="32" y="72" fill="#0f172a" font-family="{FONT}" font-size="20" font-weight="bold">Titureco</text>
    
    <!-- Nav tabs -->
    <text x="140" y="71" fill="{ '#2563eb' if active_tab=='Explorar' else '#64748b' }" font-family="{FONT}" font-size="13" font-weight="600">Explorar</text>
    <text x="220" y="71" fill="{ '#2563eb' if active_tab=='Perto de Mim' else '#64748b' }" font-family="{FONT}" font-size="13" font-weight="600">Perto de Mim</text>
    <text x="330" y="71" fill="{ '#2563eb' if active_tab=='Minhas Reservas' else '#64748b' }" font-family="{FONT}" font-size="13" font-weight="600">Minhas Reservas</text>
    <text x="470" y="71" fill="{ '#2563eb' if active_tab=='Dashboard' else '#64748b' }" font-family="{FONT}" font-size="13" font-weight="600">Dashboard</text>

    <!-- User badge -->
    <rect x="{w-210}" y="50" width="180" height="30" rx="15" fill="#f1f5f9"/>
    <circle cx="{w-195}" cy="65" r="10" fill="{role_color}"/>
    <text x="{w-195}" y="69" fill="#ffffff" font-family="{FONT}" font-size="10" font-weight="bold" text-anchor="middle">{role[0]}</text>
    <text x="{w-178}" y="69" fill="#334155" font-family="{FONT}" font-size="12" font-weight="500">Iago Santos · {role}</text>
    """

# ─── 1. Feed & Search ──────────────────────────────────────────────────────────
def make_feed_svg():
    w, h = 960, 580
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
    {window_frame(w, h, "https://titureco.com/?q=praia&amp;sort=ratingAverage,desc")}
    {navbar(w, active_tab="Explorar", role="Turista")}
    
    <!-- Hero / Header -->
    <text x="{w/2}" y="132" fill="#0f172a" font-family="{FONT}" font-size="24" font-weight="bold" text-anchor="middle">Descubra atrações incríveis</text>
    <text x="{w/2}" y="154" fill="#64748b" font-family="{FONT}" font-size="13" text-anchor="middle">Explore destinos turísticos com guias locais e reserve em poucos cliques</text>
    
    <!-- Search Controls -->
    <rect x="180" y="172" width="400" height="38" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="200" y="196" fill="#0f172a" font-family="{FONT}" font-size="13">🔍 praia</text>
    
    <!-- Sort dropdown -->
    <rect x="590" y="172" width="180" height="38" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="605" y="196" fill="#334155" font-family="{FONT}" font-size="12">Melhor avaliação ▼</text>
    
    <!-- Nearby button -->
    <rect x="780" y="172" width="120" height="38" rx="8" fill="#2563eb"/>
    <text x="840" y="196" fill="#ffffff" font-family="{FONT}" font-size="12" font-weight="600" text-anchor="middle">📍 No Mapa</text>

    <!-- Cards Row -->
    <!-- Card 1 -->
    <g transform="translate(40, 230)">
      <rect width="275" height="310" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <rect width="275" height="150" rx="12" fill="#38bdf8"/>
      <!-- Coastal illustration -->
      <path d="M 0 110 Q 70 80, 140 100 T 275 90 L 275 150 L 0 150 Z" fill="#0284c7" opacity="0.6"/>
      <circle cx="210" cy="50" r="22" fill="#fef08a" opacity="0.8"/>
      <rect x="175" y="115" width="90" height="26" rx="6" fill="#0f172a" opacity="0.85"/>
      <text x="220" y="132" fill="#ffffff" font-family="{FONT}" font-size="12" font-weight="bold" text-anchor="middle">R$ 90,00</text>
      
      <text x="16" y="180" fill="#0f172a" font-family="{FONT}" font-size="14" font-weight="bold">Piscinas Naturais do Seixas</text>
      <text x="16" y="200" fill="#64748b" font-family="{FONT}" font-size="12">Guia: Maria Santos</text>
      <text x="16" y="222" fill="#334155" font-family="{FONT}" font-size="12">Passeio de catamarã até as piscinas</text>
      <text x="16" y="238" fill="#334155" font-family="{FONT}" font-size="12">de águas cristalinas com snorkel.</text>
      <line x1="16" y1="262" x2="259" y2="262" stroke="#f1f5f9" stroke-width="1.5"/>
      <text x="16" y="285" fill="#ca8a04" font-family="{FONT}" font-size="12" font-weight="bold">★ 4.9</text>
      <text x="56" y="285" fill="#64748b" font-family="{FONT}" font-size="11">(42 avaliações)</text>
      <text x="259" y="285" fill="#2563eb" font-family="{FONT}" font-size="12" font-weight="600" text-anchor="end">8 vagas/dia</text>
    </g>

    <!-- Card 2 -->
    <g transform="translate(342, 230)">
      <rect width="275" height="310" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <rect width="275" height="150" rx="12" fill="#f97316"/>
      <!-- Sunset illustration -->
      <circle cx="137" cy="130" r="50" fill="#fde047" opacity="0.9"/>
      <path d="M 0 120 C 80 110, 190 135, 275 115 L 275 150 L 0 150 Z" fill="#c2410c" opacity="0.7"/>
      <rect x="175" y="115" width="90" height="26" rx="6" fill="#0f172a" opacity="0.85"/>
      <text x="220" y="132" fill="#ffffff" font-family="{FONT}" font-size="12" font-weight="bold" text-anchor="middle">R$ 50,00</text>
      
      <text x="16" y="180" fill="#0f172a" font-family="{FONT}" font-size="14" font-weight="bold">Pôr do Sol no Jacaré</text>
      <text x="16" y="200" fill="#64748b" font-family="{FONT}" font-size="12">Guia: Carlos Lima</text>
      <text x="16" y="222" fill="#334155" font-family="{FONT}" font-size="12">Aprecie o saxofone ao vivo na praia</text>
      <text x="16" y="238" fill="#334155" font-family="{FONT}" font-size="12">fluvial do Jacaré no entardecer.</text>
      <line x1="16" y1="262" x2="259" y2="262" stroke="#f1f5f9" stroke-width="1.5"/>
      <text x="16" y="285" fill="#ca8a04" font-family="{FONT}" font-size="12" font-weight="bold">★ 4.8</text>
      <text x="56" y="285" fill="#64748b" font-family="{FONT}" font-size="11">(56 avaliações)</text>
      <text x="259" y="285" fill="#2563eb" font-family="{FONT}" font-size="12" font-weight="600" text-anchor="end">15 vagas/dia</text>
    </g>

    <!-- Card 3 -->
    <g transform="translate(645, 230)">
      <rect width="275" height="310" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <rect width="275" height="150" rx="12" fill="#14b8a6"/>
      <!-- Lighthouse illustration -->
      <polygon points="120,40 145,40 155,150 110,150" fill="#f8fafc"/>
      <rect x="115" y="30" width="35" height="15" fill="#dc2626"/>
      <path d="M 0 125 Q 120 110, 275 130 L 275 150 L 0 150 Z" fill="#0f766e" opacity="0.7"/>
      <rect x="175" y="115" width="90" height="26" rx="6" fill="#0f172a" opacity="0.85"/>
      <text x="220" y="132" fill="#ffffff" font-family="{FONT}" font-size="12" font-weight="bold" text-anchor="middle">R$ 40,00</text>
      
      <text x="16" y="180" fill="#0f172a" font-family="{FONT}" font-size="14" font-weight="bold">Farol do Cabo Branco</text>
      <text x="16" y="200" fill="#64748b" font-family="{FONT}" font-size="12">Guia: João Silva</text>
      <text x="16" y="222" fill="#334155" font-family="{FONT}" font-size="12">O ponto mais oriental das Américas</text>
      <text x="16" y="238" fill="#334155" font-family="{FONT}" font-size="12">com vista panorâmica para o oceano.</text>
      <line x1="16" y1="262" x2="259" y2="262" stroke="#f1f5f9" stroke-width="1.5"/>
      <text x="16" y="285" fill="#ca8a04" font-family="{FONT}" font-size="12" font-weight="bold">★ 4.9</text>
      <text x="56" y="285" fill="#64748b" font-family="{FONT}" font-size="11">(38 avaliações)</text>
      <text x="259" y="285" fill="#2563eb" font-family="{FONT}" font-size="12" font-weight="600" text-anchor="end">20 vagas/dia</text>
    </g>
    </svg>"""
    return svg

# ─── 2. Nearby Map (PostGIS + Leaflet + MarkerCluster) ─────────────────────────
def make_map_svg():
    w, h = 960, 580
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
    {window_frame(w, h, "https://titureco.com/nearby")}
    {navbar(w, active_tab="Perto de Mim", role="Turista")}
    
    <!-- Controls Subheader -->
    <rect y="92" width="{w}" height="42" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="24" y="118" fill="#0f172a" font-family="{FONT}" font-size="13" font-weight="bold">Atrações Próximas</text>
    <text x="170" y="118" fill="#64748b" font-family="{FONT}" font-size="12">Raio: 15 km</text>
    <!-- Range slider -->
    <rect x="245" y="112" width="130" height="8" rx="4" fill="#e2e8f0"/>
    <rect x="245" y="112" width="60" height="8" rx="4" fill="#2563eb"/>
    <circle cx="305" cy="116" r="8" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
    <text x="400" y="118" fill="#2563eb" font-family="{FONT}" font-size="12" font-weight="bold">● 4 atrações no raio selecionado (PostGIS)</text>
    
    <!-- Left Sidebar (synchronized list) -->
    <rect x="0" y="134" width="310" height="{h-134}" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    
    <!-- Sidebar item 1 (Selected) -->
    <g transform="translate(14, 150)">
      <rect width="282" height="92" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="14" y="24" fill="#0f172a" font-family="{FONT}" font-size="13" font-weight="bold">Piscinas Naturais do Seixas</text>
      <text x="14" y="42" fill="#64748b" font-family="{FONT}" font-size="11">Guia: Maria Santos · 3.2 km de você</text>
      <text x="14" y="64" fill="#ca8a04" font-family="{FONT}" font-size="12" font-weight="bold">★ 4.9 (42)</text>
      <text x="14" y="80" fill="#2563eb" font-family="{FONT}" font-size="11" font-weight="bold">R$ 90,00 · 8 vagas</text>
      <text x="270" y="80" fill="#2563eb" font-family="{FONT}" font-size="11" text-anchor="end">Ver detalhes →</text>
    </g>

    <!-- Sidebar item 2 -->
    <g transform="translate(14, 252)">
      <rect width="282" height="92" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
      <text x="14" y="24" fill="#0f172a" font-family="{FONT}" font-size="13" font-weight="bold">Farol do Cabo Branco</text>
      <text x="14" y="42" fill="#64748b" font-family="{FONT}" font-size="11">Guia: João Silva · 5.8 km de você</text>
      <text x="14" y="64" fill="#ca8a04" font-family="{FONT}" font-size="12" font-weight="bold">★ 4.9 (38)</text>
      <text x="14" y="80" fill="#2563eb" font-family="{FONT}" font-size="11" font-weight="bold">R$ 40,00 · 20 vagas</text>
      <text x="270" y="80" fill="#64748b" font-family="{FONT}" font-size="11" text-anchor="end">Ver detalhes →</text>
    </g>

    <!-- Sidebar item 3 -->
    <g transform="translate(14, 354)">
      <rect width="282" height="92" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
      <text x="14" y="24" fill="#0f172a" font-family="{FONT}" font-size="13" font-weight="bold">Centro Histórico &amp; Hotel Globo</text>
      <text x="14" y="42" fill="#64748b" font-family="{FONT}" font-size="11">Guia: Ana Beatriz · 8.4 km de você</text>
      <text x="14" y="64" fill="#ca8a04" font-family="{FONT}" font-size="12" font-weight="bold">★ 4.7 (29)</text>
      <text x="14" y="80" fill="#2563eb" font-family="{FONT}" font-size="11" font-weight="bold">R$ 35,00 · 12 vagas</text>
      <text x="270" y="80" fill="#64748b" font-family="{FONT}" font-size="11" text-anchor="end">Ver detalhes →</text>
    </g>

    <!-- Map Canvas (Right) -->
    <rect x="310" y="134" width="{w-310}" height="{h-134}" fill="#e5e7eb"/>
    <!-- Stylized coastline / water -->
    <path d="M 520 134 Q 570 300, 600 420 T 680 {h} L {w} {h} L {w} 134 Z" fill="#bae6fd" opacity="0.8"/>
    <!-- Roads grid -->
    <path d="M 310 240 L 600 220 L 700 350 M 420 134 L 440 500 M 310 400 L 750 430" stroke="#cbd5e1" stroke-width="3" fill="none"/>
    
    <!-- User location & Radius circle -->
    <circle cx="530" cy="310" r="140" fill="#3b82f6" fill-opacity="0.12" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4,4"/>
    <circle cx="530" cy="310" r="10" fill="#2563eb" stroke="#ffffff" stroke-width="3"/>
    <rect x="475" y="260" width="110" height="24" rx="4" fill="#0f172a" opacity="0.9"/>
    <text x="530" y="276" fill="#ffffff" font-family="{FONT}" font-size="10" font-weight="bold" text-anchor="middle">Você está aqui</text>
    
    <!-- Pin 1: Seixas (with open popup) -->
    <g transform="translate(635, 290)">
      <circle cx="0" cy="0" r="14" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
      <text x="0" y="4" fill="#ffffff" font-family="{FONT}" font-size="10" font-weight="bold" text-anchor="middle">★</text>
      <!-- Popup box -->
      <rect x="-85" y="-95" width="170" height="80" rx="8" fill="#ffffff" stroke="#334155" stroke-width="1"/>
      <polygon points="-8,-15 8,-15 0,-2" fill="#ffffff"/>
      <text x="-75" y="-76" fill="#0f172a" font-family="{FONT}" font-size="11" font-weight="bold">Piscinas do Seixas</text>
      <text x="-75" y="-60" fill="#64748b" font-family="{FONT}" font-size="10">R$ 90,00 · ★ 4.9 (42)</text>
      <rect x="-75" y="-48" width="150" height="22" rx="4" fill="#2563eb"/>
      <text x="0" y="-33" fill="#ffffff" font-family="{FONT}" font-size="10" font-weight="bold" text-anchor="middle">Ver Detalhes</text>
    </g>

    <!-- Cluster Pin 2 (Farol & Penha) -->
    <g transform="translate(560, 190)">
      <circle cx="0" cy="0" r="18" fill="#f59e0b" stroke="#ffffff" stroke-width="3"/>
      <text x="0" y="4" fill="#ffffff" font-family="{FONT}" font-size="11" font-weight="bold" text-anchor="middle">2</text>
    </g>

    <!-- Pin 3: Centro Histórico -->
    <g transform="translate(410, 240)">
      <circle cx="0" cy="0" r="14" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
      <text x="0" y="4" fill="#ffffff" font-family="{FONT}" font-size="10" font-weight="bold" text-anchor="middle">★</text>
    </g>
    </svg>"""
    return svg

# ─── 3. Guide Dashboard ───────────────────────────────────────────────────────
def make_dashboard_svg():
    w, h = 960, 580
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
    {window_frame(w, h, "https://titureco.com/guide/dashboard")}
    {navbar(w, active_tab="Dashboard", role="Guia")}
    
    <!-- Top Action bar -->
    <text x="40" y="125" fill="#0f172a" font-family="{FONT}" font-size="22" font-weight="bold">Dashboard do Guia</text>
    <text x="40" y="146" fill="#64748b" font-family="{FONT}" font-size="12">Métricas em tempo real, capacidade de vagas e participantes por atração</text>
    <rect x="{w-180}" y="112" width="140" height="36" rx="8" fill="#2563eb"/>
    <text x="{w-110}" y="135" fill="#ffffff" font-family="{FONT}" font-size="12" font-weight="600" text-anchor="middle">+ Nova no Mapa</text>

    <!-- 4 KPI Cards -->
    <g transform="translate(40, 168)">
      <rect width="205" height="80" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="16" y="28" fill="#64748b" font-family="{FONT}" font-size="11" font-weight="600">ATRAÇÕES ATIVAS</text>
      <text x="16" y="60" fill="#0f172a" font-family="{FONT}" font-size="26" font-weight="bold">4</text>
    </g>
    <g transform="translate(265, 168)">
      <rect width="205" height="80" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="16" y="28" fill="#64748b" font-family="{FONT}" font-size="11" font-weight="600">TOTAL DE RESERVAS</text>
      <text x="16" y="60" fill="#0f172a" font-family="{FONT}" font-size="26" font-weight="bold">52</text>
    </g>
    <g transform="translate(490, 168)">
      <rect width="205" height="80" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="16" y="28" fill="#64748b" font-family="{FONT}" font-size="11" font-weight="600">CONFIRMADAS / CONCLUÍDAS</text>
      <text x="16" y="60" fill="#10b981" font-family="{FONT}" font-size="26" font-weight="bold">46</text>
    </g>
    <g transform="translate(715, 168)">
      <rect width="205" height="80" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="16" y="28" fill="#64748b" font-family="{FONT}" font-size="11" font-weight="600">AVALIAÇÃO MÉDIA</text>
      <text x="16" y="60" fill="#f59e0b" font-family="{FONT}" font-size="26" font-weight="bold">★ 4.9</text>
    </g>

    <!-- Status Breakdown Chart -->
    <g transform="translate(40, 264)">
      <rect width="880" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="16" y="26" fill="#0f172a" font-family="{FONT}" font-size="13" font-weight="bold">Distribuição de Reservas por Status</text>
      <!-- Multi-segment bar -->
      <rect x="16" y="38" width="848" height="14" rx="7" fill="#e2e8f0"/>
      <!-- Confirmadas (55%) -->
      <rect x="16" y="38" width="466" height="14" rx="7" fill="#10b981"/>
      <!-- Concluídas (30%) -->
      <rect x="482" y="38" width="254" height="14" fill="#3b82f6"/>
      <!-- Pendentes (10%) -->
      <rect x="736" y="38" width="85" height="14" fill="#f59e0b"/>
      <!-- Canceladas (5%) -->
      <rect x="821" y="38" width="43" height="14" rx="7" fill="#ef4444"/>
      
      <!-- Legend items with explicit X coordinates -->
      <circle cx="24" cy="74" r="5" fill="#10b981"/>
      <text x="35" y="78" fill="#334155" font-family="{FONT}" font-size="11" font-weight="500">Confirmadas: 28 (55%)</text>
      
      <circle cx="220" cy="74" r="5" fill="#3b82f6"/>
      <text x="231" y="78" fill="#334155" font-family="{FONT}" font-size="11" font-weight="500">Concluídas: 18 (35%)</text>
      
      <circle cx="410" cy="74" r="5" fill="#f59e0b"/>
      <text x="421" y="78" fill="#334155" font-family="{FONT}" font-size="11" font-weight="500">Pendentes: 4 (8%)</text>
      
      <circle cx="580" cy="74" r="5" fill="#ef4444"/>
      <text x="591" y="78" fill="#334155" font-family="{FONT}" font-size="11" font-weight="500">Canceladas: 2 (2%)</text>
    </g>

    <!-- Managed Attractions Grid Header -->
    <text x="40" y="382" fill="#0f172a" font-family="{FONT}" font-size="16" font-weight="bold">Minhas Atrações Cadastradas</text>

    <!-- Mini-card 1 -->
    <g transform="translate(40, 398)">
      <rect width="425" height="140" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <rect x="12" y="12" width="116" height="116" rx="8" fill="#38bdf8"/>
      <text x="140" y="34" fill="#0f172a" font-family="{FONT}" font-size="14" font-weight="bold">Piscinas Naturais do Seixas</text>
      <text x="140" y="54" fill="#2563eb" font-family="{FONT}" font-size="12" font-weight="600">R$ 90,00 · 8 vagas/dia</text>
      <text x="140" y="74" fill="#64748b" font-family="{FONT}" font-size="11">Total de participantes: 32 · ★ 4.9</text>
      <rect x="140" y="94" width="110" height="28" rx="6" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="195" y="112" fill="#0f172a" font-family="{FONT}" font-size="11" font-weight="600" text-anchor="middle">Participantes</text>
      <rect x="258" y="94" width="70" height="28" rx="6" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="293" y="112" fill="#0f172a" font-family="{FONT}" font-size="11" font-weight="600" text-anchor="middle">Editar</text>
      <rect x="336" y="94" width="30" height="28" rx="6" fill="#fee2e2" stroke="#fca5a5"/>
      <text x="351" y="112" fill="#b91c1c" font-family="{FONT}" font-size="11" font-weight="bold" text-anchor="middle">✕</text>
    </g>

    <!-- Mini-card 2 -->
    <g transform="translate(495, 398)">
      <rect width="425" height="140" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <rect x="12" y="12" width="116" height="116" rx="8" fill="#14b8a6"/>
      <text x="140" y="34" fill="#0f172a" font-family="{FONT}" font-size="14" font-weight="bold">Farol do Cabo Branco</text>
      <text x="140" y="54" fill="#2563eb" font-family="{FONT}" font-size="12" font-weight="600">R$ 40,00 · 20 vagas/dia</text>
      <text x="140" y="74" fill="#64748b" font-family="{FONT}" font-size="11">Total de participantes: 20 · ★ 4.9</text>
      <rect x="140" y="94" width="110" height="28" rx="6" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="195" y="112" fill="#0f172a" font-family="{FONT}" font-size="11" font-weight="600" text-anchor="middle">Participantes</text>
      <rect x="258" y="94" width="70" height="28" rx="6" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="293" y="112" fill="#0f172a" font-family="{FONT}" font-size="11" font-weight="600" text-anchor="middle">Editar</text>
      <rect x="336" y="94" width="30" height="28" rx="6" fill="#fee2e2" stroke="#fca5a5"/>
      <text x="351" y="112" fill="#b91c1c" font-family="{FONT}" font-size="11" font-weight="bold" text-anchor="middle">✕</text>
    </g>
    </svg>"""
    return svg

# ─── 4. Tourist Reservations Table ───────────────────────────────────────────
def make_reservations_svg():
    w, h = 960, 580
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
    {window_frame(w, h, "https://titureco.com/reservations")}
    {navbar(w, active_tab="Minhas Reservas", role="Turista")}
    
    <!-- Header + Filter Pills -->
    <text x="40" y="125" fill="#0f172a" font-family="{FONT}" font-size="22" font-weight="bold">Minhas Reservas</text>
    <text x="40" y="146" fill="#64748b" font-family="{FONT}" font-size="12">Acompanhe confirmações, conclua passeios e avalie atrações</text>
    
    <!-- Status Filter pills -->
    <g transform="translate(560, 118)">
      <rect x="0" y="0" width="60" height="28" rx="14" fill="#2563eb"/>
      <text x="30" y="18" fill="#ffffff" font-family="{FONT}" font-size="11" font-weight="bold" text-anchor="middle">Todas</text>
      <rect x="68" y="0" width="75" height="28" rx="14" fill="#ffffff" stroke="#cbd5e1"/>
      <text x="105" y="18" fill="#64748b" font-family="{FONT}" font-size="11" text-anchor="middle">Pendentes</text>
      <rect x="151" y="0" width="85" height="28" rx="14" fill="#ffffff" stroke="#cbd5e1"/>
      <text x="193" y="18" fill="#64748b" font-family="{FONT}" font-size="11" text-anchor="middle">Confirmadas</text>
      <rect x="244" y="0" width="80" height="28" rx="14" fill="#ffffff" stroke="#cbd5e1"/>
      <text x="284" y="18" fill="#64748b" font-family="{FONT}" font-size="11" text-anchor="middle">Concluídas</text>
    </g>

    <!-- Table Container -->
    <g transform="translate(40, 175)">
      <rect width="880" height="340" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      
      <!-- Table Header -->
      <rect width="880" height="42" rx="10" fill="#f8fafc"/>
      <rect y="30" width="880" height="12" fill="#f8fafc"/>
      <line x1="0" y1="42" x2="880" y2="42" stroke="#e2e8f0" stroke-width="1"/>
      <text x="24" y="26" fill="#475569" font-family="{FONT}" font-size="12" font-weight="bold">ATRAÇÃO</text>
      <text x="320" y="26" fill="#475569" font-family="{FONT}" font-size="12" font-weight="bold">DATA E HORA</text>
      <text x="520" y="26" fill="#475569" font-family="{FONT}" font-size="12" font-weight="bold">STATUS</text>
      <text x="856" y="26" fill="#475569" font-family="{FONT}" font-size="12" font-weight="bold" text-anchor="end">AÇÃO</text>

      <!-- Row 1: CONFIRMED -->
      <text x="24" y="80" fill="#2563eb" font-family="{FONT}" font-size="13" font-weight="bold">Piscinas Naturais do Seixas</text>
      <text x="320" y="80" fill="#334155" font-family="{FONT}" font-size="12">15/11/2026 às 09:00</text>
      <rect x="520" y="64" width="95" height="24" rx="12" fill="#dcfce7" stroke="#86efac"/>
      <text x="567" y="80" fill="#15803d" font-family="{FONT}" font-size="11" font-weight="bold" text-anchor="middle">CONFIRMED</text>
      <rect x="790" y="64" width="66" height="26" rx="6" fill="#fee2e2" stroke="#fca5a5"/>
      <text x="823" y="81" fill="#b91c1c" font-family="{FONT}" font-size="11" font-weight="bold" text-anchor="middle">Cancelar</text>
      <line x1="0" y1="108" x2="880" y2="108" stroke="#f1f5f9" stroke-width="1"/>

      <!-- Row 2: PENDING -->
      <text x="24" y="146" fill="#2563eb" font-family="{FONT}" font-size="13" font-weight="bold">Pôr do Sol no Jacaré</text>
      <text x="320" y="146" fill="#334155" font-family="{FONT}" font-size="12">18/11/2026 às 16:30</text>
      <rect x="520" y="130" width="85" height="24" rx="12" fill="#fef3c7" stroke="#fcd34d"/>
      <text x="562" y="146" fill="#b45309" font-family="{FONT}" font-size="11" font-weight="bold" text-anchor="middle">PENDING</text>
      <rect x="790" y="130" width="66" height="26" rx="6" fill="#fee2e2" stroke="#fca5a5"/>
      <text x="823" y="147" fill="#b91c1c" font-family="{FONT}" font-size="11" font-weight="bold" text-anchor="middle">Cancelar</text>
      <line x1="0" y1="174" x2="880" y2="174" stroke="#f1f5f9" stroke-width="1"/>

      <!-- Row 3: COMPLETED -->
      <text x="24" y="212" fill="#2563eb" font-family="{FONT}" font-size="13" font-weight="bold">Farol do Cabo Branco</text>
      <text x="320" y="212" fill="#334155" font-family="{FONT}" font-size="12">02/11/2026 às 10:00</text>
      <rect x="520" y="196" width="95" height="24" rx="12" fill="#dbeafe" stroke="#93c5fd"/>
      <text x="567" y="212" fill="#1d4ed8" font-family="{FONT}" font-size="11" font-weight="bold" text-anchor="middle">COMPLETED</text>
      <text x="856" y="212" fill="#2563eb" font-family="{FONT}" font-size="12" font-weight="bold" text-anchor="end">★ Avaliar passeio</text>
      <line x1="0" y1="240" x2="880" y2="240" stroke="#f1f5f9" stroke-width="1"/>

      <!-- Row 4: CANCELLED -->
      <text x="24" y="278" fill="#64748b" font-family="{FONT}" font-size="13">Trilha dos Galinhos</text>
      <text x="320" y="278" fill="#94a3b8" font-family="{FONT}" font-size="12">20/10/2026 às 08:00</text>
      <rect x="520" y="262" width="95" height="24" rx="12" fill="#fee2e2" stroke="#fca5a5"/>
      <text x="567" y="278" fill="#b91c1c" font-family="{FONT}" font-size="11" font-weight="bold" text-anchor="middle">CANCELLED</text>
      <text x="856" y="278" fill="#94a3b8" font-family="{FONT}" font-size="12" text-anchor="end">—</text>
    </g>
    </svg>"""
    return svg

ITEMS = [
    ('feed-search', make_feed_svg()),
    ('nearby-map', make_map_svg()),
    ('guide-dashboard', make_dashboard_svg()),
    ('tourist-reservations', make_reservations_svg()),
]

for name, svg_content in ITEMS:
    svg_path = os.path.join(OUT_DIR, f"{name}.svg")
    png_path = os.path.join(OUT_DIR, f"{name}.png")
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    subprocess.run(['convert', '-density', '150', svg_path, png_path], check=True)
    print(f"Generated {png_path} ({os.path.getsize(png_path)//1024} KB)")

print("All screenshots refreshed successfully.")
