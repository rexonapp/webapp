'use client';

import { Users, MapPin, Phone, Mail, MessageCircle, BadgeCheck, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface Agent {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  city: string;
  state: string;
  agency_name: string;
  profile_photo_s3_url: string | null;
  bio: string | null;
  languages_spoken: string[] | string | null;
  is_verified: boolean;
  status: string;
  whatsapp_number: string | null;
}

function AgentCard({ agent }: { agent: Agent }) {
  const initials = agent.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const languages: string[] = Array.isArray(agent.languages_spoken)
    ? agent.languages_spoken
    : typeof agent.languages_spoken === 'string' && agent.languages_spoken
    ? agent.languages_spoken.split(',').map(l => l.trim()).filter(Boolean)
    : [];
  const location = [agent.city, agent.state].filter(Boolean).join(', ');

  return (
    <div className="ag-card">
      {/* ── Big Photo Area ── */}
      <div className="ag-photo-wrap">
        {agent.profile_photo_s3_url ? (
          <img
            src={agent.profile_photo_s3_url}
            alt={agent.full_name}
            className="ag-photo"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="ag-photo-fallback">
            <span>{initials}</span>
          </div>
        )}

        {/* Overlay badges */}
        <div className="ag-photo-badges">
          {agent.is_verified && (
            <span className="ag-badge ag-badge-verified">
              <BadgeCheck size={10} /> Verified
            </span>
          )}
          <span className="ag-badge ag-badge-top">
            <Star size={10} className="ag-star-icon" /> Top Agent
          </span>
        </div>
      </div>

      {/* ── Details ── */}
      <div className="ag-details">
        <div className="ag-details-top">
          <h3 className="ag-name">{agent.full_name}</h3>
          {agent.agency_name && <p className="ag-agency">{agent.agency_name}</p>}
          {location && (
            <div className="ag-location">
              <MapPin size={11} />
              <span>{location}</span>
            </div>
          )}
        </div>

        {agent.bio && <p className="ag-bio">{agent.bio}</p>}

        {languages.length > 0 && (
          <div className="ag-langs">
            {languages.slice(0, 3).map((l, i) => (
              <span key={i} className="ag-lang">{l}</span>
            ))}
          </div>
        )}

        {/* CTA row */}
        <div className="ag-cta-row">
          <a href={`tel:${agent.mobile_number}`} className="ag-btn ag-btn-outline">
            <Phone size={13} /> Call
          </a>
          {agent.whatsapp_number ? (
            <a
              href={`https://wa.me/${agent.whatsapp_number.replace(/\D/g, '')}`}
              target="_blank" rel="noopener noreferrer"
              className="ag-btn ag-btn-green"
            >
              <MessageCircle size={13} /> WhatsApp
            </a>
          ) : (
            <a href={`mailto:${agent.email}`} className="ag-btn ag-btn-blue">
              <Mail size={13} /> Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="ag-card ag-skel-card">
      <div className="ag-photo-wrap ag-skel-photo" />
      <div className="ag-details">
        <div className="ag-sk ag-sk-w60 ag-sk-h15 ag-sk-mb6" />
        <div className="ag-sk ag-sk-w45 ag-sk-h11 ag-sk-mb5" />
        <div className="ag-sk ag-sk-w35 ag-sk-h10 ag-sk-mb12" />
        <div className="ag-sk ag-sk-w100 ag-sk-h10 ag-sk-mb4" />
        <div className="ag-sk ag-sk-w80 ag-sk-h10 ag-sk-mb14" />
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="ag-sk ag-sk-h32" style={{ width: '80px', borderRadius: '10px' }} />
          <div className="ag-sk ag-sk-h32" style={{ flex: 1, borderRadius: '10px' }} />
        </div>
      </div>
    </div>
  );
}

export default function AgentsSection() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  const stripRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const interactionResumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/api/agents?limit=12&status=approved')
      .then(r => r.json())
      .then(d => setAgents(Array.isArray(d) ? d : (d.agents ?? [])))
      .catch(() => setError('Could not load agents.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!agents.length) return;
    const el = stripRef.current;
    if (!el) return;
    const SPEED = 0.5;
    const tick = () => {
      if (!paused && el) {
        posRef.current += SPEED;
        if (posRef.current >= el.scrollWidth / 2) posRef.current = 0;
        el.scrollLeft = posRef.current;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [agents, paused]);

  useEffect(() => {
    return () => {
      if (interactionResumeTimeoutRef.current) {
        clearTimeout(interactionResumeTimeoutRef.current);
      }
    };
  }, []);

  const pauseAndResumeAutoplay = () => {
    setPaused(true);
    if (interactionResumeTimeoutRef.current) {
      clearTimeout(interactionResumeTimeoutRef.current);
    }
    interactionResumeTimeoutRef.current = setTimeout(() => {
      setPaused(false);
    }, 900);
  };

  return (
    <>
      <style>{`
        .ag-root {
          padding: 96px 0 88px;
          background: #ffffff;
          position: relative;
          overflow: hidden;
        }

        /* soft ambient blobs — keep white bg */
        .ag-blob { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(100px); }
        .ag-blob-1 { width: 560px; height: 560px; background: color-mix(in srgb, #d07648 20%, #ffffff); top: -160px; left: -140px; opacity: 0.65; }
        .ag-blob-2 { width: 480px; height: 480px; background: color-mix(in srgb, #13a8b4 18%, #ffffff); bottom: -140px; right: -100px; opacity: 0.55; }

        .ag-inner { max-width: 1280px; margin: 0 auto; padding: 0 28px; position: relative; z-index: 2; }

        /* ── Header ── */
        .ag-header { text-align: center; margin-bottom: 56px; }

        .ag-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          background: color-mix(in srgb, #d07648 14%, #fff); border: 1.5px solid color-mix(in srgb, #d07648 35%, #fff);
          border-radius: 40px; padding: 6px 16px; margin-bottom: 20px;
        }
        .ag-eyebrow-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: linear-gradient(135deg, #d07648, #bf6a41);
          animation: ag-pulse 2.2s ease-in-out infinite;
        }
        @keyframes ag-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.6} }
        .ag-eyebrow-text { font-size: 11.5px; font-weight: 700; color: #a85832; letter-spacing: 0.08em; text-transform: uppercase; }

        .ag-title { font-size: clamp(28px, 4.5vw, 46px); font-weight: 700; color: #0F172A; line-height: 1.18; letter-spacing: -0.02em; margin-bottom: 14px; }
        .ag-title-highlight { color: #d07648; position: relative; display: inline-block; }
        .ag-subtitle { font-size: 15px; color: #64748B; line-height: 1.75; max-width: 500px; margin: 0 auto; }

        /* stats */
        .ag-stats {
          display: inline-flex; align-items: stretch;
          margin-top: 32px;
          background: #FAFAFA; border: 1px solid #EFEFEF;
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .ag-stat { padding: 14px 28px; text-align: center; }
        .ag-stat + .ag-stat { border-left: 1px solid #EBEBEB; }
        .ag-stat-num { font-size: 22px; font-weight: 800; color: #1A1A2E; line-height: 1; }
        .ag-stat-lbl { font-size: 10px; font-weight: 600; color: #9CA3AF; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 3px; }

        /* ── Carousel ── */
        .ag-carousel { position: relative; }
        .ag-fade-l {
          position: absolute; left: 0; top: 0; bottom: 0; width: 120px;
          background: linear-gradient(to right, #fff 35%, transparent);
          z-index: 10; pointer-events: none;
        }
        .ag-fade-r {
          position: absolute; right: 0; top: 0; bottom: 0; width: 120px;
          background: linear-gradient(to left, #fff 35%, transparent);
          z-index: 10; pointer-events: none;
        }
        .ag-strip {
          display: flex; gap: 22px;
          overflow-x: auto; padding: 18px 2px 24px;
          overscroll-behavior-x: contain;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        /* ── Card ── */
        .ag-card {
          flex-shrink: 0; width: 270px;
          background: #fff;
          border-radius: 22px;
          border: 1.5px solid #F0F2F5;
          box-shadow: 0 4px 20px rgba(0,0,0,0.055), 0 1px 4px rgba(0,0,0,0.03);
          display: flex; flex-direction: column;
          overflow: hidden;
          transition: transform 0.38s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.25s ease;
          user-select: none; cursor: default;
        }
        .ag-card:hover {
          transform: translateY(-9px) scale(1.015);
          box-shadow: 0 28px 60px rgba(0,0,0,0.12);
          border-color: color-mix(in srgb, #d07648 35%, #fff);
        }

        /* photo area — big */
        .ag-photo-wrap {
          width: 100%; height: 200px;
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, color-mix(in srgb, #d07648 12%, #fff), color-mix(in srgb, #13a8b4 10%, #fff));
          flex-shrink: 0;
        }
        .ag-photo {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
          transition: transform 0.5s ease;
        }
        .ag-card:hover .ag-photo { transform: scale(1.05); }

        .ag-photo-fallback {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #d07648 0%, #bf6a41 60%, #a85832 100%);
        }
        .ag-photo-fallback span {
          font-size: 52px; font-weight: 800; color: rgba(255,255,255,0.9);
          letter-spacing: -2px;
        }

        /* badges overlaid on photo */
        .ag-photo-badges {
          position: absolute; top: 10px; left: 10px;
          display: flex; flex-direction: column; gap: 5px;
        }
        .ag-badge {
          display: inline-flex; align-items: center; gap: 4px;
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          border-radius: 20px; padding: 4px 9px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.02em;
        }
        .ag-badge-verified {
          background: rgba(240,253,244,0.92); color: #16A34A;
          border: 1px solid rgba(187,247,208,0.8);
        }
        .ag-badge-top {
          background: color-mix(in srgb, #d07648 20%, white); color: #a85832;
          border: 1px solid color-mix(in srgb, #d07648 38%, white);
        }
        .ag-star-icon { color: #d07648; fill: #d07648; }

        /* details section */
        .ag-details { padding: 16px 18px 18px; display: flex; flex-direction: column; flex: 1; gap: 0; }

        .ag-details-top { margin-bottom: 10px; }
        .ag-name { font-size: 15.5px; font-weight: 700; color: #0F172A; line-height: 1.3; margin-bottom: 2px; }
        .ag-agency { font-size: 11.5px; font-weight: 600; color: #d07648; margin-bottom: 5px; }
        .ag-location {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: #9CA3AF;
        }
        .ag-location svg { color: #13a8b4; flex-shrink: 0; }

        .ag-bio {
          font-size: 12px; color: #6B7280; line-height: 1.65;
          margin-bottom: 10px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .ag-langs { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px; }
        .ag-lang {
          font-size: 10px; font-weight: 600;
          background: color-mix(in srgb, #d07648 14%, #fff); color: #a85832;
          border: 1px solid color-mix(in srgb, #d07648 30%, #fff); padding: 3px 9px; border-radius: 7px;
        }

        /* no bio / no langs fallback spacing */
        .ag-cta-row { display: flex; gap: 8px; margin-top: auto; padding-top: 4px; }

        .ag-btn {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.02em;
          padding: 8px 0; border-radius: 10px; text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          white-space: nowrap;
        }
        .ag-btn:hover { transform: translateY(-2px); }

        .ag-btn-outline {
          flex: 0 0 72px;
          border: 1.5px solid #E5E7EB; color: #374151;
          background: #FAFAFA;
        }
        .ag-btn-outline:hover { border-color: #d07648; color: #d07648; background: color-mix(in srgb, #d07648 14%, #fff); box-shadow: none; transform: translateY(-2px); }

        .ag-btn-green {
          flex: 1;
          background: linear-gradient(135deg, #16A34A, #22C55E);
          color: #fff; box-shadow: 0 2px 10px rgba(34,197,94,0.25);
        }
        .ag-btn-green:hover { box-shadow: 0 6px 18px rgba(34,197,94,0.35); }

        .ag-btn-blue {
          flex: 1;
          background: linear-gradient(135deg, #13a8b4, #0f8a94);
          color: #fff; box-shadow: 0 2px 10px rgba(19,168,180,0.25);
        }
        .ag-btn-blue:hover { box-shadow: 0 6px 18px rgba(19,168,180,0.35); }

        /* skeleton */
        .ag-skel-card { pointer-events: none; }
        .ag-skel-photo { background: linear-gradient(90deg,#F5F5F5,#EBEBEB,#F5F5F5); background-size:200% 100%; animation: ag-shimmer 1.6s ease infinite; }
        @keyframes ag-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .ag-sk {
          background: linear-gradient(90deg,#F5F5F5,#EBEBEB,#F5F5F5);
          background-size: 200% 100%;
          animation: ag-shimmer 1.6s ease infinite;
          border-radius: 6px;
        }
        .ag-sk-w100{width:100%} .ag-sk-w80{width:80%} .ag-sk-w60{width:60%}
        .ag-sk-w45{width:45%} .ag-sk-w35{width:35%}
        .ag-sk-h15{height:15px} .ag-sk-h11{height:11px} .ag-sk-h10{height:10px} .ag-sk-h32{height:32px}
        .ag-sk-mb6{margin-bottom:6px} .ag-sk-mb5{margin-bottom:5px}
        .ag-sk-mb12{margin-bottom:12px} .ag-sk-mb4{margin-bottom:4px}
        .ag-sk-mb14{margin-bottom:14px}

        /* responsive */
        @media (max-width: 768px) {
          .ag-root { padding: 68px 0 60px; }
          .ag-inner { padding: 0 18px; }
          .ag-card { width: 248px; }
          .ag-photo-wrap { height: 180px; }
          .ag-stats { flex-wrap: wrap; }
        }
        @media (max-width: 480px) {
          .ag-card { width: 232px; }
          .ag-photo-wrap { height: 164px; }
          .ag-stat { padding: 12px 18px; }
        }
      `}</style>

      <section className="ag-root">
        <div className="ag-blob ag-blob-1" />
        <div className="ag-blob ag-blob-2" />

        <div className="ag-inner">
          {/* Header */}
          <div className="ag-header">
            <div className="ag-eyebrow">
              <div className="ag-eyebrow-dot" />
              <span className="ag-eyebrow-text">Our Verified Experts</span>
            </div>

            <h2 className="ag-title">
              Meet India's Most Trusted{' '}
              <span className="ag-title-highlight">Property Agents</span>
            </h2>

            <p className="ag-subtitle">
              Handpicked, verified specialists ready to help you buy, sell, or lease — faster and smarter.
            </p>

            {!loading && agents.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="ag-stats">
                  <div className="ag-stat">
                    <div className="ag-stat-num">{agents.length}+</div>
                    <div className="ag-stat-lbl">Active Agents</div>
                  </div>
                  <div className="ag-stat">
                    <div className="ag-stat-num">100%</div>
                    <div className="ag-stat-lbl">Verified</div>
                  </div>
                  <div className="ag-stat">
                    <div className="ag-stat-num">Pan India</div>
                    <div className="ag-stat-lbl">Coverage</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Carousel */}
          {loading ? (
            <div style={{ display: 'flex', gap: '22px', overflow: 'hidden', padding: '18px 2px 24px' }}>
              {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
              <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.35, display: 'block' }} />
              <p style={{ fontSize: '13px' }}>{error}</p>
            </div>
          ) : agents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
              <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.35, display: 'block' }} />
              <p style={{ fontSize: '13px' }}>No agents available yet.</p>
            </div>
          ) : (
            <div className="ag-carousel">
              <div className="ag-fade-l" />
              <div className="ag-fade-r" />
              <div
                ref={stripRef}
                className="ag-strip"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onTouchStart={() => setPaused(true)}
                onTouchEnd={() => setPaused(false)}
                onWheel={(e) => {
                  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                    e.currentTarget.scrollLeft += e.deltaY;
                  }
                  pauseAndResumeAutoplay();
                }}
                onPointerDown={pauseAndResumeAutoplay}
              >
                {[...agents, ...agents].map((agent, idx) => (
                  <AgentCard key={`${agent.id}-${idx}`} agent={agent} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}