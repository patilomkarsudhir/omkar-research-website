const { useMemo, useState, useRef } = React;

/**
 * Neural Alpha-Beta Chess (Interactive)
 * - Pure React (no external libs). Uses Tailwind classes for styling (available in canvas).
 * - Legal move generator for standard chess including castling, en passant, and promotions. Promotions -> Queen.
 * - Two search modes:
 *    1) Hard alpha-beta (classical)
 *    2) Soft / differentiable relaxation (AlphaBetaNet-style soft max/min + soft pruning gates)
 * - Toggle Human side, depth, and softness (τ, τ_g, τ_choice) and play against the engine.
 *
 * NOTE: Simplicity over completeness – this is a toy engine to demonstrate the method. It follows all
 * core chess legality constraints. The `evaluate` function is a classic hand-coded evaluation. In a
 * true AlphaZero-style engine, this would be replaced by a trained neural network.
 */

// ---------------- Board helpers ----------------
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const PIECE_TO_UNICODE = {
  P: "♙", N: "♘", B: "♗", R: "♖", Q: "♕", K: "♔",
  p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚",
};

const FILES = [0,1,2,3,4,5,6,7];
const RANKS = [0,1,2,3,4,5,6,7];

function inBounds(r, c){ return r>=0 && r<8 && c>=0 && c<8; }
function idx(r,c){ return r*8+c; }
function rc(i){ return [Math.floor(i/8), i%8]; }
function isWhite(p){ return p && p === p.toUpperCase(); }
function isBlack(p){ return p && p === p.toLowerCase(); }
function sideOf(p){ return isWhite(p) ? 'w' : isBlack(p) ? 'b' : null; }

function parseFEN(fen){
  const [placement, stm, castling, ep] = fen.split(" ");
  const rows = placement.split("/");
  const board = new Array(64).fill(".");
  for(let r=0; r<8; r++){
    let c=0;
    for(const ch of rows[r]){
      if(/\d/.test(ch)){ c += parseInt(ch,10); }
      else { board[idx(r,c)] = ch; c++; }
    }
  }
  const epIdx = ep === '-' ? null : idx(ep[1]==='3'? 2:5, ep.charCodeAt(0) - 'a'.charCodeAt(0));
  const state = { board, side: stm || 'w', castling: castling || 'KQkq', ep: epIdx };
  state.hash = computeHash(state);
  return state;
}

function cloneState(s){ return { board: s.board.slice(), side: s.side, castling: s.castling, ep: s.ep, hash: s.hash }; }

function flipSide(side){ return side==='w'? 'b' : 'w'; }

// ---------------- Zobrist Hashing ----------------
const ZOBRIST = {
  pieces: Array(12).fill(null).map(() => Array(64).fill(null)),
  blackToMove: null,
  castling: Array(4).fill(null), // K, Q, k, q
  ep: Array(8).fill(null)
};
const PIECE_TO_Z_IDX = { P:0, N:1, B:2, R:3, Q:4, K:5, p:6, n:7, b:8, r:9, q:10, k:11 };

function initZobrist() {
  // Use a fixed seed for reproducibility.
  let seed = 1804289383;
  const random = () => {
    seed = (seed * 16807 + 12345) % 2147483647;
    return BigInt(seed) << 32n | BigInt((seed * 16807 + 12345) % 2147483647);
  };

  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 64; j++) {
      ZOBRIST.pieces[i][j] = random();
    }
  }
  for (let i = 0; i < 4; i++) ZOBRIST.castling[i] = random();
  for (let i = 0; i < 8; i++) ZOBRIST.ep[i] = random();
  ZOBRIST.blackToMove = random();
}

function computeHash(state) {
  let h = 0n;
  for (let i = 0; i < 64; i++) {
    if (state.board[i] !== '.') {
      h ^= ZOBRIST.pieces[PIECE_TO_Z_IDX[state.board[i]]][i];
    }
  }
  if (state.side === 'b') h ^= ZOBRIST.blackToMove;
  if (state.castling.includes('K')) h ^= ZOBRIST.castling[0];
  if (state.castling.includes('Q')) h ^= ZOBRIST.castling[1];
  if (state.castling.includes('k')) h ^= ZOBRIST.castling[2];
  if (state.castling.includes('q')) h ^= ZOBRIST.castling[3];
  if (state.ep !== null) h ^= ZOBRIST.ep[rc(state.ep)[1]];
  return h;
}

initZobrist(); // Initialize the random keys

// ---------------- Transposition Table ----------------
const transpositionTable = new Map();
const TT_STATS = { hits: 0, lookups: 0 };
const TT_ENTRY_TYPE = { EXACT: 0, LOWER_BOUND: 1, UPPER_BOUND: 2 };

function clearTranspositionTable() {
    transpositionTable.clear();
    TT_STATS.hits = 0;
    TT_STATS.lookups = 0;
}

// ---------------- Evaluation ----------------
const VAL = { P:100, N:320, B:330, R:500, Q:900, K:0 };

// Piece-Square Tables (from https://www.chessprogramming.org/Simplified_Evaluation_Function)
const PST = {
    'P': [
        [ 0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [ 5,  5, 10, 25, 25, 10,  5,  5],
        [ 0,  0,  0, 20, 20,  0,  0,  0],
        [ 5, -5,-10,  0,  0,-10, -5,  5],
        [ 5, 10, 10,-20,-20, 10, 10,  5],
        [ 0,  0,  0,  0,  0,  0,  0,  0]
    ],
    'N': [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    'B': [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    'R': [
        [  0,  0,  0,  0,  0,  0,  0,  0],
        [  5, 10, 10, 10, 10, 10, 10,  5],
        [ -5,  0,  0,  0,  0,  0,  0, -5],
        [ -5,  0,  0,  0,  0,  0,  0, -5],
        [ -5,  0,  0,  0,  0,  0,  0, -5],
        [ -5,  0,  0,  0,  0,  0,  0, -5],
        [ -5,  0,  0,  0,  0,  0,  0, -5],
        [  0,  0,  0,  5,  5,  0,  0,  0]
    ],
    'Q': [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [ -5,  0,  5,  5,  5,  5,  0, -5],
        [  0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    'K_MG': [ // King Middle Game
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [ 20, 20,  0,  0,  0,  0, 20, 20],
        [ 20, 30, 10,  0,  0, 10, 30, 20]
    ],
    'K_EG': [ // King End Game
        [-50,-40,-30,-20,-20,-30,-40,-50],
        [-30,-20,-10,  0,  0,-10,-20,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-30,  0,  0,  0,  0,-30,-30],
        [-50,-30,-30,-30,-30,-30,-30,-50]
    ]
};

function evaluate(board) {
    let mgScore = 0;
    let egScore = 0;
    let gamePhase = 0;
    const phaseWeights = { 'N': 1, 'B': 1, 'R': 2, 'Q': 4 };
    const totalPhase = 4*phaseWeights.N + 4*phaseWeights.B + 4*phaseWeights.R + 2*phaseWeights.Q; // 24

    for (let i = 0; i < 64; i++) {
        const p = board[i];
        if (p === '.') continue;

        const pieceType = p.toUpperCase();
        const [r, c] = rc(i);
        const sign = isWhite(p) ? 1 : -1;

        const val = VAL[pieceType] || 0;
        const r_idx = isWhite(p) ? r : 7 - r;

        let mgPstVal, egPstVal;
        if (pieceType === 'K') {
            mgPstVal = PST['K_MG'][r_idx][c];
            egPstVal = PST['K_EG'][r_idx][c];
        } else {
            mgPstVal = egPstVal = PST[pieceType] ? PST[pieceType][r_idx][c] : 0;
        }

        mgScore += sign * (val + mgPstVal);
        egScore += sign * (val + egPstVal);
        
        if (phaseWeights[pieceType]) {
            gamePhase += phaseWeights[pieceType];
        }
    }

    // Tapered eval: phase=1 -> opening, phase=0 -> endgame
    const phase = Math.max(0, Math.min(gamePhase, totalPhase)) / totalPhase;
    return (phase * mgScore + (1 - phase) * egScore);
}

// ---------------- Attack detection ----------------
const KN_DEL = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const K_DEL = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const B_DIR = [[-1,-1],[-1,1],[1,-1],[1,1]];
const R_DIR = [[-1,0],[1,0],[0,-1],[0,1]];

function isSquareAttacked(board, r, c, bySide){
  // pawns
  if(bySide==='w'){
    const pr = r+1; // white pawns move up (from white perspective bottom -> top), attack down-left/down-right when looking from the square
    for(const dc of [-1,1]){
      const rr = r+1, cc = c+dc;
      if(inBounds(rr,cc)){
        const p = board[idx(rr,cc)]; if(p==='P') return true;
      }
    }
  } else {
    for(const dc of [-1,1]){
      const rr = r-1, cc = c+dc;
      if(inBounds(rr,cc)){
        const p = board[idx(rr,cc)]; if(p==='p') return true;
      }
    }
  }
  // knights
  for(const [dr,dc] of KN_DEL){
    const rr=r+dr, cc=c+dc; if(!inBounds(rr,cc)) continue;
    const p = board[idx(rr,cc)];
    if(bySide==='w' && p==='N') return true;
    if(bySide==='b' && p==='n') return true;
  }
  // bishops/queens
  for(const [dr,dc] of B_DIR){
    let rr=r+dr, cc=c+dc;
    while(inBounds(rr,cc)){
      const p = board[idx(rr,cc)];
      if(p!=='.'){
        if(bySide==='w' && (p==='B'||p==='Q')) return true;
        if(bySide==='b' && (p==='b'||p==='q')) return true;
        break;
      }
      rr+=dr; cc+=dc;
    }
  }
  // rooks/queens
  for(const [dr,dc] of R_DIR){
    let rr=r+dr, cc=c+dc;
    while(inBounds(rr,cc)){
      const p = board[idx(rr,cc)];
      if(p!=='.'){
        if(bySide==='w' && (p==='R'||p==='Q')) return true;
        if(bySide==='b' && (p==='r'||p==='q')) return true;
        break;
      }
      rr+=dr; cc+=dc;
    }
  }
  // king
  for(const [dr,dc] of K_DEL){
    const rr=r+dr, cc=c+dc; if(!inBounds(rr,cc)) continue;
    const p = board[idx(rr,cc)];
    if(bySide==='w' && p==='K') return true;
    if(bySide==='b' && p==='k') return true;
  }
  return false;
}

function findKing(board, side){
  const target = side==='w'? 'K' : 'k';
  for(let i=0;i<64;i++){ if(board[i]===target) return rc(i); }
  return [-1,-1];
}

function inCheck(board, side){
  const [kr,kc] = findKing(board, side);
  if(kr<0) return false; // malformed
  return isSquareAttacked(board, kr, kc, flipSide(side));
}

// ---------------- Move generation ----------------
function pushMove(moves, from, to, piece, captured, promo, type){
  moves.push({ from, to, piece, captured: captured||'.', promo: promo||null, type: type||null });
}

function genPseudoMoves(state){
  const { board, side, castling, ep } = state;
  const moves=[];
  for(let i=0;i<64;i++){
    const p = board[i]; if(p==='.') continue; if(sideOf(p)!==side) continue;
    const [r,c]=rc(i);
    const up = side==='w'? -1 : 1;
    const enemy = side==='w'? isBlack : isWhite;
    switch(p.toUpperCase()){
      case 'P':{
        const r1=r+up; if(inBounds(r1,c) && board[idx(r1,c)]==='.'){
          // promotion?
          const pr = (side==='w'? 0 : 7);
          if(r1===pr) pushMove(moves, i, idx(r1,c), p, '.', 'Q');
          else pushMove(moves, i, idx(r1,c), p);
          // double push
          const startRank = side==='w'? 6 : 1;
          const r2=r+2*up; if(r===startRank && inBounds(r2,c) && board[idx(r2,c)]==='.' ){
            pushMove(moves, i, idx(r2,c), p);
          }
        }
        for(const dc of [-1,1]){
          const cc=c+dc, rr=r+up; if(!inBounds(rr,cc)) continue;
          const q = board[idx(rr,cc)]; if(q!=='.' && enemy(q)){
            const pr = (side==='w'? 0 : 7);
            if(rr===pr) pushMove(moves, i, idx(rr,cc), p, q, 'Q');
            else pushMove(moves, i, idx(rr,cc), p, q);
          }
        }
        // en passant
        if (ep !== null) {
            const canEpRank = side === 'w' ? 3 : 4;
            if (r === canEpRank) {
                if (c > 0 && ep === idx(r + up, c - 1)) {
                    pushMove(moves, i, ep, p, board[idx(r, c - 1)], null, 'ep');
                }
                if (c < 7 && ep === idx(r + up, c + 1)) {
                    pushMove(moves, i, ep, p, board[idx(r, c + 1)], null, 'ep');
                }
            }
        }
        break;
      }
      case 'N':{
        for(const [dr,dc] of KN_DEL){ const rr=r+dr, cc=c+dc; if(!inBounds(rr,cc)) continue; const q=board[idx(rr,cc)]; if(q==='.'||enemy(q)) pushMove(moves,i,idx(rr,cc),p,q); }
        break;
      }
      case 'B':{
        for(const [dr,dc] of B_DIR){ let rr=r+dr, cc=c+dc; while(inBounds(rr,cc)){ const q=board[idx(rr,cc)]; if(q==='.') { pushMove(moves,i,idx(rr,cc),p,'.'); rr+=dr; cc+=dc; } else { if(enemy(q)) pushMove(moves,i,idx(rr,cc),p,q); break; } } }
        break;
      }
      case 'R':{
        for(const [dr,dc] of R_DIR){ let rr=r+dr, cc=c+dc; while(inBounds(rr,cc)){ const q=board[idx(rr,cc)]; if(q==='.') { pushMove(moves,i,idx(rr,cc),p,'.'); rr+=dr; cc+=dc; } else { if(enemy(q)) pushMove(moves,i,idx(rr,cc),p,q); break; } } }
        break;
      }
      case 'Q':{
        for(const [dr,dc] of [...B_DIR,...R_DIR]){ let rr=r+dr, cc=c+dc; while(inBounds(rr,cc)){ const q=board[idx(rr,cc)]; if(q==='.') { pushMove(moves,i,idx(rr,cc),p,'.'); rr+=dr; cc+=dc; } else { if(enemy(q)) pushMove(moves,i,idx(rr,cc),p,q); break; } } }
        break;
      }
      case 'K':{
        for(const [dr,dc] of K_DEL){ const rr=r+dr, cc=c+dc; if(!inBounds(rr,cc)) continue; const q=board[idx(rr,cc)]; if(q==='.'||enemy(q)) pushMove(moves,i,idx(rr,cc),p,q); }
        // Castling
        const backRank = side==='w'? 7 : 0;
        if(r === backRank && c === 4 && !inCheck(board, side)){
            // Kingside
            if(castling.includes(side==='w'?'K':'k') && board[idx(r,5)]==='.' && board[idx(r,6)]==='.'){
                if(!isSquareAttacked(board, r, 5, flipSide(side)) && !isSquareAttacked(board, r, 6, flipSide(side))){
                    pushMove(moves, i, idx(r,6), p, '.', null, 'castle');
                }
            }
            // Queenside
            if(castling.includes(side==='w'?'Q':'q') && board[idx(r,3)]==='.' && board[idx(r,2)]==='.' && board[idx(r,1)]==='.'){
                if(!isSquareAttacked(board, r, 2, flipSide(side)) && !isSquareAttacked(board, r, 3, flipSide(side))){
                    pushMove(moves, i, idx(r,2), p, '.', null, 'castle');
                }
            }
        }
        break;
      }
    }
  }
  return moves;
}

function makeMove(state, move){
  const ns = cloneState(state);
  let h = state.hash;
  const piece = move.piece;
  const pieceZIdx = PIECE_TO_Z_IDX[piece];
  const up = isWhite(piece) ? -1 : 1;

  // Update hash for piece movement
  h ^= ZOBRIST.pieces[pieceZIdx][move.from];
  ns.board[move.from] = '.';

  if (move.captured !== '.') {
    const capturedZIdx = PIECE_TO_Z_IDX[move.captured];
    if (move.type === 'ep') {
        const capSq = move.to - up;
        h ^= ZOBRIST.pieces[capturedZIdx][capSq];
        ns.board[capSq] = '.';
    } else {
        h ^= ZOBRIST.pieces[capturedZIdx][move.to];
    }
  }
  
  ns.board[move.to] = move.promo ? (isWhite(piece)? 'Q' : 'q') : piece;
  h ^= ZOBRIST.pieces[PIECE_TO_Z_IDX[ns.board[move.to]]][move.to];

  // Castling
  if(move.type === 'castle'){
    const [r, c] = rc(move.to);
    if(c === 6){ // kingside
      const rook = ns.board[idx(r,7)];
      h ^= ZOBRIST.pieces[PIECE_TO_Z_IDX[rook]][idx(r,7)];
      h ^= ZOBRIST.pieces[PIECE_TO_Z_IDX[rook]][idx(r,5)];
      ns.board[idx(r,5)] = rook;
      ns.board[idx(r,7)] = '.';
    } else { // queenside
      const rook = ns.board[idx(r,0)];
      h ^= ZOBRIST.pieces[PIECE_TO_Z_IDX[rook]][idx(r,0)];
      h ^= ZOBRIST.pieces[PIECE_TO_Z_IDX[rook]][idx(r,3)];
      ns.board[idx(r,3)] = rook;
      ns.board[idx(r,0)] = '.';
    }
  }

  // Update castling rights
  const oldCastling = state.castling;
  let newCastling = oldCastling;
  if (piece === 'K') { newCastling = newCastling.replace('K','').replace('Q',''); }
  if (piece === 'k') { newCastling = newCastling.replace('k','').replace('q',''); }
  if (move.from === idx(7,0) || move.to === idx(7,0)) { newCastling = newCastling.replace('Q',''); }
  if (move.from === idx(7,7) || move.to === idx(7,7)) { newCastling = newCastling.replace('K',''); }
  if (move.from === idx(0,0) || move.to === idx(0,0)) { newCastling = newCastling.replace('q',''); }
  if (move.from === idx(0,7) || move.to === idx(0,7)) { newCastling = newCastling.replace('k',''); }
  
  if (newCastling !== oldCastling) {
      const castlingMap = {K:0, Q:1, k:2, q:3};
      for(const flag of "KQkq") {
          if (oldCastling.includes(flag) !== newCastling.includes(flag)) {
              h ^= ZOBRIST.castling[castlingMap[flag]];
          }
      }
      ns.castling = newCastling;
  }

  // Update en passant square
  if (state.ep !== null) h ^= ZOBRIST.ep[rc(state.ep)[1]];
  ns.ep = null;
  if(piece.toUpperCase() === 'P' && Math.abs(move.from - move.to) === 16){
    ns.ep = (move.from + move.to) / 2;
    h ^= ZOBRIST.ep[rc(ns.ep)[1]];
  }
  
  // Update side to move
  h ^= ZOBRIST.blackToMove;
  ns.side = flipSide(state.side);
  ns.hash = h;
  return ns;
}

function legalMoves(state){
  const ps = genPseudoMoves(state);
  const moves=[];
  for(const m of ps){
    const ns = makeMove(state, m);
    if(!inCheck(ns.board, state.side)) moves.push(m);
  }
  return moves;
}

// simple MVV-LVA ordering
const BASE_VAL = { p:100, n:320, b:330, r:500, q:900, k:20000 };
function moveOrderKey(m){
  const cap = m.captured && m.captured!=='.' ? BASE_VAL[m.captured.toLowerCase()] : 0;
  const att = BASE_VAL[m.piece.toLowerCase()];
  const isCap = cap>0 ? 1 : 0;
  return isCap*10000 + cap - att; // captures first (bigger is better)
}

// ---------------- Quiescence Search ----------------
const Q_SEARCH_DEPTH = 5; // Max depth for quiescence search

function genPseudoCaptures(state){
  const { board, side, ep } = state;
  const moves=[];
  for(let i=0;i<64;i++){
    const p = board[i]; if(p==='.') continue; if(sideOf(p)!==side) continue;
    const [r,c]=rc(i);
    const up = side==='w'? -1 : 1;
    const enemy = side==='w'? isBlack : isWhite;
    switch(p.toUpperCase()){
      case 'P':{
        for(const dc of [-1,1]){
          const cc=c+dc, rr=r+up; if(!inBounds(rr,cc)) continue;
          const q = board[idx(rr,cc)]; if(q!=='.' && enemy(q)){
            const pr = (side==='w'? 0 : 7);
            if(rr===pr) pushMove(moves, i, idx(rr,cc), p, q, 'Q');
            else pushMove(moves, i, idx(rr,cc), p, q);
          }
        }
        if (ep !== null) {
            const canEpRank = side === 'w' ? 3 : 4;
            if (r === canEpRank) {
                if (c > 0 && ep === idx(r + up, c - 1)) {
                    pushMove(moves, i, ep, p, board[idx(r, c - 1)], null, 'ep');
                }
                if (c < 7 && ep === idx(r + up, c + 1)) {
                    pushMove(moves, i, ep, p, board[idx(r, c + 1)], null, 'ep');
                }
            }
        }
        break;
      }
      case 'N':{
        for(const [dr,dc] of KN_DEL){ const rr=r+dr, cc=c+dc; if(!inBounds(rr,cc)) continue; const q=board[idx(rr,cc)]; if(enemy(q)) pushMove(moves,i,idx(rr,cc),p,q); }
        break;
      }
      case 'B':{
        for(const [dr,dc] of B_DIR){ let rr=r+dr, cc=c+dc; while(inBounds(rr,cc)){ const q=board[idx(rr,cc)]; if(q!=='.') { if(enemy(q)) pushMove(moves,i,idx(rr,cc),p,q); break; } rr+=dr; cc+=dc; } }
        break;
      }
      case 'R':{
        for(const [dr,dc] of R_DIR){ let rr=r+dr, cc=c+dc; while(inBounds(rr,cc)){ const q=board[idx(rr,cc)]; if(q!=='.') { if(enemy(q)) pushMove(moves,i,idx(rr,cc),p,q); break; } rr+=dr; cc+=dc; } }
        break;
      }
      case 'Q':{
        for(const [dr,dc] of [...B_DIR,...R_DIR]){ let rr=r+dr, cc=c+dc; while(inBounds(rr,cc)){ const q=board[idx(rr,cc)]; if(q!=='.') { if(enemy(q)) pushMove(moves,i,idx(rr,cc),p,q); break; } rr+=dr; cc+=dc; } }
        break;
      }
      case 'K':{
        for(const [dr,dc] of K_DEL){ const rr=r+dr, cc=c+dc; if(!inBounds(rr,cc)) continue; const q=board[idx(rr,cc)]; if(enemy(q)) pushMove(moves,i,idx(rr,cc),p,q); }
        break;
      }
    }
  }
  return moves;
}

function legalCaptures(state){
  const ps = genPseudoCaptures(state);
  const moves=[];
  for(const m of ps){
    const ns = makeMove(state, m);
    if(!inCheck(ns.board, state.side)) moves.push(m);
  }
  return moves;
}

function quiescenceSearch(state, alpha, beta, depth = Q_SEARCH_DEPTH) {
    if (depth === 0) {
        return evaluate(state.board);
    }

    const stand_pat = evaluate(state.board);

    if (state.side === 'w') {
        alpha = Math.max(alpha, stand_pat);
        if (alpha >= beta) return beta;
    } else {
        beta = Math.min(beta, stand_pat);
        if (alpha >= beta) return alpha;
    }

    const captures = legalCaptures(state).sort((a, b) => moveOrderKey(b) - moveOrderKey(a));
    if (captures.length === 0 && !inCheck(state.board, state.side)) {
        return stand_pat;
    }

    for (const m of captures) {
        const ns = makeMove(state, m);
        const score = quiescenceSearch(ns, alpha, beta, depth - 1);

        if (state.side === 'w') {
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break; // Prune
        } else {
            beta = Math.min(beta, score);
            if (beta <= alpha) break; // Prune
        }
    }

    return state.side === 'w' ? alpha : beta;
}

// ---------------- Hard alpha-beta ----------------
function searchHard(state, depth, alpha, beta, initialDepth){
  initialDepth = initialDepth === undefined ? depth : initialDepth;
  TT_STATS.lookups++;
  const originalAlpha = alpha;

  // TT Lookup
  const ttEntry = transpositionTable.get(state.hash);
  if (ttEntry && ttEntry.depth >= depth) {
    TT_STATS.hits++;
    if (ttEntry.type === TT_ENTRY_TYPE.EXACT) {
      return { score: ttEntry.score, nodes: 1, pv: ttEntry.pv };
    }
    if (ttEntry.type === TT_ENTRY_TYPE.LOWER_BOUND) {
      alpha = Math.max(alpha, ttEntry.score);
    } else if (ttEntry.type === TT_ENTRY_TYPE.UPPER_BOUND) {
      beta = Math.min(beta, ttEntry.score);
    }
    if (alpha >= beta) {
      return { score: ttEntry.score, nodes: 1, pv: ttEntry.pv };
    }
  }

  if(depth===0){
    const score = quiescenceSearch(state, alpha, beta);
    return { score: score, nodes: 1, pv: [] };
  }
  const moves = legalMoves(state).sort((a,b)=> moveOrderKey(b)-moveOrderKey(a));
  if(moves.length===0){
    if(inCheck(state.board, state.side)){
      const mateScore = (state.side==='w'? -1 : 1) * -100000 + (initialDepth - depth); // mate is bad for side to move
      return { score: mateScore, nodes: 1, pv: [] };
    } else { return { score: 0, nodes: 1, pv: [] }; } // stalemate
  }

  let bestMove=null; let bestScore = state.side==='w'? -1e9 : 1e9; let nodes=1; // count this node
  let bestPV = [];

  if(state.side==='w'){
    for(const m of moves){
      const ns = makeMove(state, m);
      const s = searchHard(ns, depth-1, alpha, beta, initialDepth);
      nodes += s.nodes;
      if(s.score>bestScore){
        bestScore=s.score;
        bestMove=m;
        bestPV = [m, ...s.pv];
      }
      alpha = Math.max(alpha, bestScore);
      if(beta<=alpha) break; // prune
    }
  } else {
    for(const m of moves){
      const ns = makeMove(state, m);
      const s = searchHard(ns, depth-1, alpha, beta, initialDepth);
      nodes += s.nodes;
      if(s.score<bestScore){
        bestScore=s.score;
        bestMove=m;
        bestPV = [m, ...s.pv];
      }
      beta = Math.min(beta, bestScore);
      if(beta<=alpha) break;
    }
  }

  // TT Store
  let ttType;
  if (bestScore <= originalAlpha) {
    ttType = TT_ENTRY_TYPE.UPPER_BOUND;
  } else if (bestScore >= beta) {
    ttType = TT_ENTRY_TYPE.LOWER_BOUND;
  } else {
    ttType = TT_ENTRY_TYPE.EXACT;
  }
  transpositionTable.set(state.hash, { depth, score: bestScore, type: ttType, pv: bestPV });

  return { score: bestScore, nodes, pv: bestPV };
}

// ---------------- Soft / differentiable alpha-beta ----------------
const BIG_POS = 1e9, BIG_NEG = -1e9;
function softmax2(a,b,tau){ if(tau<=0) return Math.max(a,b); const m=Math.max(a,b); const ea=Math.exp((a-m)/tau), eb=Math.exp((b-m)/tau); return (ea*a+eb*b)/(ea+eb); }
function softmin2(a,b,tau){ return -softmax2(-a,-b,tau); }
function sigm(x){ if(x>=0){ const z=Math.exp(-x); return 1/(1+z);} const z=Math.exp(x); return z/(1+z); }

function searchSoft(state, depth, alpha, beta, params, atRoot=false, initialDepth){
  initialDepth = initialDepth === undefined ? depth : initialDepth;
  TT_STATS.lookups++;
  const originalAlpha = alpha;

  // TT Lookup (simplified for soft search - only using exact matches)
  const ttEntry = transpositionTable.get(state.hash);
  if (ttEntry && ttEntry.depth >= depth && ttEntry.type === TT_ENTRY_TYPE.EXACT) {
      TT_STATS.hits++;
      // Soft search doesn't have a PV, and we can't easily reconstruct the choice distribution
      // So we return the score but can't provide a choice. This is a limitation.
      return { score: ttEntry.score, nodes: 1, choice: null };
  }

  const { tau=0.1, tauGate=0.1, tauChoice=0.05 } = params || {};
  if(depth===0){ return { score: evaluate(state.board), nodes: 1, choice: null }; }

  const moves = legalMoves(state).sort((a,b)=> moveOrderKey(b)-moveOrderKey(a));
  if(moves.length===0){
    if(inCheck(state.board, state.side)){
      const mateScore = (state.side==='w'? -1 : 1) * -100000 + (initialDepth - depth);
      return { score: mateScore, nodes: 1, choice: null };
    } else { return { score: 0, nodes: 1, choice: null }; }
  }

  let nodes=1; // this node
  let best = state.side==='w'? BIG_NEG : BIG_POS;
  let contAcc = 1.0;
  const contrib = new Array(moves.length).fill(0);

  for(let i=0;i<moves.length;i++){
    const m = moves[i];
    const ns = makeMove(state, m);
    const sub = searchSoft(ns, depth-1, alpha, beta, params, false, initialDepth);
    nodes += sub.nodes;

    let bestTilde;
    if(state.side==='w'){
      bestTilde = softmax2(best, sub.score, tau);
      const gate = sigm((beta - bestTilde)/Math.max(1e-6, tauGate));
      best = gate*bestTilde + (1-gate)*best;
      alpha = Math.max(alpha, best);
      contAcc *= gate;
      contrib[i] = contAcc * sub.score;
    } else {
      bestTilde = softmin2(best, sub.score, tau);
      const gate = sigm((bestTilde - alpha)/Math.max(1e-6, tauGate));
      best = gate*bestTilde + (1-gate)*best;
      beta = Math.min(beta, best);
      contAcc *= gate;
      contrib[i] = contAcc * sub.score;
    }
  }

  // TT Store (only exact scores for soft search)
  // We don't store bounds because the soft logic doesn't create hard cutoffs.
  transpositionTable.set(state.hash, { depth, score: best, type: TT_ENTRY_TYPE.EXACT, pv: [] });

  let choice=null;
  if(atRoot){
    const logits = contrib.map(x=> x/Math.max(1e-6, tauChoice));
    const maxL = Math.max(...logits);
    const exps = logits.map(z=> Math.exp(z-maxL));
    const Z = exps.reduce((s,e)=>s+e,0) || 1;
    choice = exps.map(e=> e/Z);
  }

  return { score: best, nodes, choice };
}

// ---------------- UI ----------------
function NeuralAlphaBetaChess(){
  const [state, setState] = useState(()=> parseFEN(START_FEN));
  const [sel, setSel] = useState(null); // selected square index
  const [humanSide, setHumanSide] = useState('w');
  const [depth, setDepth] = useState(3);
  const [mode, setMode] = useState('hard'); // 'hard' | 'soft'
  const [tau, setTau] = useState(0.1);
  const [tauGate, setTauGate] = useState(0.1);
  const [tauChoice, setTauChoice] = useState(0.05);
  const [thinking, setThinking] = useState(false);
  const [info, setInfo] = useState({ nodes:0, score:0, choice:[], ttHits: 0, ttLookups: 0, depth: 0 });

  // recompute legal moves for highlight
  const legals = useMemo(()=> new Set(legalMoves(state).map(m=> m.from*100+m.to)), [state]);

  function onSquareClick(i){
    if(state.side !== humanSide) return; // not human's turn
    const p = state.board[i];
    if(sel==null){
      if(p!=='.' && sideOf(p)===humanSide) setSel(i);
      return;
    } else {
      // try move from sel to i if legal
      const key = sel*100+i;
      if(legals.has(key)){
        // find move object (handle promotions preference: always to Queen)
        const m = legalMoves(state).find(mm => mm.from===sel && mm.to===i);
        if(m){
          const ns = makeMove(state, m);
          setState(ns); setSel(null);
          setTimeout(()=> engineMove(ns), 0);
        }
      } else {
        // switch selection
        if(p!=='.' && sideOf(p)===humanSide) setSel(i); else setSel(null);
      }
    }
  }

  function engineMove(cur){
    if(cur.side===humanSide) return; // engine only moves on its turn
    setThinking(true);
    TT_STATS.hits = 0; TT_STATS.lookups = 0; // Reset stats for this move
    const t0 = performance.now();
    
    let result, chosenMove;
    let lastResult = {};

    // Iterative Deepening Loop
    for (let d = 1; d <= depth; d++) {
        if(mode==='hard'){
          result = searchHard(cur, d, -1e9, 1e9, d);
          chosenMove = result.pv ? result.pv[0] : null;
        } else {
          result = searchSoft(cur, d, -1e9, 1e9, { tau, tauGate, tauChoice }, true, d);
          // Soft mode doesn't have a single best move, so we just use the final iteration's result
        }
        lastResult = { ...result, depth: d };

        // In a real engine, we'd check a timer here and stop if needed.
        // For this UI, we'll just let it run to completion.
    }
    result = lastResult; // Use the result from the final, deepest search

    if(mode==='soft') {
        // For soft mode, we need to determine the move after the final iteration
        const moves = legalMoves(cur).sort((a,b)=> moveOrderKey(b)-moveOrderKey(a));
        let chosenIndex = 0;
        if(result.choice && result.choice.length===moves.length){
            const rand = Math.random();
            let cumulativeProb = 0;
            for(let i=0; i<result.choice.length; i++){
                cumulativeProb += result.choice[i];
                if(rand < cumulativeProb){
                    chosenIndex = i;
                    break;
                }
            }
            chosenMove = moves[chosenIndex];
        } else {
            // Fallback if soft search fails to produce a choice
            let best = cur.side==='w'? -1e9 : 1e9;
            for(let i=0;i<moves.length;i++){
                const ns = makeMove(cur, moves[i]);
                const s = evaluate(ns.board);
                if((cur.side==='w' && s>best) || (cur.side==='b' && s<best)){ best=s; chosenIndex=i; }
            }
            chosenMove = moves[chosenIndex];
        }
    }

    const t1 = performance.now();

    if(!chosenMove){
        const moves = legalMoves(cur);
        if (moves.length > 0) chosenMove = moves[0]; // Fallback to any legal move
    }

    if(chosenMove){
        const ns = makeMove(cur, chosenMove);
        setState(ns);
    }
    setThinking(false);
    setInfo({
        nodes: result.nodes,
        score: result.score,
        choice: result.choice||[],
        ms: (t1-t0).toFixed(1),
        ttHits: TT_STATS.hits,
        ttLookups: TT_STATS.lookups,
        depth: result.depth
    });
  }

  function reset(){
    clearTranspositionTable();
    setState(parseFEN(START_FEN));
    setSel(null);
    setInfo({ nodes:0, score:0, choice:[], ttHits: 0, ttLookups: 0, depth: 0 });
  }

  // auto-move if engine starts as White
  const firstRun = useRef(false);
  if(!firstRun.current){
    firstRun.current = true;
    setTimeout(()=> { if(state.side!==humanSide) engineMove(state); }, 10);
  }

  return (
    <div className="w-full min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Neural Alpha‑Beta Chess</h1>
        <p className="text-sm text-gray-600 mb-4">Play against a toy chess engine that can run either classical alpha‑beta or a differentiable soft variant. No external libraries.</p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-2xl border shadow">
            <div className="font-medium mb-2">Game</div>
            <div className="flex items-center gap-2 mb-2">
              <button className="px-3 py-1 rounded bg-gray-100 border" onClick={reset}>New game</button>
              <button className="px-3 py-1 rounded bg-gray-100 border" onClick={()=> setHumanSide(h=>{ const ns = h==='w'?'b':'w'; setTimeout(()=>{ if(state.side!==ns) engineMove(state); }, 0); return ns; })}>Human plays: <b className="ml-1">{humanSide==='w'? 'White' : 'Black'}</b></button>
            </div>
            <div className="flex items-center gap-2 mb-2">
                <button className="px-3 py-1 rounded bg-gray-100 border text-sm" onClick={clearTranspositionTable}>Clear TT</button>
            </div>
            <div className="text-sm mb-2">Depth: {depth}</div>
            <input type="range" min={1} max={6} value={depth} onChange={e=> setDepth(parseInt(e.target.value))} className="w-full" />
            <div className="mt-3 text-sm">Mode</div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-sm"><input type="radio" checked={mode==='hard'} onChange={()=> setMode('hard')} /> Hard α‑β</label>
              <label className="flex items-center gap-1 text-sm"><input type="radio" checked={mode==='soft'} onChange={()=> setMode('soft')} /> Soft (α‑β‑Net)</label>
            </div>
            {mode==='soft' && (
              <div className="mt-3 text-sm">
                <div className="text-xs text-gray-600">τ (soft max/min): {tau.toFixed(3)}</div>
                <input type="range" min={0} max={0.5} step={0.005} value={tau} onChange={e=> setTau(parseFloat(e.target.value))} className="w-full" />
                <div className="text-xs text-gray-600 mt-1">τ_g (gate): {tauGate.toFixed(3)}</div>
                <input type="range" min={0} max={0.5} step={0.005} value={tauGate} onChange={e=> setTauGate(parseFloat(e.target.value))} className="w-full" />
                <div className="text-xs text-gray-600 mt-1">Choice Temperature (τ_choice): {tauChoice.toFixed(3)}</div>
                <input type="range" min={0.01} max={0.5} step={0.005} value={tauChoice} onChange={e=> setTauChoice(parseFloat(e.target.value))} className="w-full" />
              </div>
            )}
            <div className="mt-3 text-sm">
              <button className="px-3 py-1 rounded bg-indigo-100 border" disabled={thinking || state.side===humanSide} onClick={()=> engineMove(state)}>{thinking? 'Thinking…' : 'Engine move'}</button>
            </div>
          </div>

          <div className="p-3 rounded-2xl border shadow">
            <div className="font-medium mb-2">Search info</div>
            <div className="text-sm flex justify-between"><span>Search Depth</span><span className="font-mono">{info.depth || 0}/{depth}</span></div>
            <div className="text-sm flex justify-between"><span>Last nodes</span><span className="font-mono">{info.nodes}</span></div>
            <div className="text-sm flex justify-between"><span>Last score</span><span className="font-mono">{info.score?.toFixed? info.score.toFixed(1) : info.score}</span></div>
            <div className="text-sm flex justify-between"><span>TT Hit Rate</span><span className="font-mono">{info.ttLookups > 0 ? `${((info.ttHits / info.ttLookups) * 100).toFixed(1)}%` : 'N/A'}</span></div>
            {mode==='soft' && info.choice?.length>0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 mb-1">Root choice distribution</div>
                <div className="space-y-1">
                  {info.choice.map((p,i)=> (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-10 text-xs">m{i+1}</div>
                      <div className="flex-1 h-2 bg-gray-100 rounded"><div className="h-2 bg-indigo-400 rounded" style={{ width: `${(p*100).toFixed(1)}%` }} /></div>
                      <div className="w-12 text-right font-mono text-xs">{p.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">Positive scores favor White. Mate detection is crude but functional (no TT/quiescence to keep code compact).</div>
          </div>

          <div className="p-3 rounded-2xl border shadow">
            <div className="font-medium mb-2">Tips</div>
            <ul className="text-sm list-disc pl-4 space-y-1">
              <li>Soft mode anneals toward hard α‑β as τ and τ_g → 0.</li>
              <li>In Soft mode, a higher <b>Choice Temperature (τ_choice)</b> leads to more random moves. A value near 0 is more deterministic.</li>
              <li>Promotions are automatic to Queens.</li>
              <li>Castling and en passant are now implemented. Checks and checkmates are enforced.</li>
              <li>Increase depth for stronger play (5–6 plies recommended for a challenge).</li>
              <li>The transposition table (TT) is now active, improving search speed by caching results.</li>
              <li>A quiescence search is used to make the engine's tactical evaluation more accurate.</li>
              <li>The engine uses iterative deepening to improve move ordering and search efficiency.</li>
            </ul>
          </div>
        </div>

        {/* Board */}
        <div className="rounded-2xl border shadow p-3">
          <div className="font-medium mb-2">Board</div>
          <div className="w-fit border border-gray-300">
            {RANKS.map(r=> (
              <div key={r} className="flex">
                {FILES.map(c=> {
                  const i = idx(r,c); const p = state.board[i];
                  const dark = (r+c)%2===1; const isSel = sel===i;
                  const key = sel!=null? sel*100+i : -1;
                  const isLegal = legals.has(key);
                  return (
                    <div key={c} onClick={()=> onSquareClick(i)} className={`w-12 h-12 flex items-center justify-center select-none cursor-pointer ${dark? 'bg-emerald-200' : 'bg-emerald-50'} ${isSel? 'ring-2 ring-indigo-500' : ''}`}>
                      <div className={`text-2xl ${isLegal? 'opacity-100' : ''}`}>{PIECE_TO_UNICODE[p]||''}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

// Render the component
const container = document.getElementById('neural-chess-app');
const root = ReactDOM.createRoot(container);
root.render(<NeuralAlphaBetaChess />);
