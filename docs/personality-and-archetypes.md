# Personality & Archetype System — Design Document

> **Idol Agency Manager** · Internal Reference for Testers & Designers  
> Generated from source: `src/features/idols/service.ts` · `src/types/index.ts`

---

## Overview

Every trainee (and every idol recruited from the scouting pool) carries a **Personality Profile** — a set of hidden numerical traits that represent their character, work style, and group dynamics. The profile is generated once when the scouting pool is built and is preserved permanently on recruitment.

The profile has three layers:

| Layer | What it is |
|-------|-----------|
| **Archetype** | The broad personality "class" (e.g. Center, Anchor) |
| **Dominance** | A single 0–100 score measuring assertiveness / presence |
| **6 Traits** | Fine-grained numeric scores that define the full character |

---

## The 6 Personality Traits

All traits are scored **0–100**. Higher is more of that quality.

| Trait | What it measures |
|-------|-----------------|
| **Ambition** | Drive to succeed, willingness to push limits |
| **Ego** | Self-confidence, assertiveness, star quality — at high values can create friction |
| **Teamwork** | Ability to collaborate, support members, reduce internal conflict |
| **Responsibility** | Reliability, punctuality, professionalism under pressure |
| **Discipline** | Consistency in training, focus during long schedules |
| **Adaptability** | Comfort with variety, language, new concepts, media formats |

---

## Dominance Score

**Dominance (0–100)** is a composite score that reflects how much presence and authority the idol naturally exerts within a group setting. It is not purely ego — a high-teamwork, high-ambition idol can also have high dominance.

| Range | Description |
|-------|-------------|
| 0–35 | Very reserved, background presence |
| 36–55 | Balanced, blends into group dynamics |
| 56–70 | Notable presence, naturally takes initiative |
| 71–85 | Strong personality, de-facto leader energy |
| 86–100 | Extremely dominant — can clash with other high-dominance members |

---

## The 6 Archetypes

Each trainee is assigned one of six archetypes at generation. The archetype sets the **base mean** for each trait and for dominance — actual values are then randomised around that mean using a Gaussian (bell-curve) distribution, so two Centers will feel different in play.

### ⭐ Center
> The face of the group. High star power and ambition, comfortable in the spotlight.

| Trait | Base |
|-------|------|
| Dominance | 74 |
| Ambition | 80 |
| Ego | 72 |
| Teamwork | 62 |
| Responsibility | 64 |
| Discipline | 66 |
| Adaptability | 62 |

**Gameplay note:** Centers boost group visibility and fan growth. Their high ego can reduce synergy if the group has multiple Centers.

---

### ⚓ Anchor
> The quiet backbone. Low ego, high responsibility and discipline — keeps the group grounded.

| Trait | Base |
|-------|------|
| Dominance | 48 |
| Ambition | 60 |
| Ego | 42 |
| Teamwork | 72 |
| Responsibility | 76 |
| Discipline | 74 |
| Adaptability | 58 |

**Gameplay note:** Anchors stabilise synergy and prevent morale drops during heavy schedules. They rarely create conflict.

---

### 🎭 Performer
> High energy, crowd-pleasing, thrives on variety. Excellent adaptability and teamwork.

| Trait | Base |
|-------|------|
| Dominance | 63 |
| Ambition | 72 |
| Ego | 58 |
| Teamwork | 70 |
| Responsibility | 60 |
| Discipline | 66 |
| Adaptability | 76 |

**Gameplay note:** Performers excel at variety shows, media sessions, and language training. Good for fan engagement events.

---

### 🧠 Strategist
> Calculated, precise, high discipline. Plans every move. Lower ego and adaptability.

| Trait | Base |
|-------|------|
| Dominance | 58 |
| Ambition | 70 |
| Ego | 50 |
| Teamwork | 64 |
| Responsibility | 76 |
| Discipline | 80 |
| Adaptability | 58 |

**Gameplay note:** Strategists maximise training efficiency. Their discipline stat makes them the best candidates for consistent skill progression. Less flexible with schedule changes.

---

### 🕊️ Mediator
> The heart of the group. Prioritises harmony, warm and hardworking.

| Trait | Base |
|-------|------|
| Dominance | 54 |
| Ambition | 66 |
| Ego | 44 |
| Teamwork | 78 |
| Responsibility | 74 |
| Discipline | 68 |
| Adaptability | 70 |

**Gameplay note:** Mediators significantly boost group synergy and morale. Ideal as a balancing member alongside high-ego personalities. They are natural group Leaders.

---

### ⚖️ All-Rounder
> Balanced across all traits — no clear strength or weakness.

| Trait | Base |
|-------|------|
| Dominance | 56 |
| Ambition | 68 |
| Ego | 52 |
| Teamwork | 68 |
| Responsibility | 68 |
| Discipline | 68 |
| Adaptability | 68 |

**Gameplay note:** All-Rounders are the most predictable and reliable to work with. They fill any gap in a group without creating friction, but they won't provide a specific boost either.

---

## How Profiles Are Generated (Technical)

1. **Archetype is randomly assigned** (uniform probability, 1-in-6 chance each).
2. **Base trait values** are pulled from the archetype table above.
3. **Gaussian noise** (stdDev ≈ 8–10 points) is applied to each trait, so actual values can drift meaningfully from the base.
4. **Dominance** is also Gaussian around the archetype base (stdDev ≈ 8, clamped to 35–90).
5. The **personality summary label** (e.g. "Focused", "Ambitious, Collaborative") is derived from whichever traits cross threshold values:

| Trait threshold | Label shown |
|----------------|-------------|
| Teamwork ≥ 72 | "Collaborative" |
| Discipline ≥ 72 | "Focused" |
| Ambition ≥ 74 | "Ambitious" |
| Ego ≥ 70 | "Assertive" |
| Adaptability ≥ 72 | "Adaptive" |
| None of the above | "Balanced" |

Up to two labels are shown. "Balanced" is shown only when no threshold is crossed.

---

## How Archetypes Affect Gameplay

In the current build, the personality profile is **surfaced visually** (archetype badge, dominance bar, trait tags on idol profile) and will feed into future simulation systems. Planned connections:

| Feature | How personality matters |
|---------|------------------------|
| **Group Synergy** | High Teamwork + low Ego combinations in a group raise synergy faster |
| **Training Efficiency** | High Discipline idols gain stats more reliably |
| **Morale Stability** | High Responsibility idols resist morale drops from overtraining |
| **Media Events** | High Adaptability idols benefit more from language and media sessions |
| **Leader Assignment** | Mediator and Strategist archetypes are natural candidates for the Leader role |
| **Conflict Events** (future) | Two Centers or high-Ego idols in a small group can trigger tension events |

---

## Stat Generation on Recruitment

When a trainee is signed, their scouting **Potential score (62–96)** determines the base mean for all combat stats:

```
baseMean = 44 + (potential × 0.35)
```

- **Primary skill** (e.g. Vocal for a Vocal trainee): boosted heavily — mean ~80 + bonus from potential
- **Secondary stat**: one random secondary gets a +8 bonus to mean
- **Weakness stat**: one random stat gets a –12 penalty to mean
- All other stats: Gaussian around `baseMean` ± 7

This means a potential-96 trainee starts with `baseMean ≈ 77.6` across general stats and a primary stat likely in the 88–98 range.

---

## Where to See It In-Game

| Screen | What's shown |
|--------|-------------|
| **Scout (Recruit)** | Archetype badge, personality label, potential bar, initial fanbase estimate |
| **Idol Profile → INFO tab** | Full name, archetype tag, personality tags, dominance bar |
| **Idol Profile → STATS tab** | All 8 performance stats with radar chart |
| **Group Profile** | Synergy score (influenced by member trait compatibility) |
