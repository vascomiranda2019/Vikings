let idiomaAtual = 'pt';
const idiomas = {}; // { pt: {...}, en: {...} }

// Regista as traduções de uma língua (chamado no PreloadScene)
export function registarIdioma(codigo, dados) {
  idiomas[codigo] = dados;
}

// Muda o idioma e guarda a escolha no browser
export function definirIdioma(codigo) {
  if (idiomas[codigo]) {
    idiomaAtual = codigo;
    try { localStorage.setItem('vs_idioma', codigo); } catch (e) { /* ignora */ }
  }
}

export function obterIdioma() {
  return idiomaAtual;
}

// Lê o idioma guardado anteriormente (chamado no BootScene)
export function carregarIdiomaGuardado() {
  try {
    const guardado = localStorage.getItem('vs_idioma');
    if (guardado) idiomaAtual = guardado;
  } catch (e) {  }
}

// t() = traduz a chave; cai para PT e depois para a propria chave
export function t(chave) {
  if (idiomas[idiomaAtual] && idiomas[idiomaAtual][chave]) return idiomas[idiomaAtual][chave];
  if (idiomas.pt && idiomas.pt[chave]) return idiomas.pt[chave];
  return chave;
}