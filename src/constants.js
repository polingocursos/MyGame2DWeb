// ============================================================
//  CONSTANTS — Todas as configurações globais do jogo
// ============================================================

// Resolução canvas
export const SCREEN_W = 1280;
export const SCREEN_H = 720;

// Física do mundo
export const GROUND_Y    = 565;     // Y da superfície do chão (onde o player pisa)
export const GRAVITY     = 1800;    // Aceleração da gravidade (px/s²)
export const JUMP_FORCE  = -720;    // Força do pulo (negativo = para cima)

// Configurações do Player
export const PLAYER_W        = 40;
export const PLAYER_H        = 60;
export const PLAYER_SPEED    = 340;   // Velocidade máxima horizontal (px/s)
export const PLAYER_ACCEL    = 2000;  // Aceleração no chão (px/s²)
export const PLAYER_AIR_ACCEL = 1000; // Aceleração no ar (px/s²)
export const PLAYER_DECEL    = 2800;  // Desaceleração ao parar (px/s²)

// Câmera
export const CAM_LERP_X  = 0.07;   // Suavidade horizontal (0=parado, 1=instantâneo)
export const CAM_LERP_Y  = 0.10;   // Suavidade vertical
export const CAM_LEAD    = 90;     // Câmera antecipa o movimento do player

// Sistema de Chunks (mapa infinito)
export const CHUNK_WIDTH       = 1280;  // Largura de cada chunk (1 tela)
export const CHUNK_HEIGHT      = 300;   // Altura visual do chão
export const RENDER_DISTANCE   = 3;     // Chunks carregados em cada direção

// Velocidades de parallax (fração do movimento da câmera)
// 0.0 = fixo na tela | 1.0 = velocidade do mundo
export const PARALLAX = {
  sky:    0.00,   // Céu — completamente fixo
  far:    0.03,   // Montanhas distantes
  mid:    0.12,   // Colinas médias
  near:   0.35,   // Colinas próximas
};

// Configuração dos mapas
export const MAPS = {
  1: {
    name:      'Mountain Realm',
    skybox:    '/assets/maps/map1/skybox.png',
    platform:  '/assets/maps/map1/platform.png',
    bgColor:   0x87ceeb,
    groundY:   565,
    skyTint:   0xffffff,
  },
  // Mapas 2-4: a definir
  2: { name: 'Caverna Sombria',   skybox: '/assets/maps/map2/skybox.png', platform: '/assets/maps/map2/platform.png', bgColor: 0x1a1a3e, groundY: 565, skyTint: 0xaaaacc },
  3: { name: 'Floresta Mágica',   skybox: '/assets/maps/map3/skybox.png', platform: '/assets/maps/map3/platform.png', bgColor: 0x2d5a1b, groundY: 565, skyTint: 0xaaddaa },
  4: { name: 'Céu das Nuvens',    skybox: '/assets/maps/map4/skybox.png', platform: '/assets/maps/map4/platform.png', bgColor: 0xfce4ec, groundY: 565, skyTint: 0xffd0e0 },
};

// Imagem de fundo do lobby (independente dos mapas)
export const LOBBY_BG       = '/assets/lobby/background.png';
export const LOBBY_PLAY_BTN = '/assets/lobby/play-button.png';

// Áudio
export const LOBBY_MUSIC = '/assets/audio/Bouncy Adventure.mp3';

