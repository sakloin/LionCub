"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import CartDrawer from "./cart/CartDrawer";

/**
 * Navbar — fiel al diseño ChatGPT reference.
 * Brand "LION CUB ♥" centrado, hamburger izquierda, bolsa + cuenta derecha.
 * Desktop: nav con dropdown de Categorías. Móvil: menú off-canvas.
 */

const CATEGORIES = [
  { label: "Compra por edad",     href: "#edades" },
  { label: "Conjuntos y ajuares", href: "#favoritos" },
  { label: "Bodies",              href: "#favoritos" },
  { label: "Mantas",              href: "#favoritos" },
  { label: "Pantalones",          href: "#favoritos" },
];

const NAV_LINKS = [
  { label: "Inicio",          href: "#inicio" },
  { label: "Colección",       href: "#favoritos" },
  { label: "Nuestra historia",href: "#historia" },
];

export default function Navbar() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(250,247,246,.96)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e8e4d4",
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 clamp(1rem,4vw,2.5rem)",
          height: "64px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "1rem",
        }}>

          {/* Left: hamburger (mobile) / nav links (desktop) */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Hamburger */}
            <button
              className="lc-nav-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              style={{ background:"none", border:"none", cursor:"pointer", fontSize:"1.3rem", padding:"8px", color:"#171815" }}
            >
              {menuOpen ? "✕" : "☰"}
            </button>

            {/* Desktop nav */}
            <nav aria-label="Navegación principal" className="lc-nav-desktop">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} className="lc-nav-link">{l.label}</Link>
              ))}

              {/* Dropdown Categorías */}
              <div
                ref={dropRef}
                style={{ position: "relative" }}
                onMouseEnter={() => setDropOpen(true)}
                onMouseLeave={() => setDropOpen(false)}
              >
                <button
                  className="lc-nav-link"
                  style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"4px" }}
                  aria-expanded={dropOpen}
                  aria-haspopup="true"
                  onClick={() => setDropOpen(o => !o)}
                >
                  Categorías <span style={{ fontSize:".7em", opacity:.65 }}>{dropOpen ? "▲" : "▼"}</span>
                </button>
                {dropOpen && (
                  <div
                    style={{
                      position:"absolute",
                      top:"100%",
                      left:0,
                      background:"#faf7f6",
                      border:"1.5px solid #d5d5bd",
                      borderRadius:"10px",
                      padding:"8px 0",
                      minWidth:"200px",
                      boxShadow:"0 8px 24px rgba(0,0,0,.1)",
                      zIndex:100,
                    }}
                  >
                    {CATEGORIES.map(c => (
                      <Link
                        key={c.href + c.label}
                        href={c.href}
                        onClick={() => setDropOpen(false)}
                        style={{
                          display:"block",
                          padding:"9px 18px",
                          fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)",
                          fontSize:".875rem",
                          color:"#171815",
                          textDecoration:"none",
                          transition:"background .15s",
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = "#fcf2e3")}
                        onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Center: brand */}
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-nunito, 'Nunito', sans-serif)",
              fontWeight: 900,
              fontSize: "clamp(1.1rem,2.5vw,1.35rem)",
              color: "#171815",
              textDecoration: "none",
              letterSpacing: ".04em",
              textAlign: "center",
              justifySelf: "center",
              whiteSpace: "nowrap",
            }}
            aria-label="Lion Cub — inicio"
          >
            LION CUB <span style={{ color:"#ffa486" }}>♥</span>
          </Link>

          {/* Right: bag + account */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:"8px" }}>
            <button
              onClick={() => setCartOpen(true)}
              style={{
                position:"relative",
                background:"none",
                border:"none",
                cursor:"pointer",
                padding:"8px",
                color:"#171815",
                display:"flex",
                alignItems:"center",
                gap:"4px",
                fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)",
                fontSize:".875rem",
              }}
              aria-label={`Bolsa: ${count} ${count === 1 ? "pieza" : "piezas"}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M16 10C16 12.2 14.2 14 12 14C9.8 14 8 12.2 8 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {count > 0 && (
                <span style={{
                  display:"inline-flex",
                  alignItems:"center",
                  justifyContent:"center",
                  minWidth:"18px",
                  height:"18px",
                  borderRadius:"50%",
                  background:"#ffa486",
                  color:"#fff",
                  fontSize:"11px",
                  fontWeight:700,
                  padding:"0 3px",
                }}>
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            id="menu-movil"
            style={{
              background:"#faf7f6",
              borderTop:"1px solid #e8e4d4",
              padding:"1rem clamp(1rem,4vw,2.5rem)",
              display:"flex",
              flexDirection:"column",
              gap:"4px",
            }}
          >
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)",
                  fontWeight:700,
                  fontSize:".95rem",
                  color:"#171815",
                  textDecoration:"none",
                  padding:"10px 0",
                  borderBottom:"1px solid #e8e4d4",
                }}
              >
                {l.label}
              </Link>
            ))}
            <p style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontWeight:700, fontSize:".85rem", color:"#83827f", margin:".75rem 0 4px", textTransform:"uppercase", letterSpacing:".08em" }}>
              Categorías
            </p>
            {CATEGORIES.map(c => (
              <Link
                key={c.href + c.label}
                href={c.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)",
                  fontSize:".875rem",
                  color:"#171815",
                  textDecoration:"none",
                  padding:"8px 12px",
                }}
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <style>{`
        .lc-nav-hamburger { display:flex; }
        .lc-nav-desktop   { display:none; align-items:center; gap:.25rem; margin-left:.5rem; }
        .lc-nav-link {
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-size:.875rem;
          color:#171815;
          text-decoration:none;
          padding:8px 12px;
          border-radius:6px;
          transition:background .15s;
        }
        .lc-nav-link:hover { background:#fcf2e3; }
        @media(min-width:768px){
          .lc-nav-hamburger { display:none; }
          .lc-nav-desktop   { display:flex; }
        }
      `}</style>
    </>
  );
}
